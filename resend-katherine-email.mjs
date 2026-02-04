// Re-trigger lunch notification email for Katherine McElwee
import fs from 'fs';
import nodemailer from 'nodemailer';

const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=([^\\s\\r\\n]+)`));
  return match ? match[1] : null;
};

// Email config - using Zoho SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: getEnv('ZOHO_USER'),
    pass: getEnv('ZOHO_APP_PASSWORD'),
  },
});

// Generate the email HTML (matching the new format)
const data = {
  name: 'Katherine McElwee',
  dates: [
    { date: '2026-02-04', mealCount: 1, isFrozenFriday: false },
    { date: '2026-02-23', mealCount: 1, isFrozenFriday: false },
    { date: '2026-02-24', mealCount: 1, isFrozenFriday: false },
    { date: '2026-02-25', mealCount: 1, isFrozenFriday: false },
  ],
  mealType: 'To Go',
  memberStatus: 'Member',
  totalMeals: 4,
  amount: 0,
  paymentMethod: 'Lunch Card',
  lunchCardName: 'Katherine McElwee',
  cardBalanceBefore: 10,
  cardBalanceAfter: 6,
  notes: 'no dessert',
  staff: 'LYNN',
  timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
};

const borderColor = '#d97706';
const bgColor = '#fef3c7';

// Build dates list
const datesHtml = data.dates.map(d => {
  const frozen = d.isFrozenFriday ? ' 🧊' : '';
  const count = d.mealCount > 1 ? ` (×${d.mealCount})` : '';
  return `${d.date}${frozen}${count}`;
}).join('<br/>');

// Payment display for lunch card
const paymentDisplay = `
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Lunch Card</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.lunchCardName}'s card</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Meals Used</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 16px; font-weight: bold; color: #d97706;">${data.totalMeals} meals</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Card Balance</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.cardBalanceBefore} → <strong>${data.cardBalanceAfter}</strong> meals remaining</td></tr>
`;

const detailsHtml = `
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.name}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Meals</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 16px; font-weight: bold;">${data.totalMeals}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date(s)</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${datesHtml}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Meal Type</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.mealType}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Status</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.memberStatus}</td></tr>
  ${paymentDisplay}
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Notes</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.notes}</td></tr>
  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Staff</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.staff}</td></tr>
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: ${bgColor}; padding: 20px; border-bottom: 4px solid ${borderColor}; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: ${borderColor};">🍴 New Lunch Reservation</h1>
      <p style="margin: 5px 0 0; font-size: 14px; color: #666;">${data.timestamp}</p>
    </div>
    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${detailsHtml}
      </table>
    </div>
    <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      Ukiah Senior Center Lunch Program<br/>
      495 Leslie Street, Ukiah, CA 95482
    </div>
  </div>
</body>
</html>
`;

const subject = `🍴 Lunch: 4 dates - Katherine McElwee - 4 meals`;

console.log('Sending email...');

try {
  const result = await transporter.sendMail({
    from: `"Ukiah Senior Center" <${getEnv('ZOHO_USER')}>`,
    to: 'sam@samuelholley.com',
    cc: ['cashier@ukiahseniorcenter.org', 'activities@ukiahseniorcenter.org'],
    subject,
    html,
  });
  console.log('✅ Email sent!', result.messageId);
} catch (err) {
  console.error('❌ Email failed:', err);
}
