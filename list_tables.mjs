// List all tables in the base to find the existing Contacts table
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';

async function listTables() {
  console.log('Listing all tables in base...\n');

  // Note: The Metadata API requires a specific scope or Personal Access Token with schema permissions
  // Using the meta/bases endpoint
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error listing tables:', JSON.stringify(error, null, 2));
    return;
  }

  const data = await response.json();
  
  console.log('FOUND TABLES:');
  console.log('================================');
  data.tables.forEach(table => {
    console.log(`Name: ${table.name}`);
    console.log(`ID:   ${table.id}`);
    console.log(`Desc: ${table.description || 'N/A'}`);
    console.log('---');
  });
}

listTables();
