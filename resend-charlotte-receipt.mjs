import { readFileSync } from 'fs';
import { sendEmail, generateReceiptEmail } from './src/lib/email.js';
import { generateTicketsPDF } from './src/lib/pdf.js';

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

// Set environment variables
process.env.EMAIL_USER = env.EMAIL_USER;
process.env.EMAIL_PASSWORD = env.EMAIL_PASSWORD;
process.env.NEXT_PUBLIC_BASE_URL = env.NEXT_PUBLIC_BASE_URL || 'https://tickets.ukiahseniorcenter.org';

async function resendCharlotteReceipt() {
  console.log('\n📧 RESENDING CHARLOTTE JACOBS RECEIPT');
  console.log('==================================================\n');

  // Charlotte's record data
  const recordData = {
    transactionId: 'ZEFFY-IMPORT-1766184481036-BAR5WE9',
    customerName: 'Charlotte Jacobs',
    customerEmail: 'charjacobswood@gmail.com',
    customerPhone: 'No phone provided',
    christmasMember: 2,
    christmasNonMember: 2,
    nyeMember: 0,
    nyeNonMember: 0,
    ticketSubtotal: 70,
    donationAmount: 0,
    grandTotal: 70,
    paymentMethod: 'Card (Zeffy)',
    staffInitials: 'ZEFFY',
    timestamp: new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };

  console.log('📝 Transaction Details:');
  console.log(`   Name: ${recordData.customerName}`);
  console.log(`   Email: ${recordData.customerEmail}`);
  console.log(`   Christmas Member Tickets: ${recordData.christmasMember}`);
  console.log(`   Christmas Non-Member Tickets: ${recordData.christmasNonMember}`);
  console.log(`   Total: $${recordData.grandTotal}`);
  console.log(`   BCC: sam@samuelholley.com`);
  console.log('');

  try {
    // Generate PDF
    console.log('📄 Generating PDF tickets...');
    const pdfBuffer = await generateTicketsPDF({
      christmasMember: recordData.christmasMember,
      christmasNonMember: recordData.christmasNonMember,
      nyeMember: recordData.nyeMember,
      nyeNonMember: recordData.nyeNonMember,
      customerName: recordData.customerName,
      customerEmail: recordData.customerEmail,
      customerPhone: recordData.customerPhone,
      transactionId: recordData.transactionId,
      vegetarian: 0,
    });
    console.log('   ✅ PDF generated');

    // Generate email HTML
    console.log('📧 Generating email...');
    const emailHtml = generateReceiptEmail(recordData);
    console.log('   ✅ Email HTML generated');

    // Send email with BCC to sam@samuelholley.com
    console.log('📬 Sending email...');
    const result = await sendEmail({
      to: recordData.customerEmail,
      subject: `🎟️ Your Ukiah Senior Center Tickets - ${recordData.transactionId}`,
      html: emailHtml,
      additionalCC: ['sam@samuelholley.com'], // BCC to Sam
      attachments: [
        {
          filename: `tickets_${recordData.transactionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    if (result.success) {
      console.log('\n✅ Email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${recordData.customerEmail}`);
      console.log(`   CC: cashier@seniorctr.org, activities@ukiahseniorcenter.org, sam@samuelholley.com`);
    } else {
      console.error('\n❌ Failed to send email');
      console.error('   Error:', result.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }

  console.log('\n==================================================\n');
}

resendCharlotteReceipt();
