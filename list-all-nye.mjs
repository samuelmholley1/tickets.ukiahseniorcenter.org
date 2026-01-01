import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

function getRecords() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${NYE_TABLE_ID}?sort%5B0%5D%5Bfield%5D=Purchase%20Date&sort%5B0%5D%5Bdirection%5D=desc`,
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
  const records = await getRecords();
  
  console.log('ALL NYE RECORDS (sorted by date, newest first):\n');
  
  records.forEach((r, i) => {
    const date = r.fields['Purchase Date'] ? new Date(r.fields['Purchase Date']).toLocaleString() : 'No date';
    const refunded = r.fields['Refunded'] ? ' [REFUNDED]' : '';
    console.log(`${i+1}. ${r.fields['First Name']} ${r.fields['Last Name']} - ${r.fields['Ticket Quantity']} tickets - ${date}${refunded}`);
  });
  
  console.log(`\nTotal: ${records.length} records`);
}

main().catch(console.error);
