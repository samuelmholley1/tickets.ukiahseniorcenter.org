import { readFileSync } from 'fs';

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const BASE_ID = env.AIRTABLE_BASE_ID;
const CHRISTMAS_TABLE_ID = env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID;
const API_KEY = env.AIRTABLE_API_KEY;

console.log('\n🔍 FINDING CHARLOTTE/CHAROLETTE JACOBS RECORDS\n');
console.log('==================================================\n');

// Search for both spellings
const response = await fetch(
  `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}?filterByFormula=SEARCH("Jacobs",{Last Name})`,
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  }
);

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
}

const data = await response.json();

console.log(`Found ${data.records.length} Jacobs records:\n`);

data.records.forEach(record => {
  const firstName = record.fields['First Name'];
  const lastName = record.fields['Last Name'];
  const email = record.fields['Email'];
  const qty = record.fields['Ticket Quantity'];
  const created = new Date(record.createdTime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  
  console.log(`${firstName} ${lastName} (${email})`);
  console.log(`   Tickets: ${qty}`);
  console.log(`   Record ID: ${record.id}`);
  console.log(`   Created: ${created}`);
  
  if (firstName === 'Charolette') {
    console.log(`   ❌ MISSPELLED - Should delete`);
  } else if (firstName === 'Charlotte') {
    console.log(`   ✅ CORRECT SPELLING - Keep this one`);
  }
  console.log('');
});

console.log('==================================================\n');

// Find the misspelled one to delete
const misspelledRecord = data.records.find(r => r.fields['First Name'] === 'Charolette');

if (misspelledRecord) {
  console.log(`🗑️  DELETING MISSPELLED RECORD: Charolette Jacobs (${misspelledRecord.id})\n`);
  
  const deleteResponse = await fetch(
    `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}/${misspelledRecord.id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );

  if (!deleteResponse.ok) {
    const errorText = await deleteResponse.text();
    console.log(`❌ Failed to delete: ${errorText}\n`);
  } else {
    console.log(`✅ Deleted misspelled "Charolette" record\n`);
  }
} else {
  console.log(`ℹ️  No misspelled "Charolette" record found (may already be corrected)\n`);
}

console.log('==================================================\n');
