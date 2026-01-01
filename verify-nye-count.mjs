import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

function getRecords() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${NYE_TABLE_ID}`,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.records || []);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('NYE GALA 2025 - CURRENT STATUS\n');
  console.log('='.repeat(60));
  
  const records = await getRecords();
  
  let totalTickets = 0;
  let totalActiveTickets = 0;
  let refundedTickets = 0;
  let totalRecords = records.length;
  let refundedRecords = 0;
  
  console.log(`\nTotal Records in Airtable: ${totalRecords}\n`);
  
  records.forEach(r => {
    const tickets = r.fields['Ticket Quantity'] || 0;
    const refunded = r.fields['Refunded'] || false;
    
    totalTickets += tickets;
    
    if (refunded) {
      refundedTickets += tickets;
      refundedRecords++;
      console.log(`❌ REFUNDED: ${r.fields['First Name']} ${r.fields['Last Name']} - ${tickets} tickets`);
    } else {
      totalActiveTickets += tickets;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Active Records: ${totalRecords - refundedRecords}`);
  console.log(`Refunded Records: ${refundedRecords}`);
  console.log('\n' + '='.repeat(60));
  console.log(`Total Tickets (all): ${totalTickets}`);
  console.log(`Active Tickets: ${totalActiveTickets}`);
  console.log(`Refunded Tickets: ${refundedTickets}`);
  console.log('='.repeat(60));
  
  // Check the math
  console.log('\n📊 EXPECTED CALCULATION:');
  console.log('Before today: 29 records, 45 tickets');
  console.log('Linda Pardini refunded: -2 tickets (not deleted, just marked refunded)');
  console.log('New imports today: 5 records, 6 tickets');
  console.log('Expected: 34 records total, 49 active tickets (45 - 2 + 6)');
  console.log(`Actual: ${totalRecords} records total, ${totalActiveTickets} active tickets`);
  
  if (totalActiveTickets === 49) {
    console.log('✅ Math checks out!');
  } else {
    console.log(`⚠️  Discrepancy: Expected 49, got ${totalActiveTickets}`);
  }
}

main().catch(console.error);
