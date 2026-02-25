import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

// Fetch all reservations (meal punches) linked to a specific lunch card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const reservationsTableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
    if (!reservationsTableId) {
      throw new Error('Reservations table not configured');
    }

    // Fetch the card first to get its linked reservation IDs and card info
    const cardsTableId = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;
    let cardInfo = null;
    let linkedReservationIds: string[] = [];
    
    if (cardsTableId) {
      const cardRes = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${cardsTableId}/${cardId}`,
        { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
      );
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        cardInfo = {
          id: cardData.id,
          name: cardData.fields['Name'] || '',
          totalMeals: cardData.fields['Total Meals'] || cardData.fields['Card Type'] || '',
          remainingMeals: cardData.fields['Remaining Meals'] || 0,
          cardType: cardData.fields['Card Type'] || '',
          memberStatus: cardData.fields['Member Status'] || '',
          purchaseDate: cardData.fields['Purchase Date'] || '',
          paymentMethod: cardData.fields['Payment Method'] || '',
        };
        // Get linked reservation IDs from the card's "Lunch Reservations" linked record field
        linkedReservationIds = (cardData.fields['Lunch Reservations'] as string[]) || [];
      }
    }

    // Fetch the linked reservation records in batches (Airtable supports fetching by record ID)
    const allRecords: Array<{ id: string; fields: Record<string, unknown>; createdTime: string }> = [];
    
    if (linkedReservationIds.length > 0) {
      // Airtable API allows fetching multiple records by ID using filterByFormula with OR(RECORD_ID()=...)
      // But for many records, do it in batches of 50 via individual record ID fetch
      // Use OR formula approach for efficiency
      const batchSize = 50;
      for (let i = 0; i < linkedReservationIds.length; i += batchSize) {
        const batch = linkedReservationIds.slice(i, i + batchSize);
        const orClauses = batch.map(id => `RECORD_ID()='${id}'`).join(',');
        const filterFormula = encodeURIComponent(`OR(${orClauses})`);
        
        const url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${reservationsTableId}?filterByFormula=${filterFormula}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });

        if (response.ok) {
          const data = await response.json();
          allRecords.push(...data.records);
          // Handle pagination within batch
          let offset = data.offset;
          while (offset) {
            const pageUrl = url + `&offset=${offset}`;
            const pageRes = await fetch(pageUrl, {
              headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
            });
            if (!pageRes.ok) break;
            const pageData = await pageRes.json();
            allRecords.push(...pageData.records);
            offset = pageData.offset;
          }
        }
      }
    }

    // Sort by date descending
    allRecords.sort((a, b) => {
      const dateA = (a.fields['Date'] as string) || '';
      const dateB = (b.fields['Date'] as string) || '';
      return dateB.localeCompare(dateA);
    });

    const punches = allRecords.map(record => ({
      id: record.id,
      date: (record.fields['Date'] as string) || '',
      name: (record.fields['Name'] as string) || '',
      mealType: (record.fields['Meal Type'] as string) || '',
      memberStatus: (record.fields['Member Status'] as string) || '',
      paymentMethod: (record.fields['Payment Method'] as string) || '',
      notes: (record.fields['Notes'] as string) || '',
      amount: (record.fields['Amount'] as number) || 0,
      staff: (record.fields['Staff'] as string) || '',
      createdAt: record.createdTime,
    }));

    return NextResponse.json({
      success: true,
      cardInfo,
      punches,
      totalPunches: punches.length,
    });

  } catch (error) {
    console.error('Card history error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch card history' },
      { status: 500 }
    );
  }
}
