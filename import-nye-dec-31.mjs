import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

const newTickets = [
  {
    firstName: 'Dawna',
    lastName: 'Cornett',
    email: 'green_dm@hotmail.com',
    phone: '',
    tickets: 2,
    memberType: 'Nonmember',
    amount: 90,
    date: '12/31/2025, 3:04 PM'
  },
  {
    firstName: 'Megan',
    lastName: 'Lopez',
    email: 'mccluer0021@gmail.com',
    phone: '',
    tickets: 3,
    memberType: 'Nonmember',
    amount: 135,
    date: '12/31/2025, 10:00 AM'
  }
];

function parsePaymentDate(dateStr) {
  try {
    const [datePart, timePart] = dateStr.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, meridiem] = timePart.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    const date = new Date(year, month - 1, day, hour, parseInt(minutes));
    return date.toISOString();
  } catch (e) {
    console.error(`Error parsing date: ${dateStr}`, e);
    return null;
  }
}

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

function createRecord(fields) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields });
    
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${NYE_TABLE_ID}`,
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
          reject(new Error(`Failed to create: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Checking 2 new NYE tickets from Dec 31...\n');
  
  const records = await getRecords();
  
  // Check for duplicates
  let allNew = true;
  for (const ticket of newTickets) {
    const exists = records.find(r => 
      r.fields['Email']?.toLowerCase() === ticket.email.toLowerCase()
    );
    
    if (exists) {
      console.log(`❌ DUPLICATE: ${ticket.firstName} ${ticket.lastName} (${ticket.email})`);
      console.log(`   Already in Airtable\n`);
      allNew = false;
    } else {
      console.log(`✓ NEW: ${ticket.firstName} ${ticket.lastName} - ${ticket.tickets} tickets ($${ticket.amount})`);
    }
  }
  
  if (!allNew) {
    console.log('\n⚠️  Some records already exist - stopping import');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All records are new. Importing...\n');
  
  let imported = 0;
  let totalTickets = 0;
  
  for (const ticket of newTickets) {
    const fields = {
      'First Name': ticket.firstName,
      'Last Name': ticket.lastName,
      'Email': ticket.email,
      'Phone': ticket.phone,
      'Ticket Quantity': ticket.tickets,
      'Payment Method': 'Zeffy',
      'Amount Paid': ticket.amount,
      'Donation Amount': 0,
      'Purchase Date': parsePaymentDate(ticket.date),
      'Transaction ID': `Zeffy-${ticket.date}`,
      'Refunded': false
    };
    
    try {
      await createRecord(fields);
      console.log(`✓ Imported: ${ticket.firstName} ${ticket.lastName} - ${ticket.tickets} tickets ($${ticket.amount})`);
      imported++;
      totalTickets += ticket.tickets;
    } catch (err) {
      console.log(`✗ Failed: ${ticket.firstName} ${ticket.lastName} - ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully imported ${imported} transactions (${totalTickets} tickets)`);
  console.log(`New total: ${records.length + imported} records, ${53 + totalTickets} active tickets`);
}

main().catch(console.error);
