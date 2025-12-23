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
    const records = response.records || [];
    
    console.log('\n=== CHRISTMAS DRIVE-THRU MEAL COUNTS ===\n');
    console.log('Total records (active, not refunded):', records.length);
    
    // Separate Heather Haydon (delivery) from regular
    const heatherRecords = records.filter(r => 
      r.fields['Last Name']?.toLowerCase().startsWith('haydon') && 
      r.fields['First Name']?.toLowerCase() === 'heather'
    );
    
    const regularRecords = records.filter(r => 
      !(r.fields['Last Name']?.toLowerCase().startsWith('haydon') && 
        r.fields['First Name']?.toLowerCase() === 'heather')
    );
    
    console.log('Heather Haydon (delivery) records:', heatherRecords.length);
    console.log('Regular drive-through records:', regularRecords.length);
    
    // Calculate drive-through totals
    let driveThruMeals = 0;
    let driveThruVegetarian = 0;
    regularRecords.forEach(r => {
      driveThruMeals += r.fields['Ticket Quantity'] || 0;
      driveThruVegetarian += r.fields['Vegetarian Meals'] || 0;
    });
    const driveThruRegular = driveThruMeals - driveThruVegetarian;
    
    // Calculate delivery totals
    let deliveryMeals = 0;
    let deliveryVegetarian = 0;
    heatherRecords.forEach(r => {
      deliveryMeals += r.fields['Ticket Quantity'] || 0;
      deliveryVegetarian += r.fields['Vegetarian Meals'] || 0;
    });
    const deliveryRegular = deliveryMeals - deliveryVegetarian;
    
    // Grand totals
    const totalMeals = driveThruMeals + deliveryMeals;
    const totalVegetarian = driveThruVegetarian + deliveryVegetarian;
    const totalRegular = totalMeals - totalVegetarian;
    
    console.log('\n--- DRIVE-THROUGH ---');
    console.log('Total meals:', driveThruMeals);
    console.log('Vegetarian:', driveThruVegetarian);
    console.log('Regular (Prime Rib):', driveThruRegular);
    
    console.log('\n--- DELIVERY (Heather Haydon) ---');
    console.log('Total meals:', deliveryMeals);
    console.log('Vegetarian:', deliveryVegetarian);
    console.log('Regular (Prime Rib):', deliveryRegular);
    
    console.log('\n--- GRAND TOTALS (Kitchen) ---');
    console.log('Total meals to make:', totalMeals);
    console.log('Vegetarian (Eggplant):', totalVegetarian);
    console.log('Regular (Prime Rib with Cheesecake):', totalRegular);
    
    // Check for special requests (pumpkin pie, etc.)
    console.log('\n--- CHECKING FOR SPECIAL REQUESTS ---');
    const marySnyder = records.filter(r => 
      r.fields['Last Name']?.toLowerCase().includes('snyder') && 
      r.fields['First Name']?.toLowerCase().includes('mary')
    );
    
    if (marySnyder.length > 0) {
      console.log('\nMary Snyder records found:', marySnyder.length);
      marySnyder.forEach(r => {
        console.log('  -', r.fields['First Name'], r.fields['Last Name']);
        console.log('    Tickets:', r.fields['Ticket Quantity']);
        console.log('    Vegetarian:', r.fields['Vegetarian Meals'] || 0);
        console.log('    Notes/Email:', r.fields['Email']);
      });
    } else {
      console.log('No Mary Snyder records found');
    }
    
    // List all Heather Haydon delivery records
    console.log('\n--- HEATHER HAYDON DELIVERY DETAILS ---');
    heatherRecords.forEach(r => {
      console.log('  -', r.fields['First Name'], r.fields['Last Name']);
      console.log('    Tickets:', r.fields['Ticket Quantity']);
      console.log('    Vegetarian:', r.fields['Vegetarian Meals'] || 0);
    });
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
