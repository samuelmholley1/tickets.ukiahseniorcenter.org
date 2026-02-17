// Split Debbie Zimmerer's lunch card into two cards:
// 1. Dine In: 1 remaining / 5 total
// 2. Pick Up: 3 remaining / 5 total

import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const cardsTableMatch = envContent.match(/AIRTABLE_LUNCH_CARDS_TABLE_ID=([^\s\r\n]+)/);

const API_KEY = apiKeyMatch?.[1];
const BASE_ID = baseIdMatch?.[1];
const TABLE_ID = cardsTableMatch?.[1] || 'tblOBnt2ZatrSugbj';

if (!API_KEY || !BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const API_BASE = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  // Step 1: Find Debbie Zimmerer's current card(s)
  const searchUrl = `${API_BASE}?filterByFormula=SEARCH("Debbie Zimmerer",{Name})`;
  const res = await fetch(searchUrl, { headers });
  const data = await res.json();

  console.log(`Found ${data.records?.length || 0} card(s) for Debbie Zimmerer:`);
  for (const rec of data.records || []) {
    console.log(`  ID: ${rec.id}`);
    console.log(`  Name: ${rec.fields['Name']}`);
    console.log(`  Card Type: ${rec.fields['Card Type']}`);
    console.log(`  Total Meals: ${rec.fields['Total Meals']}`);
    console.log(`  Remaining Meals: ${rec.fields['Remaining Meals']}`);
    console.log(`  Member Status: ${rec.fields['Member Status']}`);
    console.log(`  Purchase Date: ${rec.fields['Purchase Date']}`);
    console.log(`  Payment Method: ${rec.fields['Payment Method']}`);
    console.log(`  ---`);
  }

  if (!data.records?.length) {
    console.log('No cards found for Debbie Zimmerer. Creating both new cards...');
  }

  // Step 2: Delete existing card(s)
  for (const rec of data.records || []) {
    console.log(`Deleting existing card ${rec.id}...`);
    const delRes = await fetch(`${API_BASE}/${rec.id}`, { method: 'DELETE', headers });
    const delData = await delRes.json();
    console.log(`  Deleted: ${delData.deleted ? 'yes' : 'no'}`);
  }

  // Step 3: Create two new cards
  const today = new Date().toISOString().split('T')[0];

  const newCards = [
    {
      fields: {
        'Name': 'Debbie Zimmerer',
        'Card Type': 'Dine In',
        'Total Meals': 5,
        'Remaining Meals': 1,
        'Member Status': 'Member',
        'Purchase Date': today,
        'Payment Method': 'Cash',
      }
    },
    {
      fields: {
        'Name': 'Debbie Zimmerer',
        'Card Type': 'Pick Up',
        'Total Meals': 5,
        'Remaining Meals': 3,
        'Purchase Date': today,
        'Member Status': 'Member',
        'Payment Method': 'Cash',
      }
    },
  ];

  const createRes = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: newCards, typecast: true }),
  });
  const createData = await createRes.json();

  if (createData.error) {
    console.error('Error creating cards:', createData.error);
    return;
  }

  console.log(`\nCreated ${createData.records.length} new cards:`);
  for (const rec of createData.records) {
    console.log(`  ID: ${rec.id}`);
    console.log(`  Card Type: ${rec.fields['Card Type']}`);
    console.log(`  Total Meals: ${rec.fields['Total Meals']}`);
    console.log(`  Remaining: ${rec.fields['Remaining Meals']}`);
    console.log(`  ---`);
  }

  console.log('\nDone! Debbie Zimmerer now has 2 cards:');
  console.log('  1. Dine In: 1 remaining of 5');
  console.log('  2. Pick Up: 3 remaining of 5');
}

main().catch(console.error);
