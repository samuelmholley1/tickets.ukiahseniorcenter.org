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

async function addZeffyRecords() {
  console.log('\n➕ Adding 2 new Zeffy Christmas records...\n');
  
  const records = [
    {
      firstName: 'Laura',
      lastName: 'Buckner',
      email: 'lauraannbuckner@gmail.com',
      purchaseDate: '2025-12-22T14:39:00.000-08:00',
      amount: 30,
      tickets: 2
    },
    {
      firstName: 'Gerry & Polly',
      lastName: 'Detreville',
      email: 'pollyp@pacific.net',
      purchaseDate: '2025-12-22T14:46:00.000-08:00',
      amount: 30,
      tickets: 2
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    const airtableRecord = {
      fields: {
        'First Name': record.firstName,
        'Last Name': record.lastName,
        'Email': record.email,
        'Phone': 'No phone provided',
        'Payment Method': 'Card (Zeffy)',
        'Purchase Date': record.purchaseDate,
        'Ticket Subtotal': record.amount,
        'Donation Amount': 0,
        'Amount Paid': record.amount,
        'Ticket Quantity': record.tickets,
        'Christmas Member Tickets': record.tickets,
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
        body: JSON.stringify(airtableRecord)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create record: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log(`✅ ${record.firstName} ${record.lastName} - ${record.tickets} tickets ($${record.amount})`);
      console.log(`   Record ID: ${result.id}\n`);
      successCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`❌ Error creating ${record.firstName} ${record.lastName}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n==================================================');
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('==================================================\n');
}

addZeffyRecords();
