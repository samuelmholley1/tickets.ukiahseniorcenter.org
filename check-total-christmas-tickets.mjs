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

async function checkTotalChristmasTickets() {
  console.log('\n🎄 TOTAL CHRISTMAS TICKETS BREAKDOWN');
  console.log('==================================================\n');

  try {
    let allRecords = [];
    let offset = null;
    
    // Fetch all records
    do {
      let url = `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`;
      if (offset) {
        url += `?offset=${offset}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    console.log(`📊 Total records: ${allRecords.length}\n`);

    // Break down by payment method
    const breakdown = {};
    let totalTickets = 0;
    let totalAmount = 0;

    allRecords.forEach(record => {
      const paymentMethod = record.fields['Payment Method'] || 'Unknown';
      const ticketQty = record.fields['Ticket Quantity'] || 0;
      const amount = record.fields['Amount Paid'] || 0;
      const firstName = record.fields['First Name'] || '';
      
      if (!breakdown[paymentMethod]) {
        breakdown[paymentMethod] = { records: 0, tickets: 0, amount: 0 };
      }
      
      breakdown[paymentMethod].records++;
      breakdown[paymentMethod].tickets += ticketQty;
      breakdown[paymentMethod].amount += amount;
      
      totalTickets += ticketQty;
      totalAmount += amount;
      
      // Track Mendocino separately
      if (firstName.includes('Mendocino')) {
        if (!breakdown['Mendocino Book Company']) {
          breakdown['Mendocino Book Company'] = { records: 0, tickets: 0, amount: 0 };
        }
        breakdown['Mendocino Book Company'].records++;
        breakdown['Mendocino Book Company'].tickets += ticketQty;
        breakdown['Mendocino Book Company'].amount += amount;
      }
    });

    console.log('📈 BREAKDOWN BY PAYMENT METHOD:');
    console.log('─────────────────────────────────────────────────────');
    Object.entries(breakdown).sort().forEach(([method, stats]) => {
      console.log(`${method}:`);
      console.log(`  Records: ${stats.records}, Tickets: ${stats.tickets}, Total: $${stats.amount.toFixed(2)}`);
    });
    console.log('─────────────────────────────────────────────────────');
    console.log(`\n🎫 GRAND TOTAL: ${totalTickets} tickets across ${allRecords.length} records`);
    console.log(`💰 TOTAL AMOUNT: $${totalAmount.toFixed(2)}`);

    console.log('\n✓ ZEFFY VERIFICATION:');
    console.log('  Expected: 48 member + 33 non-member = 81 tickets');
    console.log('  In Airtable: ' + breakdown['Card (Zeffy)']?.tickets + ' tickets');
    console.log('  Match: ' + (breakdown['Card (Zeffy)']?.tickets === 81 ? '✅ YES' : '❌ NO'));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  console.log('\n==================================================\n');
}

checkTotalChristmasTickets();
