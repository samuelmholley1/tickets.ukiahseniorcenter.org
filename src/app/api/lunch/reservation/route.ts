import { NextRequest, NextResponse } from 'next/server';
import { sendLunchNotification } from '@/lib/email';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/* ========== LUNCH PRICING ==========
 * Dine In:  Member $8,  Non-Member $10
 * To Go:    Member $9,  Non-Member $11
 * Delivery: To Go price + $3
 * =================================== */

const PRICING = {
  dineIn:   { member: 8,  nonMember: 10 },
  toGo:     { member: 9,  nonMember: 11 },
  delivery: { member: 12, nonMember: 14 }, // To Go + $3 delivery
} as const;

type MealType = 'dineIn' | 'toGo' | 'delivery';
type MemberStatus = 'member' | 'nonMember';
type PaymentMethod = 'cash' | 'check' | 'cashCheckSplit' | 'card' | 'lunchCard' | 'compCard';

interface MealDateInfo {
  date: string;
  mealCount: number;
  isFrozenFriday?: boolean;
}

interface ReservationRequest {
  name: string;
  date: string; // ISO date string
  mealType: MealType;
  memberStatus: MemberStatus;
  paymentMethod: PaymentMethod;
  lunchCardId?: string; // Airtable record ID if paying with lunch card (primary card)
  bufferCardId?: string; // Optional buffer card ID for weekly buyers
  notes?: string;
  staff: string;
  quantity?: number; // defaults to 1
  deductMeal?: boolean; // Only deduct from lunch card if true (for first meal in batch)
  isFrozenFriday?: boolean; // Is this a frozen Friday meal (picked up Thursday)?
  // Email data (only sent on first meal of batch)
  emailData?: {
    allDates: MealDateInfo[]; // All dates in this transaction
    totalMeals: number;
    totalAmount: number;
    cardBalanceBefore?: number;
    cardBalanceAfter?: number;
  };
}

// Map our field names to Airtable field names
const MEAL_TYPE_MAP: Record<MealType, string> = {
  dineIn: 'Dine In',
  toGo: 'To Go',
  delivery: 'Delivery',
};

const MEMBER_STATUS_MAP: Record<MemberStatus, string> = {
  member: 'Member',
  nonMember: 'Non-Member',
};

