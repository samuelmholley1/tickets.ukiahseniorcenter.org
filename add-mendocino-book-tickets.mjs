/**
 * Add 2 Valentine's Day tickets sold at Mendocino Book Company
 * Each gets its own row so they appear individually on the attendance list.
 * No email = each record stays separate (won't merge).
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`;
const headers = {
  'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

const records = [
  {
    fields: {
      'First Name': 'Mendocino Book Co.',
      'Last Name': '#1',
      'Ticket Quantity': 1,
      'Non-Member Tickets': 1,
      'Payment Method': 'Other',
      'Amount Paid': 45,
      'Payment Notes': 'Sold at Mendocino Book Company - ticket #1 of 2',
      'Purchase Date': new Date().toISOString(),
    }
  },
  {
    fields: {
      'First Name': 'Mendocino Book Co.',
      'Last Name': '#2',
      'Ticket Quantity': 1,
      'Non-Member Tickets': 1,
      'Payment Method': 'Other',
      'Amount Paid': 45,
      'Payment Notes': 'Sold at Mendocino Book Company - ticket #2 of 2',
      'Purchase Date': new Date().toISOString(),
    }
  }
];

console.log('Adding 2 Mendocino Book Company tickets to Valentine\'s table...\n');
records.forEach((r, i) => {
  const f = r.fields;
  console.log(`  ${i+1}. ${f['First Name']} ${f['Last Name']} - ${f['Non-Member Tickets']} non-member ticket - $${f['Amount Paid']}`);
});

const response = await fetch(BASE, {
  method: 'POST',
  headers,
  body: JSON.stringify({ records }),
});

if (!response.ok) {
  const err = await response.text();
  console.error('\nERROR:', err);
  process.exit(1);
}

const result = await response.json();
console.log(`\n✅ Added ${result.records.length} records`);
result.records.forEach(r => {
  console.log(`  ID: ${r.id} - ${r.fields['First Name']} ${r.fields['Last Name']}`);
});

// Verify total
const verifyResponse = await fetch(BASE, { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } });
const verifyData = await verifyResponse.json();
const active = verifyData.records.filter(r => !r.fields.Refunded);
const totalTickets = active.reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
console.log(`\nTotal records: ${verifyData.records.length} (${active.length} active)`);
console.log(`Total tickets (non-refunded): ${totalTickets}`);
