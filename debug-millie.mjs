import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appZ6HE5luAFV0Ot2');
const reservationsTableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;
const cardsTableId = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;

// Check Millie
console.log('=== Searching for Millie ===');
const millie = await base(reservationsTableId).select({
  filterByFormula: `SEARCH("Millie", {Name})`,
  sort: [{ field: 'Date', direction: 'desc' }],
  maxRecords: 10
}).firstPage();
millie.forEach(r => console.log(r.id, '|', r.fields['Name'], '|', r.fields['Date'], '|', r.fields['Payment Method'], '|$' + r.fields['Amount'], '| created:', r._rawJson.createdTime));

// Also check cards for Millie
const millieCards = await base(cardsTableId).select({
  filterByFormula: `SEARCH("Millie", {Name})`,
  maxRecords: 10
}).firstPage();
if (millieCards.length > 0) {
  console.log('\nMillie card records:');
  millieCards.forEach(r => console.log(r.id, '|', r.fields['Name'], '|', r.fields['Payment Method'], '|$' + r.fields['Amount Paid'], '| created:', r._rawJson.createdTime));
}

// Stephanie Stevens
console.log('\n=== Stephanie Stevens ===');
const steph = await base(reservationsTableId).select({
  filterByFormula: `SEARCH("Stephanie Stevens", {Name})`,
  sort: [{ field: 'Date', direction: 'desc' }],
  maxRecords: 10
}).firstPage();
steph.forEach(r => console.log(r.id, '|', r.fields['Name'], '|', r.fields['Date'], '|', r.fields['Payment Method'], '|$' + r.fields['Amount'], '| created:', r._rawJson.createdTime));

// Count total records after cutoff
console.log('\n=== Records after 2/17 cutoff ===');
const all = [];
let page = await base(reservationsTableId).select({
  filterByFormula: `IS_AFTER({Date}, '2026-02-17')`,
}).eachPage((records, fetchNextPage) => {
  all.push(...records);
  fetchNextPage();
});
console.log('Total reservation records after cutoff:', all.length);

// Show how many are dated today vs future
const today = all.filter(r => r.fields['Date'] === '2026-02-18');
const future = all.filter(r => r.fields['Date'] > '2026-02-18');
console.log('Dated 2/18:', today.length);
console.log('Dated after 2/18:', future.length);

// Cash/check for today by createdTime
const cashCheckMethods = ['Cash', 'Check', 'Cash & Check'];
const todayCash = all.filter(r => {
  const ct = new Date(r._rawJson.createdTime);
  const pacific = new Date(ct.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const ds = `${pacific.getFullYear()}-${String(pacific.getMonth()+1).padStart(2,'0')}-${String(pacific.getDate()).padStart(2,'0')}`;
  return ds === '2026-02-18' && cashCheckMethods.includes(r.fields['Payment Method']);
});
console.log('\nCash/Check created today (should be in cash box):');
todayCash.forEach(r => console.log(' ', r.id, r.fields['Name'], '$' + r.fields['Amount'], r.fields['Payment Method'], r._rawJson.createdTime));
