import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = 'https://api.airtable.com/v0';
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const key = process.env.AIRTABLE_API_KEY;

async function run() {
  // 1) Update existing 3 records: change Staff Override → Check, set $12 amount
  const existingIds = [
    { id: 'recL7uZAYXohDOIm4', date: '2026-02-18' },  // 2/18
    { id: 'recj87XOdorEsdHqI', date: '2026-02-19' },  // 2/19
    { id: 'rec05oyFYpQ40uY7W', date: '2026-02-20' },  // 2/20
  ];

  console.log('=== Updating 3 existing records to Check @ $12 ===');
  for (const rec of existingIds) {
    const resp = await fetch(`${BASE}/${baseId}/${tableId}/${rec.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Payment Method': 'Check',
          'Amount': 12,
        },
      }),
    });
    const data = await resp.json();
    if (data.error) {
      console.log(`ERROR updating ${rec.id} (${rec.date}):`, data.error);
    } else {
      console.log(`Updated ${rec.date}: ${data.fields['Name']} → ${data.fields['Payment Method']} $${data.fields['Amount']}`);
    }
  }

  // 2) Create 2 new records for 2/16 and 2/17
  console.log('\n=== Creating 2 new records for 2/16 and 2/17 ===');
  const newDates = ['2026-02-16', '2026-02-17'];
  for (const date of newDates) {
    const resp = await fetch(`${BASE}/${baseId}/${tableId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Name': 'Carol Ann Hulsmann',
          'Date': date,
          'Meal Type': 'Delivery',
          'Member Status': 'Member',
          'Payment Method': 'Check',
          'Amount': 12,
          'Staff': 'SYS',
          'Notes': 'Vegetarian',
        },
      }),
    });
    const data = await resp.json();
    if (data.error) {
      console.log(`ERROR creating ${date}:`, data.error);
    } else {
      console.log(`Created ${date}: ${data.id} | ${data.fields['Name']} | ${data.fields['Payment Method']} $${data.fields['Amount']}`);
    }
  }

  // 3) Verify: 5 records total
  console.log('\n=== Verification: All Carol Ann records ===');
  const filter = encodeURIComponent(`SEARCH("hulsmann", LOWER({Name}))`);
  const verifyResp = await fetch(`${BASE}/${baseId}/${tableId}?filterByFormula=${filter}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=asc`, {
    headers: { 'Authorization': `Bearer ${key}` },
  });
  const verifyData = await verifyResp.json();
  let checkTotal = 0;
  for (const r of (verifyData.records || [])) {
    const amt = r.fields['Amount'] || 0;
    if (r.fields['Payment Method'] === 'Check') checkTotal += amt;
    console.log(`  ${r.fields['Date']} | ${r.fields['Meal Type']} | ${r.fields['Payment Method']} | $${amt} | ${r.fields['Notes'] || ''}`);
  }
  console.log(`\nCheck total: $${checkTotal} (should be $60)`);
}
run();
