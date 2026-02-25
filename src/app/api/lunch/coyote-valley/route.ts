import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Coyote Valley Tribal Delivery Customers
 * B2B arrangement: Tribe pays senior center directly.
 * These 9 customers get daily delivery (Mon-Thu) + Frozen Friday (packed Thu).
 * No lunch card needed — always "Tribe Prepaid".
 */
const COYOTE_VALLEY_CUSTOMERS = [
  { routeId: 'COYOTE VALLEY #1', name: 'Iris Martinez', address: '5875 Hwy 20' },
  { routeId: 'COYOTE VALLEY #2', name: 'Margaret Olea', address: '7601 N State St, Tribal Office' },
  { routeId: 'COYOTE VALLEY #3', name: 'Victor Olea', address: '7601 N State St, Tribal Office' },
  { routeId: 'COYOTE VALLEY #4', name: 'Michael Brown', address: '104 Coyote Valley Blvd.' },
  { routeId: 'COYOTE VALLEY #5', name: 'Guadalupe Munoz', address: '4 Shodakai Ct.' },
  { routeId: 'COYOTE VALLEY #6', name: 'Ronald Hoel Sr.', address: '128 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #7', name: 'Sherry Knight', address: '128 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #8', name: 'Trudy Ramos', address: '129 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #9', name: 'John Feliz Sr.', address: '6 Coyote Valley Blvd.' },
];

