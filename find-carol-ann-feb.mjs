import 'dotenv/config';

const BASE = 'https://api.airtable.com/v0';
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const key = process.env.AIRTABLE_API_KEY;

async function run() {
  const filter = encodeURIComponent(
    `AND(SEARCH("hulsmann", LOWER({Name})), OR(IS_SAME({Date}, "2026-02-16", "day"), IS_SAME({Date}, "2026-02-17", "day"), IS_SAME({Date}, "2026-02-18", "day"), IS_SAME({Date}, "2026-02-19", "day")))`
  );
  const url = `${BASE}/${baseId}/${tableId}?filterByFormula=${filter}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  const data = await res.json();
  console.log('Found', data.records?.length || 0, 'records');
  for (const r of (data.records || [])) {
    console.log(JSON.stringify({
      id: r.id,
      name: r.fields['Name'],
      date: r.fields['Date'],
      mealType: r.fields['Meal Type'],
      memberStatus: r.fields['Member Status'],
      paymentMethod: r.fields['Payment Method'],
      amount: r.fields['Amount'],
      notes: r.fields['Notes'],
      compCard: r.fields['Comp Card Number'],
    }, null, 2));
  }
}
run();
