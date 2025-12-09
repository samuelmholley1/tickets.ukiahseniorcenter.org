import nodemailer from 'nodemailer';

console.log('Testing SMTP authentication...\n');

if (!process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: EMAIL_PASSWORD not set');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'cashier@seniorctr.org',
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: 'Ukiah Senior Center <cashier@seniorctr.org>',
  to: 'sam@samuelholley.com',
  subject: 'Test Email - SMTP Auth Enabled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #427d78;">✅ SMTP Authentication Working!</h2>
      <p>This test email confirms that SMTP authentication is now enabled for cashier@seniorctr.org</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">
        Next step: Add EMAIL_PASSWORD to Vercel environment variables
      </p>
    </div>
  `
};

console.log('📧 Sending test email from cashier@seniorctr.org to sam@samuelholley.com...\n');

try {
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ SUCCESS! Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('\n✨ Check sam@samuelholley.com inbox (and spam folder)');
} catch (error) {
  console.error('❌ FAILED:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  process.exit(1);
}
