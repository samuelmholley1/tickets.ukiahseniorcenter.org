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

async function fixTomDesRoches() {
  console.log('🔧 Fixing Tom DesRoches duplicate...\n');
  
  // The old record with 5 tickets that should be deleted
  const oldRecordId = 'rec3mo6L5HX7uYEYk';
  
  try {
    const response = await fetch(`${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}/${oldRecordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.statusText}`);
    }

    console.log('✅ Deleted old Tom DesRoches record (5 tickets) - rec3mo6L5HX7uYEYk');
    console.log('✅ Kept correct Tom DesRoches record (2 tickets) - recuX7pLhMNbz9hF0\n');
  } catch (error) {
    console.error('❌ Error deleting record:', error.message);
  }
}

fixTomDesRoches();
