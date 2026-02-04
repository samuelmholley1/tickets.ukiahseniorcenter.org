import { NextRequest, NextResponse } from 'next/server';
import { sendLunchNotification } from '@/lib/email';

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
type PaymentMethod = 'cash' | 'check' | 'cashCheckSplit' | 'card' | 'compCard';

interface LunchCardRequest {
  name: string;
  phone: string;
  cardType: MealCount;
  mealType: CardMealType;
  memberStatus: MemberStatus;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  compCardNumber?: string;
  staff: string;
  contactId?: string;
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

const MEAL_TYPE_MAP: Record<CardMealType, string> = {
  dineIn: 'Dine In',
  pickup: 'To Go',
  delivery: 'Delivery',
};

const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  cashCheckSplit: 'Cash & Check',
  card: 'Card (Zeffy)',
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
    if (!process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID) {
      throw new Error('AIRTABLE_LUNCH_CARDS_TABLE_ID is not configured');
    }

    const body: LunchCardRequest = await request.json();
    const { name, phone, cardType, mealType, memberStatus, paymentMethod, checkNumber, staff, contactId: providedContactId } = body;
    let contactId = providedContactId;

    // Contact Sync Logic
    const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3PQZzXGpT991dH';
    if (!contactId && name) {
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
                          'Phone': phone, // Also save phone to contact
                          'Contact Type': memberStatus === 'member' ? 'Member' : 'Other',
                          'Source': 'Internal',
                          'Notes': 'Auto-created from Lunch Card creation'
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
    }

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
    if (!['cash', 'check', 'cashCheckSplit', 'card', 'compCard'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if ((paymentMethod === 'check' || paymentMethod === 'cashCheckSplit') && !checkNumber?.trim()) {
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
        'Meal Type': MEAL_TYPE_MAP[mealType],
        'Member Status': MEMBER_STATUS_MAP[memberStatus],
        'Total Meals': cardType,
        'Remaining Meals': cardType, // Start with full balance
        'Amount Paid': price,
        'Payment Method': PAYMENT_METHOD_MAP[paymentMethod],
        'Purchase Date': new Date().toISOString().split('T')[0], // Just the date
        'Staff': staff.trim().substring(0, 50),
        ...(contactId ? { 'Contact': [contactId] } : {}),
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

    // Send email notification
    try {
      await sendLunchNotification({
        type: 'lunch_card',
        name: name.trim(),
        phone: phone.trim(),
        cardType: CARD_TYPE_MAP[cardType],
        mealType: MEAL_TYPE_MAP[mealType],
        memberStatus: MEMBER_STATUS_MAP[memberStatus],
        amount: price,
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod],
        checkNumber: checkNumber || undefined,
        compCardNumber: body.compCardNumber || undefined,
        staff: staff.trim(),
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
      });
      console.log('Lunch card notification email sent');
    } catch (emailError) {
      console.error('Failed to send lunch card notification email:', emailError);
      // Don't fail the request if email fails - the card was still created
    }

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

    // If specific ID requested, fetch that record with deduction history
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
      
      // Fetch deduction history (reservations linked to this card)
      const reservationsTableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
      let deductions: { date: string; name: string }[] = [];
      
      if (reservationsTableId) {
        try {
          // Query reservations that link to this card ID
          const deductionsRes = await fetch(
            `${AIRTABLE_API_BASE}/${baseId}/${reservationsTableId}?filterByFormula=${encodeURIComponent(
              `FIND("${id}", ARRAYJOIN({Lunch Card}))`
            )}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );
          
          if (deductionsRes.ok) {
            const deductionsData = await deductionsRes.json();
            deductions = deductionsData.records.map((r: { fields: Record<string, unknown> }) => ({
              date: r.fields['Date'] as string,
              name: r.fields['Name'] as string,
            }));
          }
        } catch (err) {
          console.error('Failed to fetch deduction history:', err);
        }
      }
      
      return NextResponse.json({
        success: true,
        card: {
          id: record.id,
          ...record.fields,
        },
        deductions,
      });
    }

    // Search by name or phone
    let filterFormula = '';
    if (search) {
      // Sanitize input to prevent formula injection - escape quotes and backslashes
      const sanitizedSearch = search.replace(/\\/g, '\\\\').replace(/"/g, '\\"').toLowerCase().trim();
      
      // Split into words and require ALL words to match (in name OR phone)
      const words = sanitizedSearch.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length === 1) {
        // Single word: match Name OR Phone
        // Note: We intentionally DO NOT filter by Remaining Meals > 0 here,
        // because we want to see users who have run out of meals so we can renew them.
        // We will filter out "replaced" (old) zero-balance cards in JavaScript.
        filterFormula = `?filterByFormula=${encodeURIComponent(
          `OR(SEARCH("${words[0]}", LOWER({Name})), SEARCH("${words[0]}", {Phone}))`
        )}`;
      } else {
        // Multiple words: ALL words must appear in Name
        const wordChecks = words.map(w => `SEARCH("${w}", LOWER({Name}))`).join(', ');
        filterFormula = `?filterByFormula=${encodeURIComponent(
          `AND(${wordChecks})`
        )}`;
      }
    } else {
      // Just get cards with remaining meals if not searching
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
    
    // Collect linked Contact IDs to fetch email/phone
    const contactsTableId = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3PQZzXGpT991dH';
    const contactIds = new Set<string>();
    for (const record of data.records) {
      const linkedContacts = record.fields['Contact'] as string[] | undefined;
      if (linkedContacts && linkedContacts.length > 0) {
        contactIds.add(linkedContacts[0]);
      }
    }
    
    // Fetch contact info for all linked contacts
    const contactInfo: Record<string, { email?: string; phone?: string }> = {};
    if (contactIds.size > 0) {
      try {
        const contactIdsArray = Array.from(contactIds);
        // Airtable formula to get records by IDs
        const contactFormula = `OR(${contactIdsArray.map(id => `RECORD_ID()="${id}"`).join(',')})`;
        const contactsRes = await fetch(
          `${AIRTABLE_API_BASE}/${baseId}/${contactsTableId}?filterByFormula=${encodeURIComponent(contactFormula)}&fields%5B%5D=Email&fields%5B%5D=Phone%20Cell&fields%5B%5D=Phone%20Home`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          for (const contact of contactsData.records) {
            contactInfo[contact.id] = {
              email: contact.fields['Email'] as string | undefined,
              phone: (contact.fields['Phone Cell'] || contact.fields['Phone Home']) as string | undefined,
            };
          }
        }
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
      }
    }
    
    // Process records into standardized objects
    const allCards = data.records.map((record: { id: string; fields: Record<string, unknown> }) => {
      const linkedContacts = record.fields['Contact'] as string[] | undefined;
      const contactId = linkedContacts && linkedContacts.length > 0 ? linkedContacts[0] : null;
      const contact = contactId ? contactInfo[contactId] : null;
      
      return {
        id: record.id,
        name: record.fields['Name'] as string,
        phone: record.fields['Phone'] as string,
        cardType: record.fields['Card Type'] as string,
        mealType: record.fields['Meal Type'] as string,
        totalMeals: record.fields['Total Meals'] as number,
        remainingMeals: record.fields['Remaining Meals'] as number,
        memberStatus: record.fields['Member Status'] as string,
        purchaseDate: record.fields['Purchase Date'] as string,
        // Contact info from Contacts table
        contactEmail: contact?.email,
        contactPhone: contact?.phone,
      };
    });

    let filteredCards = allCards;

    // Smart Filtering Logic:
    // If we are searching (meaning we fetched 0-balance cards), we want to show:
    // 1. All active cards (Remaining > 0)
    // 2. OR, if the person has NO active cards, show their most recent 0-balance card.
    //    (This satisfies "Show zeroed out cards if haven't been replaced yet")
    if (search) {
      const groupedMap = new Map<string, typeof allCards>();
      
      allCards.forEach(card => {
        // Group by Name (lowercase for consistency)
        const key = (card.name || 'unknown').toLowerCase().trim();
        if (!groupedMap.has(key)) groupedMap.set(key, []);
        groupedMap.get(key)!.push(card);
      });

      filteredCards = [];
      for (const cards of groupedMap.values()) {
        const activeCards = cards.filter(c => (c.remainingMeals || 0) > 0);
        
        if (activeCards.length > 0) {
          // User has active cards! Show them. Hide the old 0-balance ones.
          filteredCards.push(...activeCards);
        } else {
          // User has NO active cards. Show the most recent zero-balance card so we can renew it.
          // Sort by Purchase Date descending
          cards.sort((a, b) => {
            const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
            const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
            return dateB - dateA; // Descending
          });
          
          if (cards.length > 0) {
            filteredCards.push(cards[0]);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      cards: filteredCards,
    });

  } catch (error) {
    console.error('Fetch lunch cards error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lunch cards' },
      { status: 500 }
    );
  }
}
