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
const NYE_TABLE_ID = env.AIRTABLE_NYE_TICKETS_TABLE_ID;
const API_KEY = env.AIRTABLE_API_KEY;

async function addTicketSpiceRecord() {
  console.log('\n🎟️  ADDING TICKETSPICE RECORD');
  console.log('==================================================\n');

  // Parse the purchase date: 12/17/2025 10:03 AM Pacific Time
  const purchaseDate = new Date('2025-12-17T10:03:00-08:00');
  
  const record = {
    fields: {
      'First Name': 'nfn',
      'Last Name': 'Shonduel',
      'Email': 'shonduel@pacific.net',
      'Phone': '+17074621859',
      'Payment Method': 'Card (TicketSpice)',
      'Amount Paid': 45,
      'Ticket Quantity': 1,
      'NYE Member Tickets': 0,
      'NYE Non-Member Tickets': 1,
      'Ticket Subtotal': 45,
      'Donation Amount': 0,
      'Staff Initials': 'TICKETSPICE',
      'Purchase Date': purchaseDate.toISOString()
    }
  };

  console.log('📝 Record to create:');
  console.log('   Name: nfn Shonduel');
  console.log('   Email: shonduel@pacific.net');
  console.log('   Phone: +17074621859');
  console.log('   Tickets: 1 NYE Non-Member ($45)');
  console.log('   Payment: Card (TicketSpice)');
  console.log('   Purchase Date:', purchaseDate.toLocaleString('en-US', { 
    timeZone: 'America/Los_Angeles',
    dateStyle: 'short',
    timeStyle: 'short'
  }));
  console.log('');

  try {
    const response = await fetch(
      `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: record.fields }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully created record:', result.id);
    
  } catch (error) {
    console.error('❌ Error creating record:', error.message);
    throw error;
  }

  console.log('\n==================================================');
  console.log('✅ TICKETSPICE RECORD ADDED!\n');
}

addTicketSpiceRecord();
