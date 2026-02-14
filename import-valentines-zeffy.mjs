import XLSX from 'xlsx';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const wb = XLSX.readFile("Valentine's Day Dance 2026_2-14-2026.xlsx");
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

// Group by buyer email
const byBuyer = {};
data.forEach(r => {
  const email = r['Buyer email'].toLowerCase().trim();
  if (!byBuyer[email]) {
    const nameParts = r['Buyer name'].trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    byBuyer[email] = { firstName, lastName, email, member: 0, nonMember: 0 };
  }
  if (r['Ticket type'] === "Member's Ticket") {
    byBuyer[email].member++;
  } else {
    byBuyer[email].nonMember++;
  }
});

// Check existing records in Airtable
const existingResponse = await fetch(
  `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`,
  { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
);
const existingData = await existingResponse.json();
const existingEmails = new Set(
  existingData.records.map(r => (r.fields['Email'] || '').toLowerCase().trim())
);

// Check for overlaps
const buyers = Object.values(byBuyer);
const duplicates = buyers.filter(b => existingEmails.has(b.email));
const newBuyers = buyers.filter(b => !existingEmails.has(b.email));

console.log(`\nExisting Airtable records: ${existingData.records.length}`);
console.log(`Zeffy buyers: ${buyers.length}`);
console.log(`Email overlaps: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log('Overlapping emails:', duplicates.map(d => `${d.firstName} ${d.lastName} <${d.email}>`));
}
console.log(`New buyers to import: ${newBuyers.length}`);

// Prepare records for Airtable import
const MEMBER_PRICE = 35;
const NONMEMBER_PRICE = 45;

const records = newBuyers.map(b => {
  const totalTickets = b.member + b.nonMember;
  const amountPaid = (b.member * MEMBER_PRICE) + (b.nonMember * NONMEMBER_PRICE);
  
  return {
    fields: {
      'First Name': b.firstName,
      'Last Name': b.lastName,
      'Email': b.email,
      'Ticket Quantity': totalTickets,
      'Member Tickets': b.member,
      'Non-Member Tickets': b.nonMember,
      'Payment Method': 'Zeffy',
      'Amount Paid': amountPaid,
      'Purchase Date': new Date().toISOString(),
    }
  };
});

console.log(`\nReady to import ${records.length} records:`);
records.forEach(r => {
  const f = r.fields;
  console.log(`  ${f['First Name']} ${f['Last Name']} <${f['Email']}> M:${f['Member Tickets']} NM:${f['Non-Member Tickets']} $${f['Amount Paid']}`);
});

// Import in batches of 10 (Airtable limit)
if (records.length === 0) {
  console.log('\nNo new records to import.');
  process.exit(0);
}

console.log('\nImporting...');
for (let i = 0; i < records.length; i += 10) {
  const batch = records.slice(i, i + 10);
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: batch }),
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ERROR importing batch ${i/10 + 1}:`, errorText);
    process.exit(1);
  }
  
  const result = await response.json();
  console.log(`  Batch ${i/10 + 1}: imported ${result.records.length} records`);
}

console.log('\n✅ Import complete!');

// Verify final count
const verifyResponse = await fetch(
  `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`,
  { headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` } }
);
const verifyData = await verifyResponse.json();
console.log(`Total Airtable records now: ${verifyData.records.length}`);
const totalTickets = verifyData.records
  .filter(r => !r.fields.Refunded)
  .reduce((sum, r) => sum + (r.fields['Ticket Quantity'] || 0), 0);
console.log(`Total tickets (non-refunded): ${totalTickets}`);
