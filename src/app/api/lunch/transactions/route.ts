import { NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
}

export interface LunchTransaction {
  id: string;
  type: 'lunch_card' | 'reservation';
  createdAt: string;
  name: string;
  date?: string; // Only for reservations
  mealType: string;
  memberStatus: string;
  amount: number;
  paymentMethod: string;
  staff: string;
  // Card-specific
  cardType?: string;
  remainingMeals?: number;
  phone?: string;
  // Reservation-specific
  notes?: string;
  isFrozenFriday?: boolean;
}

export async function GET() {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const lunchCardsTableId = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;
    const reservationsTableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;

    if (!lunchCardsTableId || !reservationsTableId) {
      throw new Error('Lunch tables not configured');
    }

    // Fetch recent lunch cards (last 20)
    const cardsResponse = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${lunchCardsTableId}?maxRecords=20&sort%5B0%5D%5Bfield%5D=Purchase%20Date&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    // Fetch recent reservations (last 30)
    const reservationsResponse = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${reservationsTableId}?maxRecords=30&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!cardsResponse.ok || !reservationsResponse.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const cardsData = await cardsResponse.json();
    const reservationsData = await reservationsResponse.json();

    const transactions: LunchTransaction[] = [];

    // Process lunch cards
    for (const record of cardsData.records as AirtableRecord[]) {
      transactions.push({
        id: record.id,
        type: 'lunch_card',
        createdAt: record.createdTime,
        name: (record.fields['Name'] as string) || 'Unknown',
        mealType: (record.fields['Meal Type'] as string) || '',
        memberStatus: (record.fields['Member Status'] as string) || '',
        amount: (record.fields['Amount Paid'] as number) || 0,
        paymentMethod: (record.fields['Payment Method'] as string) || '',
        staff: (record.fields['Staff'] as string) || '',
        cardType: (record.fields['Card Type'] as string) || '',
        remainingMeals: (record.fields['Remaining Meals'] as number) || 0,
        phone: (record.fields['Phone'] as string) || '',
      });
    }

    // Process reservations
    for (const record of reservationsData.records as AirtableRecord[]) {
      transactions.push({
        id: record.id,
        type: 'reservation',
        createdAt: record.createdTime,
        name: (record.fields['Name'] as string) || 'Unknown',
        date: (record.fields['Date'] as string) || '',
        mealType: (record.fields['Meal Type'] as string) || '',
        memberStatus: (record.fields['Member Status'] as string) || '',
        amount: (record.fields['Amount'] as number) || 0,
        paymentMethod: (record.fields['Payment Method'] as string) || '',
        staff: (record.fields['Staff'] as string) || '',
        notes: (record.fields['Notes'] as string) || '',
        isFrozenFriday: ((record.fields['Notes'] as string) || '').includes('FROZEN FRIDAY'),
      });
    }

    // Sort by createdAt descending (most recent first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return top 30 transactions
    return NextResponse.json({
      success: true,
      transactions: transactions.slice(0, 30),
    });

  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
