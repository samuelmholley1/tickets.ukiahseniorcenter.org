// Add Purchase Date field to Airtable tables using Metadata API
import fs from 'fs';

// Extract values using regex from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const christmasTableMatch = envContent.match(/AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=([^\s\r\n]+)/);
const nyeTableMatch = envContent.match(/AIRTABLE_NYE_TICKETS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;
const AIRTABLE_BASE_ID = baseIdMatch ? baseIdMatch[1] : null;
const CHRISTMAS_TABLE_ID = christmasTableMatch ? christmasTableMatch[1] : null;
const NYE_TABLE_ID = nyeTableMatch ? nyeTableMatch[1] : null;

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

async function addPurchaseDateField(tableId, tableName) {
  console.log(`\n🔧 Adding Purchase Date field to ${tableName}...`);
  
  const response = await fetch(
    `${AIRTABLE_API_BASE}/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Purchase Date',
        type: 'dateTime',
        options: {
          timeZone: 'America/Los_Angeles',
          dateFormat: {
            name: 'local',
            format: 'l'
          },
          timeFormat: {
            name: '12hour',
            format: 'h:mma'
          }
        }
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add field: ${response.status} ${error}`);
  }
  
  const result = await response.json();
  console.log(`✅ Added field: ${result.name} (${result.id})`);
  return result;
}

async function main() {
  console.log('📅 ADDING PURCHASE DATE FIELD TO AIRTABLE\n');
  console.log('='.repeat(50));
  
  try {
    await addPurchaseDateField(CHRISTMAS_TABLE_ID, 'Christmas Drive-Thru 2025');
    await addPurchaseDateField(NYE_TABLE_ID, 'NYE Gala Dance 2025');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Fields created successfully!');
    console.log('\nNow run: node update-zeffy-dates.mjs');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
