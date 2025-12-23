import https from 'https';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const TABLE_ID = 'tbljtMTsXvSP3MDt4'; // Christmas table

const record = {
  fields: {
    'Transaction ID': 'ZEFFY-2025-12-23-JEAN-DAVIS',
    'First Name': 'Jean',
    'Last Name': 'Davis',
    'Email': 'javis103@sbcglobal.net',
    'Phone': 'Declined to Provide',
    'Ticket Quantity': 1,
    'Vegetarian Meals': 0,
    'Payment Method': 'Card (Zeffy)',
    'Purchase Date': '2025-12-23T07:35:00.000Z'
  }
};

const data = JSON.stringify({ records: [record] });

const options = {
  hostname: 'api.airtable.com',
  path: `/v0/${BASE_ID}/${TABLE_ID}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', JSON.parse(responseData));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
