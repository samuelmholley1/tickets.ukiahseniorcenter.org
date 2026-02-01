// Create Daily Prepaid Delivery table in Airtable
// These are customers who have prepaid for daily delivery (Mon-Thu + frozen Friday)
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

console.log('Creating Daily Prepaid Delivery table in Airtable...');
console.log('Base ID:', AIRTABLE_BASE_ID);
console.log('');

// ============================================
// Daily Prepaid Delivery Table
// ============================================
// These are customers who:
// - Get delivery Mon-Thu
// - Also get frozen Friday meal (picked up Thursday)
// - Have prepaid for the week/month
const dailyDeliverySchema = {
  name: 'Daily Prepaid Delivery',
  description: 'Customers who receive daily prepaid meal delivery (Mon-Thu + frozen Friday)',
  fields: [
    {
      name: 'Name',
      type: 'singleLineText',
      description: 'Customer name'
    },
    {
      name: 'Phone',
      type: 'phoneNumber',
      description: 'Contact phone number'
    },
    {
      name: 'Delivery Address',
      type: 'multilineText',
      description: 'Full delivery address'
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
      name: 'Active',
      type: 'checkbox',
      description: 'Is this customer currently active?',
      options: {
        icon: 'check',
        color: 'greenBright'
      }
    },
    {
      name: 'Start Date',
      type: 'date',
      description: 'When prepaid delivery started',
      options: {
        dateFormat: { name: 'local' }
      }
    },
    {
      name: 'End Date',
      type: 'date',
      description: 'When prepaid delivery ends (optional)',
      options: {
        dateFormat: { name: 'local' }
      }
    },
    {
      name: 'Include Frozen Friday',
      type: 'checkbox',
      description: 'Do they also get the frozen Friday meal on Thursday?',
      options: {
        icon: 'check',
        color: 'blueBright'
      }
    },
    {
      name: 'Special Requests',
      type: 'multilineText',
      description: 'Standing special requests for all deliveries'
    },
    {
      name: 'Payment Method',
      type: 'singleSelect',
      description: 'How they paid for the prepaid delivery',
      options: {
        choices: [
          { name: 'Cash', color: 'greenLight2' },
          { name: 'Check', color: 'blueLight2' },
          { name: 'Card (Zeffy)', color: 'purpleLight2' }
        ]
      }
    },
    {
      name: 'Weekly Rate',
      type: 'currency',
      description: 'Amount paid per week',
      options: {
        precision: 2,
        symbol: '$'
      }
    },
    {
      name: 'Notes',
      type: 'multilineText',
      description: 'Administrative notes about this customer'
    }
  ]
};

async function createTable(schema) {
  console.log(`Creating table: ${schema.name}...`);
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schema)
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error creating table:', data.error);
    return null;
  }
  
  console.log(`✅ Created: ${schema.name}`);
  console.log(`   Table ID: ${data.id}`);
  console.log('');
  return data;
}

async function main() {
  try {
    const result = await createTable(dailyDeliverySchema);
    
    if (result) {
      console.log('========================================');
      console.log('SUCCESS! Add to .env.local:');
      console.log('========================================');
      console.log(`AIRTABLE_DAILY_DELIVERY_TABLE_ID=${result.id}`);
      console.log('');
      console.log('Update AIRTABLE_SCHEMA.md with the new table info!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
