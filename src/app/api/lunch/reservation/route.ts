import { NextRequest, NextResponse } from 'next/server';

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
type PaymentMethod = 'cash' | 'check' | 'card' | 'lunchCard';

interface ReservationRequest {
  name: string;
  date: string; // ISO date string
  mealType: MealType;
  memberStatus: MemberStatus;
  paymentMethod: PaymentMethod;
  lunchCardId?: string; // Airtable record ID if paying with lunch card
  notes?: string;
  staff: string;
  quantity?: number; // defaults to 1
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
  card: 'Card (Zeffy)',
  lunchCard: 'Lunch Card',
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
    const { name, date, mealType, memberStatus, paymentMethod, lunchCardId, notes, staff, quantity = 1 } = body;

    // Input validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (!['dineIn', 'toGo', 'delivery'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }
    if (!['member', 'nonMember'].includes(memberStatus)) {
      return NextResponse.json({ error: 'Invalid member status' }, { status: 400 });
    }
    if (!['cash', 'check', 'card', 'lunchCard'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (!staff?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }
    if (quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 20' }, { status: 400 });
    }

    // If paying with lunch card, we need to decrement the card balance
    if (paymentMethod === 'lunchCard') {
      if (!lunchCardId) {
        return NextResponse.json({ error: 'Lunch card selection is required' }, { status: 400 });
      }

      // Fetch the lunch card to check balance
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
      const remainingMeals = cardData.fields['Remaining Meals'] || 0;

      if (remainingMeals < quantity) {
        return NextResponse.json({ 
          error: `Insufficient meals on card. Has ${remainingMeals}, needs ${quantity}` 
        }, { status: 400 });
      }

      // Decrement the lunch card balance
      const updateCardResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}/${lunchCardId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Remaining Meals': remainingMeals - quantity,
            },
          }),
        }
      );

      if (!updateCardResponse.ok) {
        const errorText = await updateCardResponse.text();
        console.error('Failed to update lunch card:', errorText);
        throw new Error('Failed to update lunch card balance');
      }
    }

    // Calculate price (0 if paying with lunch card)
    const pricePerMeal = paymentMethod === 'lunchCard' ? 0 : PRICING[mealType][memberStatus];
    const totalAmount = pricePerMeal * quantity;

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
