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

    // Fetch all reservations that are linked to this lunch card
    // The "Lunch Card" field on reservations is a linked record field
    const filterFormula = encodeURIComponent(`FIND('${cardId}', ARRAYJOIN({Lunch Card}))`);
    
    const allRecords: Array<{ id: string; fields: Record<string, unknown>; createdTime: string }> = [];
    let offset: string | undefined;

    do {
      let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${reservationsTableId}?filterByFormula=${filterFormula}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc`;
      if (offset) url += `&offset=${offset}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        throw new Error(`Airtable error: ${response.status}`);
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    // Also fetch the card itself for summary info
    const cardsTableId = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;
    let cardInfo = null;
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
      }
    }

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
