// Test script to send email receipt
// Run with: node --loader ts-node/esm test-email.mjs

import { sendEmail, generateReceiptEmail } from './src/lib/email.ts';

const testData = {
  transactionId: 'TXN-1733270400000-ABC123',
  customerName: 'Sam Holley',
  customerEmail: 'sam@samuelholley.com',
  customerPhone: '(707) 555-1234',
  christmasMember: 2,
  christmasNonMember: 1,
  nyeMember: 2,
  nyeNonMember: 1,
  ticketSubtotal: 165,
  donationAmount: 25,
  grandTotal: 190,
  paymentMethod: 'Cash',
  staffInitials: 'TEST',
  timestamp: new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
};

async function testEmail() {
  console.log('🧪 Testing email receipt...');
  console.log('📧 Sending to:', testData.customerEmail);
  
  const emailHTML = generateReceiptEmail(testData);
  
  const result = await sendEmail({
    to: testData.customerEmail,
    subject: `TEST - Your Ticket Receipt - ${testData.transactionId}`,
    html: emailHTML,
  });

  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\nCheck your inbox at sam@samuelholley.com');
  } else {
    console.error('❌ Failed to send email');
    console.error(result.error);
  }
}

testEmail();
