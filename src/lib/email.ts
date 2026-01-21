// Email service using Microsoft 365 SMTP via Nodemailer
import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  additionalCC?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail({ to, subject, html, additionalCC = [], attachments }: EmailParams) {
  console.log('[email] sendEmail called with to:', to);
  
  // Check if credentials are configured
  if (!process.env.EMAIL_PASSWORD) {
    console.error('[email] ERROR: EMAIL_PASSWORD environment variable is not set');
    return { success: false, error: new Error('Email service not configured - missing EMAIL_PASSWORD') };
  }
  
  console.log('[email] EMAIL_PASSWORD is set');
  console.log('[email] EMAIL_USER:', process.env.EMAIL_USER || 'cashier@seniorctr.org');

  // Create transporter using Microsoft 365 SMTP
  console.log('[email] Creating SMTP transporter for smtp.office365.com:587');
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER || 'cashier@seniorctr.org',
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
  });

  const ccList = ['cashier@seniorctr.org', 'activities@ukiahseniorcenter.org', ...additionalCC];
  
  const mailOptions = {
    from: '"Ukiah Senior Center Tickets" <cashier@seniorctr.org>',
    to,
    cc: ccList,
    replyTo: 'cashier@seniorctr.org',
    subject,
    html,
    attachments,
  };
  
  console.log('[email] Mail options prepared, attachments:', attachments?.length || 0);

  try {
    console.log('[email] Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] ✅ Email sent successfully! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] ❌ Error sending email:', error);
    console.error('[email] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[email] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return { success: false, error };
  }
}

// ============================================================================
// 2026 EVENT EMAIL TEMPLATES
// ============================================================================

interface ValentinesReceiptData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  memberTickets: number;
  nonMemberTickets: number;
  ticketSubtotal: number;
  donationAmount: number;
  grandTotal: number;
  paymentMethod: string;
  timestamp: string;
  memberPrice: number;
  nonMemberPrice: number;
}