const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  cashCheckSplit: 'Cash & Check',
  card: 'Card (Zeffy)',
  lunchCard: 'Lunch Card',
  compCard: 'Comp Card',
};

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY is not configured');
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID is not configured');
    }
    if (!process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID is not configured');
    }

    const body: ReservationRequest = await request.json();
    const { name, date, mealType, memberStatus, paymentMethod, lunchCardId, notes, staff, quantity = 1, isFrozenFriday = false } = body;

    // Contact Sync Logic
    const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3PQZzXGpT991dH';
    let contactId: string | null = null;
    try {
        const searchFormula = `{Name} = '${name.replace(/'/g, "\\'")}'`;
        const searchRes = await fetch(`${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${CONTACTS_TABLE_ID}?filterByFormula=${encodeURIComponent(searchFormula)}&maxRecords=1`, {
            headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });
        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.records && searchData.records.length > 0) {
                contactId = searchData.records[0].id;
            } else {
                const parts = name.trim().split(' ');
                const res = await fetch(`${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${CONTACTS_TABLE_ID}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ records: [{ fields: {
                        'Name': name,
                        'First Name': parts[0],
                        'Last Name': parts.slice(1).join(' '),
                        'Contact Type': memberStatus === 'member' ? 'Member' : 'Other',
                        'Source': 'Internal',
                        'Notes': 'Auto-created from Lunch Reservation'
                    }}]})
                });
                if (res.ok) {
                    const d = await res.json();
                    if (d.records && d.records.length > 0) contactId = d.records[0].id;
                }
            }
        }
    } catch (e) {
        console.error('Contact Sync Error', e);
    }


    // Input validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    // Validate date format and business rules
    const reservationDate = new Date(date + 'T12:00:00'); // Noon to avoid timezone issues
    if (isNaN(reservationDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    const dayOfWeek = reservationDate.getDay();
    // Friday (5) is allowed for Frozen Friday meals (picked up Thursday)
    // Saturday (6) and Sunday (0) are never allowed
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ error: 'Cannot reserve on weekends (Sat-Sun closed)' }, { status: 400 });
    }
    // Friday requires isFrozenFriday flag
    if (dayOfWeek === 5 && !isFrozenFriday) {
      return NextResponse.json({ error: 'Friday reservations must be marked as Frozen Friday meals' }, { status: 400 });
    }
    
    // Allow reservations for today or future only (no past dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDateOnly = new Date(reservationDate);
    reservationDateOnly.setHours(0, 0, 0, 0);
    if (reservationDateOnly < today) {
      return NextResponse.json({ error: 'Cannot create reservations for past dates' }, { status: 400 });
    }
    
    if (!['dineIn', 'toGo', 'delivery'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }
    if (!['member', 'nonMember'].includes(memberStatus)) {
      return NextResponse.json({ error: 'Invalid member status' }, { status: 400 });
    }
    if (!['cash', 'check', 'cashCheckSplit', 'card', 'lunchCard', 'compCard'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (!staff?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }
    if (quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 20' }, { status: 400 });
    }

    // If paying with lunch card, we need to decrement the card balance
    // IMPORTANT: The 'deductMeal' flag controls whether to actually deduct.
    // Frontend should ONLY set deductMeal=true on ONE request to avoid double-deduction.
    const shouldDeduct = body.deductMeal !== false; // Default true for backwards compat
    const bufferCardId = body.bufferCardId; // Optional buffer card for weekly buyers
    
    if (paymentMethod === 'lunchCard') {
      if (!lunchCardId) {
        return NextResponse.json({ error: 'Lunch card selection is required' }, { status: 400 });
      }

      // Fetch the primary lunch card to check balance
      const cardResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!cardResponse.ok) {
        return NextResponse.json({ error: 'Lunch card not found' }, { status: 404 });
      }

      const cardData = await cardResponse.json();
      const primaryMeals = cardData.fields['Remaining Meals'] || 0;
      
      // If buffer card exists, fetch its balance too
      let bufferMeals = 0;
      if (bufferCardId) {
        const bufferResponse = await fetch(
          `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${bufferCardId}`,
          { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
        );
        if (bufferResponse.ok) {
          const bufferData = await bufferResponse.json();
          bufferMeals = bufferData.fields['Remaining Meals'] || 0;
        }
      }
      
      const totalAvailable = primaryMeals + bufferMeals;

      // Only check balance if we're going to deduct
      if (shouldDeduct && totalAvailable < quantity) {
        return NextResponse.json({ 
          error: `Insufficient meals on card. Has ${totalAvailable}, needs ${quantity}` 
        }, { status: 400 });
      }

      // Only decrement if shouldDeduct is true
      if (shouldDeduct) {
        let mealsToDeduct = quantity;
        
        // First deduct from primary card
        const deductFromPrimary = Math.min(primaryMeals, mealsToDeduct);
        if (deductFromPrimary > 0) {
          const updateCardResponse = await fetch(
            `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: { 'Remaining Meals': primaryMeals - deductFromPrimary },
              }),
            }
          );

          if (!updateCardResponse.ok) {
            const errorText = await updateCardResponse.text();
            console.error('Failed to update lunch card:', errorText);
            throw new Error('Failed to update lunch card balance');
          }
          mealsToDeduct -= deductFromPrimary;
        }
        
        // If more meals needed, deduct from buffer card
        if (mealsToDeduct > 0 && bufferCardId && bufferMeals > 0) {
          const deductFromBuffer = Math.min(bufferMeals, mealsToDeduct);
          const updateBufferResponse = await fetch(
            `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${bufferCardId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: { 'Remaining Meals': bufferMeals - deductFromBuffer },
              }),
            }
          );

          if (!updateBufferResponse.ok) {
            console.error('Failed to update buffer card - primary already deducted!');
            // Note: Primary card was already deducted, this is a partial failure
          }
        }
      }
    }

    // Calculate price (0 if paying with lunch card or comp card)
    const pricePerMeal = (paymentMethod === 'lunchCard' || paymentMethod === 'compCard') ? 0 : PRICING[mealType][memberStatus];
    // For multi-meal transactions, only the first record should show the total amount
    // Subsequent records show $0 to avoid double-counting in reports
    const totalAmount = shouldDeduct ? (pricePerMeal * quantity) : 0;

    // Build the Airtable record
    const payload: { fields: Record<string, unknown> } = {
      fields: {
        'Name': name.trim().substring(0, 100),
        'Date': date,
        'Meal Type': MEAL_TYPE_MAP[mealType],
        'Member Status': MEMBER_STATUS_MAP[memberStatus],
        'Amount': totalAmount,
        'Payment Method': PAYMENT_METHOD_MAP[paymentMethod],
        'Notes': notes?.trim().substring(0, 1000) || '',
        'Staff': staff.trim().substring(0, 50),
        'Status': 'Reserved',
        'Frozen Friday': isFrozenFriday,
        ...(contactId ? { 'Contact': [contactId] } : {}),
      },
    };

    // Add lunch card link if applicable
    if (paymentMethod === 'lunchCard' && lunchCardId) {
      payload.fields['Lunch Card'] = [lunchCardId];
    }

    console.log('Creating lunch reservation:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error:', errorText);
      throw new Error(`Airtable error: ${errorText}`);
    }

    const result = await response.json();

    // Send email notification only on first meal of a multi-meal transaction
    // (shouldDeduct is true only for the first meal)
    if (shouldDeduct && body.emailData) {
      try {
        // Get lunch card owner name if paying with lunch card
        let lunchCardName: string | undefined;
        if (paymentMethod === 'lunchCard' && lunchCardId) {
          // cardData is already fetched above in the lunchCard flow
          // We need to re-fetch it here since it's out of scope
          const cardFetchRes = await fetch(
            `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
            { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
          );
          if (cardFetchRes.ok) {
            const cardInfo = await cardFetchRes.json();
            lunchCardName = cardInfo.fields?.['Name'];
          }
        }

        await sendLunchNotification({
          type: 'lunch_reservation',
          name: name.trim(),
          dates: body.emailData.allDates,
          mealType: MEAL_TYPE_MAP[mealType],
          memberStatus: MEMBER_STATUS_MAP[memberStatus],
          totalMeals: body.emailData.totalMeals,
          amount: body.emailData.totalAmount,
          paymentMethod: PAYMENT_METHOD_MAP[paymentMethod],
          lunchCardName,
          cardBalanceBefore: body.emailData.cardBalanceBefore,
          cardBalanceAfter: body.emailData.cardBalanceAfter,
          notes: notes?.trim() || undefined,
          staff: staff.trim(),
          timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
        });
        console.log('Lunch reservation notification email sent');
      } catch (emailError) {
        console.error('Failed to send lunch reservation notification email:', emailError);
        // Don't fail the request if email fails - the reservation was still created
      }
    }

    return NextResponse.json({
      success: true,
      recordId: result.id,
      amount: totalAmount,
      message: paymentMethod === 'lunchCard' 
        ? `Reservation created. ${quantity} meal(s) deducted from lunch card.`
        : `Reservation created. Amount due: $${totalAmount}`,
    });

  } catch (error) {
    console.error('Lunch reservation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch reservations for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    let filterFormula = '';
    if (date) {
      filterFormula = `?filterByFormula=${encodeURIComponent(`{Date}='${date}'`)}`;
    }

    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}${filterFormula}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      reservations: data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        ...record.fields,
      })),
    });

  } catch (error) {
    console.error('Fetch reservations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
