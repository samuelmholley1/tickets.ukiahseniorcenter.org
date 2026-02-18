import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appZ6HE5luAFV0Ot2');

// Check Stephanie Stevens records
const records = await base('tblF83nL5KPuPUDqx').select({
  filterByFormula: `SEARCH("Stephanie Stevens", {Name})`,
  sort: [{ field: 'Date', direction: 'desc' }],
  maxRecords: 10
}).firstPage();

console.log('=== Stephanie Stevens Records ===');
for (const r of records) {
  console.log(r.id, '|', r.fields['Name'], '|', r.fields['Date'], '|', r.fields['Payment Method'], '|', r.fields['Member Status'], '|', '$' + r.fields['Amount'], '|', 'created:', r._rawJson.createdTime);
}
console.log('Total:', records.length);
