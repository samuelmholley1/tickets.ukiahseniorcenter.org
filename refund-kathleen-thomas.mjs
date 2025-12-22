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

async function markKathleenThomasRefunded() {
  console.log('\n🔍 Finding KATHLEEN THOMAS record...\n');
  
  // Fetch all records to find KATHLEEN THOMAS
  const response = await fetch(`${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  const data = await response.json();
  const kathleenRecord = data.records.find(r => 
    r.fields['First Name']?.toUpperCase() === 'KATHLEEN' && 
    r.fields['Last Name']?.toUpperCase() === 'THOMAS'
  );
  
  if (!kathleenRecord) {
    console.log('❌ KATHLEEN THOMAS not found');
    return;
  }
  
  console.log(`Found: ${kathleenRecord.fields['First Name']} ${kathleenRecord.fields['Last Name']}`);
  console.log(`Record ID: ${kathleenRecord.id}`);
  console.log(`Tickets: ${kathleenRecord.fields['Ticket Quantity']}`);
  console.log(`Email: ${kathleenRecord.fields['Email']}\n`);
  
  // Update record to mark as refunded
  const updateResponse = await fetch(`${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}/${kathleenRecord.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        'Refunded': true
      }
    })
  });
  
  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    console.log('❌ Error updating record:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Successfully marked KATHLEEN THOMAS as REFUNDED\n');
  }
}

markKathleenThomasRefunded();
