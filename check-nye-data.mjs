import https from 'https';

const options = {
  hostname: 'api.airtable.com',
  path: '/v0/appZ6HE5luAFV0Ot2/tbl5OyCybJCfrebOb?filterByFormula=NOT({Refunded})',
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
    
    console.log('\n=== NYE GALA DANCE TICKET COUNTS ===\n');
    console.log('Total records (active, not refunded):', records.length);
    
    let memberTickets = 0;
    let nonMemberTickets = 0;
    let memberRevenue = 0;
    let nonMemberRevenue = 0;
    
    const paymentCounts = {};
    
    console.log('\n--- ALL RECORDS ---');
    records.forEach(r => {
      const tickets = r.fields['Ticket Quantity'] || 0;
      const firstName = r.fields['First Name'] || '';
      const lastName = r.fields['Last Name'] || '';
      const email = r.fields['Email'] || '';
      const paymentMethod = r.fields['Payment Method'] || '';
      const transactionId = r.fields['Transaction ID'] || '';
      
      console.log(`\n${firstName} ${lastName}`);
      console.log(`  Tickets: ${tickets}`);
      console.log(`  Email: ${email}`);
      console.log(`  Payment: ${paymentMethod}`);
      console.log(`  Transaction ID: ${transactionId}`);
      
      // Check if test/filler by looking for common patterns
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      if (fullName.includes('test') || fullName.includes('demo') || 
          email.includes('test') || email.includes('demo') ||
          transactionId.includes('TEST') || transactionId.includes('DEMO')) {
        console.log('  ⚠️ POSSIBLE TEST ENTRY');
      }
      
      // Calculate member vs non-member based on price
      // Member: $35, Non-Member: $45
      const amountPaid = r.fields['Amount Paid'] || 0;
      const pricePerTicket = tickets > 0 ? amountPaid / tickets : 0;
      
      // Track payment methods
      if (!paymentCounts[paymentMethod]) {
        paymentCounts[paymentMethod] = 0;
      }
      paymentCounts[paymentMethod] += tickets;
      
      if (pricePerTicket >= 44 && pricePerTicket <= 46) {
        nonMemberTickets += tickets;
        nonMemberRevenue += amountPaid;
        console.log(`  Type: NON-MEMBER ($${pricePerTicket.toFixed(2)}/ticket)`);
      } else if (pricePerTicket >= 34 && pricePerTicket <= 36) {
        memberTickets += tickets;
        memberRevenue += amountPaid;
        console.log(`  Type: MEMBER ($${pricePerTicket.toFixed(2)}/ticket)`);
      } else {
        console.log(`  Type: UNKNOWN ($${pricePerTicket.toFixed(2)}/ticket)`);
      }
    });
    
    console.log('\n\n=== SUMMARY ===');
    console.log(`Member tickets: ${memberTickets} ($${memberRevenue.toFixed(2)})`);
    console.log(`Non-Member tickets: ${nonMemberTickets} ($${nonMemberRevenue.toFixed(2)})`);
    console.log(`Total tickets: ${memberTickets + nonMemberTickets}`);
    console.log(`Total revenue: $${(memberRevenue + nonMemberRevenue).toFixed(2)}`);
    
    console.log('\n=== PAYMENT METHOD BREAKDOWN ===');
    Object.keys(paymentCounts).sort().forEach(method => {
      console.log(`${method}: ${paymentCounts[method]} tickets`);
    });
    
    console.log('\n=== ZEFFY COMPARISON ===');
    console.log('Expected from Zeffy export:');
    console.log('  Member: 22 tickets ($770.00)');
    console.log('  Non-Member: 9 tickets ($405.00)');
    console.log('  TOTAL ZEFFY: 31 tickets ($1,175.00)');
    console.log('\nActual in database:');
    console.log(`  Card (Zeffy): ${paymentCounts['Card (Zeffy)'] || 0} tickets`);
    console.log(`  Other payments (Cash/Check/Comp/TicketSpice): ${(memberTickets + nonMemberTickets) - (paymentCounts['Card (Zeffy)'] || 0)} tickets`);
    console.log(`  TOTAL: ${memberTickets + nonMemberTickets} tickets`);
    console.log('\n⚠️  MISSING FROM DATABASE: ${31 - (paymentCounts['Card (Zeffy)'] || 0)} Zeffy tickets need to be imported!');
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
