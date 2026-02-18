import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appZ6HE5luAFV0Ot2');
const reservationsTableId = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID;

// Same query as the transactions API
const records = await base(reservationsTableId).select({
  filterByFormula: `IS_AFTER({Date}, '2026-02-17')`,
  sort: [{ field: 'Date', direction: 'desc' }],
  maxRecords: 50
}).firstPage();

const steph = records.filter(r => r.fields['Name']?.toString().includes('Stephanie'));
console.log('Total records returned:', records.length);
console.log('Stephanie records in result:', steph.length);
steph.forEach(r => console.log(r.id, r.fields['Name'], r.fields['Payment Method'], '$' + r.fields['Amount'], r._rawJson.createdTime));

// Cash records for today
const cashToday = records.filter(r => r.fields['Payment Method'] === 'Cash');
console.log('\nAll Cash records:');
cashToday.forEach(r => console.log('  ', r.id, r.fields['Name'], r.fields['Date'], '$' + r.fields['Amount'], r._rawJson.createdTime));

// Check the date filter issue: createdTime converted to Pacific
const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
console.log('\nToday Pacific:', todayStr);

// Simulate the cash box filter
const cashCheckMethods = ['Cash', 'Check', 'Cash & Check'];
const todaysCashCheck = records.map(r => ({
  id: r.id,
  name: r.fields['Name'],
  amount: r.fields['Amount'],
  paymentMethod: r.fields['Payment Method'],
  createdAt: r._rawJson.createdTime,
})).filter(tx => {
  const txDate = new Date(tx.createdAt);
  const txPacific = new Date(txDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const txDateStr = `${txPacific.getFullYear()}-${String(txPacific.getMonth() + 1).padStart(2, '0')}-${String(txPacific.getDate()).padStart(2, '0')}`;
  const matches = txDateStr === todayStr && cashCheckMethods.includes(tx.paymentMethod);
  if (tx.name?.toString().includes('Stephanie')) {
    console.log(`\nStephanie check: txDateStr=${txDateStr} todayStr=${todayStr} method=${tx.paymentMethod} match=${matches}`);
  }
  return matches;
});

console.log('\nCash box would show:', todaysCashCheck.length, 'transactions');
todaysCashCheck.forEach(tx => console.log('  ', tx.name, '$' + tx.amount, tx.paymentMethod));
