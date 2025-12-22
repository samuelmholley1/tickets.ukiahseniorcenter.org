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

async function findNYEDuplicates() {
  console.log('\n🔍 FINDING NYE ZEFFY DUPLICATES\n');
  console.log('==================================================\n');
  
  // Fetch all NYE Zeffy records
  let allRecords = [];
  let offset = null;
  
  do {
    const url = offset 
      ? `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}?offset=${offset}`
      : `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);
  
  const zeffyRecords = allRecords.filter(r => 
    r.fields['Payment Method'] === 'Card (Zeffy)'
  );
  
  console.log(`Total Zeffy NYE Records: ${zeffyRecords.length}\n`);
  
  // Group by name + email + quantity
  const groups = {};
  
  zeffyRecords.forEach(record => {
    const name = `${record.fields['First Name']} ${record.fields['Last Name']}`;
    const email = record.fields['Email'] || 'no-email';
    const memberTickets = record.fields['NYE Member Tickets'] || 0;
    const nonMemberTickets = record.fields['NYE Non-Member Tickets'] || 0;
    const totalTickets = memberTickets + nonMemberTickets;
    
    const key = `${name}|${email}|${totalTickets}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push({
      id: record.id,
      name,
      email,
      memberTickets,
      nonMemberTickets,
      amount: record.fields['Amount Paid'],
      createdTime: record.createdTime
    });
  });
  
  // Find duplicates
  const duplicates = [];
  Object.entries(groups).forEach(([key, records]) => {
    if (records.length > 1) {
      // Sort by creation time (oldest first)
      records.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime());
      
      console.log(`Found ${records.length} records for ${records[0].name}:`);
      records.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.id} - Created: ${new Date(r.createdTime).toLocaleString()}`);
        if (i > 0) {
          console.log(`     ⚠️  DUPLICATE - Will delete this one`);
          duplicates.push(r.id);
        } else {
          console.log(`     ✅ KEEP - Oldest record`);
        }
      });
      console.log('');
    }
  });
  
  console.log('==================================================');
  console.log(`\nTotal duplicates to delete: ${duplicates.length}\n`);
  
  if (duplicates.length > 0) {
    console.log('Duplicate Record IDs:');
    duplicates.forEach(id => console.log(`  '${id}',`));
  }
  
  console.log('\n==================================================\n');
  
  return duplicates;
}

findNYEDuplicates();
