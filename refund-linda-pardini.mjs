import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

// Get all NYE records
function getRecords() {
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

// Update record
function updateRecord(recordId, fields) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields });
    
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${NYE_TABLE_ID}/${recordId}`,
      method: 'PATCH',
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
          reject(new Error(`Failed to update: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Searching for Linda Pardini...\n');
  
  const records = await getRecords();
  
  const lindaRecord = records.find(r => 
    r.fields['First Name'] === 'Linda' && 
    r.fields['Last Name'] === 'Pardini' &&
    r.fields['Email'] === 'lindapardini1368@gmail.com'
  );
  
  if (!lindaRecord) {
    console.log('❌ Linda Pardini record not found');
    return;
  }
  
  console.log('✓ Found Linda Pardini:');
  console.log(`  Record ID: ${lindaRecord.id}`);
  console.log(`  Email: ${lindaRecord.fields['Email']}`);
  console.log(`  Ticket Quantity: ${lindaRecord.fields['Ticket Quantity']}`);
  console.log(`  Amount Paid: $${lindaRecord.fields['Amount Paid']}`);
  console.log(`  Purchase Date: ${lindaRecord.fields['Purchase Date']}`);
  console.log(`  Current Refunded Status: ${lindaRecord.fields['Refunded'] || false}`);
  
  if (lindaRecord.fields['Refunded']) {
    console.log('\n⚠️  This record is already marked as Refunded');
    return;
  }
  
  console.log('\nUpdating Refunded status to TRUE...');
  
  await updateRecord(lindaRecord.id, {
    'Refunded': true
  });
  
  console.log('✅ Successfully marked Linda Pardini as Refunded');
  console.log('\nThis purchase will now be excluded from attendance lists.');
}

main().catch(console.error);
