// Import Zeffy ticket data into Airtable
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

// Pricing constants
const PRICES = {
  'Christmas Drive-Thru (Member)': 15,
  'Christmas Drive-Thru (Nonmember)': 20,
  'NYE Dance (Member)': 35,
  'NYE Dance (Nonmember)': 45
};

// Parse name into first and last
function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

// Read and process Zeffy Excel file
function processZeffyData(filename) {
  console.log(`\n📖 Reading ${filename}...`);
  const wb = XLSX.readFile(filename);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);
  
  console.log(`   Found ${data.length} total tickets`);
  
  // Group by buyer email
  const buyers = {};
  const skipped = [];
  
  data.forEach(row => {
    const ticketType = row['Ticket type'];
    const email = row['Buyer email'];
    const ticketNumber = row['Ticket number'];
    
    // Skip non-event items
    if (!PRICES[ticketType]) {
      skipped.push({ type: ticketType, number: ticketNumber });
      return;
    }
    
    if (!buyers[email]) {
      buyers[email] = {
        name: row['Buyer name'],
        email: email,
        tickets: [],
        ticketNumbers: []
      };
    }
    
    buyers[email].tickets.push(ticketType);
    buyers[email].ticketNumbers.push(ticketNumber);
  });
  
  console.log(`   Grouped into ${Object.keys(buyers).length} unique buyers`);
  if (skipped.length > 0) {
    console.log(`   ⚠️  Skipped ${skipped.length} non-event items:`);
    skipped.forEach(s => console.log(`      - ${s.type} (ticket #${s.number})`));
  }
  
  return buyers;
}

// Transform buyer data into Airtable records
function transformBuyerData(buyers) {
  const christmasRecords = [];
  const nyeRecords = [];
  
  for (const [email, buyer] of Object.entries(buyers)) {
    const { firstName, lastName } = parseName(buyer.name);
    
    // Replace @seniorctr.org emails with "Declined to Provide"
    const actualEmail = email.endsWith('@seniorctr.org') ? 'Declined to Provide' : email;
    
    // Count ticket types
    const counts = {
      christmasMember: 0,
      christmasNonMember: 0,
      nyeMember: 0,
      nyeNonMember: 0
    };
    
    let christmasTotal = 0;
    let nyeTotal = 0;
    
    buyer.tickets.forEach(ticket => {
      if (ticket === 'Christmas Drive-Thru (Member)') {
        counts.christmasMember++;
        christmasTotal += PRICES[ticket];
      } else if (ticket === 'Christmas Drive-Thru (Nonmember)') {
        counts.christmasNonMember++;
        christmasTotal += PRICES[ticket];
      } else if (ticket === 'NYE Dance (Member)') {
        counts.nyeMember++;
        nyeTotal += PRICES[ticket];
      } else if (ticket === 'NYE Dance (Nonmember)') {
        counts.nyeNonMember++;
        nyeTotal += PRICES[ticket];
      }
    });
    
    const transactionId = `ZEFFY-IMPORT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const ticketNumbersNote = `Zeffy ticket numbers: ${buyer.ticketNumbers.join(', ')}`;
    
    // Create Christmas record if has Christmas tickets
    if (counts.christmasMember > 0 || counts.christmasNonMember > 0) {
      christmasRecords.push({
        email: actualEmail,
        fields: {
          'Transaction ID': transactionId,
          'First Name': firstName,
          'Last Name': lastName,
          'Email': actualEmail,
          'Phone': 'No phone provided',
          'Payment Method': 'Card (Zeffy)',
          'Check Number': '',
          'Payment Notes': ticketNumbersNote,
          'Purchase Date': new Date().toISOString(),
          'Ticket Subtotal': christmasTotal,
          'Donation Amount': 0,
          'Amount Paid': christmasTotal,
          'Ticket Quantity': counts.christmasMember + counts.christmasNonMember,
          'Christmas Member Tickets': counts.christmasMember,
          'Christmas Non-Member Tickets': counts.christmasNonMember,
          'Vegetarian Meals': 0,
          'Staff Initials': 'ZEFFY'
        }
      });
    }
    
    // Create NYE record if has NYE tickets
    if (counts.nyeMember > 0 || counts.nyeNonMember > 0) {
      nyeRecords.push({
        email: actualEmail,
        fields: {
          'Transaction ID': transactionId,
          'First Name': firstName,
          'Last Name': lastName,
          'Email': actualEmail,
          'Phone': 'No phone provided',
          'Payment Method': 'Card (Zeffy)',
          'Check Number': '',
          'Payment Notes': ticketNumbersNote,
          'Purchase Date': new Date().toISOString(),
          'Ticket Subtotal': nyeTotal,
          'Donation Amount': 0,
          'Amount Paid': nyeTotal,
          'Ticket Quantity': counts.nyeMember + counts.nyeNonMember,
          'NYE Member Tickets': counts.nyeMember,
          'NYE Non-Member Tickets': counts.nyeNonMember,
          'Staff Initials': 'ZEFFY'
        }
      });
    }
  }
  
  return { christmasRecords, nyeRecords };
}

// Check for existing records by email
async function checkExistingRecords(tableId, emails) {
  const existing = [];
  
  // Check in batches
  for (let i = 0; i < emails.length; i += 10) {
    const batch = emails.slice(i, i + 10);
    const filterFormula = `OR(${batch.map(e => `{Email}='${e}'`).join(',')})`;
    
    const response = await fetch(
      `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      existing.push(...data.records.map(r => r.fields.Email));
    }
  }
  
  return existing;
}

