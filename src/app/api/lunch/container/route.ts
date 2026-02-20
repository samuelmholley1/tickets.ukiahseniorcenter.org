import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const { staff } = await request.json();

    if (!staff?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }

    // Get today's date in Pacific Time
    const now = new Date();
    const pacificDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const year = pacificDate.getFullYear();
    const month = String(pacificDate.getMonth() + 1).padStart(2, '0');
    const day = String(pacificDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const payload = {
      fields: {
        'Name': 'Anonymous',
        'Date': todayStr,
        'Meal Type': 'To Go',
        'Member Status': 'Member',
        'Amount': 1,
        'Payment Method': 'Cash',
        'Staff': staff.trim().substring(0, 50),
        'Status': 'Reserved',
        'Notes': '$1 To Go container fee',
      },
      typecast: true,
    };

    console.log('Creating $1 container charge:', JSON.stringify(payload, null, 2));

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
      console.error('Airtable error creating container charge:', errorText);
      throw new Error(`Failed to create container charge: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: '$1 To Go container charge recorded',
    });
  } catch (error) {
    console.error('Container charge error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create container charge' },
      { status: 500 }
    );
  }
}
