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

async function addPamelaJensen() {
  console.log('\n➕ Adding Pamela Jensen Zeffy record...\n');
  
  const record = {
    fields: {
      'First Name': 'Pamela',
      'Last Name': 'Jensen',
      'Email': 'peejjensen@gmail.com',
      'Phone': 'No phone provided',
      'Payment Method': 'Card (Zeffy)',
      'Purchase Date': '2025-12-22T15:20:00.000-08:00',
      'Ticket Subtotal': 40,
      'Donation Amount': 0,
      'Amount Paid': 40,
      'Ticket Quantity': 2,
      'Christmas Member Tickets': 0,
      'Christmas Non-Member Tickets': 2,
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
    console.log('✅ Successfully added Pamela Jensen:');
    console.log(`   Record ID: ${result.id}`);
    console.log(`   2 Non-Member tickets ($40)`);
    console.log(`   Purchased: 12/22/25 at 3:20 PM\n`);
  } catch (error) {
    console.error('❌ Error creating record:', error.message);
  }
}

addPamelaJensen();
