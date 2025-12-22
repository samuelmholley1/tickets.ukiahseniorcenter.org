import { readFileSync } from 'fs';

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const BASE_ID = env.AIRTABLE_BASE_ID;
const CHRISTMAS_TABLE_ID = env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID;
const NYE_TABLE_ID = env.AIRTABLE_NYE_TICKETS_TABLE_ID;
const API_KEY = env.AIRTABLE_API_KEY;

async function findCharlotteJacobs() {
  console.log('\n🔍 SEARCHING FOR CHARLOTTE JACOBS');
  console.log('==================================================\n');

  // Search both tables
  const tables = [
    { name: 'Christmas', id: CHRISTMAS_TABLE_ID },
    { name: 'NYE', id: NYE_TABLE_ID }
  ];

  for (const table of tables) {
    console.log(`\n📋 Checking ${table.name} table...`);
    
    try {
      let allRecords = [];
      let offset = null;
      
      do {
        let url = `${AIRTABLE_API_BASE}/${BASE_ID}/${table.id}`;
        if (offset) {
          url += `?offset=${offset}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records);
        offset = data.offset;
      } while (offset);

      // Search for Charlotte
      const matches = allRecords.filter(record => {
        const firstName = (record.fields['First Name'] || '').toLowerCase();
        const lastName = (record.fields['Last Name'] || '').toLowerCase();
        return firstName.includes('charlotte') || lastName.includes('jacobs');
      });

      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} record(s):\n`);
        matches.forEach((record, idx) => {
          console.log(`Record ${idx + 1}:`);
          console.log(`  ID: ${record.id}`);
          console.log(`  Name: ${record.fields['First Name']} ${record.fields['Last Name']}`);
          console.log(`  Email: ${record.fields['Email']}`);
          console.log(`  Phone: ${record.fields['Phone']}`);
          console.log(`  Payment Method: ${record.fields['Payment Method']}`);
          console.log(`  Amount Paid: $${record.fields['Amount Paid']}`);
          console.log(`  Ticket Quantity: ${record.fields['Ticket Quantity']}`);
          if (table.name === 'Christmas') {
            console.log(`  Member Tickets: ${record.fields['Christmas Member Tickets'] || 0}`);
            console.log(`  Non-Member Tickets: ${record.fields['Christmas Non-Member Tickets'] || 0}`);
            console.log(`  Vegetarian Meals: ${record.fields['Vegetarian Meals'] || 0}`);
          } else {
            console.log(`  Member Tickets: ${record.fields['NYE Member Tickets'] || 0}`);
            console.log(`  Non-Member Tickets: ${record.fields['NYE Non-Member Tickets'] || 0}`);
          }
          console.log(`  Transaction ID: ${record.fields['Transaction ID'] || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('❌ No matches found');
      }
      
    } catch (error) {
      console.error(`Error searching ${table.name}:`, error.message);
    }
  }

  console.log('==================================================\n');
}

findCharlotteJacobs();
