import XLSX from 'xlsx';
import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const CHRISTMAS_TABLE_ID = 'tbljtMTsXvSP3MDt4';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

// Parse Zeffy "Details" field to extract ticket information
function parseDetails(details) {
  const tickets = {
    christmasMember: 0,
    christmasNonMember: 0,
    nyeMember: 0,
    nyeNonMember: 0,
    vegetarian: 0
  };

  // Match patterns like "2x Christmas Drive-Thru (Member)"
  const christmasMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Member\)/i);
  const christmasNonMemberMatch = details.match(/(\d+)x Christmas Drive-Thru \(Nonmember\)/i);
  const nyeMemberMatch = details.match(/(\d+)x NYE Dance \(Member\)/i);
  const nyeNonMemberMatch = details.match(/(\d+)x NYE Dance \(Nonmember\)/i);

  if (christmasMemberMatch) tickets.christmasMember = parseInt(christmasMemberMatch[1]);
  if (christmasNonMemberMatch) tickets.christmasNonMember = parseInt(christmasNonMemberMatch[1]);
  if (nyeMemberMatch) tickets.nyeMember = parseInt(nyeMemberMatch[1]);
  if (nyeNonMemberMatch) tickets.nyeNonMember = parseInt(nyeNonMemberMatch[1]);

  return tickets;
}

// Parse payment date from Zeffy format "12/26/2025, 4:01 PM"
function parsePaymentDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Parse "12/26/2025, 4:01 PM" format
    const [datePart, timePart] = dateStr.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, meridiem] = timePart.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    // Create ISO 8601 date string in Pacific timezone
    const date = new Date(year, month - 1, day, hour, parseInt(minutes));
    return date.toISOString();
  } catch (e) {
    console.error(`Error parsing date: ${dateStr}`, e);
    return null;
  }
}

// Get existing records from Airtable
function getExistingRecords(tableId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${tableId}`,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.records || []);
      });
    }).on('error', reject);
  });
}

// Create record in Airtable
function createRecord(tableId, fields) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields });
    
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${tableId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  // Read Excel file
  const workbook = XLSX.readFile('Holidays 2025_12-29-2025.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Found ${data.length} rows in Excel file\n`);

  // Get existing records
  const [christmasRecords, nyeRecords] = await Promise.all([
    getExistingRecords(CHRISTMAS_TABLE_ID),
    getExistingRecords(NYE_TABLE_ID)
  ]);

  console.log(`Existing Christmas records: ${christmasRecords.length}`);
  console.log(`Existing NYE records: ${nyeRecords.length}\n`);

  // Create lookup keys for existing records
  const existingChristmas = new Set();
  const existingNYE = new Set();

  christmasRecords.forEach(r => {
    const key = `${r.fields['First Name']?.toLowerCase()}_${r.fields['Last Name']?.toLowerCase()}_${r.fields.Email?.toLowerCase()}`;
    existingChristmas.add(key);
  });

  nyeRecords.forEach(r => {
    const key = `${r.fields['First Name']?.toLowerCase()}_${r.fields['Last Name']?.toLowerCase()}_${r.fields.Email?.toLowerCase()}`;
    existingNYE.add(key);
  });

  let christmasImported = 0;
  let nyeImported = 0;
  let skipped = 0;

  // Process each row
  for (const row of data) {
    // Skip refunded entries
    if (row['Refund Amount'] && row['Refund Amount'] > 0) {
      console.log(`SKIPPED (refunded): ${row['First Name']} ${row['Last Name']}`);
      skipped++;
      continue;
    }

    // Parse ticket details
    const tickets = parseDetails(row.Details || '');
    const totalChristmas = tickets.christmasMember + tickets.christmasNonMember;
    const totalNYE = tickets.nyeMember + tickets.nyeNonMember;

    // Generate lookup key
    const key = `${row['First Name']?.toLowerCase()}_${row['Last Name']?.toLowerCase()}_${row.Email?.toLowerCase()}`;

    // Parse payment date
    const purchaseDate = parsePaymentDate(row['Payment Date (America/Los_Angeles)']);

    // Extract donation amount
    const extraDonation = row['Extra Donation'] || 0;

    // Process Christmas tickets
    if (totalChristmas > 0) {
      if (!existingChristmas.has(key)) {
        const christmasPrice = tickets.christmasMember * 15 + tickets.christmasNonMember * 20;
        
        const fields = {
          'First Name': row['First Name'],
          'Last Name': row['Last Name'],
          'Email': row.Email,
          'Phone': row['Phone Number'] || '',
          'Ticket Quantity': totalChristmas,
          'Vegetarian Meals': tickets.vegetarian,
          'Payment Method': 'Zeffy',
          'Amount Paid': christmasPrice,
          'Donation Amount': extraDonation,
          'Purchase Date': purchaseDate,
          'Transaction ID': `zeffy-${row['Payment Date (America/Los_Angeles)']}-${row['First Name']}-${row['Last Name']}`
        };

        try {
          await createRecord(CHRISTMAS_TABLE_ID, fields);
          console.log(`✅ CHRISTMAS: ${row['First Name']} ${row['Last Name']} - ${totalChristmas} tickets ($${christmasPrice}${extraDonation > 0 ? ` + $${extraDonation} donation` : ''})`);
          christmasImported++;
          existingChristmas.add(key);
          
          // Rate limit: wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
          console.error(`❌ ERROR importing Christmas: ${row['First Name']} ${row['Last Name']}`, e.message);
        }
      } else {
        console.log(`SKIP (exists): Christmas - ${row['First Name']} ${row['Last Name']}`);
        skipped++;
      }
    }

    // Process NYE tickets
    if (totalNYE > 0) {
      if (!existingNYE.has(key)) {
        const nyePrice = tickets.nyeMember * 35 + tickets.nyeNonMember * 45;
        
        const fields = {
          'First Name': row['First Name'],
          'Last Name': row['Last Name'],
          'Email': row.Email,
          'Phone': row['Phone Number'] || '',
          'Ticket Quantity': totalNYE,
          'Payment Method': 'Zeffy',
          'Amount Paid': nyePrice,
          'Donation Amount': extraDonation,
          'Purchase Date': purchaseDate,
          'Transaction ID': `zeffy-${row['Payment Date (America/Los_Angeles)']}-${row['First Name']}-${row['Last Name']}`
        };

        try {
          await createRecord(NYE_TABLE_ID, fields);
          console.log(`✅ NYE: ${row['First Name']} ${row['Last Name']} - ${totalNYE} tickets ($${nyePrice}${extraDonation > 0 ? ` + $${extraDonation} donation` : ''})`);
          nyeImported++;
          existingNYE.add(key);
          
          // Rate limit: wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
          console.error(`❌ ERROR importing NYE: ${row['First Name']} ${row['Last Name']}`, e.message);
        }
      } else {
        console.log(`SKIP (exists): NYE - ${row['First Name']} ${row['Last Name']}`);
        skipped++;
      }
    }
  }

  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Christmas tickets imported: ${christmasImported}`);
  console.log(`NYE tickets imported: ${nyeImported}`);
  console.log(`Skipped (duplicates/refunds): ${skipped}`);
}

main().catch(console.error);
