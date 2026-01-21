import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/* ========== LUNCH CARD PRICING ==========
 * See AIRTABLE_SCHEMA.md for full pricing table
 * Cards come in 5, 10, 15, 20 meal variants
 * With Dine In, Pickup, or Delivery options
 * Member vs Non-Member pricing
 * ======================================== */

const CARD_PRICING = {
  5: {
    member:    { dineIn: 40,  pickup: 45,  delivery: 60 },
    nonMember: { dineIn: 50,  pickup: 55,  delivery: 70 },
  },
  10: {
    member:    { dineIn: 80,  pickup: 90,  delivery: 120 },
    nonMember: { dineIn: 100, pickup: 110, delivery: 140 },
  },
  15: {
    member:    { dineIn: 120, pickup: 135, delivery: 180 },
    nonMember: { dineIn: 150, pickup: 165, delivery: 210 },
  },
  20: {
    member:    { dineIn: 160, pickup: 180, delivery: 240 },
    nonMember: { dineIn: 200, pickup: 220, delivery: 280 },
  },
} as const;

type MealCount = 5 | 10 | 15 | 20;
type CardMealType = 'dineIn' | 'pickup' | 'delivery';
type MemberStatus = 'member' | 'nonMember';
type PaymentMethod = 'cash' | 'check' | 'card';

interface LunchCardRequest {
  name: string;
  phone: string;
  cardType: MealCount;
  mealType: CardMealType;
  memberStatus: MemberStatus;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  staff: string;
}

// Map our field names to Airtable field names
const CARD_TYPE_MAP: Record<MealCount, string> = {
  5: '5 Meals',
  10: '10 Meals',
  15: '15 Meals',
  20: '20 Meals',
};

const MEMBER_STATUS_MAP: Record<MemberStatus, string> = {
  member: 'Member',
  nonMember: 'Non-Member',
};

const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Card (Zeffy)',
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
    if (!process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID) {
      throw new Error('AIRTABLE_LUNCH_CARDS_TABLE_ID is not configured');
    }

    const body: LunchCardRequest = await request.json();
    const { name, phone, cardType, mealType, memberStatus, paymentMethod, checkNumber, staff } = body;

    // Input validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (![5, 10, 15, 20].includes(cardType)) {
      return NextResponse.json({ error: 'Invalid card type' }, { status: 400 });
    }
    if (!['dineIn', 'pickup', 'delivery'].includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }
    if (!['member', 'nonMember'].includes(memberStatus)) {
      return NextResponse.json({ error: 'Invalid member status' }, { status: 400 });
    }
    if (!['cash', 'check', 'card'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (paymentMethod === 'check' && !checkNumber?.trim()) {
      return NextResponse.json({ error: 'Check number is required for check payments' }, { status: 400 });
    }
    if (!staff?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }

    // Calculate price
    const price = CARD_PRICING[cardType][memberStatus][mealType];

    // Build the Airtable record
    const payload = {
      fields: {
        'Name': name.trim().substring(0, 100),
        'Phone': phone.trim().substring(0, 50),
        'Card Type': CARD_TYPE_MAP[cardType],
        'Member Status': MEMBER_STATUS_MAP[memberStatus],
        'Total Meals': cardType,
        'Remaining Meals': cardType, // Start with full balance
        'Amount Paid': price,
        'Payment Method': PAYMENT_METHOD_MAP[paymentMethod],
        'Purchase Date': new Date().toISOString().split('T')[0], // Just the date
        'Staff': staff.trim().substring(0, 50),
      },
    };

    console.log('Creating lunch card:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}`,
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
      cardType: `${cardType} Meals`,
      mealType,
      memberStatus,
      amount: price,
      message: `Lunch card created! ${cardType} meals for $${price}`,
    });

  } catch (error) {
    console.error('Lunch card creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lunch card' },
      { status: 500 }
    );
  }
}

// GET endpoint to search for lunch cards by name or phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    // More detailed env var checking with specific errors
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;
    
    if (!apiKey) {
      console.error('Missing AIRTABLE_API_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing API key' }, { status: 500 });
    }
    if (!baseId) {
      console.error('Missing AIRTABLE_BASE_ID');
      return NextResponse.json({ error: 'Server configuration error: Missing base ID' }, { status: 500 });
    }
    if (!tableId) {
      console.error('Missing AIRTABLE_LUNCH_CARDS_TABLE_ID');
      return NextResponse.json({ error: 'Server configuration error: Missing lunch cards table ID' }, { status: 500 });
    }

    // If specific ID requested, fetch that record
    if (id) {
      const response = await fetch(
        `${AIRTABLE_API_BASE}/${baseId}/${tableId}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return NextResponse.json({ error: 'Lunch card not found' }, { status: 404 });
      }

      const record = await response.json();
      return NextResponse.json({
        success: true,
        card: {
          id: record.id,
          ...record.fields,
        },
      });
    }

    // Search by name or phone
    let filterFormula = '';
    if (search) {
      // Sanitize input to prevent formula injection - escape quotes and backslashes
      const sanitizedSearch = search.replace(/\\/g, '\\\\').replace(/"/g, '\\"').toLowerCase();
      // Search in both Name and Phone fields, only cards with remaining meals
      filterFormula = `?filterByFormula=${encodeURIComponent(
        `AND({Remaining Meals}>0, OR(SEARCH("${sanitizedSearch}", LOWER({Name})), SEARCH("${sanitizedSearch}", {Phone})))`
      )}`;
    } else {
      // Just get cards with remaining meals
      filterFormula = `?filterByFormula=${encodeURIComponent(`{Remaining Meals}>0`)}`;
    }

    const response = await fetch(
      `${AIRTABLE_API_BASE}/${baseId}/${tableId}${filterFormula}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch lunch cards');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      cards: data.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        name: record.fields['Name'],
        phone: record.fields['Phone'],
        cardType: record.fields['Card Type'],
        totalMeals: record.fields['Total Meals'],
        remainingMeals: record.fields['Remaining Meals'],
        memberStatus: record.fields['Member Status'],
      })),
    });

  } catch (error) {
    console.error('Fetch lunch cards error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lunch cards' },
      { status: 500 }
    );
  }
}
