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

async function getChristmasPaymentBreakdown() {
  console.log('\n🎄 CHRISTMAS DRIVE-THRU PAYMENT BREAKDOWN\n');
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
  
  console.log(`Total Records: ${allRecords.length}\n`);
  
  // Group by payment method
  const byPaymentMethod = {};
  let totalTickets = 0;
  
  allRecords.forEach(record => {
    const paymentMethod = record.fields['Payment Method'] || 'Unknown';
    const quantity = record.fields['Ticket Quantity'] || 0;
    
    if (!byPaymentMethod[paymentMethod]) {
      byPaymentMethod[paymentMethod] = {
        count: 0,
        tickets: 0,
        records: []
      };
    }
    
    byPaymentMethod[paymentMethod].count++;
    byPaymentMethod[paymentMethod].tickets += quantity;
    byPaymentMethod[paymentMethod].records.push({
      name: `${record.fields['First Name']} ${record.fields['Last Name']}`,
      quantity
    });
    
    totalTickets += quantity;
  });
  
  // Display results
  Object.keys(byPaymentMethod).sort().forEach(method => {
    const data = byPaymentMethod[method];
    console.log(`${method}:`);
    console.log(`  Transactions: ${data.count}`);
    console.log(`  Tickets: ${data.tickets}`);
    console.log('');
  });
  
  console.log('==================================================');
  console.log(`TOTAL TICKETS: ${totalTickets}`);
  console.log('==================================================\n');
}

getChristmasPaymentBreakdown();
