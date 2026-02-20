import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = 'https://api.airtable.com/v0';
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const key = process.env.AIRTABLE_API_KEY;

async function run() {
  // Get ALL Carol Ann Hulsmann records
  const filter = encodeURIComponent(`OR(SEARCH("carol", LOWER({Name})), SEARCH("hulsmann", LOWER({Name})))`);
  const url = `${BASE}/${baseId}/${tableId}?filterByFormula=${filter}&maxRecords=50`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  const data = await res.json();
  console.log('Total Carol/Hulsmann records:', data.records?.length || 0);
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
      staff: r.fields['Staff'],
    }, null, 2));
  }
}
run();
