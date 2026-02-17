import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`;
const recordId = 'recAJ4gyljakvXKX4'; // Samuel Holley test record

const headers = {
  'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
};

console.log('Deleting test record: Samuel Holley (recAJ4gyljakvXKX4)...\n');

const response = await fetch(`${BASE}/${recordId}`, {
  method: 'DELETE',
  headers,
});

if (!response.ok) {
  const err = await response.text();
  console.error('ERROR:', err);
  process.exit(1);
}

console.log('✅ Deleted test record\n');

// Verify final count
const verifyResponse = await fetch(BASE, { headers });
const verifyData = await verifyResponse.json();
const active = verifyData.records.filter(r => !r.fields.Refunded);
const totalTickets = active.reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
console.log(`Total records: ${verifyData.records.length} (${active.length} active)`);
console.log(`Total tickets: ${totalTickets}`);
