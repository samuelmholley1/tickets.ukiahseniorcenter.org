// Email service using Microsoft 365 SMTP via Nodemailer
import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail({ to, subject, html, attachments }: EmailParams) {
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

  const mailOptions = {
    from: '"Ukiah Senior Center Tickets" <cashier@seniorctr.org>',
    to,
    cc: ['cashier@seniorctr.org', 'activities@ukiahseniorcenter.org'],
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

interface TicketReceiptData {
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
  ticketSubtotal: number;
  donationAmount: number;
  grandTotal: number;
  paymentMethod: string;
  staffInitials: string;
  timestamp: string;
}

export function generateReceiptEmail(data: TicketReceiptData): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    christmasMember,
    christmasNonMember,
    nyeMember,
    nyeNonMember,
    ticketSubtotal,
    donationAmount,
    grandTotal,
    paymentMethod,
    staffInitials,
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
          background: #427d78;
          color: white;
          padding: 30px 20px;
          text-align: center;
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
          background: #f5f5f5;
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
          background: #f5f5f5;
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
          <h1>Your Ukiah Senior Center Tickets</h1>
        </div>

        <div class="content">
          <div class="greeting">
            Hello ${customerName},
          </div>

          <p style="font-size: 16px; line-height: 1.8; margin: 20px 0;">
            Thank you for your ticket purchase! Your tickets are attached to this email as a PDF file.
          </p>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span> ${customerName}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${customerEmail}
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span> ${customerPhone}
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
              YOUR TICKETS ARE ATTACHED TO THIS EMAIL
            </div>
            <div style="font-size: 16px; color: #000000; line-height: 1.6;">
              Open the PDF file attached to this email.<br/>
              Print your tickets at home or show them on your phone.
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
