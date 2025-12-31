import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

const newTickets = [
  {
    firstName: 'Susan',
    lastName: 'King',
    email: '1sueking@gmail.com',
    tickets: 1,
    memberType: 'Member',
    amount: 35,
    date: '12/30/2025, 12:11 PM'
  },
  {
    firstName: 'Liz',
    lastName: 'Dorsey',
    email: '4444zils@gmail.com',
    tickets: 1,
    memberType: 'Member',
    amount: 35,
    date: '12/30/2025, 11:34 AM'
  },
  {
    firstName: 'Deb',
    lastName: 'Attaway',
    email: 'baldaway2@gmail.com',
    tickets: 2,
    memberType: 'Member',
    amount: 70,
    date: '12/30/2025, 9:12 AM'
  },
  {
    firstName: 'Kay',
    lastName: 'McLellan',
    email: 'kaymclellan.km@gmail.com',
    tickets: 1,
    memberType: 'Nonmember',
    amount: 45,
    date: '12/29/2025, 1:01 PM'
  },
  {
    firstName: 'CYNTHIA',
    lastName: 'MOSS',
    email: 'serenityhealer@comcast.net',
    tickets: 1,
    memberType: 'Nonmember',
    amount: 45,
    date: '12/29/2025, 11:21 AM'
  }
];

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

async function main() {
  console.log('Checking 5 new NYE tickets from Dec 29-30...\n');
  
  const records = await getRecords();
  
  let allNew = true;
  let totalNewTickets = 0;
  
  for (const ticket of newTickets) {
    const exists = records.find(r => 
      r.fields['Email']?.toLowerCase() === ticket.email.toLowerCase() &&
      r.fields['First Name'] === ticket.firstName &&
      r.fields['Last Name'] === ticket.lastName
    );
    
    if (exists) {
      console.log(`❌ DUPLICATE: ${ticket.firstName} ${ticket.lastName} (${ticket.email})`);
      console.log(`   Already in Airtable with ${exists.fields['Ticket Quantity']} tickets\n`);
      allNew = false;
    } else {
      console.log(`✓ NEW: ${ticket.firstName} ${ticket.lastName}`);
      console.log(`   Email: ${ticket.email}`);
      console.log(`   Tickets: ${ticket.tickets} x ${ticket.memberType} = $${ticket.amount}`);
      console.log(`   Date: ${ticket.date}\n`);
      totalNewTickets += ticket.tickets;
    }
  }
  
  console.log('='.repeat(60));
  if (allNew) {
    console.log(`✅ ALL 5 TRANSACTIONS ARE NEW (${totalNewTickets} tickets total)`);
    console.log('Ready to import!');
  } else {
    console.log('⚠️  Some records already exist - review duplicates above');
  }
}

main().catch(console.error);
