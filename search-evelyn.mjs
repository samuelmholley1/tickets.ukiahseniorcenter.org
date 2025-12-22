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

async function searchForEvelyn() {
  console.log('\n🔍 SEARCHING FOR EVELYN VANCE IN CHRISTMAS TABLE\n');
  
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}?filterByFormula=SEARCH("Vance",{Last Name})`,
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
  
  console.log(`Found ${data.records.length} records with last name containing "Vance":\n`);
  
  data.records.forEach(record => {
    console.log(`ID: ${record.id}`);
    console.log(`Name: ${record.fields['First Name']} ${record.fields['Last Name']}`);
    console.log(`Email: ${record.fields['Email']}`);
    console.log(`Payment: ${record.fields['Payment Method']}`);
    console.log(`Staff: ${record.fields['Staff Initials']}`);
    console.log(`Created: ${record.createdTime}`);
    console.log('---\n');
  });
}

searchForEvelyn();
