import { readFileSync } from 'fs';

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

// Transaction details from the failed submission
const transactionId = `TXN-${Date.now()}-MANUAL`;
const customer = {
  firstName: 'Rod & Debra',
  lastName: 'Christenson',
  email: 'debandrodchristenson@comcast.net',
  phone: '7073917444',
  paymentMethod: 'Cash', // Use Cash as the payment method
  checkNumber: '7547',
  cashAmount: '20',
  checkAmount: '70',
  staffInitials: 'SH'
};

const quantities = {
  valentinesMember: 0,
  valentinesNonMember: 2,
  speakeasy: 0
};

const donation = 0;
const valentinesTotal = quantities.valentinesNonMember * 45;

async function main() {
  try {
    console.log('Creating Valentine\'s Day record via Airtable API...');
    
    const payload = {
      fields: {
        'Transaction ID': transactionId,
        'First Name': customer.firstName,
        'Last Name': customer.lastName,
        'Email': customer.email,
        'Phone': customer.phone,
        'Payment Method': customer.paymentMethod,
        'Check Number': customer.checkNumber,
        'Payment Notes': `Cash: $${customer.cashAmount}.00, Check: $${customer.checkAmount}.00`,
        'Purchase Date': new Date().toISOString(),
        'Ticket Quantity': 2,
        'Member Tickets': 0,
        'Non-Member Tickets': 2,
        'Amount Paid': valentinesTotal,
        'Donation Amount': 0,
        'Staff Initials': customer.staffInitials,
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_VALENTINES_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error:', errorText);
      throw new Error(`Airtable error (${response.status}): ${errorText}`);
    }

    const record = await response.json();
    console.log('✅ Record created:', record.id);

    // Send email
    console.log('Sending confirmation email via SMTP...');
    
    const { default: nodemailer } = await import('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #db2777 0%, #be185d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { width: 80px; height: auto; margin-bottom: 15px; }
    .content { background: white; padding: 30px; border: 2px solid #fdf2f8; border-top: none; }
    .info-box { background: #fdf2f8; border: 2px solid #db2777; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #fce7f3; }
    .info-label { font-weight: bold; color: #db2777; }
    .event-header { background: #db2777; color: white; padding: 12px; margin: 25px 0 15px 0; border-radius: 6px; font-weight: bold; font-size: 16px; }
    .event-items { background: #fdf2f8; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://tickets.ukiahseniorcenter.org/logo.png" alt="Ukiah Senior Center" class="logo" />
    <h1 style="color: #ffffff; margin: 0 0 8px 0;">💕 Valentine's Day Dance</h1>
    <p style="color: #fce7f3; margin: 0; font-size: 18px;">Receipt & Confirmation</p>
  </div>

  <div class="content">
    <div class="greeting">
      Hello ${customer.firstName} ${customer.lastName},
    </div>

    <p style="font-size: 18px; line-height: 1.8; margin: 20px 0; font-weight: bold; color: #1a1a2e;">
      Your Valentine's Day Dance reservation is confirmed!
    </p>

    <div style="background: #fdf2f8; border: 3px solid #db2777; padding: 25px; margin: 25px 0; border-radius: 8px;">
      <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
        <strong>📅 Date:</strong> Friday, February 14, 2026
      </p>
      <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
        <strong>🕖 Time:</strong> Doors open 6pm, Dance 7-10pm
      </p>
      <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
        <strong>📍 Location:</strong> Bartlett Event Center, 495 Leslie St
      </p>
      <p style="font-size: 17px; line-height: 2; margin: 0; color: #000000;">
        <strong>✓ Just give us your name at the door!</strong>
      </p>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Name:</span> ${customer.firstName} ${customer.lastName}
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span> ${customer.email}
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span> ${customer.phone}
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span> ${customer.paymentMethod}
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span> ${new Date().toLocaleString()}
      </div>
    </div>

    <div class="event-header">
      💕 Valentine's Day Dance - 2 Tickets
    </div>
    <div class="event-items">
      <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 15px;">
        <span>2 × Non-Member Tickets ($45.00 each)</span>
        <span style="font-weight: bold;">$90.00</span>
      </div>
    </div>

    <div style="background: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
      <div style="font-size: 18px; margin-bottom: 8px;">💳 Total Amount Paid</div>
      <div style="font-size: 36px; font-weight: bold;">$90.00</div>
      <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">
        Payment: Cash $20.00 + Check #7547 $70.00
      </div>
    </div>

    <p style="font-size: 15px; line-height: 1.8; color: #4b5563;">
      We look forward to seeing you at the Valentine's Day Dance! If you have any questions, please contact us at (707) 462-4343 ext 209.
    </p>

    <p style="font-size: 14px; color: #9ca3af; margin-top: 25px;">
      Transaction ID: ${transactionId}
    </p>
  </div>

  <div class="footer">
    <p style="margin: 0 0 8px 0;">Ukiah Senior Center</p>
    <p style="margin: 0;">495 Leslie St, Ukiah, CA 95482 • (707) 462-4343 ext 209</p>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Ukiah Senior Center" <${env.SMTP_FROM || env.SMTP_USER}>`,
      to: customer.email,
      subject: "Valentine's Day Dance - Ticket Confirmation",
      html: emailHtml,
    });

    console.log('✅ Email sent to:', customer.email);
    console.log('\n=== COMPLETED SUCCESSFULLY ===');
    console.log('Transaction ID:', transactionId);
    console.log('Airtable Record:', record.id);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
