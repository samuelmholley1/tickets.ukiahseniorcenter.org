// Add Frozen Friday checkbox field to Lunch Reservations table
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const tableIdMatch = envContent.match(/AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch?.[1];
const AIRTABLE_BASE_ID = baseIdMatch?.[1];
const TABLE_ID = tableIdMatch?.[1];

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !TABLE_ID) {
  console.error('Missing env vars');
  process.exit(1);
}

const field = {
  name: 'Frozen Friday',
  type: 'checkbox',
  description: 'Is this a frozen Friday meal (picked up Thursday)?',
  options: { icon: 'check', color: 'blueBright' }
};

async function addField() {
  console.log(`Adding field: ${field.name}...`);
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${TABLE_ID}/fields`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(field)
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    if (data.error?.message?.includes('already exists')) {
      console.log(`   ⚠️  Field "${field.name}" already exists, skipping`);
      return;
    }
    console.error(`   ❌ Error:`, data.error);
    return;
  }
  
  console.log(`   ✅ Added: ${field.name}`);
}

addField();
