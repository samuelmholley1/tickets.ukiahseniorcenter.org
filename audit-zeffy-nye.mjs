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

async function auditNYEZeffy() {
  console.log('\n🎉 NYE GALA DANCE - ZEFFY DATA AUDIT\n');
  console.log('==================================================\n');
  
  // Fetch all NYE records
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}?offset=${offset}`
      : `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);
  
  console.log(`Total NYE Records: ${allRecords.length}\n`);
  
  // Filter for Zeffy records only
  const zeffyRecords = allRecords.filter(r => 
    r.fields['Payment Method'] === 'Card (Zeffy)'
  );
  
  console.log(`Zeffy Records: ${zeffyRecords.length}\n`);
  
  // Calculate totals
  let totalMemberTickets = 0;
  let totalNonMemberTickets = 0;
  let totalMemberAmount = 0;
  let totalNonMemberAmount = 0;
  
  console.log('📋 ZEFFY TRANSACTIONS:\n');
  
  zeffyRecords.forEach(record => {
    const name = `${record.fields['First Name']} ${record.fields['Last Name']}`;
    const memberTickets = record.fields['NYE Member Tickets'] || 0;
    const nonMemberTickets = record.fields['NYE Non-Member Tickets'] || 0;
    const amount = record.fields['Amount Paid'] || 0;
    const purchaseDate = record.fields['Purchase Date'];
    
    totalMemberTickets += memberTickets;
    totalNonMemberTickets += nonMemberTickets;
    
    if (memberTickets > 0) {
      totalMemberAmount += memberTickets * 35;
    }
    if (nonMemberTickets > 0) {
      totalNonMemberAmount += nonMemberTickets * 45;
    }
    
    console.log(`${name}`);
    if (memberTickets > 0) console.log(`  Member: ${memberTickets} tickets`);
    if (nonMemberTickets > 0) console.log(`  Non-Member: ${nonMemberTickets} tickets`);
    console.log(`  Amount: $${amount}`);
    if (purchaseDate) {
      const date = new Date(purchaseDate);
      console.log(`  Purchased: ${date.toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`);
    }
    console.log(`  Record ID: ${record.id}`);
    console.log('');
  });
  
  console.log('\n==================================================');
  console.log('📊 ZEFFY SUMMARY:\n');
  console.log(`Member Tickets: ${totalMemberTickets} tickets`);
  console.log(`Expected Amount: $${totalMemberTickets * 35}`);
  console.log(`Actual Amount: $${totalMemberAmount}\n`);
  
  console.log(`Non-Member Tickets: ${totalNonMemberTickets} tickets`);
  console.log(`Expected Amount: $${totalNonMemberTickets * 45}`);
  console.log(`Actual Amount: $${totalNonMemberAmount}\n`);
  
  console.log(`TOTAL Zeffy Tickets: ${totalMemberTickets + totalNonMemberTickets}`);
  console.log(`TOTAL Zeffy Amount: $${totalMemberAmount + totalNonMemberAmount}`);
  console.log('==================================================\n');
  
  // Expected values from user
  console.log('🎯 EXPECTED FROM ZEFFY EXPORT:\n');
  console.log('Member: 18 tickets × $35 = $630.00');
  console.log('Non-Member: 5 tickets × $45 = $225.00');
  console.log('TOTAL: 23 tickets, $855.00\n');
  
  // Comparison
  const memberMatch = totalMemberTickets === 18 && totalMemberAmount === 630;
  const nonMemberMatch = totalNonMemberTickets === 5 && totalNonMemberAmount === 225;
  
  if (memberMatch && nonMemberMatch) {
    console.log('✅ PERFECT MATCH - All Zeffy data imported correctly!\n');
  } else {
    console.log('⚠️  DISCREPANCY DETECTED:\n');
    if (!memberMatch) {
      console.log(`❌ Member Tickets: Expected 18/$630, Got ${totalMemberTickets}/$${totalMemberAmount}`);
    }
    if (!nonMemberMatch) {
      console.log(`❌ Non-Member Tickets: Expected 5/$225, Got ${totalNonMemberTickets}/$${totalNonMemberAmount}`);
    }
    console.log('');
  }
}

auditNYEZeffy();
