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
const NYE_TABLE_ID = env.AIRTABLE_NYE_TICKETS_TABLE_ID;
const API_KEY = env.AIRTABLE_API_KEY;

console.log('\n🗑️  DELETING NYE DUPLICATE RECORDS\n');
console.log('==================================================\n');

const duplicatesToDelete = [
  'recsnAlqHOnsUjQZs',  // Edward Dick
  'recj8gyybJB9j9zSK',  // Kris Kelly
  'recKflTNcaygCEep5',  // Judy Morgan
  'recLC6iQ2F1mBwKzm',  // Liz Dorsey
  'recWHMhRVvl1wiuxB',  // Sherry Hoey
  'recXtEWQ9GOeNwgy0',  // Kathy Sheehy
  'recxskrkdmpdc27ji',  // Karen Castro
  'recbady3MLpnPziHY',  // Caro Lorber
  'recfsswKMpS7QmwhW',  // Randy Esson
];

async function deleteDuplicates() {
  let successCount = 0;
  let errorCount = 0;

  for (const recordId of duplicatesToDelete) {
    try {
      const response = await fetch(
        `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete ${recordId}: ${response.statusText}`);
      }

      console.log(`✅ Deleted ${recordId}`);
      successCount++;
      
      // Rate limiting - wait 250ms between deletions
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`❌ Error deleting ${recordId}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n==================================================');
  console.log(`✅ Successfully deleted: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('==================================================\n');
}

deleteDuplicates();
