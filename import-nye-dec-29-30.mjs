import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const NYE_TABLE_ID = 'tbl5OyCybJCfrebOb';

// Parse date from format "12/30/2025, 12:11 PM"
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

const newTickets = [
  {
    firstName: 'Susan',
    lastName: 'King',
    email: '1sueking@gmail.com',
    phone: '',
    tickets: 1,
    memberType: 'Member',
    amount: 35,
    date: '12/30/2025, 12:11 PM'
  },
  {
    firstName: 'Liz',
    lastName: 'Dorsey',
    email: '4444zils@gmail.com',
    phone: '',
    tickets: 1,
    memberType: 'Member',
    amount: 35,
    date: '12/30/2025, 11:34 AM'
  },
  {
    firstName: 'Deb',
    lastName: 'Attaway',
    email: 'baldaway2@gmail.com',
    phone: '',
    tickets: 2,
    memberType: 'Member',
    amount: 70,
    date: '12/30/2025, 9:12 AM'
  },
  {
    firstName: 'Kay',
    lastName: 'McLellan',
    email: 'kaymclellan.km@gmail.com',
    phone: '',
    tickets: 1,
    memberType: 'Nonmember',
    amount: 45,
    date: '12/29/2025, 1:01 PM'
  },
  {
    firstName: 'CYNTHIA',
    lastName: 'MOSS',
    email: 'serenityhealer@comcast.net',
    phone: '',
    tickets: 1,
    memberType: 'Nonmember',
    amount: 45,
    date: '12/29/2025, 11:21 AM'
  }
];

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
  console.log('Importing 5 NYE tickets from Dec 29-30, 2025...\n');
  
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
  console.log('\nNote: Liz Dorsey now has 2 separate transactions. The attendance list will merge them.');
}

main().catch(console.error);
