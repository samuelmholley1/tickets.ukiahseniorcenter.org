import { NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
}

export interface LunchTransaction {
  id: string;
  type: 'lunch_card' | 'reservation' | 'cancellation';
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
  // Cancel/modify tracking
  cancelled?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
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

    // Only show records from 2/17/2026 onwards (fresh start after 2-week gap)
    const CUTOFF_DATE = '2026-02-17';

    // Helper: fetch ALL pages from Airtable (100 records per page)
    async function fetchAllPages(tableId: string, filter: string, sortField: string): Promise<AirtableRecord[]> {
      const allRecords: AirtableRecord[] = [];
      let offset: string | undefined;
      do {
        const url = new URL(`${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${tableId}`);
        url.searchParams.set('filterByFormula', filter);
        url.searchParams.set('sort[0][field]', sortField);
        url.searchParams.set('sort[0][direction]', 'desc');
        if (offset) url.searchParams.set('offset', offset);

        const resp = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });
        if (!resp.ok) throw new Error(`Airtable fetch failed: ${resp.status}`);
        const data = await resp.json();
        allRecords.push(...(data.records || []));
        offset = data.offset;
      } while (offset);
      return allRecords;
    }

    // Fetch ALL lunch cards (purchased on or after cutoff)
    const cardsFilter = `OR(IS_SAME({Purchase Date}, '${CUTOFF_DATE}', 'day'), IS_AFTER({Purchase Date}, '${CUTOFF_DATE}'))`;
    const cardsRecords = await fetchAllPages(lunchCardsTableId, cardsFilter, 'Purchase Date');

    // Fetch ALL reservations (date on or after cutoff) — include cancelled for audit trail
    const reservationsFilter = `OR(IS_SAME({Date}, '${CUTOFF_DATE}', 'day'), IS_AFTER({Date}, '${CUTOFF_DATE}'))`;
    const reservationsRecords = await fetchAllPages(reservationsTableId, reservationsFilter, 'Date');

    const transactions: LunchTransaction[] = [];

    // Process lunch cards
    for (const record of cardsRecords) {
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
    for (const record of reservationsRecords) {
      const isCancelled = !!(record.fields['Cancelled']);
      const cancelledAt = (record.fields['Cancelled At'] as string) || '';
      const cancelledBy = (record.fields['Cancelled By'] as string) || '';

      // Always push the original reservation row
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
        cancelled: isCancelled,
        cancelledAt: cancelledAt,
        cancelledBy: cancelledBy,
      });

      // For cancelled reservations, also emit a cancellation event row
      if (isCancelled && cancelledAt) {
        transactions.push({
          id: `${record.id}-cancel`,
          type: 'cancellation',
          createdAt: cancelledAt,
          name: (record.fields['Name'] as string) || 'Unknown',
          date: (record.fields['Date'] as string) || '',
          mealType: (record.fields['Meal Type'] as string) || '',
          memberStatus: (record.fields['Member Status'] as string) || '',
          amount: -((record.fields['Amount'] as number) || 0),
          paymentMethod: (record.fields['Payment Method'] as string) || '',
          staff: cancelledBy,
          notes: '',
          cancelled: true,
          cancelledAt: cancelledAt,
          cancelledBy: cancelledBy,
        });
      }
    }

    // Sort by createdAt descending (most recent first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return all transactions (already filtered by cutoff date)
    return NextResponse.json({
      success: true,
      transactions,
    });

  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
