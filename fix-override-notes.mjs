import 'dotenv/config';

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;
const tableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const API = `https://api.airtable.com/v0/${baseId}/${tableId}`;
const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

// Step 1: Find all records with "Override:" in Notes
const filter = encodeURIComponent("FIND('Override:', {Notes})");
const res = await fetch(`${API}?filterByFormula=${filter}&maxRecords=100`, { headers });
const data = await res.json();

console.log(`Found ${data.records?.length || 0} records with Override in Notes\n`);

if (!data.records || data.records.length === 0) {
  console.log('Nothing to fix.');
  process.exit(0);
}

// Step 2: For each record, strip the Override comment from Notes while preserving dietary info
for (const rec of data.records) {
  const id = rec.id;
  const name = rec.fields['Name'];
  const date = rec.fields['Date'];
  const oldNotes = rec.fields['Notes'] || '';
  const paymentComment = rec.fields['Payment Comment'] || '';

  // Split by pipe delimiter, remove any segment that starts with "Override:"
  const parts = oldNotes.split(/\s*\|\s*/);
  const cleaned = parts.filter(p => !p.trim().startsWith('Override:')).join(' | ').trim();

  // Remove trailing/leading pipes
  const finalNotes = cleaned.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '').trim();

  console.log(`[${name}] ${date}`);
  console.log(`  OLD Notes: "${oldNotes}"`);
  console.log(`  NEW Notes: "${finalNotes}"`);
  console.log(`  Payment Comment: "${paymentComment}"`);

  // Update the record
  const updateRes = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { Notes: finalNotes } }),
  });

  if (updateRes.ok) {
    console.log(`  ✅ Updated\n`);
  } else {
    const err = await updateRes.text();
    console.log(`  ❌ Failed: ${err}\n`);
  }
}

// Step 3: Also find and clean any records with "Check #" in Notes
console.log('\n--- Checking for Check # in Notes ---');
const checkFilter = encodeURIComponent("FIND('Check #', {Notes})");
const checkRes = await fetch(`${API}?filterByFormula=${checkFilter}&maxRecords=100`, { headers });
const checkData = await checkRes.json();
console.log(`Found ${checkData.records?.length || 0} records with Check # in Notes\n`);

for (const rec of (checkData.records || [])) {
  const id = rec.id;
  const name = rec.fields['Name'];
  const date = rec.fields['Date'];
  const oldNotes = rec.fields['Notes'] || '';

  const parts = oldNotes.split(/\s*\|\s*/);
  const cleaned = parts.filter(p => !p.trim().startsWith('Check #')).join(' | ').trim();
  const finalNotes = cleaned.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '').trim();

  if (finalNotes === oldNotes) continue;

  console.log(`[${name}] ${date}`);
  console.log(`  OLD Notes: "${oldNotes}"`);
  console.log(`  NEW Notes: "${finalNotes}"`);

  const updateRes = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { Notes: finalNotes } }),
  });
  console.log(updateRes.ok ? `  ✅ Updated\n` : `  ❌ Failed\n`);
}

// Step 4: Also find and clean any records with "Comp #" in Notes
console.log('\n--- Checking for Comp # in Notes ---');
const compFilter = encodeURIComponent("FIND('Comp #', {Notes})");
const compRes = await fetch(`${API}?filterByFormula=${compFilter}&maxRecords=100`, { headers });
const compData = await compRes.json();
console.log(`Found ${compData.records?.length || 0} records with Comp # in Notes\n`);

for (const rec of (compData.records || [])) {
  const id = rec.id;
  const name = rec.fields['Name'];
  const date = rec.fields['Date'];
  const oldNotes = rec.fields['Notes'] || '';

  const parts = oldNotes.split(/\s*\|\s*/);
  const cleaned = parts.filter(p => !p.trim().startsWith('Comp #')).join(' | ').trim();
  const finalNotes = cleaned.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '').trim();

  if (finalNotes === oldNotes) continue;

  console.log(`[${name}] ${date}`);
  console.log(`  OLD Notes: "${oldNotes}"`);
  console.log(`  NEW Notes: "${finalNotes}"`);

  const updateRes = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { Notes: finalNotes } }),
  });
  console.log(updateRes.ok ? `  ✅ Updated\n` : `  ❌ Failed\n`);
}

// Step 5: Add Vegetarian note for Carol Ann Hulsmann on 2/18
console.log('\n--- Adding Vegetarian for Carol Ann Hulsmann 2/18 ---');
const carolFilter = encodeURIComponent("AND(FIND('Carol Ann', {Name}), IS_SAME({Date}, '2026-02-18', 'day'))");
const carolRes = await fetch(`${API}?filterByFormula=${carolFilter}&maxRecords=10`, { headers });
const carolData = await carolRes.json();
console.log(`Found ${carolData.records?.length || 0} records for Carol Ann on 2/18`);

for (const rec of (carolData.records || [])) {
  const name = rec.fields['Name'];
  const oldNotes = rec.fields['Notes'] || '';
  
  // Don't add if already has vegetarian
  if (oldNotes.toLowerCase().includes('vegetarian')) {
    console.log(`  [${name}] Already has Vegetarian in notes: "${oldNotes}"`);
    continue;
  }

  const newNotes = oldNotes ? `${oldNotes} | Vegetarian` : 'Vegetarian';
  console.log(`  [${name}] "${oldNotes}" → "${newNotes}"`);

  const updateRes = await fetch(`${API}/${rec.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: { Notes: newNotes } }),
  });
  console.log(updateRes.ok ? `  ✅ Updated\n` : `  ❌ Failed\n`);
}

console.log('\nDone!');
