// Apply fixes to 2/19/2026 Lunch Reservations
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const AIRTABLE_API_KEY = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/)?.[1];
const AIRTABLE_BASE_ID = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/)?.[1];
const TABLE_ID = 'tblF83nL5KPuPUDqx';

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Records to DELETE (5 records)
const toDelete = [
  { id: 'recwXANCkQ6C4Q8lN', reason: '#2 Thomas Arendell - To Go duplicate, he is dine-in tomorrow' },
  { id: 'recSKj7c1O7j43tbY', reason: '#18 Pam Hopkins - duplicate (twice listed)' },
  { id: 'recPLFhT5Ov238jbD', reason: '#27 Shirley Pedrotti - Cash $8 refund (paid for person already paid)' },
  { id: 'recTinQJSIAzsvQtl', reason: '#31 Racheal Roque - duplicate (twice listed)' },
  { id: 'recz38gPZJIO5ez7L', reason: '#42 Gail Walker - duplicate (twice listed)' },
];

// Records to UPDATE (1 record)
const toUpdate = [
  { id: 'rec3AyCe3lFRpYSiQ', fields: { 'Notes': 'vegetarian' }, reason: '#36 Linda Thompson - add vegetarian' },
];

async function main() {
  // Delete records
  console.log('=== DELETING RECORDS ===');
  for (const rec of toDelete) {
    console.log(`Deleting: ${rec.reason}`);
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}/${rec.id}`,
      { method: 'DELETE', headers }
    );
    if (!res.ok) {
      console.error(`  FAILED: ${res.status} ${await res.text()}`);
    } else {
      const data = await res.json();
      console.log(`  OK: deleted=${data.deleted}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }

  // Update records
  console.log('\n=== UPDATING RECORDS ===');
  for (const rec of toUpdate) {
    console.log(`Updating: ${rec.reason}`);
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}/${rec.id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: rec.fields }),
      }
    );
    if (!res.ok) {
      console.error(`  FAILED: ${res.status} ${await res.text()}`);
    } else {
      const data = await res.json();
      console.log(`  OK: ${data.fields.Name} - Notes: "${data.fields.Notes}"`);
    }
  }

  console.log('\nDone! Removed 5 records, updated 1 record.');
}

main().catch(err => { console.error(err); process.exit(1); });