// Create Airtable record
async function createRecord(tableId, fields) {
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${tableId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create record: ${response.status} ${error}`);
  }
  
  return response.json();
}

// Main import function
async function importToAirtable(records, tableId, tableName, dryRun = true) {
  console.log(`\n📊 ${tableName} Table:`);
  console.log(`   ${records.length} records to import`);
  
  if (records.length === 0) {
    console.log('   ✓ Nothing to import');
    return { imported: 0, skipped: 0, errors: [] };
  }
  
  // Check for existing emails
  const emails = records.map(r => r.email);
  console.log(`   Checking for existing records...`);
  const existing = await checkExistingRecords(tableId, emails);
  
  if (existing.length > 0) {
    console.log(`   ⚠️  Found ${existing.length} existing emails:`);
    existing.forEach(e => console.log(`      - ${e}`));
  }
  
  // Show sample records
  console.log(`\n   Sample records:`);
  records.slice(0, 3).forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.fields['First Name']} ${rec.fields['Last Name']} (${rec.email})`);
    console.log(`      Tickets: ${rec.fields['Ticket Quantity']} | Amount: $${rec.fields['Amount Paid']}`);
  });
  
  if (dryRun) {
    console.log(`\n   🔍 DRY RUN - No records created`);
    return { imported: 0, skipped: existing.length, errors: [] };
  }
  
  // Import records
  console.log(`\n   Importing records...`);
  let imported = 0;
  let skipped = 0;
  const errors = [];
  
  for (const record of records) {
    // Skip if already exists
    if (existing.includes(record.email)) {
      skipped++;
      continue;
    }
    
    try {
      await createRecord(tableId, record.fields);
      imported++;
      console.log(`   ✓ ${record.fields['First Name']} ${record.fields['Last Name']}`);
      
      // Rate limiting - don't hit Airtable too fast
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      errors.push({ email: record.email, error: error.message });
      console.error(`   ✗ ${record.email}: ${error.message}`);
    }
  }
  
  return { imported, skipped, errors };
}

// Main execution
async function main() {
  console.log('🎟️  ZEFFY TICKET IMPORT\n');
  console.log('=' .repeat(50));
  
  try {
    // Process Zeffy data
    const buyers = processZeffyData('Holidays 2025_12-19-2025.xlsx');
    
    // Transform to Airtable format
    const { christmasRecords, nyeRecords } = transformBuyerData(buyers);
    
    console.log(`\n📈 Import Summary:`);
    console.log(`   Christmas records: ${christmasRecords.length}`);
    console.log(`   NYE records: ${nyeRecords.length}`);
    console.log(`   Total revenue: $${christmasRecords.reduce((sum, r) => sum + r.fields['Amount Paid'], 0) + nyeRecords.reduce((sum, r) => sum + r.fields['Amount Paid'], 0)}`);
    
    // DRY RUN
    console.log('\n' + '='.repeat(50));
    console.log('🔍 DRY RUN - Checking data...\n');
    
    await importToAirtable(christmasRecords, CHRISTMAS_TABLE_ID, 'Christmas Drive-Thru', true);
    await importToAirtable(nyeRecords, NYE_TABLE_ID, 'NYE Gala Dance', true);
    
    // Ask for confirmation
    console.log('\n' + '='.repeat(50));
    console.log('⚠️  Ready to import for real?');
    console.log('   Run with --execute flag to proceed:');
    console.log('   node import-zeffy.mjs --execute');
    
    // Check for execute flag
    if (process.argv.includes('--execute')) {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 EXECUTING IMPORT...\n');
      
      const christmasResults = await importToAirtable(christmasRecords, CHRISTMAS_TABLE_ID, 'Christmas Drive-Thru', false);
      const nyeResults = await importToAirtable(nyeRecords, NYE_TABLE_ID, 'NYE Gala Dance', false);
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ IMPORT COMPLETE!\n');
      console.log('Christmas:');
      console.log(`   Imported: ${christmasResults.imported}`);
      console.log(`   Skipped (existing): ${christmasResults.skipped}`);
      console.log(`   Errors: ${christmasResults.errors.length}`);
      console.log('\nNYE:');
      console.log(`   Imported: ${nyeResults.imported}`);
      console.log(`   Skipped (existing): ${nyeResults.skipped}`);
      console.log(`   Errors: ${nyeResults.errors.length}`);
      
      if (christmasResults.errors.length > 0 || nyeResults.errors.length > 0) {
        console.log('\n❌ Errors:');
        [...christmasResults.errors, ...nyeResults.errors].forEach(e => {
          console.log(`   ${e.email}: ${e.error}`);
        });
      }
      console.log('='.repeat(50));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
