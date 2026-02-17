import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`;
const headers = {
  'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
};

const response = await fetch(BASE, { headers });
const data = await response.json();

// Show all records
console.log(`Total records: ${data.records.length}\n`);
data.records.forEach(r => {
  const f = r.fields;
  console.log(`${r.id} | ${f['First Name']} ${f['Last Name']} | ${f['Email'] || '(no email)'} | ${f['Ticket Quantity']} tickets | Refunded: ${f['Refunded'] ? 'YES' : 'NO'}`);
});
