// Create "Comp Card Number" field in Lunch Reservations table
// and migrate any existing comp card numbers from Notes field
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch?.[1];
const AIRTABLE_BASE_ID = baseIdMatch?.[1];
const RESERVATIONS_TABLE_ID = 'tblF83nL5KPuPUDqx';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Step 1: Create the new field
async function createField() {
  console.log('Step 1: Creating "Comp Card Number" field in Lunch Reservations table...');
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${RESERVATIONS_TABLE_ID}/fields`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Comp Card Number',
        type: 'singleLineText',
        description: 'Comp card number for comp card payments',
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    if (text.includes('DUPLICATE') || text.includes('DUPLICATE_FIELD_NAME')) {
      console.log('  Field already exists, skipping creation.');
      // Get the field ID from schema
      const schemaRes = await fetch(
        `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
        { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
      );
      const schema = await schemaRes.json();
      const table = schema.tables.find(t => t.id === RESERVATIONS_TABLE_ID);
      const field = table.fields.find(f => f.name === 'Comp Card Number');
      return field?.id;
    }
    throw new Error(`Failed to create field: ${response.status} ${text}`);
  }

  const result = await response.json();
  console.log(`  Created field: ${result.name} (${result.id})`);
  return result.id;
}

// Step 2: Find records with "Comp Card #" in Notes
async function findCompCardRecords() {
  console.log('\nStep 2: Searching for records with "Comp Card #" in Notes...');
  
  const allRecords = [];
  let offset = null;
  
  do {
    const params = new URLSearchParams();
    params.set('filterByFormula', 'FIND("Comp Card #", {Notes}) > 0');
    params.append('fields[]', 'Notes');
    params.append('fields[]', 'Name');
    params.append('fields[]', 'Date');
    params.set('pageSize', '100');
    if (offset) params.set('offset', offset);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${RESERVATIONS_TABLE_ID}?${params}`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);
  
  console.log(`  Found ${allRecords.length} records with comp card numbers in Notes.`);
  return allRecords;
}

// Step 3: Migrate comp card numbers to new field and clean Notes
async function migrateRecords(records) {
  if (records.length === 0) {
    console.log('\nNo records to migrate.');
    return;
  }
  
  console.log(`\nStep 3: Migrating ${records.length} records...`);
  
  // Parse comp card number from Notes and prepare updates
  const updates = records.map(record => {
    const notes = record.fields.Notes || '';
    // Extract comp card number - pattern: "Comp Card #123"
    const match = notes.match(/Comp Card #(\S+)/);
    const compCardNum = match ? match[1] : '';
    
    // Remove the comp card part from notes
    let cleanNotes = notes
      .replace(/\s*\|\s*Comp Card #\S+/, '')  // " | Comp Card #123" at end
      .replace(/Comp Card #\S+\s*\|\s*/, '')  // "Comp Card #123 | " at start
      .replace(/Comp Card #\S+/, '')           // standalone "Comp Card #123"
      .trim();
    
    console.log(`  ${record.fields.Name} (${record.fields.Date}): Card #${compCardNum}`);
    if (cleanNotes !== notes) {
      console.log(`    Notes: "${notes}" → "${cleanNotes}"`);
    }
    
    return {
      id: record.id,
      fields: {
        'Comp Card Number': compCardNum,
        'Notes': cleanNotes,
      },
    };
  });
  
  // Airtable batch update: max 10 records per request
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${RESERVATIONS_TABLE_ID}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: batch }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to update batch ${i / 10 + 1}: ${response.status} ${await response.text()}`);
    }
    
    console.log(`  Updated batch ${i / 10 + 1} (${batch.length} records)`);
    
    // Rate limit: 5 requests per second
    if (i + 10 < updates.length) {
      await new Promise(r => setTimeout(r, 250));
    }
  }
  
  console.log('\nMigration complete!');
}

// Run
try {
  const fieldId = await createField();
  console.log(`  Field ID: ${fieldId}`);
  
  const records = await findCompCardRecords();
  await migrateRecords(records);
  
  console.log('\nDone! New field ID:', fieldId);
  console.log('Update AIRTABLE_SCHEMA.md with this field ID.');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
