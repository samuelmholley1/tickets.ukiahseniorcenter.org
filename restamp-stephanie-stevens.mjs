import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const BASE = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const HEADERS = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
console.log('BASE_ID:', BASE_ID, 'TABLE_ID:', TABLE_ID, 'KEY set:', !!API_KEY);

// Find Stephanie Stevens Cash records for 2/18/2026
const filter = encodeURIComponent(`FIND('Stephanie', {Name})`);
const res = await fetch(`${BASE}?filterByFormula=${filter}`, { headers: HEADERS });
const body = await res.json();
console.log('Status:', res.status);
console.log('Records count:', body.records?.length);
if (body.error) console.log('Error:', body.error);
const { records } = body;

if (!records || records.length === 0) {
  console.log('No matching records found at all.');
  process.exit(0);
}

console.log(`Found ${records.length} record(s):`);
records.forEach(r => {
  console.log(`  [${r.id}] "${r.fields['Name']}" | Date: ${r.fields['Date']} | ${r.fields['Payment Method']} | $${r.fields['Amount']} | ${r.fields['Member Status']} | createdTime: ${r.createdTime}`);
});
console.log('Proceeding to duplicate and delete originals...\n');

// Duplicate each record (creates a new record with createdTime = now)
const newIds = [];
for (const r of records) {
  const fields = { ...r.fields };
  // Remove any read-only/computed fields Airtable won't accept
  delete fields['Created Time'];
  delete fields['Last Modified Time'];

  const createRes = await fetch(BASE, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ records: [{ fields }] }),
  });
  const created = await createRes.json();
  if (created.records?.[0]) {
    const newId = created.records[0].id;
    newIds.push(newId);
    console.log(`  Created duplicate: ${newId} (createdTime = now)`);
  } else {
    console.error('  Failed to create duplicate:', JSON.stringify(created));
    process.exit(1);
  }
}

// Delete originals
for (const r of records) {
  const delRes = await fetch(`${BASE}/${r.id}`, { method: 'DELETE', headers: HEADERS });
  const delData = await delRes.json();
  if (delData.deleted) {
    console.log(`  Deleted original: ${r.id}`);
  } else {
    console.error('  Failed to delete original:', JSON.stringify(delData));
  }
}

console.log('\nDone. New records have today\'s creation timestamp.');
