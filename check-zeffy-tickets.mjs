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

async function checkZeffyTickets() {
  console.log('\n🎄 CHECKING ZEFFY CHRISTMAS TICKETS IN AIRTABLE');
  console.log('==================================================\n');

  try {
    let allRecords = [];
    let offset = null;
    
    // Fetch all records (with pagination)
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

    console.log(`📊 Total records in Airtable: ${allRecords.length}\n`);

    // Filter for Zeffy tickets (Payment Method = "Card (Zeffy)")
    const zeffyRecords = allRecords.filter(record => 
      record.fields['Payment Method'] === 'Card (Zeffy)'
    );

    console.log(`🎫 Zeffy tickets found: ${zeffyRecords.length}\n`);

    // Count member vs non-member tickets
    let memberTickets = 0;
    let nonMemberTickets = 0;
    let memberTotal = 0;
    let nonMemberTotal = 0;

    zeffyRecords.forEach(record => {
      const memberCount = record.fields['Christmas Member Tickets'] || 0;
      const nonMemberCount = record.fields['Christmas Non-Member Tickets'] || 0;
      const ticketSubtotal = record.fields['Ticket Subtotal'] || 0;
      
      memberTickets += memberCount;
      nonMemberTickets += nonMemberCount;
      
      // Calculate totals based on ticket counts and standard prices
      if (memberCount > 0) {
        memberTotal += memberCount * 15; // Member price is $15
      }
      if (nonMemberCount > 0) {
        nonMemberTotal += nonMemberCount * 20; // Non-member price is $20
      }
    });

    console.log('📈 ZEFFY TICKET BREAKDOWN:');
    console.log('─────────────────────────────────────────────');
    console.log(`Member Tickets:     ${memberTickets.toString().padStart(3)} tickets × $15 = $${memberTotal.toFixed(2)}`);
    console.log(`Non-Member Tickets: ${nonMemberTickets.toString().padStart(3)} tickets × $20 = $${nonMemberTotal.toFixed(2)}`);
    console.log('─────────────────────────────────────────────');
    console.log(`Total:              ${(memberTickets + nonMemberTickets).toString().padStart(3)} tickets        $${(memberTotal + nonMemberTotal).toFixed(2)}`);
    console.log('');

    console.log('🎯 EXPECTED FROM ZEFFY:');
    console.log('─────────────────────────────────────────────');
    console.log('Member Tickets:      48 tickets × $15 = $720.00');
    console.log('Non-Member Tickets:  33 tickets × $20 = $660.00');
    console.log('─────────────────────────────────────────────');
    console.log('Total:               81 tickets        $1380.00');
    console.log('');

    console.log('✓ COMPARISON:');
    console.log('─────────────────────────────────────────────');
    const memberMatch = memberTickets === 48 ? '✅' : '❌';
    const nonMemberMatch = nonMemberTickets === 33 ? '✅' : '❌';
    console.log(`${memberMatch} Member:     ${memberTickets} vs 48 expected (diff: ${memberTickets - 48})`);
    console.log(`${nonMemberMatch} Non-Member: ${nonMemberTickets} vs 33 expected (diff: ${nonMemberTickets - 33})`);
    console.log('─────────────────────────────────────────────');

    if (memberTickets === 48 && nonMemberTickets === 33) {
      console.log('\n✅ PERFECT MATCH! All Zeffy tickets are in Airtable.\n');
    } else {
      console.log('\n⚠️  MISMATCH DETECTED! Please review the differences.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  console.log('==================================================\n');
}

checkZeffyTickets();
