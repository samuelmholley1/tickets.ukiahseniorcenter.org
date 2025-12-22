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

console.log('\n🔍 FINDING DUPLICATE CHRISTMAS RECORDS\n');
console.log('==================================================\n');

// Fetch all Zeffy Christmas records
const response = await fetch(
  `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}?filterByFormula=OR({Staff Initials}='ZEFFY',{Payment Method}='Card (Zeffy)')`,
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  }
);

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
}

const data = await response.json();
console.log(`Found ${data.records.length} total Zeffy records\n`);

// Group by name + email + quantity to find duplicates
const groups = {};
data.records.forEach(record => {
  const name = `${record.fields['First Name']} ${record.fields['Last Name']}`;
  const email = record.fields['Email'];
  const qty = record.fields['Ticket Quantity'];
  const key = `${name}|${email}|${qty}`;
  
  if (!groups[key]) {
    groups[key] = [];
  }
  groups[key].push({
    id: record.id,
    name: name,
    email: email,
    qty: qty,
    created: record.createdTime,
    member: record.fields['Christmas Member Tickets'] || 0,
    nonMember: record.fields['Christmas Non-Member Tickets'] || 0
  });
});

// Find duplicates (groups with more than 1 record)
const duplicates = Object.entries(groups).filter(([key, records]) => records.length > 1);

console.log('📊 DUPLICATE RECORDS FOUND:\n');
console.log(`${duplicates.length} people have duplicate records\n`);

const recordsToDelete = [];

duplicates.forEach(([key, records]) => {
  // Sort by creation time (oldest first)
  records.sort((a, b) => new Date(a.created) - new Date(b.created));
  
  console.log(`${records[0].name} (${records[0].email})`);
  console.log(`   ${records[0].qty} tickets (${records[0].member} member, ${records[0].nonMember} non-member)`);
  console.log(`   ${records.length} duplicate records:\n`);
  
  records.forEach((record, i) => {
    const date = new Date(record.created).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const action = i === 0 ? '✅ KEEP (oldest)' : '❌ DELETE (duplicate)';
    console.log(`      ${action} - ${record.id} - Created: ${date}`);
    
    // Mark for deletion all except the first (oldest) one
    if (i > 0) {
      recordsToDelete.push(record);
    }
  });
  console.log('');
});

console.log('==================================================\n');
console.log(`📋 SUMMARY:\n`);
console.log(`   Total duplicates to delete: ${recordsToDelete.length}\n`);

// Show records to delete
if (recordsToDelete.length > 0) {
  console.log('🗑️  RECORDS TO DELETE:\n');
  recordsToDelete.forEach(record => {
    console.log(`   ${record.name} - ${record.id}`);
  });
  console.log('');
}

console.log('==================================================\n');

// Ask for confirmation before deleting
console.log('⚠️  Ready to delete duplicates. Type "yes" to proceed or Ctrl+C to cancel.\n');

// For automated execution, comment out the prompt and uncomment deletion code below
/*
console.log('🗑️  DELETING DUPLICATE RECORDS...\n');

for (const record of recordsToDelete) {
  try {
    const deleteResponse = await fetch(
      `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}/${record.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log(`   ❌ Failed to delete ${record.name} (${record.id}): ${errorText}`);
    } else {
      console.log(`   ✅ Deleted ${record.name} (${record.id})`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  } catch (error) {
    console.log(`   ❌ Error deleting ${record.name}: ${error.message}`);
  }
}

console.log('\n==================================================');
console.log('✅ CLEANUP COMPLETE!\n');
*/
