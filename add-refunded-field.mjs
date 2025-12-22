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

const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const CHRISTMAS_TABLE_ID = 'tbljtMTsXvSP3MDt4';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

async function addRefundedField() {
  console.log('\n📝 Adding Refunded checkbox field to both tables...\n');
  
  // Add to Christmas table
  try {
    const christmasResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${CHRISTMAS_TABLE_ID}/fields`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Refunded',
          type: 'checkbox',
          options: {
            icon: 'check',
            color: 'redBright'
          }
        })
      }
    );

    if (christmasResponse.ok) {
      const result = await christmasResponse.json();
      console.log(`✅ Added Refunded field to Christmas table: ${result.id}`);
    } else {
      const error = await christmasResponse.json();
      console.log('❌ Christmas table error:', JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.log('❌ Christmas table error:', error.message);
  }

  // Add to NYE table
  try {
    const nyeResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${NYE_TABLE_ID}/fields`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Refunded',
          type: 'checkbox',
          options: {
            icon: 'check',
            color: 'redBright'
          }
        })
      }
    );

    if (nyeResponse.ok) {
      const result = await nyeResponse.json();
      console.log(`✅ Added Refunded field to NYE table: ${result.id}`);
    } else {
      const error = await nyeResponse.json();
      console.log('❌ NYE table error:', JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.log('❌ NYE table error:', error.message);
  }

  console.log('\n✅ Done!\n');
}

addRefundedField();
