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
const NYE_TABLE_ID = env.AIRTABLE_NYE_TICKETS_TABLE_ID;
const API_KEY = env.AIRTABLE_API_KEY;

console.log('\n🎟️  ZEFFY IMPORT - 12/22/25');
console.log('==================================================\n');

// Read Excel file
console.log('📖 Reading Holidays 2025_12-22-2025.xlsx...\n');
const wb = XLSX.readFile('Holidays 2025_12-22-2025.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(ws);

console.log(`Found ${excelData.length} transactions\n`);

// Helper to normalize emails
function normalizeEmail(email) {
  if (!email) return email;
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.endsWith('@seniorctr.org') || lowerEmail.endsWith('@ukiahseniorcenter.org')) {
    return 'Declined to Provide';
  }
  return email;
}

// Helper to parse purchase date
function parsePurchaseDate(dateString) {
  // Parse "12/22/2025, 1:15 PM" format
  const date = new Date(dateString);
  return date.toISOString();
}

// Parse each transaction
const christmasRecords = [];
const nyeRecords = [];

excelData.forEach(row => {
  const firstName = row['First Name'];
  const lastName = row['Last Name'];
  const rawEmail = row['Email'];
  const email = normalizeEmail(rawEmail);
  const details = row['Details'] || '';
  const totalAmount = row['Total Amount'] || 0;
  const purchaseDateStr = row['Payment Date (America/Los_Angeles)'];
  const purchaseDate = parsePurchaseDate(purchaseDateStr);
  
  // Parse details for Christmas tickets
  const christmasMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Member\)/);
  const christmasNonMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Nonmember\)/);
  const christmasMember = christmasMemberMatch ? parseInt(christmasMemberMatch[1]) : 0;
  const christmasNonMember = christmasNonMemberMatch ? parseInt(christmasNonMemberMatch[1]) : 0;
  const totalChristmas = christmasMember + christmasNonMember;
  
  // Parse details for NYE tickets
  const nyeMemberMatch = details.match(/(\d+)x NYE Dance \(Member\)/);
  const nyeNonMemberMatch = details.match(/(\d+)x NYE Dance \(Nonmember\)/);
  const nyeMember = nyeMemberMatch ? parseInt(nyeMemberMatch[1]) : 0;
  const nyeNonMember = nyeNonMemberMatch ? parseInt(nyeNonMemberMatch[1]) : 0;
  const totalNYE = nyeMember + nyeNonMember;
  
  // Calculate amounts
  const christmasAmount = (christmasMember * 15) + (christmasNonMember * 20);
  const nyeAmount = (nyeMember * 35) + (nyeNonMember * 45);
  
  // Create Christmas record if has Christmas tickets
  if (totalChristmas > 0) {
    christmasRecords.push({
      firstName,
      lastName,
      email,
      purchaseDate,
      fields: {
        'First Name': firstName,
        'Last Name': lastName,
        'Email': email,
        'Phone': 'No phone provided',
        'Payment Method': 'Card (Zeffy)',
        'Purchase Date': purchaseDate,
        'Ticket Subtotal': christmasAmount,
        'Donation Amount': 0,
        'Amount Paid': christmasAmount,
        'Ticket Quantity': totalChristmas,
        'Christmas Member Tickets': christmasMember,
        'Christmas Non-Member Tickets': christmasNonMember,
        'Vegetarian Meals': 0,
        'Staff Initials': 'ZEFFY'
      }
    });
  }
  
  // Create NYE record if has NYE tickets
  if (totalNYE > 0) {
    nyeRecords.push({
      firstName,
      lastName,
      email,
      purchaseDate,
      fields: {
        'First Name': firstName,
        'Last Name': lastName,
        'Email': email,
        'Phone': 'No phone provided',
        'Payment Method': 'Card (Zeffy)',
        'Purchase Date': purchaseDate,
        'Ticket Subtotal': nyeAmount,
        'Donation Amount': 0,
        'Amount Paid': nyeAmount,
        'Ticket Quantity': totalNYE,
        'NYE Member Tickets': nyeMember,
        'NYE Non-Member Tickets': nyeNonMember,
        'Staff Initials': 'ZEFFY'
      }
    });
  }
});

console.log(`📊 SUMMARY:`);
console.log(`   Christmas records to import: ${christmasRecords.length}`);
console.log(`   NYE records to import: ${nyeRecords.length}\n`);

console.log('==================================================\n');

// Import Christmas records
if (christmasRecords.length > 0) {
  console.log('🎄 IMPORTING CHRISTMAS DRIVE-THRU RECORDS:\n');
  
  for (const record of christmasRecords) {
    console.log(`📝 ${record.firstName} ${record.lastName} (${record.email})`);
    console.log(`   ${record.fields['Ticket Quantity']} tickets (${record.fields['Christmas Member Tickets']} member, ${record.fields['Christmas Non-Member Tickets']} non-member)`);
    console.log(`   Purchase: ${new Date(record.purchaseDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
    
    try {
      const response = await fetch(
        `${AIRTABLE_API_BASE}/${BASE_ID}/${CHRISTMAS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: record.fields }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ ERROR: ${response.status} - ${errorText}\n`);
      } else {
        const result = await response.json();
        console.log(`   ✅ Created record: ${result.id}\n`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}

// Import NYE records
if (nyeRecords.length > 0) {
  console.log('🎉 IMPORTING NYE GALA RECORDS:\n');
  
  for (const record of nyeRecords) {
    console.log(`📝 ${record.firstName} ${record.lastName} (${record.email})`);
    console.log(`   ${record.fields['Ticket Quantity']} tickets (${record.fields['NYE Member Tickets']} member, ${record.fields['NYE Non-Member Tickets']} non-member)`);
    console.log(`   Purchase: ${new Date(record.purchaseDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
    
    try {
      const response = await fetch(
        `${AIRTABLE_API_BASE}/${BASE_ID}/${NYE_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: record.fields }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ ERROR: ${response.status} - ${errorText}\n`);
      } else {
        const result = await response.json();
        console.log(`   ✅ Created record: ${result.id}\n`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}

console.log('==================================================');
console.log('✅ IMPORT COMPLETE!\n');
