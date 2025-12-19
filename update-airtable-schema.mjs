// Update Airtable Payment Method field to add Comp and Other options
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

console.log('Using Airtable Metadata API to update Payment Method field...\n');

// Get table schema
async function getTableSchema(tableId, tableName) {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get schema: ${response.status} ${await response.text()}`);
  }
  
  const data = await response.json();
  const table = data.tables.find(t => t.id === tableId || t.name === tableName);
  
  if (!table) {
    console.log('Available tables:', data.tables.map(t => ({ id: t.id, name: t.name })));
    throw new Error(`Table ${tableId} not found`);
  }
  
  return table;
}

// Update field to add new options
async function updateFieldOptions(tableId, fieldId, currentOptions) {
  // Preserve existing choices with their IDs, and add new ones
  const newChoices = currentOptions.choices.map(choice => ({
    id: choice.id,
    name: choice.name
  }));
  
  // Add Cash & Check if missing
  if (!newChoices.find(opt => opt.name === 'Cash & Check')) {
    newChoices.push({ name: 'Cash & Check' });
  }
  
  // Add Comp if missing
  if (!newChoices.find(opt => opt.name === 'Comp')) {
    newChoices.push({ name: 'Comp' });
  }
  
  // Add Other if missing
  if (!newChoices.find(opt => opt.name === 'Other')) {
    newChoices.push({ name: 'Other' });
  }
  
  console.log('  Sending update with choices:', JSON.stringify(newChoices, null, 2));
  
  const payload = {
    options: {
      choices: newChoices
    }
  };
  
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields/${fieldId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('  Error response:', errorText);
    throw new Error(`Failed to update field: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

async function updateTable(tableId, tableName) {
  console.log(`\n=== Updating ${tableName} ===`);
  
  // Get current schema
  const table = await getTableSchema(tableId, tableName);
  console.log(`✓ Found table: ${table.name} (${table.id})`);
  
  // Find Payment Method field
  const paymentMethodField = table.fields.find(f => f.name === 'Payment Method');
  if (!paymentMethodField) {
    throw new Error('Payment Method field not found');
  }
  
  console.log(`✓ Found Payment Method field (${paymentMethodField.id})`);
  console.log(`  Field type: ${paymentMethodField.type}`);
  console.log(`  Current options:`, JSON.stringify(paymentMethodField.options, null, 2));
  
  // Check if already has the options
  const hasComp = paymentMethodField.options.choices.some(c => c.name === 'Comp');
  const hasOther = paymentMethodField.options.choices.some(c => c.name === 'Other');
  const hasCashCheck = paymentMethodField.options.choices.some(c => c.name === 'Cash & Check');
  
  if (hasComp && hasOther && hasCashCheck) {
    console.log('  ✓ Already has all required options - no update needed');
    return;
  }
  
  // Update the field
  console.log('  Updating field to add new options...');
  const result = await updateFieldOptions(table.id, paymentMethodField.id, paymentMethodField.options);
  console.log(`  ✓ Updated successfully!`);
  console.log(`  New options: ${result.options.choices.map(c => c.name).join(', ')}`);
}

async function main() {
  try {
    await updateTable(CHRISTMAS_TABLE_ID, 'Christmas Drive-Thru 2025');
    await updateTable(NYE_TABLE_ID, 'NYE Gala Dance 2025');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Schema update complete!');
    console.log('   Both tables now have Comp and Other payment options.');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
