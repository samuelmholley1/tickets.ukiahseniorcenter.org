// Add Coyote Valley prepaid delivery customers to Lunch Cards table
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const tableIdMatch = envContent.match(/AIRTABLE_LUNCH_CARDS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch?.[1];
const AIRTABLE_BASE_ID = baseIdMatch?.[1];
const TABLE_ID = tableIdMatch?.[1];

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !TABLE_ID) {
  console.error('Missing env vars');
  process.exit(1);
}

// Coyote Valley prepaid delivery customers
// Mon-Thu delivery + frozen Friday on Thursday
const customers = [
  { num: 1, name: 'Margaret Olea', address: '500 Zinfandel Dr. (Ukiah)' },
  { num: 2, name: 'Victor Olea', address: '500 Zinfandel Dr. (Ukiah)' },
  { num: 3, name: 'Iris Martinez', address: '5875 Hwy 20' },
  { num: 4, name: 'Michael Brown', address: '104 Coyote Valley Blvd.' },
  { num: 5, name: 'Ronald Hoel Sr.', address: '128 Campbell Dr.' },
  { num: 6, name: 'Sherry Knight', address: '128 Campbell Dr.' },
  { num: 7, name: 'Trudy Ramos', address: '129 Campbell Dr.' },
  { num: 8, name: 'Guadalupe Munoz', address: '4 Shodakai Ct.' },
  { num: 9, name: 'John Feliz Sr.', address: '6 Coyote Valley Blvd.' },
];

async function addCustomer(customer) {
  const routeLabel = `COYOTE VALLEY #${customer.num}`;
  
  console.log(`Adding: ${routeLabel} - ${customer.name}...`);
  
  const payload = {
    fields: {
      'Name': customer.name,
      'Delivery Address': `${routeLabel}\n${customer.address}`,
      'Member Status': 'Member',
      'Card Type': '20 Meals', // Prepaid weekly - use high meal count
      'Total Meals': 100, // Will be managed manually
      'Remaining Meals': 100,
      'Weekly Delivery': true,
      'Include Frozen Friday': true,
      'Payment Method': 'Cash', // Prepaid through tribe
      'Amount Paid': 0,
    }
  };
  
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`   ❌ Error:`, data.error);
    return false;
  }
  
  console.log(`   ✅ Added: ${data.id}`);
  return true;
}

async function main() {
  console.log('Adding Coyote Valley prepaid delivery customers...\n');
  
  let success = 0;
  for (const customer of customers) {
    if (await addCustomer(customer)) {
      success++;
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ Done! Added ${success}/${customers.length} customers.`);
}

main();
