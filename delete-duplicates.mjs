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
const API_KEY = env.AIRTABLE_API_KEY;

console.log('\n🗑️  DELETING DUPLICATE CHRISTMAS RECORDS\n');
console.log('==================================================\n');

const duplicatesToDelete = [
  'rech97FPzqtvJ0Kd7',  // Elisabeth Hovland
  'rec26ekdNHY1NrNGM',  // Laura Stewart
  'recvmT4Id9kNYSbph',  // Janis Hildreth
  'rec2kf6emEefvpT7M',  // Vicki Heath
  'recBcV2zUYiPq9YMn',  // Liz Dorsey
  'recV6vzvW0DDN4oYH',  // Leslie Sacchi
  'rec5O0Pe7G5Aobp8j',  // Kathy Sheehy
  'rec5sdK6i9S0K40Qn',  // Jean Davis
  'receiWstU8XjZxqv3',  // Joyce Gotd
  'recDar9QMrxBd3901',  // KATHLEEN THOMAS
  'rec8L29xAFOImu2PL',  // Sherry Hoey
  'rec9IUe5lEWaK21Hj',  // Sarah Martin
  'rec9b9w6mpWLqkLIU',  // Betty Ustick
  'recAFpZK9oejEGJoi',  // Milli Hicky
  'recUXviyjErJOBYhQ',  // Jan Pohl
  'recCXPGUHwjrkSht4',  // Megan Bradford
  'recZsgNXfBq6Ed4AC',  // Roma Lee-Lucas
  'recrdUmkGd0cf8iGQ',  // Jody Martinez
  'recQAo4gp7sI78CWs',  // Mary Snyder
  'recIwNSGgRYzJdvjR',  // Katherine McElwee
  'recJSloAMC7MjLHPr',  // WILMA PRIBYL
  'recsa8hjkqY6PVdop',  // Terry Phillips
  'recWYKmy7ONRFO3BQ',  // Leota Garner Burson
  'recZeOoaYqZ8uuhwR',  // Kris Kelly
  'recxo8QphAUpOIeHb',  // Kathie McAdams
  'recgjoAB8UPIgX0Yb'   // Kathy Poma
];

console.log(`Deleting ${duplicatesToDelete.length} duplicate records...\n`);

let successCount = 0;
let errorCount = 0;

for (const recordId of duplicatesToDelete) {
  try {
    const deleteResponse = await fetch(
      `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log(`   ❌ Failed to delete ${recordId}: ${errorText}`);
      errorCount++;
    } else {
      console.log(`   ✅ Deleted ${recordId}`);
      successCount++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  } catch (error) {
    console.log(`   ❌ Error deleting ${recordId}: ${error.message}`);
    errorCount++;
  }
}

console.log('\n==================================================');
console.log(`✅ Deleted ${successCount} duplicates`);
console.log(`❌ Failed: ${errorCount}`);
console.log('==================================================\n');
