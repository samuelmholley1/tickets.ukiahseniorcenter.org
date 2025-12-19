// Script to update records with (COMP) indication to have payment method = "Comp"

import { readFileSync } from 'fs';

// Load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const BASE_ID = envVars.AIRTABLE_BASE_ID;
const API_KEY = envVars.AIRTABLE_API_KEY;
const CHRISTMAS_TABLE_ID = envVars.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID;
const NYE_TABLE_ID = envVars.AIRTABLE_NYE_TICKETS_TABLE_ID;

async function getAllRecords(tableId) {
  console.log(`Fetching from: ${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}`);
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Response status:', response.status);
    console.error('Error details:', error);
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.records;
}

async function updateRecord(tableId, recordId, fields) {
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

function hasCompIndication(record) {
  const fields = record.fields;
  const lastName = fields['Last Name'] || '';
  const firstName = fields['First Name'] || '';
  const email = fields['Email'] || '';
  const phone = fields['Phone'] || '';
  const checkNumber = fields['Check Number'] || '';
  const staffInitials = fields['Staff Initials'] || '';
  
  // Check for (COMP), (comp), COMP, comp in any of these fields
  const compPattern = /\(?\s*comp\s*\)?/i;
  
  return compPattern.test(lastName) || 
         compPattern.test(firstName) || 
         compPattern.test(email) ||
         compPattern.test(phone) ||
         compPattern.test(checkNumber) ||
         compPattern.test(staffInitials);
}

async function processTable(tableName, tableId) {
  console.log(`\n=== Processing ${tableName} Table ===`);
  
  const records = await getAllRecords(tableId);
  console.log(`Found ${records.length} total records`);
  
  const compRecords = records.filter(hasCompIndication);
  console.log(`Found ${compRecords.length} records with COMP indication`);
  
  if (compRecords.length === 0) {
    console.log('No records to update');
    return [];
  }
  
  console.log('\nRecords to update:');
  for (const record of compRecords) {
    console.log(`- ${record.fields['First Name']} ${record.fields['Last Name']} (Payment: ${record.fields['Payment Method']})`);
    console.log(`  Fields: ${JSON.stringify(record.fields, null, 2)}`);
  }
  
  console.log('\nUpdating records...');
  const updated = [];
  
  for (const record of compRecords) {
    try {
      const result = await updateRecord(tableId, record.id, {
        'Payment Method': 'Comp'
      });
      console.log(`✓ Updated: ${record.fields['First Name']} ${record.fields['Last Name']}`);
      updated.push(result);
    } catch (error) {
      console.error(`✗ Failed to update ${record.fields['First Name']} ${record.fields['Last Name']}: ${error.message}`);
    }
  }
  
  return updated;
}

async function main() {
  try {
    console.log('Starting COMP records update process...');
    
    const christmasUpdated = await processTable('Christmas', CHRISTMAS_TABLE_ID);
    const nyeUpdated = await processTable('NYE', NYE_TABLE_ID);
    
    const totalUpdated = christmasUpdated.length + nyeUpdated.length;
    
    console.log(`\n=== Summary ===`);
    console.log(`Christmas records updated: ${christmasUpdated.length}`);
    console.log(`NYE records updated: ${nyeUpdated.length}`);
    console.log(`Total records updated: ${totalUpdated}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
