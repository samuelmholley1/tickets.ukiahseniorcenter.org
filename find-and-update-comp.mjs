// Find and update records with (COMP) indication to use Comp payment method
import fs from 'fs';

// For this one-time script, read values directly from .env.local
// Avoiding complex parsing due to line ending issues
const envContent = fs.readFileSync('.env.local', 'utf8');

// Extract values using regex
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const christmasTableMatch = envContent.match(/AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=([^\s\r\n]+)/);
const nyeTableMatch = envContent.match(/AIRTABLE_NYE_TICKETS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;
const AIRTABLE_BASE_ID = baseIdMatch ? baseIdMatch[1] : null;
const CHRISTMAS_TABLE_ID = christmasTableMatch ? christmasTableMatch[1] : null;
const NYE_TABLE_ID = nyeTableMatch ? nyeTableMatch[1] : null;

console.log('Loaded environment variables:');
console.log('- AIRTABLE_API_KEY:', AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 10)}...` : 'MISSING');
console.log('- AIRTABLE_BASE_ID:', AIRTABLE_BASE_ID || 'MISSING');
console.log('- CHRISTMAS_TABLE_ID:', CHRISTMAS_TABLE_ID || 'MISSING');
console.log('- NYE_TABLE_ID:', NYE_TABLE_ID || 'MISSING');
console.log('');

// Also try with table names URL-encoded as backup
const CHRISTMAS_TABLE_NAME = encodeURIComponent('Christmas Drive-Thru 2025');
const NYE_TABLE_NAME = encodeURIComponent('NYE Gala Dance 2025');

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

async function fetchAllRecords(tableId, tableName) {
  const records = [];
  let offset = null;
  
  do {
    // Try table ID first, then fall back to table name
    let url = offset 
      ? `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}?offset=${offset}`
      : `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}`;
    
    let response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });
    
    // If 404, try with table name instead
    if (!response.ok && response.status === 404) {
      console.log(`   Table ID ${tableId} not found, trying with table name...`);
      url = offset 
        ? `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableName}?offset=${offset}`
        : `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableName}`;
      
      response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      });
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  
  return records;
}

async function updateRecord(tableId, tableName, recordId, fields) {
  // Try table ID first, then fall back to table name
  let response = await fetch(
    `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  
  // If 404, try with table name instead
  if (!response.ok && response.status === 404) {
    response = await fetch(
      `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
  }
  
  if (!response.ok) {
    throw new Error(`Failed to update record: ${response.status} ${await response.text()}`);
  }
  
  return response.json();
}

function findCompIndication(record) {
  const fields = record.fields;
  const searchFields = [
    'Last Name',
    'First Name',
    'Email',
    'Payment Notes',
    'Check Number',
  ];
  
  for (const field of searchFields) {
    if (fields[field] && typeof fields[field] === 'string') {
      if (fields[field].toUpperCase().includes('(COMP)') || 
          fields[field].toUpperCase().includes('COMP') ||
          fields[field].toUpperCase().includes('COMPLIMENTARY')) {
        return { field, value: fields[field] };
      }
    }
  }
  
  return null;
}

async function processTable(tableId, tableName, displayName) {
  console.log(`\n=== Processing ${displayName} ===`);
  
  const records = await fetchAllRecords(tableId, tableName);
  console.log(`Found ${records.length} total records`);
  
  const recordsToUpdate = [];
  
  for (const record of records) {
    const compIndication = findCompIndication(record);
    if (compIndication) {
      recordsToUpdate.push({
        id: record.id,
        fields: record.fields,
        compIndication,
      });
    }
  }
  
  console.log(`\nFound ${recordsToUpdate.length} records with COMP indication:`);
  
  for (const record of recordsToUpdate) {
    console.log(`\n📋 Record ID: ${record.id}`);
    console.log(`   Name: ${record.fields['First Name']} ${record.fields['Last Name']}`);
    console.log(`   Current Payment Method: ${record.fields['Payment Method']}`);
    console.log(`   COMP found in ${record.compIndication.field}: "${record.compIndication.value}"`);
    
    // Check if already set to Comp
    if (record.fields['Payment Method'] === 'Comp') {
      console.log(`   ✅ Already set to Comp - skipping`);
      continue;
    }
    
    try {
      // Update to Comp payment method
      await updateRecord(tableId, tableName, record.id, {
        'Payment Method': 'Comp',
      });
      console.log(`   ✅ UPDATED to Comp payment method`);
    } catch (error) {
      console.error(`   ❌ Error updating: ${error.message}`);
    }
  }
  
  return recordsToUpdate.length;
}

async function main() {
  console.log('🔍 Searching for records with COMP indication...\n');
  
  try {
    const christmasCount = await processTable(
      CHRISTMAS_TABLE_ID, 
      CHRISTMAS_TABLE_NAME,
      'Christmas Drive-Thru 2025'
    );
    const nyeCount = await processTable(
      NYE_TABLE_ID,
      NYE_TABLE_NAME,
      'NYE Gala Dance 2025'
    );
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Process complete!`);
    console.log(`   Christmas records processed: ${christmasCount}`);
    console.log(`   NYE records processed: ${nyeCount}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
