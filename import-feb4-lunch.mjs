// Import Feb 4, 2026 lunch list and deduct from cards
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const LUNCH_CARDS_TABLE = 'tblOBnt2ZatrSugbj';
const RESERVATIONS_TABLE = 'tblF83nL5KPuPUDqx';

const DATE = '2026-02-04';

const entries = [
  // Skip Coyote Valley - institutional, handle separately
  { name: "Joanne Carlson", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Ph: 707.462.1794", cardName: "Joanne Carlson" },
  { name: "Ful-Lin Chang", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "VEGETARIAN. No Garlic/Onions, No Dessert", cardName: null }, // No card found
  { name: "Gerry DeTreville", mealType: "To Go", payment: "Lunch Card", quantity: 2, delivery: false, notes: "", cardName: "Gerry Detreville" },
  { name: "Dick Hooper", mealType: "Delivery", payment: "Lunch Card", quantity: 1, delivery: true, notes: "Sheet marks LC but no card in system", cardName: null },
  { name: "Evelyn Vance", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Shares card with Harry", cardName: "Harry Vance & Evelyn Vance" },
  { name: "Harry Vance", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Shares card with Evelyn", cardName: "Harry Vance & Evelyn Vance" },
  { name: "David Vilner", mealType: "Dine In", payment: "Pre-paid 2/3/26", quantity: 1, delivery: false, notes: "VEGETARIAN", cardName: null },
  { name: "Jean Woodward", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "", cardName: "Jean Woodward" },
  { name: "Jan Pohl", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "", cardName: null }, // Need to find card
  { name: "MacDonalds", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "First name unknown", cardName: null },
  { name: "Tom DesRoches", mealType: "Delivery", payment: "Lunch Card", quantity: 2, delivery: true, notes: "", cardName: "John DesRoches" }, // Note: John not Tom
  { name: "Katherine McElwee", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "", cardName: "Katherine McElwee" }, // Already has reservations
  { name: "Val Parker", mealType: "To Go", payment: "Lunch Card", quantity: 2, delivery: false, notes: "NO DESSERT. #2: White meat or veg", cardName: "Val Parker" },
  { name: "Liz MacMillan", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Put in fridge", cardName: "Liz MacMillan" },
  { name: "Greg Bryant", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "", cardName: "Greg Bryant" },
  { name: "Nancy Gilmore", mealType: "Delivery", payment: "Lunch Card", quantity: 1, delivery: true, notes: "", cardName: "Nancy Gilmore" },
  { name: "Carol Ann Hulsmann", mealType: "Delivery", payment: "Lunch Card", quantity: 1, delivery: true, notes: "", cardName: "Carol Ann Hulsmann" }, // Already set to 0
  { name: "John Attaway", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "Heart in box", cardName: "John Attaway" },
  { name: "Thomas Arendell", mealType: "To Go", payment: "Lunch Card", quantity: 1, delivery: false, notes: "", cardName: null },
  { name: "Jim Denham", mealType: "To Go", payment: "Unknown", quantity: 1, delivery: false, notes: "Payment blank", cardName: null },
];

async function fetchAllCards() {
  let allCards = [];
  let offset = null;
  
  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}?pageSize=100${offset ? `&offset=${offset}` : ''}`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } });
    const data = await res.json();
    allCards = allCards.concat(data.records || []);
    offset = data.offset;
  } while (offset);
  
  return allCards;
}

async function findCardByName(cards, searchName) {
  if (!searchName) return null;
  const search = searchName.toLowerCase();
  return cards.find(c => (c.fields['Name'] || '').toLowerCase() === search);
}

async function createReservation(entry, cardId) {
  const mealTypeMap = { 'To Go': 'To Go', 'Dine In': 'Dine In', 'Delivery': 'Delivery' };
  
  const fields = {
    'Name': entry.name,
    'Date': DATE,
    'Meal Type': mealTypeMap[entry.mealType] || 'To Go',
    'Member Status': 'Member', // Default, most are members
    'Amount': 0, // Using card
    'Payment Method': entry.payment === 'Lunch Card' ? 'Lunch Card' : 'Cash',
    'Notes': entry.notes,
    'Staff': 'IMPORT',
    'Status': 'Reserved',
  };
  
  if (cardId) {
    fields['Lunch Card'] = [cardId];
  }
  
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  
  return res.ok;
}

async function deductFromCard(card, quantity) {
  const currentMeals = card.fields['Remaining Meals'] || 0;
  const newMeals = Math.max(0, currentMeals - quantity);
  
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}/${card.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: { 'Remaining Meals': newMeals } })
  });
  
  return { ok: res.ok, before: currentMeals, after: newMeals };
}

async function run() {
  console.log('=== IMPORTING FEB 4, 2026 LUNCH LIST ===\n');
  
  const cards = await fetchAllCards();
  console.log(`Loaded ${cards.length} lunch cards\n`);
  
  // Skip entries already in database
  const skipNames = ['Katherine McElwee', 'Carol Ann Hulsmann']; // Already processed
  
  const results = { success: [], noCard: [], skipped: [], errors: [] };
  
  for (const entry of entries) {
    if (skipNames.some(s => entry.name.includes(s))) {
      console.log(`⏭️  SKIP: ${entry.name} (already in database)`);
      results.skipped.push(entry.name);
      continue;
    }
    
    const card = await findCardByName(cards, entry.cardName);
    
    if (entry.payment === 'Lunch Card' && card) {
      // Create reservations and deduct
      for (let i = 0; i < entry.quantity; i++) {
        const created = await createReservation(entry, card.id);
        if (created) {
          const deduction = await deductFromCard(card, 1);
          // Update local card data
          card.fields['Remaining Meals'] = deduction.after;
          console.log(`✅ ${entry.name} - ${entry.mealType} - Card: ${deduction.before}→${deduction.after}`);
          results.success.push(`${entry.name} (${entry.mealType})`);
        } else {
          console.log(`❌ ${entry.name} - Failed to create reservation`);
          results.errors.push(entry.name);
        }
      }
    } else if (entry.payment === 'Lunch Card' && !card) {
      // Marked as lunch card but no card found
      console.log(`⚠️  ${entry.name} - NO CARD FOUND (sheet says LC)`);
      results.noCard.push(entry.name);
      // Still create reservation without card link
      await createReservation(entry, null);
    } else {
      // Not a lunch card payment - just create reservation
      console.log(`📝 ${entry.name} - ${entry.payment} (no deduction)`);
      await createReservation(entry, null);
      results.success.push(`${entry.name} (${entry.payment})`);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`⚠️  No Card: ${results.noCard.length} - ${results.noCard.join(', ')}`);
  console.log(`❌ Errors: ${results.errors.length}`);
}

run();
