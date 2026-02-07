// Check Feb 4 reservations and add any missing from the list
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const RESERVATIONS_TABLE = 'tblF83nL5KPuPUDqx';

const DATE = '2026-02-04';

// All entries from the list
const allEntries = [
  { name: "Joanne Carlson", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Ph: 707.462.1794" },
  { name: "Ful-Lin Chang", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "VEGETARIAN. No Garlic/Onions, No Dessert. Sheet says LC but no card" },
  { name: "Gerry DeTreville", mealType: "To Go", payment: "Lunch Card", quantity: 2, delivery: false, notes: "" },
  { name: "Dick Hooper", mealType: "Delivery", payment: "Unknown", quantity: 1, delivery: true, notes: "Sheet says LC but no card" },
  { name: "Evelyn Vance", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Payment not marked" },
  { name: "Harry Vance", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Payment not marked" },
  { name: "David Vilner", mealType: "Dine In", payment: "Pre-paid", quantity: 1, delivery: false, notes: "VEGETARIAN. Paid 2/3/26" },
  { name: "Jean Woodward", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "" },
  { name: "Jan Pohl", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Sheet says LC but no card" },
  { name: "MacDonalds", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "First name unknown. Sheet says LC" },
  { name: "Tom DesRoches", mealType: "Delivery", payment: "Lunch Card", quantity: 2, delivery: true, notes: "" },
  { name: "Katherine McElwee", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "" },
  { name: "Val Parker", mealType: "To Go", payment: "Lunch Card", quantity: 2, delivery: false, notes: "NO DESSERT. #2: White meat or veg" },
  { name: "Liz MacMillan", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Put in fridge" },
  { name: "Greg Bryant", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "" },
  { name: "Nancy Gilmore", mealType: "Delivery", payment: "Lunch Card", quantity: 1, delivery: true, notes: "" },
  { name: "Carol Ann Hulsmann", mealType: "Delivery", payment: "Lunch Card", quantity: 1, delivery: true, notes: "" },
  { name: "John Attaway", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Heart in box" },
  { name: "Thomas Arendell", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Sheet says LC but no card" },
  { name: "Jim Denham", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Payment blank" },
];

async function run() {
  // Get existing reservations for Feb 4
  const resFormula = `{Date}='${DATE}'`;
  const resRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}?filterByFormula=${encodeURIComponent(resFormula)}`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
  );
  
  const resData = await resRes.json();
  const existing = resData.records || [];
  
  console.log(`=== FEB 4, 2026 RESERVATIONS CHECK ===\n`);
  console.log(`Existing reservations: ${existing.length}`);
  
  // Build list of existing names (normalize for comparison)
  const existingNames = new Map();
  for (const r of existing) {
    const name = (r.fields['Name'] || '').toLowerCase().trim();
    existingNames.set(name, (existingNames.get(name) || 0) + 1);
  }
  
  console.log('\nExisting names:');
  for (const [name, count] of existingNames) {
    console.log(`  ${name} x${count}`);
  }
  
  // Find missing entries
  console.log('\n=== CHECKING FOR MISSING ===\n');
  
  const toAdd = [];
  
  for (const entry of allEntries) {
    const normName = entry.name.toLowerCase().trim();
    const existingCount = existingNames.get(normName) || 0;
    
    if (existingCount >= entry.quantity) {
      console.log(`✅ ${entry.name} x${entry.quantity} - already in database (${existingCount})`);
    } else {
      const missing = entry.quantity - existingCount;
      console.log(`❌ ${entry.name} - MISSING ${missing} of ${entry.quantity}`);
      for (let i = 0; i < missing; i++) {
        toAdd.push(entry);
      }
    }
  }
  
  if (toAdd.length === 0) {
    console.log('\n✅ All entries already in database!');
    return;
  }
  
  console.log(`\n=== ADDING ${toAdd.length} MISSING RESERVATIONS ===\n`);
  
  for (const entry of toAdd) {
    const fields = {
      'Name': entry.name,
      'Date': DATE,
      'Meal Type': entry.mealType,
      'Member Status': 'Member',
      'Amount': 0,
      'Payment Method': entry.payment === 'Lunch Card' ? 'Lunch Card' : 'Cash',
      'Notes': entry.notes,
      'Staff': 'IMPORT',
      'Status': 'Reserved',
    };
    
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });
    
    if (res.ok) {
      console.log(`✅ Added: ${entry.name} - ${entry.mealType}`);
    } else {
      console.log(`❌ Failed: ${entry.name} - ${await res.text()}`);
    }
  }
}

run();
