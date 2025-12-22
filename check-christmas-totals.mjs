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

async function getChristmasTotals() {
  console.log('\n🎄 CHRISTMAS TICKET TOTALS\n');
  console.log('==================================================\n');
  
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}?offset=${offset}`
      : `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);
  
  console.log(`Total Records in Database: ${allRecords.length}\n`);
  
  // Filter out refunded
  const activeRecords = allRecords.filter(r => !r.fields.Refunded);
  const refundedRecords = allRecords.filter(r => r.fields.Refunded);
  
  const totalTickets = allRecords.reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
  const activeTickets = activeRecords.reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
  const refundedTickets = refundedRecords.reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
  
  console.log('📊 BREAKDOWN:\n');
  console.log(`Active Records: ${activeRecords.length}`);
  console.log(`Active Tickets: ${activeTickets}\n`);
  
  console.log(`Refunded Records: ${refundedRecords.length}`);
  console.log(`Refunded Tickets: ${refundedTickets}`);
  if (refundedRecords.length > 0) {
    refundedRecords.forEach(r => {
      console.log(`  - ${r.fields['First Name']} ${r.fields['Last Name']}: ${r.fields['Ticket Quantity']} tickets`);
    });
  }
  
  console.log('\n==================================================');
  console.log(`TOTAL IN DATABASE: ${totalTickets} tickets`);
  console.log(`SHOWING ON LISTS: ${activeTickets} tickets`);
  console.log('==================================================\n');
  
  // Payment method breakdown (active only)
  const byPaymentMethod = {};
  activeRecords.forEach(record => {
    const paymentMethod = record.fields['Payment Method'] || 'Unknown';
    const quantity = record.fields['Ticket Quantity'] || 0;
    
    if (!byPaymentMethod[paymentMethod]) {
      byPaymentMethod[paymentMethod] = { count: 0, tickets: 0 };
    }
    
    byPaymentMethod[paymentMethod].count++;
    byPaymentMethod[paymentMethod].tickets += quantity;
  });
  
  console.log('💳 ACTIVE TICKETS BY PAYMENT METHOD:\n');
  Object.keys(byPaymentMethod).sort().forEach(method => {
    const data = byPaymentMethod[method];
    console.log(`${method}: ${data.tickets} tickets (${data.count} transactions)`);
  });
  console.log('');
}

getChristmasTotals();
