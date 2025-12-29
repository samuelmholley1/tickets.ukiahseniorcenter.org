import XLSX from 'xlsx';
import https from 'https';
import fs from 'fs';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

// Read the Excel file
const workbook = XLSX.readFile('Holidays 2025_12-29-2025.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`Found ${data.length} rows in Excel file\n`);

// Get existing records from Airtable
function getExistingRecords() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${NYE_TABLE_ID}`,
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

async function main() {
  const existingRecords = await getExistingRecords();
  console.log(`Found ${existingRecords.length} existing records in Airtable\n`);

  // Create a set of existing transaction IDs
  const existingTxIds = new Set(
    existingRecords
      .map(r => r.fields['Transaction ID'])
      .filter(Boolean)
  );

  console.log('=== ANALYZING EXCEL DATA ===\n');
  
  data.forEach((row, idx) => {
    console.log(`\nRow ${idx + 1}:`);
    console.log(JSON.stringify(row, null, 2));
  });

  console.log('\n\n=== COLUMN NAMES ===');
  if (data.length > 0) {
    console.log(Object.keys(data[0]));
  }
}

main().catch(console.error);
