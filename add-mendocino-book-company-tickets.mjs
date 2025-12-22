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

async function addMendocinoBookCompanyTickets() {
  console.log('\n🎄 ADDING MENDOCINO BOOK COMPANY CHRISTMAS TICKETS');
  console.log('==================================================\n');

  // 7 tickets @ $20 each (non-member price)
  const ticketPrice = 20;
  const numberOfTickets = 7;

  console.log(`📝 Creating ${numberOfTickets} records for Mendocino Book Company`);
  console.log(`   Price per ticket: $${ticketPrice}`);
  console.log(`   Payment: Cash`);
  console.log('');

  const results = {
    success: [],
    errors: []
  };

  for (let i = 1; i <= numberOfTickets; i++) {
    const record = {
      fields: {
        'First Name': 'Mendocino Book Company',
        'Last Name': `${i}`,
        'Email': 'mendocinobookcompany@example.com',
        'Phone': '',
        'Payment Method': 'Cash',
        'Amount Paid': ticketPrice,
        'Ticket Quantity': 1,
        'Christmas Member Tickets': 0,
        'Christmas Non-Member Tickets': 1,
        'Ticket Subtotal': ticketPrice,
        'Donation Amount': 0,
        'Vegetarian Meals': 0,
        'Staff Initials': 'MBC'
      }
    };

    console.log(`Creating record ${i}/${numberOfTickets}...`);

    try {
      const response = await fetch(
        `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`,
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
      results.success.push(result.id);
      console.log(`   ✅ Record ${i} created: ${result.id}`);
      
    } catch (error) {
      console.error(`   ❌ Error creating record ${i}:`, error.message);
      results.errors.push({ ticket: i, error: error.message });
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n==================================================');
  console.log(`✅ Successfully created: ${results.success.length} records`);
  if (results.errors.length > 0) {
    console.log(`❌ Failed: ${results.errors.length} records`);
    console.error('Errors:', results.errors);
  }
  console.log(`💰 Total amount: $${numberOfTickets * ticketPrice}`);
  console.log('\n🎄 MENDOCINO BOOK COMPANY TICKETS ADDED!\n');
}

addMendocinoBookCompanyTickets();
