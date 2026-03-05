import { NextRequest, NextResponse } from 'next/server';
import { sendLunchNotification } from '@/lib/email';
import { titleCaseName } from '@/lib/nameUtils';
import { writeAuditLog } from '@/lib/auditLog';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/* ========== LUNCH PRICING ==========\n * Dine In:  Member $8,  Non-Member $10\n * To Go:    Member $9,  Non-Member $11\n * Delivery: Member $12, Non-Member $14\n * =================================== */

const PRICING = {
  dineIn:   { member: 8,  nonMember: 10 },
  toGo:     { member: 9,  nonMember: 11 },
  delivery: { member: 12, nonMember: 14 },
} as const;

type MealType = 'dineIn' | 'toGo' | 'delivery';
type MemberStatus = 'member' | 'nonMember';
type PaymentMethod = 'cash' | 'check' | 'cashCheckSplit' | 'card' | 'lunchCard' | 'compCard' | 'staffOverride';

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
  paymentComment?: string;
  compCardNumber?: string; // For comp card tracking
  checkNumber?: string; // For check payment tracking
  staff: string;
  quantity?: number; // defaults to 1
  deductMeal?: boolean; // Only deduct from lunch card if true (for first meal in batch)
  isFrozenFriday?: boolean; // Is this a frozen Friday meal (picked up Thursday)?
  retroactive?: boolean; // Allow creating reservations for past dates (retroactive payment)
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
  staffOverride: 'Staff Override',
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
    const { date, mealType, memberStatus, paymentMethod, lunchCardId, notes, paymentComment, compCardNumber, checkNumber, staff, quantity = 1, isFrozenFriday = false, retroactive = false } = body;
    const name = titleCaseName(body.name || '');

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
    
    // Allow reservations for today or future only (no past dates) unless retroactive override
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDateOnly = new Date(reservationDate);
    reservationDateOnly.setHours(0, 0, 0, 0);
    if (reservationDateOnly < today && !retroactive) {
      return NextResponse.json({ error: 'Cannot create reservations for past dates', code: 'PAST_DATE' }, { status: 400 });
    }
    
    if (!['dineIn', 'toGo', 'delivery'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }
    if (!['member', 'nonMember'].includes(memberStatus)) {
      return NextResponse.json({ error: 'Invalid member status' }, { status: 400 });
    }
    if (!['cash', 'check', 'cashCheckSplit', 'card', 'lunchCard', 'compCard', 'staffOverride'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (!staff?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }
    if (paymentMethod === 'staffOverride' && !paymentComment?.trim()) {
      return NextResponse.json({ error: 'Payment comment is required for Staff Override' }, { status: 400 });
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

      // Validate Card Type alignment with meal type
      // If Card Type is empty or a legacy quantity label (e.g. "5 Meals"), allow any meal type
      // If Card Type is a service type (Dine In / Pick Up / Delivery), it must match
      const cardTypeValue = (cardData.fields['Card Type'] as string) || '';
      const isServiceType = ['Dine In', 'Pick Up', 'Delivery'].includes(cardTypeValue);
      if (isServiceType) {
        // Map card service type to the reservation meal type codes
        const cardToMealMap: Record<string, string> = {
          'Dine In': 'dineIn',
          'Pick Up': 'toGo',
          'Delivery': 'delivery',
        };
        const expectedMealType = cardToMealMap[cardTypeValue];
        if (expectedMealType && expectedMealType !== mealType) {
          const mealLabel = MEAL_TYPE_MAP[mealType];
          return NextResponse.json({
            error: `This lunch card is designated for ${cardTypeValue} only. Cannot use for ${mealLabel} meals.`
          }, { status: 400 });
        }
      }
      
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
    const pricePerMeal = (paymentMethod === 'lunchCard' || paymentMethod === 'compCard' || paymentMethod === 'staffOverride') ? 0 : PRICING[mealType][memberStatus];
    // Each record stores its own per-meal price for accurate reporting
    const totalAmount = pricePerMeal;

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
        ...(compCardNumber ? { 'Comp Card Number': compCardNumber.trim().substring(0, 50) } : {}),
        ...(checkNumber ? { 'Check Number': checkNumber.trim().substring(0, 50) } : {}),
        ...(paymentComment ? { 'Payment Comment': paymentComment.trim().substring(0, 1000) } : {}),
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
        body: JSON.stringify({ ...payload, typecast: true }),
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

    // Write audit log entry for creation
    writeAuditLog({
      action: 'Created',
      reservationId: result.id,
      reservationName: name.trim(),
      reservationDate: date,
      mealType: MEAL_TYPE_MAP[mealType],
      staff: staff.trim(),
      paymentMethod: PAYMENT_METHOD_MAP[paymentMethod],
      amount: totalAmount,
    });

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

// GET endpoint to fetch reservations for a specific date OR search by name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const search = searchParams.get('search'); // Search by last name
    const futureOnly = searchParams.get('futureOnly') === 'true'; // Only return today + future

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    let filterFormula = '';
    
    if (search) {
      // Search by name (last name match) - case insensitive
      const sanitizedSearch = search.replace(/'/g, "\\'").toLowerCase().trim();
      
      if (futureOnly) {
        // Get today's date in YYYY-MM-DD format
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        filterFormula = `?filterByFormula=${encodeURIComponent(
          `AND(SEARCH("${sanitizedSearch}", LOWER({Name})), NOT({Cancelled}), IS_AFTER({Date}, DATEADD('${today}', -1, 'days')))`
        )}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=asc`;
      } else {
        filterFormula = `?filterByFormula=${encodeURIComponent(
          `AND(SEARCH("${sanitizedSearch}", LOWER({Name})), NOT({Cancelled}))`
        )}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`;
      }
    } else if (date) {
      // Use IS_SAME for date comparison - Airtable date fields need proper date comparison, not string equality
      filterFormula = `?filterByFormula=${encodeURIComponent(`AND(IS_SAME({Date}, '${date}', 'day'), NOT({Cancelled}))`)}`;
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

// Cancel a reservation with refund handling
export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const body = await request.json();
    const { reservationId, refundMethod, staff } = body as {
      reservationId: string;
      refundMethod: 'cash' | 'lunchCard' | 'forfeit';
      staff?: string;
    };

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }
    if (!refundMethod) {
      return NextResponse.json({ error: 'Refund method is required' }, { status: 400 });
    }
    if (!staff || !staff.trim()) {
      return NextResponse.json({ error: 'Staff initials are required for cancellations' }, { status: 400 });
    }

    // 1. Fetch the reservation to get details (payment method, lunch card link, amount)
    const fetchRes = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}/${reservationId}`,
      { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
    );

    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const reservation = await fetchRes.json();
    const fields = reservation.fields;
    const name = fields['Name'] || 'Unknown';
    const amount = fields['Amount'] || 0;
    const lunchCardIds = fields['Lunch Card'] as string[] | undefined;
    const lunchCardId = lunchCardIds?.[0];

    // 2. If refunding to lunch card, replenish 1 meal on the linked card
    if (refundMethod === 'lunchCard') {
      if (!lunchCardId) {
        return NextResponse.json({ 
          error: 'No lunch card linked to this reservation. Use cash refund or forfeit instead.' 
        }, { status: 400 });
      }

      // Fetch current card balance
      const cardRes = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
        { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
      );

      if (cardRes.ok) {
        const cardData = await cardRes.json();
        const currentMeals = (cardData.fields['Remaining Meals'] as number) || 0;

        // Add 1 meal back
        await fetch(
          `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: { 'Remaining Meals': currentMeals + 1 },
            }),
          }
        );
      }
    }

    // 3. Soft-delete: mark the reservation as cancelled (preserve data for audit trail)
    const cancelTimestamp = new Date().toISOString();
    const softDeleteRes = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}/${reservationId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Cancelled': true,
            'Cancelled At': cancelTimestamp,
            'Cancelled By': staff || '',
          },
        }),
      }
    );

    if (!softDeleteRes.ok) {
      const errorText = await softDeleteRes.text();
      console.error('Failed to cancel reservation:', errorText);
      return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
    }

    const refundLabel = refundMethod === 'cash' ? 'Cash Refund' : refundMethod === 'lunchCard' ? 'Lunch Card Replenished' : 'Payment Forfeited';

    // Write audit log entry for cancellation
    const auditRefundMap: Record<string, 'Card Punch Restored' | 'Cash' | 'Forfeit'> = {
      cash: 'Cash',
      lunchCard: 'Card Punch Restored',
      forfeit: 'Forfeit',
    };
    writeAuditLog({
      action: 'Cancelled',
      reservationId,
      reservationName: name as string,
      reservationDate: fields['Date'] as string,
      mealType: fields['Meal Type'] as string,
      staff: staff || '',
      paymentMethod: fields['Payment Method'] as string,
      amount: amount as number,
      refundMethod: auditRefundMap[refundMethod],
      refundAmount: refundMethod === 'forfeit' ? 0 : (amount as number),
    });

    return NextResponse.json({
      success: true,
      message: `Reservation for ${name} cancelled. ${refundLabel}.`,
      refundMethod,
      amount,
      staff: staff || '',
    });

  } catch (error) {
    console.error('Cancel reservation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}

// Modify a reservation (change date, meal type, or notes/special request)
export async function PATCH(request: NextRequest) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const body = await request.json();
    const { reservationId, date, mealType, notes, memberStatus } = body as {
      reservationId: string;
      date?: string; // YYYY-MM-DD
      mealType?: string; // 'Dine In' | 'To Go' | 'Delivery'
      notes?: string;
      memberStatus?: string; // 'Member' | 'Non-Member' (needed for price recalculation)
      staff?: string;
    };

    if (!reservationId) {
      return NextResponse.json({ error: 'reservationId is required' }, { status: 400 });
    }
    if (!body.staff || !(body.staff as string).trim()) {
      return NextResponse.json({ error: 'Staff initials are required for modifications' }, { status: 400 });
    }

    // First fetch the current record to get existing values for price recalculation
    const fetchRes = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}/${reservationId}`,
      { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
    );

    if (!fetchRes.ok) {
      throw new Error('Reservation not found');
    }

    const currentRecord = await fetchRes.json();
    const currentFields = currentRecord.fields;

    // Build update fields
    const updateFields: Record<string, unknown> = {};
    const changes: string[] = [];

    if (date && date !== currentFields['Date']) {
      // Validate date is Mon-Fri
      const dateObj = new Date(date + 'T12:00:00');
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return NextResponse.json({ error: 'Date must be Monday through Friday' }, { status: 400 });
      }
      updateFields['Date'] = date;
      changes.push(`Date: ${currentFields['Date']} → ${date}`);
    }

    if (mealType && mealType !== currentFields['Meal Type']) {
      // Validate meal type
      const validTypes = ['Dine In', 'To Go', 'Delivery'];
      if (!validTypes.includes(mealType)) {
        return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
      }
      updateFields['Meal Type'] = mealType;
      changes.push(`Meal Type: ${currentFields['Meal Type']} → ${mealType}`);

      // Recalculate price based on new meal type and current member status
      const effectiveMemberStatus = memberStatus || currentFields['Member Status'];
      const isMember = effectiveMemberStatus === 'Member';
      const priceMap: Record<string, { member: number; nonMember: number }> = {
        'Dine In':   { member: 8,  nonMember: 10 },
        'To Go':     { member: 9,  nonMember: 11 },
        'Delivery':  { member: 12, nonMember: 14 },
      };
      const newPrice = isMember ? priceMap[mealType].member : priceMap[mealType].nonMember;
      const paymentMethod = currentFields['Payment Method'];
      // Only recalculate for non-card payments (cards don't change price in Airtable)
      if (paymentMethod !== 'Lunch Card' && paymentMethod !== 'Comp Card') {
        updateFields['Amount'] = newPrice;
        changes.push(`Amount: $${currentFields['Amount']} → $${newPrice}`);
      }
    }

    if (notes !== undefined && notes !== currentFields['Notes']) {
      updateFields['Notes'] = notes.trim().substring(0, 1000);
      changes.push(`Notes: "${currentFields['Notes'] || ''}" → "${notes.trim()}"`);
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes needed', changes: [] });
    }

    // Build audit diff before applying changes
    const auditDiff: Record<string, { from: unknown; to: unknown }> = {};
    if (updateFields['Date']) auditDiff['Date'] = { from: currentFields['Date'], to: updateFields['Date'] };
    if (updateFields['Meal Type']) auditDiff['Meal Type'] = { from: currentFields['Meal Type'], to: updateFields['Meal Type'] };
    if (updateFields['Notes'] !== undefined) auditDiff['Notes'] = { from: currentFields['Notes'] || '', to: updateFields['Notes'] };
    if (updateFields['Amount'] !== undefined) auditDiff['Amount'] = { from: currentFields['Amount'], to: updateFields['Amount'] };

    // Update the record in Airtable
    const updateRes = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}/${reservationId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updateFields }),
      }
    );

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      throw new Error(`Airtable update failed: ${JSON.stringify(errorData)}`);
    }

    const updatedRecord = await updateRes.json();

    // Write audit log entry for modification
    writeAuditLog({
      action: 'Modified',
      reservationId,
      reservationName: currentFields['Name'] as string || 'Unknown',
      reservationDate: (updateFields['Date'] as string) || (currentFields['Date'] as string),
      mealType: (updateFields['Meal Type'] as string) || (currentFields['Meal Type'] as string),
      changedFields: auditDiff,
      previousValues: changes.join(', '),
      staff: body.staff || '',
      paymentMethod: currentFields['Payment Method'] as string,
      amount: currentFields['Amount'] as number,
    });

    return NextResponse.json({
      success: true,
      message: `Reservation modified: ${changes.join(', ')}`,
      changes,
      reservation: {
        id: updatedRecord.id,
        ...updatedRecord.fields,
      },
    });

  } catch (error) {
    console.error('Modify reservation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to modify reservation' },
      { status: 500 }
    );
  }
}
