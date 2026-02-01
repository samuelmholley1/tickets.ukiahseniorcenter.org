// Add Weekly Delivery fields to existing Lunch Cards table
// No new table - just extend what we have
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const tableIdMatch = envContent.match(/AIRTABLE_LUNCH_CARDS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch?.[1];
const AIRTABLE_BASE_ID = baseIdMatch?.[1];
const LUNCH_CARDS_TABLE_ID = tableIdMatch?.[1];

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !LUNCH_CARDS_TABLE_ID) {
  console.error('Missing env vars');
  process.exit(1);
}

const fieldsToAdd = [
  {
    name: 'Weekly Delivery',
    type: 'checkbox',
    description: 'Auto-include on daily delivery list (Mon-Thu)',
    options: { icon: 'check', color: 'greenBright' }
  },
  {
    name: 'Delivery Address',
    type: 'multilineText',
    description: 'Delivery address for weekly delivery customers'
  },
  {
    name: 'Include Frozen Friday',
    type: 'checkbox',
    description: 'Also get frozen Friday meal (picked up Thursday)',
    options: { icon: 'check', color: 'blueBright' }
  }
];

async function addField(field) {
  console.log(`Adding field: ${field.name}...`);
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${LUNCH_CARDS_TABLE_ID}/fields`,
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
      return true;
    }
    console.error(`   ❌ Error:`, data.error);
    return false;
  }
  
  console.log(`   ✅ Added: ${field.name}`);
  return true;
}

async function main() {
  console.log('Adding Weekly Delivery fields to Lunch Cards table...\n');
  
  for (const field of fieldsToAdd) {
    await addField(field);
  }
  
  console.log('\n✅ Done! Update AIRTABLE_SCHEMA.md with new fields.');
}

main();
