// Create Lunch Reservations and Lunch Cards tables in Airtable
import fs from 'fs';

// Extract values using regex from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;
const AIRTABLE_BASE_ID = baseIdMatch ? baseIdMatch[1] : null;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

console.log('Creating Lunch tables in Airtable...');
console.log('Base ID:', AIRTABLE_BASE_ID);
console.log('');

// ============================================
// TABLE 1: Lunch Reservations
// ============================================
const lunchReservationsSchema = {
  name: 'Lunch Reservations',
  description: 'Individual lunch reservations and transactions',
  fields: [
    {
      name: 'Name',
      type: 'singleLineText',
      description: 'Customer name'
    },
    {
      name: 'Date',
      type: 'date',
      description: 'Date of the meal',
      options: {
        dateFormat: { name: 'local' }
      }
    },
    {
      name: 'Meal Type',
      type: 'singleSelect',
      description: 'How they receive the meal',
      options: {
        choices: [
          { name: 'Dine In', color: 'blueLight2' },
          { name: 'To Go', color: 'greenLight2' },
          { name: 'Delivery', color: 'yellowLight2' }
        ]
      }
    },
    {
      name: 'Member Status',
      type: 'singleSelect',
      description: 'Member or non-member pricing',
      options: {
        choices: [
          { name: 'Member', color: 'greenLight2' },
          { name: 'Non-Member', color: 'grayLight2' }
        ]
      }
    },
    {
      name: 'Amount',
      type: 'currency',
      description: 'Amount paid for this meal',
      options: {
        precision: 2,
        symbol: '$'
      }
    },
    {
      name: 'Payment Method',
      type: 'singleSelect',
      description: 'How they paid',
      options: {
        choices: [
          { name: 'Cash', color: 'greenLight2' },
          { name: 'Check', color: 'blueLight2' },
          { name: 'Card (Zeffy)', color: 'purpleLight2' },
          { name: 'Lunch Card', color: 'orangeLight2' }
        ]
      }
    },
    {
      name: 'Notes',
      type: 'multilineText',
      description: 'Special requests, delivery address, check number, etc.'
    },
    {
      name: 'Staff',
      type: 'singleLineText',
      description: 'Staff initials who took the order'
    },
    {
      name: 'Status',
      type: 'singleSelect',
      description: 'Reservation status',
      options: {
        choices: [
          { name: 'Reserved', color: 'yellowLight2' },
          { name: 'Picked Up', color: 'greenLight2' },
          { name: 'No Show', color: 'redLight2' }
        ]
      }
    }
  ]
};

// ============================================
// TABLE 2: Lunch Cards
// ============================================
const lunchCardsSchema = {
  name: 'Lunch Cards',
  description: 'Prepaid lunch cards (5, 10, 15, or 20 meals)',
  fields: [
    {
      name: 'Name',
      type: 'singleLineText',
      description: 'Cardholder name'
    },
    {
      name: 'Phone',
      type: 'phoneNumber',
      description: 'Contact phone number'
    },
    {
      name: 'Card Type',
      type: 'singleSelect',
      description: 'Number of meals on card',
      options: {
        choices: [
          { name: '5 Meals', color: 'blueLight2' },
          { name: '10 Meals', color: 'greenLight2' },
          { name: '15 Meals', color: 'yellowLight2' },
          { name: '20 Meals', color: 'purpleLight2' }
        ]
      }
    },
    {
      name: 'Member Status',
      type: 'singleSelect',
      description: 'Member or non-member pricing',
      options: {
        choices: [
          { name: 'Member', color: 'greenLight2' },
          { name: 'Non-Member', color: 'grayLight2' }
        ]
      }
    },
    {
      name: 'Total Meals',
      type: 'number',
      description: 'Total meals on the card (5, 10, 15, or 20)',
      options: {
        precision: 0
      }
    },
    {
      name: 'Remaining Meals',
      type: 'number',
      description: 'Meals remaining on card',
      options: {
        precision: 0
      }
    },
    {
      name: 'Amount Paid',
      type: 'currency',
      description: 'Total amount paid for the card',
      options: {
        precision: 2,
        symbol: '$'
      }
    },
    {
      name: 'Payment Method',
      type: 'singleSelect',
      description: 'How they paid',
      options: {
        choices: [
          { name: 'Cash', color: 'greenLight2' },
          { name: 'Check', color: 'blueLight2' },
          { name: 'Card (Zeffy)', color: 'purpleLight2' }
        ]
      }
    },
    {
      name: 'Purchase Date',
      type: 'date',
      description: 'When the card was purchased',
      options: {
        dateFormat: { name: 'local' }
      }
    },
    {
      name: 'Staff',
      type: 'singleLineText',
      description: 'Staff initials who sold the card'
    }
  ]
};

// Create a table
async function createTable(schema) {
  console.log(`Creating table: ${schema.name}...`);
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schema),
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  ❌ Failed to create ${schema.name}:`, errorText);
    throw new Error(`Failed to create table: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`  ✅ Created: ${schema.name}`);
  console.log(`     Table ID: ${data.id}`);
  return data;
}

// Add linked field to Lunch Reservations after both tables exist
async function addLunchCardLink(reservationsTableId, cardsTableId) {
  console.log('\nAdding Lunch Card link field to Reservations table...');
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${reservationsTableId}/fields`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Lunch Card',
        type: 'multipleRecordLinks',
        description: 'Link to Lunch Card (if paying with prepaid card)',
        options: {
          linkedTableId: cardsTableId,
          prefersSingleRecordLink: true
        }
      }),
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('  ❌ Failed to add link field:', errorText);
    throw new Error(`Failed to add link field: ${response.status}`);
  }
  
  console.log('  ✅ Added Lunch Card link field');
  return response.json();
}

// Main
async function main() {
  try {
    // Create both tables
    const reservationsTable = await createTable(lunchReservationsSchema);
    const cardsTable = await createTable(lunchCardsSchema);
    
    // Add link field after both tables exist
    await addLunchCardLink(reservationsTable.id, cardsTable.id);
    
    console.log('\n========================================');
    console.log('✅ SUCCESS! Both tables created.');
    console.log('========================================');
    console.log('\nTable IDs (add to .env.local):');
    console.log(`AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID=${reservationsTable.id}`);
    console.log(`AIRTABLE_LUNCH_CARDS_TABLE_ID=${cardsTable.id}`);
    console.log('\nView tables at:');
    console.log(`https://airtable.com/${AIRTABLE_BASE_ID}/${reservationsTable.id}`);
    console.log(`https://airtable.com/${AIRTABLE_BASE_ID}/${cardsTable.id}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