/**
 * POST /api/lunch/coyote-valley
 * Body: { date: "YYYY-MM-DD" }  OR  { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
 *
 * Creates Lunch Reservation records for all 9 Coyote Valley customers.
 * - Mon-Thu: one Delivery reservation each
 * - If a Thursday is included, also creates Frozen Friday reservations for the next day (Friday)
 * - Skips customers who already have a reservation for that date (idempotent)
 * - Payment Method = "Tribe Prepaid", Amount = $0
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    const body = await request.json();
    const { date, startDate, endDate } = body;

    // Build list of dates to process
    const dates: string[] = [];

    if (startDate && endDate) {
      // Date range mode
      const start = new Date(startDate + 'T12:00:00');
      const end = new Date(endDate + 'T12:00:00');
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
      }
      const cursor = new Date(start);
      while (cursor <= end) {
        const dow = cursor.getDay();
        if (dow >= 1 && dow <= 4) { // Mon-Thu only
          dates.push(cursor.toISOString().split('T')[0]);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (date) {
      // Single date mode
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
      }
      const d = new Date(date + 'T12:00:00');
      const dow = d.getDay();
      if (dow === 0 || dow === 6) {
        return NextResponse.json({ error: 'Coyote Valley delivery is Mon-Thu only (no weekends)' }, { status: 400 });
      }
      if (dow === 5) {
        return NextResponse.json({ error: 'Friday meals are auto-created when Thursday is processed (Frozen Friday). Select a Mon-Thu date.' }, { status: 400 });
      }
      dates.push(date);
    } else {
      return NextResponse.json({ error: 'Provide "date" or "startDate"+"endDate"' }, { status: 400 });
    }

    if (dates.length === 0) {
      return NextResponse.json({ error: 'No valid Mon-Thu dates in the specified range' }, { status: 400 });
    }

    const results: { date: string; created: number; skipped: number; frozenFriday?: { date: string; created: number; skipped: number } }[] = [];
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const targetDate of dates) {
      const result = await processDate(targetDate);
      results.push(result);
      totalCreated += result.created + (result.frozenFriday?.created || 0);
      totalSkipped += result.skipped + (result.frozenFriday?.skipped || 0);
    }

    return NextResponse.json({
      success: true,
      totalCreated,
      totalSkipped,
      dates: results,
    });
  } catch (error) {
    console.error('Coyote Valley reservation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processDate(date: string): Promise<{ date: string; created: number; skipped: number; frozenFriday?: { date: string; created: number; skipped: number } }> {
  // Fetch existing reservations for this date to avoid duplicates
  const existingNames = await getExistingReservationNames(date);

  let created = 0;
  let skipped = 0;

  // Create reservations for customers who don't already have one
  const toCreate: Array<{ fields: Record<string, unknown> }> = [];

  for (const customer of COYOTE_VALLEY_CUSTOMERS) {
    if (existingNames.has(customer.name.toLowerCase().trim())) {
      skipped++;
      continue;
    }

    toCreate.push({
      fields: {
        'Name': customer.name,
        'Date': date,
        'Meal Type': 'Delivery',
        'Member Status': 'Member',
        'Payment Method': 'Tribe Prepaid',
        'Amount': 0,
        'Status': 'Reserved',
        'Notes': `📍 ${customer.routeId} — ${customer.address}`,
      },
    });
  }

  // Batch create (Airtable allows up to 10 per request)
  if (toCreate.length > 0) {
    created = await batchCreateRecords(toCreate);
  }

  // If this is a Thursday, also create Frozen Friday reservations for the next day
  const targetDate = new Date(date + 'T12:00:00');
  let frozenFriday: { date: string; created: number; skipped: number } | undefined;

  if (targetDate.getDay() === 4) { // Thursday
    const fridayDate = new Date(targetDate);
    fridayDate.setDate(fridayDate.getDate() + 1);
    const fridayDateStr = fridayDate.toISOString().split('T')[0];

    const existingFridayNames = await getExistingReservationNames(fridayDateStr);
    const fridayToCreate: Array<{ fields: Record<string, unknown> }> = [];
    let fridaySkipped = 0;

    for (const customer of COYOTE_VALLEY_CUSTOMERS) {
      if (existingFridayNames.has(customer.name.toLowerCase().trim())) {
        fridaySkipped++;
        continue;
      }

      fridayToCreate.push({
        fields: {
          'Name': customer.name,
          'Date': fridayDateStr,
          'Meal Type': 'Delivery',
          'Member Status': 'Member',
          'Payment Method': 'Tribe Prepaid',
          'Amount': 0,
          'Status': 'Reserved',
          'Frozen Friday': true,
          'Notes': `🧊 FROZEN FRIDAY | 📍 ${customer.routeId} — ${customer.address}`,
        },
      });
    }

    let fridayCreated = 0;
    if (fridayToCreate.length > 0) {
      fridayCreated = await batchCreateRecords(fridayToCreate);
    }

    frozenFriday = { date: fridayDateStr, created: fridayCreated, skipped: fridaySkipped };
  }

  return { date, created, skipped, frozenFriday };
}

async function getExistingReservationNames(date: string): Promise<Set<string>> {
  const filter = `AND(IS_SAME({Date}, '${date}', 'day'), NOT({Cancelled}))`;
  const url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?filterByFormula=${encodeURIComponent(filter)}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY!}` },
  });

  if (!response.ok) return new Set();

  const data = await response.json();
  const names = new Set<string>();
  for (const record of data.records) {
    const name = (record.fields['Name'] as string || '').toLowerCase().trim();
    if (name) names.add(name);
  }
  return names;
}

async function batchCreateRecords(records: Array<{ fields: Record<string, unknown> }>): Promise<number> {
  let created = 0;

  // Airtable batch limit: 10 records per request
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);

    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: batch, typecast: true }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      created += data.records.length;
    } else {
      const error = await response.json();
      console.error('Airtable batch create error:', error);
    }

    // Rate limit safety
    if (i + 10 < records.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return created;
}

/**
 * GET /api/lunch/coyote-valley
 * Returns the list of Coyote Valley customers (for reference/display)
 */
export async function GET() {
  return NextResponse.json({
    customers: COYOTE_VALLEY_CUSTOMERS,
    count: COYOTE_VALLEY_CUSTOMERS.length,
    schedule: 'Mon-Thu Delivery + Frozen Friday (packed Thursday)',
    payment: 'Tribe Prepaid (B2B — Coyote Valley Tribe pays Senior Center directly)',
  });
}
