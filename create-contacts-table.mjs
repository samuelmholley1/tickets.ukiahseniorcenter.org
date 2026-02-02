// Create the Contacts table in Airtable
// Run with: node create-contacts-table.mjs

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';

async function createContactsTable() {
  console.log('Creating Contacts table...');
  console.log('Using BASE_ID:', BASE_ID);
  console.log('API Key exists:', !!API_KEY);
  console.log('');

  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Contacts',
      description: 'Master contact list for all customers - deduplicated from ticket purchases',
      fields: [
        { name: 'First Name', type: 'singleLineText' },
        { name: 'Last Name', type: 'singleLineText' },
        { name: 'Email', type: 'email' },
        { name: 'Phone', type: 'phoneNumber' },
        { name: 'Member Status', type: 'singleSelect', options: { choices: [
          { name: 'Member', color: 'greenBright' },
          { name: 'Non-Member', color: 'orangeBright' },
          { name: 'Unknown', color: 'grayBright' },
        ]}},
        { name: 'Source', type: 'singleLineText', description: 'Where this contact was first added from' },
        { name: 'Date Added', type: 'dateTime', options: { timeZone: 'America/Los_Angeles', dateFormat: { name: 'local' }, timeFormat: { name: '12hour' }}},
        { name: 'Notes', type: 'multilineText' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error creating table:', error);
    return;
  }

  const data = await response.json();
  console.log('✅ Contacts table created!');
  console.log(`Table ID: ${data.id}`);
  console.log('\nAdd this to your .env.local:');
  console.log(`AIRTABLE_CONTACTS_TABLE_ID=${data.id}`);
}

createContactsTable();
