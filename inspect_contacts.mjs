// Inspect fields of the existing CONTACTS table (tbl3PQZzXGpT991dH)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const TABLE_ID = 'tbl3PQZzXGpT991dH';

async function inspectTable() {
  console.log(`Inspecting table ${TABLE_ID}...\n`);

  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    console.error('Error fetching tables');
    return;
  }

  const data = await response.json();
  const table = data.tables.find(t => t.id === TABLE_ID);
  
  if (!table) {
    console.error('Table not found');
    return;
  }

  console.log(`Table Name: ${table.name}`);
  console.log('Fields:');
  console.log('--------------------------------');
  table.fields.forEach(field => {
    console.log(`- ${field.name} (${field.type})`);
    if (field.type === 'singleSelect' && field.options && field.options.choices) {
        console.log('  Choices:', field.options.choices.map(c => c.name).join(', '));
    }
  });
}

inspectTable();
