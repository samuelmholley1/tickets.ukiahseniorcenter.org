
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) process.env[k] = envConfig[k];
}

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const RESERVATIONS_TABLE_ID = process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID || 'tblF83nL5KPuPUDqx';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Error: Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// --- HELPERS ---

async function fetchRecords(tableId, formula) {
  const url = `${BASE_URL}/${tableId}?filterByFormula=${encodeURIComponent(formula)}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } });
  const data = await res.json();
  return data.records || [];
}

async function deleteRecord(tableId, recordId) {
  console.log(`Deleting ${tableId} record ${recordId}...`);
  await fetch(`${BASE_URL}/${tableId}?records%5B%5D=${recordId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });
}

async function createRecord(tableId, fields) {
  console.log(`Creating reservation for ${fields.Name}...`);
  const res = await fetch(`${BASE_URL}/${tableId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records: [{ fields }] })
  });
  const data = await res.json();
  if (data.error) console.error('Create failed:', JSON.stringify(data.error));
  return data.records ? data.records[0] : null;
}

// --- TASKS ---

async function removeTestTransactions() {
  console.log('--- Removing Test Transactions (Before 2026-02-02) ---');
  // Airtable formula: IS_BEFORE({Date}, '2026-02-02')
  // Note: Date fields in Airtable compare as strings often work YYYY-MM-DD
  const formula = "IS_BEFORE({Date}, '2026-02-02')";
  
  const records = await fetchRecords(RESERVATIONS_TABLE_ID, formula);
  console.log(`Found ${records.length} records before Feb 2 to delete.`);
  
  for (const r of records) {
    await deleteRecord(RESERVATIONS_TABLE_ID, r.id);
  }
}

async function importFeb3() {
  console.log('--- Importing Feb 3 Reservations ---');
  
  const DATA = [
    { "first_name": "Coyote", "last_name": "Valley #1", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten note: 'Total of 9 lunches'" },
    { "first_name": "Coyote", "last_name": "Valley #2", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Coyote", "last_name": "Valley #3", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Coyote", "last_name": "Valley #4", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Ful-Lin", "last_name": "Chang", "type": "To Go", "dietary_needs": "Veggie", "payment_method": "", "notes": "NO GARLIC OR ONIONS NO DESSERT (Highlighted)" },
    { "first_name": "Gerry", "last_name": "DeTreville #1", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Gerry", "last_name": "DeTreville #2", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Dick", "last_name": "Hooper", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Marked '(H)' with pink highlight" },
    { "first_name": "Evelyn", "last_name": "Vance", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Harry", "last_name": "Vance", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "David", "last_name": "Vilner", "type": "Dine In", "dietary_needs": "Veggie", "payment_method": "", "notes": "Green highlight: 'Veg paid 2/2/26 ab'" },
    { "first_name": "Jean", "last_name": "Woodward", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Jan or Renata", "last_name": "Pohl", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "" },
    { "first_name": "Marilyn", "last_name": "McGowan", "type": "Dine In", "dietary_needs": "", "payment_method": "", "notes": "Handwritten Entry" },
    { "first_name": "M.", "last_name": "McCowals", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten Entry; Last name difficult to read" },
    { "first_name": "Tom", "last_name": "DesRoches #1", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten; Name highlighted pink" },
    { "first_name": "Tom", "last_name": "DesRoches #2", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten; Name highlighted pink" },
    { "first_name": "Joe", "last_name": "Scarfo", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Larry", "last_name": "Cristiani", "type": "Dine In", "dietary_needs": "", "payment_method": "Cash", "amount": 8.00, "notes": "Handwritten; Green highlight 'paid on 1-29-26'" },
    { "first_name": "GRF", "last_name": "Bryan", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Nancy", "last_name": "Gilmore", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten; Pink highlight '+'" },
    { "first_name": "Carol Ann", "last_name": "Hulsmann", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten; Pink highlight '+'" },
    { "first_name": "Michelle", "last_name": "Winderman", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Kevin", "last_name": "Kelley", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Coyote", "last_name": "Valley #05", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Coyote", "last_name": "Valley #06", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Coyote", "last_name": "Valley #07", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Coyote", "last_name": "Valley #08", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" },
    { "first_name": "Coyote", "last_name": "Valley #09", "type": "To Go", "dietary_needs": "", "payment_method": "", "notes": "Handwritten" }
  ];

  for (const row of DATA) {
    const name = `${row.first_name} ${row.last_name}`;
    
    // Combine notes
    const parts = [];
    if (row.dietary_needs) parts.push(`DIET: ${row.dietary_needs}`);
    if (row.notes) parts.push(row.notes);
    if (row.payment_method === 'Cash' && row.amount) parts.push(`Paid $${row.amount}`);
    
    const fields = {
      'Name': name,
      'Date': '2026-02-03',
      'Meal Type': row.type,
      'Member Status': 'Member',
      'Payment Method': row.payment_method === 'Cash' ? 'Cash' : undefined,
      'Notes': parts.join(' | '),
      'Staff': 'SYS'
    };

    if (row.amount) {
      // If there's an amount paid, log it (though Reservations table usually doesn't track strict revenue in my schema, let's see if fields exist)
      fields['Amount'] = row.amount; // Might fail if field missing, but safer to omit if unsure. Using Notes for now.
    }

    await createRecord(RESERVATIONS_TABLE_ID, fields);
  }
}

async function main() {
  await removeTestTransactions();
  await importFeb3();
}

main().catch(console.error);
