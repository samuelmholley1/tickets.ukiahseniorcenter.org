// Find and clean records that have Check #, Comp #, or Override: in Notes field
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;
const tableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;

const filter = `OR(FIND("Check #",{Notes}),FIND("Comp #",{Notes}),FIND("Override:",{Notes}))`;
const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}?filterByFormula=${encodeURIComponent(filter)}`;

const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
const data = await res.json();

console.log(`Found ${data.records?.length || 0} polluted records\n`);

if (!data.records || data.records.length === 0) {
  console.log('Nothing to fix!');
  process.exit(0);
}

for (const record of data.records) {
  const id = record.id;
  const name = record.fields['Name'];
  const notes = record.fields['Notes'] || '';
  const paymentComment = record.fields['Payment Comment'] || '';
  const paymentMethod = record.fields['Payment Method'] || '';

  console.log(`--- ${name} (${id})`);
  console.log(`  Notes BEFORE: "${notes}"`);
  console.log(`  Payment Comment: "${paymentComment}"`);
  console.log(`  Payment Method: ${paymentMethod}`);

  // Clean the Notes field — remove payment metadata
  let cleaned = notes
    .replace(/Check\s*#\s*\S+/gi, '')
    .replace(/Comp\s*#\s*\S+/gi, '')
    .replace(/Override:\s*[^|]*/gi, '')
    .replace(/\s*\|\s*\|\s*/g, ' | ')
    .replace(/^\s*\|\s*/g, '')
    .replace(/\s*\|\s*$/g, '')
    .trim();

  if (cleaned === notes) {
    console.log('  (no change needed)');
    continue;
  }

  console.log(`  Notes AFTER:  "${cleaned}"`);

  // Update the record
  const updateRes = await fetch(`${AIRTABLE_API_BASE}/${baseId}/${tableId}/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { Notes: cleaned } }),
  });

  if (updateRes.ok) {
    console.log('  ✅ Updated');
  } else {
    const err = await updateRes.text();
    console.log(`  ❌ Failed: ${err}`);
  }
}

console.log('\nDone!');
