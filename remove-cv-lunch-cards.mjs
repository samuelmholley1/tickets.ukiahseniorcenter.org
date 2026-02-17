// Remove Coyote Valley customers from the Lunch Cards table.
// They are B2B (tribe pays directly), they should NOT have lunch cards.
// Their reservations are now created via /api/lunch/coyote-valley endpoint.
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const API_KEY = apiKeyMatch?.[1];
const BASE_ID = baseIdMatch?.[1];
const TABLE_ID = 'tblOBnt2ZatrSugbj'; // Lunch Cards

if (!API_KEY || !BASE_ID) {
  console.error('Missing env vars');
  process.exit(1);
}

const CV_NAMES = [
  'iris martinez', 'margaret olea', 'victor olea', 'michael brown',
  'guadalupe munoz', 'ronald hoel', 'sherry knight', 'trudy ramos', 'john feliz',
];

async function main() {
  console.log('Searching for Coyote Valley records in Lunch Cards table...\n');

  // Fetch all cards with Weekly Delivery or Coyote Valley in address
  const filter = `OR({Weekly Delivery}, FIND('COYOTE', UPPER({Delivery Address})))`;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${encodeURIComponent(filter)}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    console.error('Fetch error:', (await res.json()).error);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`Found ${data.records.length} Weekly Delivery / Coyote Valley cards:\n`);

  const toDelete = [];
  const toKeep = [];

  for (const record of data.records) {
    const name = record.fields['Name'] || '(no name)';
    const address = record.fields['Delivery Address'] || '';
    const remaining = record.fields['Remaining Meals'] || 0;
    const nameLower = name.toLowerCase().trim();

    const isCV = CV_NAMES.some(cv => nameLower.includes(cv)) ||
                 address.toUpperCase().includes('COYOTE VALLEY');

    if (isCV) {
      toDelete.push({ id: record.id, name, address, remaining });
      console.log(`  🗑️  DELETE: ${name} | ${address} | ${remaining} meals remaining`);
    } else {
      toKeep.push({ id: record.id, name, address, remaining });
      console.log(`  ✅ KEEP:   ${name} | ${address} | ${remaining} meals remaining`);
    }
  }

  console.log(`\nWill DELETE ${toDelete.length} CV cards, KEEP ${toKeep.length} other delivery cards.\n`);

  if (toDelete.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  // Delete in batches of 10
  for (let i = 0; i < toDelete.length; i += 10) {
    const batch = toDelete.slice(i, i + 10);
    const ids = batch.map(r => `records[]=${r.id}`).join('&');
    const delRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${ids}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      }
    );

    if (delRes.ok) {
      const result = await delRes.json();
      console.log(`  Deleted batch: ${result.records.map(r => r.id).join(', ')}`);
    } else {
      console.error('  Delete error:', (await delRes.json()).error);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n✅ Coyote Valley cards removed from Lunch Cards table.');
  console.log('Their reservations are now managed via /api/lunch/coyote-valley endpoint.');
}

main();
