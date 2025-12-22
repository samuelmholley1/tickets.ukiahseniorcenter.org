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

async function addDonaMitcham() {
  console.log('➕ Adding Dona Mitcham record...\n');
  
  const record = {
    fields: {
      'First Name': 'Dona',
      'Last Name': 'Mitcham',
      'Email': 'tgifdona@yahoo.com',
      'Phone': 'No phone provided',
      'Payment Method': 'Card (Zeffy)',
      'Purchase Date': '2025-12-22T13:21:00.000-08:00',
      'Ticket Subtotal': 30,
      'Donation Amount': 0,
      'Amount Paid': 30,
      'Ticket Quantity': 2,
      'Christmas Member Tickets': 2,
      'Christmas Non-Member Tickets': 0,
      'Vegetarian Meals': 0,
      'Staff Initials': 'ZEFFY'
    }
  };

  try {
    const response = await fetch(`${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create record: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log('✅ Successfully added Dona Mitcham:');
    console.log(`   Record ID: ${result.id}`);
    console.log(`   2 Member tickets ($30)`);
    console.log(`   Purchased: 12/22/25 at 1:21 PM\n`);
  } catch (error) {
    console.error('❌ Error creating record:', error.message);
  }
}

addDonaMitcham();
