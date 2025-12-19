// Update Zeffy records in Airtable with correct dates
import XLSX from 'xlsx';
import fs from 'fs';

// Read environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);
const christmasTableMatch = envContent.match(/AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=([^\s\r\n]+)/);
const nyeTableMatch = envContent.match(/AIRTABLE_NYE_TICKETS_TABLE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;
const AIRTABLE_BASE_ID = baseIdMatch ? baseIdMatch[1] : null;
const CHRISTMAS_TABLE_ID = christmasTableMatch ? christmasTableMatch[1] : null;
const NYE_TABLE_ID = nyeTableMatch ? nyeTableMatch[1] : null;
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

// Parse Zeffy date format: "12/18/2025, 6:43 PM"
function parseZeffyDate(dateStr) {
  const [datePart, timePart] = dateStr.split(', ');
  const [month, day, year] = datePart.split('/');
  const [time, meridian] = timePart.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  if (meridian === 'PM' && hours !== 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  
  // Create ISO date string
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

// Parse Details field to extract ticket counts
function parseDetails(details) {
  const counts = {
    christmasMember: 0,
    christmasNonMember: 0,
    nyeMember: 0,
    nyeNonMember: 0
  };
  
  const items = details.split(', ');
  items.forEach(item => {
    const match = item.match(/(\d+)x (.+)/);
    if (match) {
      const qty = parseInt(match[1]);
      const type = match[2];
      
      if (type === 'Christmas Drive-Thru (Member)') counts.christmasMember = qty;
      else if (type === 'Christmas Drive-Thru (Nonmember)') counts.christmasNonMember = qty;
      else if (type === 'NYE Dance (Member)') counts.nyeMember = qty;
      else if (type === 'NYE Dance (Nonmember)') counts.nyeNonMember = qty;
    }
  });
  
  return counts;
}

// Find record by email
async function findRecordByEmail(tableId, email) {
  const filterFormula = encodeURIComponent(`{Email}='${email}'`);
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}?filterByFormula=${filterFormula}`,
    {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.records.length > 0 ? data.records[0] : null;
}

// Update record with purchase date
async function updateRecordDate(tableId, recordId, isoDate) {
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Purchase Date': isoDate
        }
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update: ${response.status} ${await response.text()}`);
  }
  
  return response.json();
}

async function main() {
  console.log('📅 UPDATING ZEFFY RECORD DATES\n');
  console.log('='.repeat(50));
  
  // Read the new Zeffy file with dates
  console.log('\n📖 Reading Holidays w dates2025_12-19-2025.xlsx...');
  const wb = XLSX.readFile('Holidays w dates2025_12-19-2025.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);
  
  console.log(`   Found ${data.length} transactions\n`);
  
  let updated = 0;
  let notFound = 0;
  const errors = [];
  
  for (const row of data) {
    const email = row['Email'];
    const firstName = row['First Name'];
    const lastName = row['Last Name'];
    const date = row['Payment Date (America/Los_Angeles)'];
    const details = row['Details'];
    
    // Skip if no email
    if (!email) {
      console.log(`⚠️  Skipping ${firstName} ${lastName} - no email`);
      continue;
    }
    
    const actualEmail = email.endsWith('@seniorctr.org') ? 'Declined to Provide' : email;
    const counts = parseDetails(details);
    const isoDate = parseZeffyDate(date);
    
    console.log(`\n🔍 ${firstName} ${lastName} (${actualEmail})`);
    console.log(`   Date: ${date}`);
    
    // Update Christmas table if has Christmas tickets
    if (counts.christmasMember > 0 || counts.christmasNonMember > 0) {
      const record = await findRecordByEmail(CHRISTMAS_TABLE_ID, actualEmail);
      if (record) {
        try {
          await updateRecordDate(CHRISTMAS_TABLE_ID, record.id, isoDate);
          console.log(`   ✅ Updated Christmas record`);
          updated++;
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.log(`   ❌ Error updating Christmas: ${error.message}`);
          errors.push({ name: `${firstName} ${lastName}`, table: 'Christmas', error: error.message });
        }
      } else {
        console.log(`   ⚠️  Christmas record not found`);
        notFound++;
      }
    }
    
    // Update NYE table if has NYE tickets
    if (counts.nyeMember > 0 || counts.nyeNonMember > 0) {
      const record = await findRecordByEmail(NYE_TABLE_ID, actualEmail);
      if (record) {
        try {
          await updateRecordDate(NYE_TABLE_ID, record.id, isoDate);
          console.log(`   ✅ Updated NYE record`);
          updated++;
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.log(`   ❌ Error updating NYE: ${error.message}`);
          errors.push({ name: `${firstName} ${lastName}`, table: 'NYE', error: error.message });
        }
      } else {
        console.log(`   ⚠️  NYE record not found`);
        notFound++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ UPDATE COMPLETE!\n');
  console.log(`   Records updated: ${updated}`);
  console.log(`   Records not found: ${notFound}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`   ${e.name} (${e.table}): ${e.error}`));
  }
  console.log('='.repeat(50));
}

main();
