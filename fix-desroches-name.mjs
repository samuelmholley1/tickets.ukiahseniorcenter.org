// Fix: Rename all "John DesRoches" to "Tom DesRoches" across all Airtable tables
// Tables to check: CONTACTS, Lunch Cards, Lunch Reservations
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const API_KEY = apiKeyMatch?.[1];
const BASE_ID = baseIdMatch?.[1];

if (!API_KEY || !BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const TABLES = [
  { name: 'CONTACTS', id: 'tbl3PQZzXGpT991dH', nameFields: ['Name', 'First Name'] },
  { name: 'Lunch Cards', id: 'tblOBnt2ZatrSugbj', nameFields: ['Name'] },
  { name: 'Lunch Reservations', id: 'tblF83nL5KPuPUDqx', nameFields: ['Name'] },
];

const OLD_FIRST = 'John';
const NEW_FIRST = 'Tom';
const LAST_NAME = 'DesRoches';

async function searchAndFix(table) {
  console.log(`\n=== ${table.name} (${table.id}) ===`);
  
  // Search for any record containing "John" AND "DesRoches" or just "John DesRoches"
  const filter = `OR(
    FIND('John DesRoches', {Name}),
    FIND('John Desroches', {Name}),
    FIND('john desroches', LOWER({Name}))
  )`;
  
  let url = `https://api.airtable.com/v0/${BASE_ID}/${table.id}?filterByFormula=${encodeURIComponent(filter)}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  
  if (!response.ok) {
    const err = await response.json();
    console.error(`  ❌ Error fetching:`, err.error?.message || err);
    return;
  }
  
  const data = await response.json();
  
  if (data.records.length === 0) {
    console.log('  No "John DesRoches" records found.');
    return;
  }
  
  console.log(`  Found ${data.records.length} record(s) to fix:`);
  
  for (const record of data.records) {
    const fields = record.fields;
    const updates = {};
    
    // Check each name field
    for (const field of table.nameFields) {
      const val = fields[field];
      if (typeof val === 'string' && val.toLowerCase().includes('john')) {
        // Replace John with Tom (case-insensitive but preserve casing pattern)
        const newVal = val.replace(/John/gi, NEW_FIRST);
        updates[field] = newVal;
        console.log(`    ${field}: "${val}" → "${newVal}"`);
      }
    }
    
    // Also check First Name field specifically in CONTACTS
    if (fields['First Name'] && typeof fields['First Name'] === 'string' && fields['First Name'].toLowerCase() === 'john') {
      updates['First Name'] = NEW_FIRST;
      console.log(`    First Name: "John" → "Tom"`);
    }
    
    if (Object.keys(updates).length > 0) {
      const updateRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${table.id}/${record.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updates }),
      });
      
      if (updateRes.ok) {
        console.log(`    ✅ Updated record ${record.id}`);
      } else {
        const err = await updateRes.json();
        console.error(`    ❌ Failed:`, err.error?.message || err);
      }
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
}

async function main() {
  console.log('Renaming "John DesRoches" → "Tom DesRoches" across all Airtable tables...');
  
  for (const table of TABLES) {
    await searchAndFix(table);
  }
  
  console.log('\n✅ Done!');
}

main();
