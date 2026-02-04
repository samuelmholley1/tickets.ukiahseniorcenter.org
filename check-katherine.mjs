import Airtable from 'airtable';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const apiKey = env.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/)?.[1];
const baseId = env.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/)?.[1];
const base = new Airtable({ apiKey }).base(baseId);

console.log('=== All Feb 4 Reservations ===\n');

const feb4 = await base('tblF83nL5KPuPUDqx').select({
  filterByFormula: "{Date}='2026-02-04'",
  maxRecords: 50
}).firstPage();

feb4.forEach(r => {
  console.log(`Name: ${r.get('Name')} | Type: ${r.get('Meal Type')} | Payment: ${r.get('Payment Method')} | Notes: ${r.get('Notes') || ''}`);
});
console.log(`\nTotal Feb 4: ${feb4.length} reservations`);

console.log('\n=== Katherine McElwee Reservations ===\n');

const records = await base('tblF83nL5KPuPUDqx').select({
  filterByFormula: "FIND('Katherine', {Name})",
  sort: [{ field: 'Date', direction: 'desc' }],
  maxRecords: 10
}).firstPage();

records.forEach(r => {
  console.log(`Date: ${r.get('Date')} | Name: ${r.get('Name')} | Type: ${r.get('Meal Type')} | Payment: ${r.get('Payment Method')} | Amount: $${r.get('Amount') || 0}`);
});

console.log('\n=== Katherine McElwee Lunch Card ===\n');

const cards = await base('tblOBnt2ZatrSugbj').select({
  filterByFormula: "FIND('Katherine', {Name})",
  maxRecords: 5
}).firstPage();

cards.forEach(c => {
  console.log(`Name: ${c.get('Name')} | Total: ${c.get('Total Meals')} | Remaining: ${c.get('Remaining Meals')} | Type: ${c.get('Card Type')}`);
});