export function generateValentinesEmail(data: ValentinesReceiptData): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    memberTickets,
    nonMemberTickets,
    ticketSubtotal,
    donationAmount,
    grandTotal,
    paymentMethod,
    timestamp,
    memberPrice,
    nonMemberPrice,
  } = data;

  const totalTickets = memberTickets + nonMemberTickets;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.8;
          color: #000000;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #db2777;
        }
        .logo {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          display: block;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #000000;
        }
        .info-box {
          background: #fce7f3;
          padding: 20px;
          margin: 20px 0;
          border: 2px solid #db2777;
        }
        .info-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.8;
        }
        .info-label {
          font-weight: bold;
          color: #000000;
        }
        .event-header {
          background: #db2777;
          color: white;
          padding: 15px;
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
        }
        .event-items {
          background: #fce7f3;
          border: 2px solid #db2777;
          padding: 15px;
          margin-bottom: 20px;
        }
        .item-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        .divider {
          border: none;
          border-top: 3px solid #000000;
          margin: 25px 0;
        }
        .total-row {
          padding: 10px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .grand-total {
          background: #fce7f3;
          padding: 20px;
          border: 3px solid #db2777;
          margin: 25px 0;
        }
        .grand-total-row {
          font-size: 24px;
          font-weight: bold;
          color: #db2777;
        }
        .attachment-notice {
          background: #fffbeb;
          border: 3px solid #f59e0b;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .footer-text {
          text-align: center;
          color: #000000;
          font-size: 14px;
          padding: 20px;
          border-top: 2px solid #cccccc;
        }
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 25px 0 15px 0;
          color: #000000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://tickets.ukiahseniorcenter.org/logo.png" alt="Ukiah Senior Center" class="logo" />
          <h1 style="color: #db2777; margin: 0;">💕 Valentine's Day Dance</h1>
        </div>

        <div class="content">
          <div class="greeting">
            Hello ${customerName.includes('&') || customerName.includes(' and ') ? customerName.split(' ')[0] + ' & ' + customerName.split(/&| and /)[1].trim().split(' ')[0] : customerName.split(' ')[0]},
          </div>

          <p style="font-size: 18px; line-height: 1.8; margin: 20px 0; font-weight: bold; color: #db2777;">
            Your Valentine's Day Dance reservation is confirmed!
          </p>

          <div style="background: #fdf2f8; border: 3px solid #db2777; padding: 25px; margin: 25px 0; border-radius: 8px;">
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>📅 Date:</strong> Saturday, February 14, 2026
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>🕖 Time:</strong> Doors open 6pm, Dance 7-10pm
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>📍 Location:</strong> Ukiah Senior Center, 495 Leslie St
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0; color: #000000;">
              <strong>✓ Just give us your name at the door!</strong>
            </p>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span> ${customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${customerEmail}
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span> ${customerPhone || 'Not provided'}
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span> ${paymentMethod}
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span> ${timestamp}
            </div>
          </div>

          <div class="event-header">
            💕 Valentine's Day Dance - ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}
          </div>
          <div class="event-items">
            ${memberTickets > 0 ? `
            <div class="item-row">
              ${memberTickets} Member Ticket${memberTickets > 1 ? 's' : ''} @ $${memberPrice.toFixed(2)} each = <strong>$${(memberTickets * memberPrice).toFixed(2)}</strong>
            </div>
            ` : ''}
            ${nonMemberTickets > 0 ? `
            <div class="item-row">
              ${nonMemberTickets} Non-Member Ticket${nonMemberTickets > 1 ? 's' : ''} @ $${nonMemberPrice.toFixed(2)} each = <strong>$${(nonMemberTickets * nonMemberPrice).toFixed(2)}</strong>
            </div>
            ` : ''}
            <div class="item-row" style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #db2777;">
              <strong>Ticket Total: $${ticketSubtotal.toFixed(2)}</strong>
            </div>
          </div>

          ${donationAmount > 0 ? `
          <div class="total-row" style="font-size: 18px;">
            Donation (Thank you! 💝): $${donationAmount.toFixed(2)}
          </div>
          ` : ''}

          <div class="grand-total">
            <div class="grand-total-row">
              TOTAL PAID: $${grandTotal.toFixed(2)}
            </div>
          </div>

          <div class="attachment-notice">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #000000;">
              📎 OPTIONAL: TICKETS ATTACHED
            </div>
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              Want a ticket for your records? Open the PDF attached to this email.<br/>
              <strong>Remember: No ticket required to attend!</strong>
            </div>
          </div>

          <div style="background: #f5f5f5; border: 2px solid #000000; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              <strong>Questions?</strong><br/>
              Call: (707) 462-4343 ext. 209<br/>
              Email: cashier@seniorctr.org
            </div>
          </div>
        </div>

        <div class="footer-text">
          <strong>Ukiah Senior Center</strong><br/>
          495 Leslie Street, Ukiah, CA 95482<br/>
          Phone: (707) 462-4343<br/>
          Email: cashier@seniorctr.org
        </div>
      </div>
    </body>
    </html>
  `;
}

interface SpeakeasyReceiptData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketQuantity: number;
  ticketPrice: number;
  ticketSubtotal: number;
  donationAmount: number;
  grandTotal: number;
  paymentMethod: string;
  timestamp: string;
}

export function generateSpeakeasyEmail(data: SpeakeasyReceiptData): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    ticketQuantity,
    ticketPrice,
    ticketSubtotal,
    donationAmount,
    grandTotal,
    paymentMethod,
    timestamp,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.8;
          color: #000000;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #d4af37;
        }
        .logo {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          display: block;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #000000;
        }
        .info-box {
          background: #fefce8;
          padding: 20px;
          margin: 20px 0;
          border: 2px solid #d4af37;
        }
        .info-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.8;
        }
        .info-label {
          font-weight: bold;
          color: #000000;
        }
        .event-header {
          background: #1a1a2e;
          color: #d4af37;
          padding: 15px;
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
        }
        .event-items {
          background: #fefce8;
          border: 2px solid #d4af37;
          padding: 15px;
          margin-bottom: 20px;
        }
        .item-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        .grand-total {
          background: #1a1a2e;
          padding: 20px;
          border: 3px solid #d4af37;
          margin: 25px 0;
        }
        .grand-total-row {
          font-size: 24px;
          font-weight: bold;
          color: #d4af37;
        }
        .attachment-notice {
          background: #fffbeb;
          border: 3px solid #f59e0b;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .footer-text {
          text-align: center;
          color: #000000;
          font-size: 14px;
          padding: 20px;
          border-top: 2px solid #cccccc;
        }
        h1 {
          margin: 0;
          font-size: 22px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://tickets.ukiahseniorcenter.org/logo.png" alt="Ukiah Senior Center" class="logo" />
          <h1 style="color: #d4af37; margin: 0 0 8px 0;">An Affair to Remember</h1>
          <p style="color: #d4af37; margin: 0; font-size: 18px;">🎭 A Night at the Speakeasy</p>
        </div>

        <div class="content">
          <div class="greeting">
            Hello ${customerName.includes('&') || customerName.includes(' and ') ? customerName.split(' ')[0] + ' & ' + customerName.split(/&| and /)[1].trim().split(' ')[0] : customerName.split(' ')[0]},
          </div>

          <p style="font-size: 18px; line-height: 1.8; margin: 20px 0; font-weight: bold; color: #1a1a2e;">
            Your Speakeasy Gala reservation is confirmed!
          </p>

          <div style="background: #fefce8; border: 3px solid #d4af37; padding: 25px; margin: 25px 0; border-radius: 8px;">
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>📅 Date:</strong> Saturday, April 11, 2026
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>🕖 Time:</strong> Doors open 6pm, Entertainment 7-10pm
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>📍 Location:</strong> Ukiah Senior Center, 495 Leslie St
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>👔 Dress Code:</strong> 1920s Speakeasy Attire Encouraged!
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0; color: #000000;">
              <strong>✓ Just give us your name at the door!</strong>
            </p>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span> ${customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${customerEmail}
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span> ${customerPhone || 'Not provided'}
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span> ${paymentMethod}
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span> ${timestamp}
            </div>
          </div>

          <div class="event-header">
            🎭 Speakeasy Gala - ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''}
          </div>
          <div class="event-items">
            <div class="item-row">
              ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''} @ $${ticketPrice.toFixed(2)} each = <strong>$${ticketSubtotal.toFixed(2)}</strong>
            </div>
          </div>

          ${donationAmount > 0 ? `
          <div style="font-size: 18px; font-weight: bold; padding: 10px 0;">
            Donation (Thank you! 🙏): $${donationAmount.toFixed(2)}
          </div>
          ` : ''}

          <div class="grand-total">
            <div class="grand-total-row">
              TOTAL PAID: $${grandTotal.toFixed(2)}
            </div>
          </div>

          <div class="attachment-notice">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #000000;">
              📎 OPTIONAL: TICKETS ATTACHED
            </div>
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              Want a ticket for your records? Open the PDF attached to this email.<br/>
              <strong>Remember: No ticket required to attend!</strong>
            </div>
          </div>

          <div style="background: #f5f5f5; border: 2px solid #000000; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              <strong>Questions?</strong><br/>
              Call: (707) 462-4343 ext. 209<br/>
              Email: cashier@seniorctr.org
            </div>
          </div>
        </div>

        <div class="footer-text">
          <strong>Ukiah Senior Center</strong><br/>
          495 Leslie Street, Ukiah, CA 95482<br/>
          Phone: (707) 462-4343<br/>
          Email: cashier@seniorctr.org
        </div>
      </div>
    </body>
    </html>
  `;
}

/* ========== 2025 EVENT EMAIL TEMPLATES - PRESERVED ==========
    timestamp,
  } = data;

  const christmasTotal = christmasMember + christmasNonMember;
  const nyeTotal = nyeMember + nyeNonMember;
  const christmasSubtotal = christmasMember * 15 + christmasNonMember * 20;
  const nyeSubtotal = nyeMember * 35 + nyeNonMember * 45;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.8;
          color: #000000;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          background: #fafbff;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #427d78;
        }
        .logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          display: block;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #000000;
        }
        .info-box {
          background: #fafbff;
          padding: 20px;
          margin: 20px 0;
          border: 2px solid #427d78;
        }
        .info-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.8;
        }
        .info-label {
          font-weight: bold;
          color: #000000;
        }
        .items-section {
          margin: 30px 0;
        }
        .event-header {
          background: #427d78;
          color: white;
          padding: 15px;
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
        }
        .event-header.nye {
          background: #7c3aed;
        }
        .event-items {
          background: #fafbff;
          border: 2px solid #427d78;
          padding: 15px;
          margin-bottom: 20px;
        }
        .event-items.nye {
          border-color: #7c3aed;
        }
        .item-row {
          padding: 8px 0;
          font-size: 16px;
          line-height: 1.6;
        }
        .divider {
          border: none;
          border-top: 3px solid #000000;
          margin: 25px 0;
        }
        .total-row {
          padding: 10px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .grand-total {
          background: #f5f5f5;
          padding: 20px;
          border: 3px solid #000000;
          margin: 25px 0;
        }
        .grand-total-row {
          font-size: 24px;
          font-weight: bold;
          color: #000000;
        }
        .attachment-notice {
          background: #fffbeb;
          border: 3px solid #f59e0b;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .footer-text {
          text-align: center;
          color: #000000;
          font-size: 14px;
          padding: 20px;
          border-top: 2px solid #cccccc;
        }
        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 25px 0 15px 0;
          color: #000000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://tickets.ukiahseniorcenter.org/logo.png" alt="Ukiah Senior Center" class="logo" />
          <h1 style="color: #427d78; margin: 0;">Your Ukiah Senior Center Tickets</h1>
        </div>

        <div class="content">
          <div class="greeting">
            Hello ${customerName.includes('&') || customerName.includes(' and ') ? customerName.split(' ')[0] + ' & ' + customerName.split(/&| and /)[1].trim().split(' ')[0] : customerName.split(' ')[0]},
          </div>

          <p style="font-size: 18px; line-height: 1.8; margin: 20px 0; font-weight: bold; color: #000000;">
            Your reservation is confirmed! No ticket required.
          </p>

          <div style="background: #e8f5e9; border: 3px solid #2e7d32; padding: 25px; margin: 25px 0; border-radius: 8px;">
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>✓ All set!</strong> Just give us your name when you arrive.
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0 0 15px 0; color: #000000;">
              <strong>✓ No ticket needed.</strong> We have your reservation in our system.
            </p>
            <p style="font-size: 17px; line-height: 2; margin: 0; color: #000000;">
              <strong>Optional:</strong> If you'd like a ticket for your records, one is attached as a PDF. You can view it on your phone, print it at home, or ask us to print one for you.
            </p>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span> ${customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${customerEmail}
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span> ${customerPhone || 'Not provided'}
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span> ${paymentMethod}
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span> ${timestamp}
            </div>
          </div>

          <div class="items-section">
            <h2>Your Tickets</h2>

            ${christmasTotal > 0 ? `
            <div class="event-header">
              Christmas Drive-Thru Meal
            </div>
            <div class="event-items">
              ${christmasMember > 0 ? `
              <div class="item-row">
                ${christmasMember} Member Ticket${christmasMember > 1 ? 's' : ''} @ $15.00 each = <strong>$${(christmasMember * 15).toFixed(2)}</strong>
              </div>
              ` : ''}
              ${christmasNonMember > 0 ? `
              <div class="item-row">
                ${christmasNonMember} Non-Member Ticket${christmasNonMember > 1 ? 's' : ''} @ $20.00 each = <strong>$${(christmasNonMember * 20).toFixed(2)}</strong>
              </div>
              ` : ''}
              <div class="item-row" style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #427d78;">
                <strong>Christmas Total: $${christmasSubtotal.toFixed(2)}</strong>
              </div>
            </div>
            ` : ''}

            ${nyeTotal > 0 ? `
            <div class="event-header nye">
              New Year's Eve Gala Dance
            </div>
            <div class="event-items nye">
              ${nyeMember > 0 ? `
              <div class="item-row">
                ${nyeMember} Member Ticket${nyeMember > 1 ? 's' : ''} @ $35.00 each = <strong>$${(nyeMember * 35).toFixed(2)}</strong>
              </div>
              ` : ''}
              ${nyeNonMember > 0 ? `
              <div class="item-row">
                ${nyeNonMember} Non-Member Ticket${nyeNonMember > 1 ? 's' : ''} @ $45.00 each = <strong>$${(nyeNonMember * 45).toFixed(2)}</strong>
              </div>
              ` : ''}
              <div class="item-row" style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #7c3aed;">
                <strong>NYE Total: $${nyeSubtotal.toFixed(2)}</strong>
              </div>
            </div>
            ` : ''}
          </div>

          <hr class="divider">

          <div class="total-row" style="font-size: 18px;">
            Tickets: $${ticketSubtotal.toFixed(2)}
          </div>
          ${donationAmount > 0 ? `
          <div class="total-row" style="font-size: 18px;">
            Donation (Thank you!): $${donationAmount.toFixed(2)}
          </div>
          ` : ''}

          <div class="grand-total">
            <div class="grand-total-row">
              TOTAL PAID: $${grandTotal.toFixed(2)}
            </div>
          </div>

          <div class="attachment-notice">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #000000;">
              📎 OPTIONAL: TICKETS ATTACHED
            </div>
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              Want a ticket for your records? Open the PDF attached to this email.<br/>
              You can view it on your phone, print it at home, or we can print one for you.<br/>
              <strong>Remember: No ticket required to attend!</strong>
            </div>
          </div>

          <div style="background: #f5f5f5; border: 2px solid #000000; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 16px; color: #000000; line-height: 1.8;">
              <strong>Questions?</strong><br/>
              Call: (707) 462-4343 ext. 209<br/>
              Email: cashier@seniorctr.org
            </div>
          </div>
        </div>

        <div class="footer-text">
          <strong>Ukiah Senior Center</strong><br/>
          495 Leslie Street, Ukiah, CA 95482<br/>
          Phone: (707) 462-4343<br/>
          Email: cashier@seniorctr.org
        </div>
      </div>
    </body>
    </html>
  `;
}
========== END 2025 EVENT EMAIL TEMPLATES ==========*/