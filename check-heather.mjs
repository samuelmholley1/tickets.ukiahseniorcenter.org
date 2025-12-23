import https from 'https';

const options = {
  hostname: 'api.airtable.com',
  path: '/v0/appZ6HE5luAFV0Ot2/tbljtMTsXvSP3MDt4?filterByFormula=NOT({Refunded})',
  headers: {
    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('Response status:', res.statusCode);
    
    if (response.error) {
      console.log('Error:', response.error);
      return;
    }
    
    const records = response.records || [];
    console.log('Total records:', records.length);
    
    const heather = records.filter(r => 
      r.fields['Last Name']?.toLowerCase().includes('haydon')
    );
    
    console.log('\nFound records with Haydon:', heather.length);
    
    if (heather.length > 0) {
      heather.forEach(r => {
        console.log(JSON.stringify({
          firstName: r.fields['First Name'],
          lastName: r.fields['Last Name'],
          id: r.id
        }, null, 2));
      });
    } else {
      console.log('\nNo Haydon found. Sample names:');
      records.slice(0, 10).forEach(r => {
        console.log(JSON.stringify({
          firstName: r.fields['First Name'],
          lastName: r.fields['Last Name']
        }, null, 2));
      });
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
