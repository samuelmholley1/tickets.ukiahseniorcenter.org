// Add sample lunch cards to Airtable for testing
import { config } from 'dotenv';
config({ path: '.env.local' });

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID;

const sampleCards = [
  {
    name: 'John Smith',
    phone: '707-555-1234',
    cardType: '10 Meals',
    memberStatus: 'Member',
    totalMeals: 10,
    remainingMeals: 7,
    amountPaid: 80,
  },
  {
    name: 'Mary Johnson',
    phone: '707-555-5678',
    cardType: '20 Meals',
    memberStatus: 'Member',
    totalMeals: 20,
    remainingMeals: 15,
    amountPaid: 160,
  },
  {
    name: 'Bob Wilson',
    phone: '707-555-9999',
    cardType: '5 Meals',
    memberStatus: 'Non-Member',
    totalMeals: 5,
    remainingMeals: 3,
    amountPaid: 50,
  },
  {
    name: 'Test User',
    phone: '707-123-4567',
    cardType: '10 Meals',
    memberStatus: 'Member',
    totalMeals: 10,
    remainingMeals: 10,
    amountPaid: 80,
  },
];

async function addCard(card) {
  const payload = {
    fields: {
      'Name': card.name,
      'Phone': card.phone,
      'Card Type': card.cardType,
      'Member Status': card.memberStatus,
      'Total Meals': card.totalMeals,
      'Remaining Meals': card.remainingMeals,
      'Amount Paid': card.amountPaid,
      'Payment Method': 'Cash',
      'Purchase Date': '2026-01-21',
      'Staff': 'TEST',
    },
  };

  const response = await fetch(
    `${AIRTABLE_API_BASE}/${BASE_ID}/${TABLE_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to add ${card.name}:`, errorText);
    return null;
  }

  const result = await response.json();
  console.log(`✅ Added: ${card.name} (${card.phone}) - ${card.remainingMeals} meals remaining`);
  return result;
}

async function main() {
  console.log('Adding sample lunch cards to Airtable...\n');
  
  for (const card of sampleCards) {
    await addCard(card);
  }

  console.log('\n========================================');
  console.log('SAMPLE LUNCH CARDS FOR TESTING:');
  console.log('========================================');
  console.log('');
  console.log('1. John Smith');
  console.log('   Phone: 707-555-1234');
  console.log('   Card: 10 Meals (Member)');
  console.log('   Remaining: 7 meals');
  console.log('');
  console.log('2. Mary Johnson');
  console.log('   Phone: 707-555-5678');
  console.log('   Card: 20 Meals (Member)');
  console.log('   Remaining: 15 meals');
  console.log('');
  console.log('3. Bob Wilson');
  console.log('   Phone: 707-555-9999');
  console.log('   Card: 5 Meals (Non-Member)');
  console.log('   Remaining: 3 meals');
  console.log('');
  console.log('4. Test User');
  console.log('   Phone: 707-123-4567');
  console.log('   Card: 10 Meals (Member)');
  console.log('   Remaining: 10 meals');
  console.log('');
  console.log('========================================');
  console.log('Search by name or phone on the lunch page!');
  console.log('========================================');
}

main().catch(console.error);
