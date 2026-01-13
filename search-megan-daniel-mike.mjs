import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

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

async function main() {
  const records = await getRecords();
  
  console.log('Searching for Megan Lopez and related names...\n');
  
  // Find Megan Lopez
  const meganLopez = records.find(r => 
    r.fields['First Name'] === 'Megan' && 
    r.fields['Last Name'] === 'Lopez'
  );
  
  if (meganLopez) {
    console.log('✓ FOUND: Megan Lopez');
    console.log(`  Email: ${meganLopez.fields['Email']}`);
    console.log(`  Tickets: ${meganLopez.fields['Ticket Quantity']}`);
    console.log(`  Purchase Date: ${meganLopez.fields['Purchase Date']}`);
    console.log(`  Amount Paid: $${meganLopez.fields['Amount Paid']}`);
    console.log('');
  } else {
    console.log('❌ Megan Lopez NOT FOUND\n');
  }
  
  // Find all Megan/Meghan variations
  const megans = records.filter(r => {
    const firstName = r.fields['First Name']?.toLowerCase() || '';
    return firstName.includes('megan') || firstName.includes('meghan');
  });
  
  if (megans.length > 0) {
    console.log(`Found ${megans.length} Megan/Meghan record(s):\n`);
    megans.forEach(r => {
      const date = r.fields['Purchase Date'] ? new Date(r.fields['Purchase Date']).toLocaleString() : 'No date';
      console.log(`- ${r.fields['First Name']} ${r.fields['Last Name']}`);
      console.log(`  Email: ${r.fields['Email']}`);
      console.log(`  Tickets: ${r.fields['Ticket Quantity']} | Date: ${date}`);
      console.log('');
    });
  }
  
  // Find Daniel
  const daniels = records.filter(r => {
    const firstName = r.fields['First Name']?.toLowerCase() || '';
    return firstName.includes('daniel') || firstName.includes('dan ');
  });
  
  if (daniels.length > 0) {
    console.log(`Found ${daniels.length} Daniel record(s):\n`);
    daniels.forEach(r => {
      const date = r.fields['Purchase Date'] ? new Date(r.fields['Purchase Date']).toLocaleString() : 'No date';
      console.log(`- ${r.fields['First Name']} ${r.fields['Last Name']}`);
      console.log(`  Email: ${r.fields['Email']}`);
      console.log(`  Tickets: ${r.fields['Ticket Quantity']} | Date: ${date}`);
      console.log('');
    });
  } else {
    console.log('No Daniel found\n');
  }
  
  // Find Mike/Michael
  const mikes = records.filter(r => {
    const firstName = r.fields['First Name']?.toLowerCase() || '';
    return firstName.includes('mike') || firstName.includes('michael');
  });
  
  if (mikes.length > 0) {
    console.log(`Found ${mikes.length} Mike/Michael record(s):\n`);
    mikes.forEach(r => {
      const date = r.fields['Purchase Date'] ? new Date(r.fields['Purchase Date']).toLocaleString() : 'No date';
      console.log(`- ${r.fields['First Name']} ${r.fields['Last Name']}`);
      console.log(`  Email: ${r.fields['Email']}`);
      console.log(`  Tickets: ${r.fields['Ticket Quantity']} | Date: ${date}`);
      console.log('');
    });
  } else {
    console.log('No Mike/Michael found\n');
  }
}

main().catch(console.error);
