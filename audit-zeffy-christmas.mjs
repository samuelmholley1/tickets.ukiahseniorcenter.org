import XLSX from 'xlsx';
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

// Helper to normalize emails
function normalizeEmail(email) {
  if (!email) return email;
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.endsWith('@seniorctr.org') || lowerEmail.endsWith('@ukiahseniorcenter.org')) {
    return 'Declined to Provide';
  }
  return email;
}

console.log('\n📊 ZEFFY DATA AUDIT - CHRISTMAS DRIVE-THRU\n');
console.log('==================================================\n');

// Read Excel file
console.log('📖 Reading Holidays w dates2025_12-19-2025.xlsx...\n');
const wb = XLSX.readFile('Holidays w dates2025_12-19-2025.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(ws);

console.log(`Found ${excelData.length} transactions in Excel file\n`);

// Parse Details field to extract Christmas tickets
const excelBuyers = {};

excelData.forEach(row => {
  const name = `${row['First Name']} ${row['Last Name']}`;
  const rawEmail = row['Email'];
  const email = normalizeEmail(rawEmail);
  const details = row['Details'] || '';
  
  // Parse details like "3x Christmas Drive-Thru (Nonmember)" or "2x Christmas Drive-Thru (Member), 1x NYE Dance (Member)"
  const christmasMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Member\)/);
  const christmasNonMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Nonmember\)/);
  
  const memberCount = christmasMemberMatch ? parseInt(christmasMemberMatch[1]) : 0;
  const nonMemberCount = christmasNonMemberMatch ? parseInt(christmasNonMemberMatch[1]) : 0;
  const totalChristmas = memberCount + nonMemberCount;
  
  if (totalChristmas > 0) {
    excelBuyers[name] = {
      email: email,
      member: memberCount,
      nonMember: nonMemberCount,
      total: totalChristmas
    };
  }
});

console.log(`${Object.keys(excelBuyers).length} buyers with Christmas Drive-Thru tickets\n`);

console.log('📋 EXCEL DATA (Christmas Drive-Thru Buyers):\n');
Object.entries(excelBuyers).sort().forEach(([name, data]) => {
  console.log(`${name} (${data.email})`);
  console.log(`   Total: ${data.total} | Member: ${data.member}, Non-Member: ${data.nonMember}`);
  console.log('');
});

console.log('\n==================================================\n');

// Fetch from Airtable
console.log('🔍 Fetching Christmas Drive-Thru records from Airtable...\n');

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

const airtableData = await response.json();
console.log(`Found ${airtableData.records.length} Zeffy records in Airtable\n`);

console.log('📋 AIRTABLE DATA (Zeffy Christmas Records):\n');
const airtableBuyers = {};
airtableData.records.forEach(record => {
  const name = `${record.fields['First Name']} ${record.fields['Last Name']}`;
  const email = record.fields['Email'];
  const qty = record.fields['Ticket Quantity'];
  const member = record.fields['Christmas Member Tickets'] || 0;
  const nonMember = record.fields['Christmas Non-Member Tickets'] || 0;
  
  airtableBuyers[name] = {
    email: email,
    member: member,
    nonMember: nonMember,
    total: qty,
    recordId: record.id
  };
  
  console.log(`${name} (${email})`);
  console.log(`   Total: ${qty} | Member: ${member}, Non-Member: ${nonMember}`);
  console.log(`   Record ID: ${record.id}`);
  console.log('');
});

console.log('\n==================================================\n');
console.log('🔍 DISCREPANCY ANALYSIS:\n');

// Check for missing people
const excelNames = Object.keys(excelBuyers);
const airtableNames = Object.keys(airtableBuyers);

console.log('❌ IN EXCEL BUT NOT IN AIRTABLE:\n');
let missingCount = 0;
excelNames.forEach(name => {
  if (!airtableNames.includes(name)) {
    const data = excelBuyers[name];
    console.log(`   ${name} (${data.email})`);
    console.log(`      ${data.total} tickets (${data.member} member, ${data.nonMember} non-member)`);
    console.log('');
    missingCount++;
  }
});
if (missingCount === 0) {
  console.log('   None - all Excel buyers are in Airtable ✅\n');
}

console.log('\n✅ IN AIRTABLE BUT NOT IN EXCEL:\n');
let extraCount = 0;
airtableNames.forEach(name => {
  if (!excelNames.includes(name)) {
    const data = airtableBuyers[name];
    console.log(`   ${name} (${data.email})`);
    console.log(`      ${data.total} tickets | Record ID: ${data.recordId}`);
    console.log('');
    extraCount++;
  }
});
if (extraCount === 0) {
  console.log('   None ✅\n');
}

console.log('\n⚠️  QUANTITY MISMATCHES:\n');
let mismatchCount = 0;
excelNames.forEach(name => {
  const excelData = excelBuyers[name];
  const airtableData = airtableBuyers[name];
  
  if (airtableData) {
    if (excelData.total !== airtableData.total || 
        excelData.member !== airtableData.member || 
        excelData.nonMember !== airtableData.nonMember) {
      console.log(`   ${name}:`);
      console.log(`      EXCEL:    ${excelData.total} total (${excelData.member} member, ${excelData.nonMember} non-member)`);
      console.log(`      AIRTABLE: ${airtableData.total} total (${airtableData.member} member, ${airtableData.nonMember} non-member)`);
      console.log(`      Record ID: ${airtableData.recordId}`);
      console.log('');
      mismatchCount++;
    }
  }
});
if (mismatchCount === 0) {
  console.log('   None - all quantities match ✅\n');
}

console.log('==================================================\n');
console.log('📊 SUMMARY:\n');
console.log(`   Excel buyers: ${excelNames.length}`);
console.log(`   Airtable records: ${airtableNames.length}`);
console.log(`   Missing from Airtable: ${missingCount}`);
console.log(`   Extra in Airtable: ${extraCount}`);
console.log(`   Quantity mismatches: ${mismatchCount}`);
console.log('\n==================================================\n');
