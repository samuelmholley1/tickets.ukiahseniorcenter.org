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
  // Create transporter using Microsoft 365 SMTP
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
    },
  });

  const mailOptions = {
    from: '"Ukiah Senior Center Tickets" <cashier@seniorctr.org>',
    to,
    replyTo: 'cashier@seniorctr.org',
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
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
    transactionId,
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header {
          background: linear-gradient(135deg, #427d78 0%, #2d5a56 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          border-radius: 8px;
          display: block;
          margin: 0 auto;
        }
        .content {
          padding: 40px 30px;
        }
        .ticket-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .transaction-id {
          background: #f0fdf4;
          border: 2px solid #86efac;
          padding: 12px 20px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin: 24px 0;
          color: #166534;
        }
        .info-box {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 6px;
          margin: 24px 0;
          border-left: 4px solid #427d78;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 15px;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #4a5568;
        }
        .info-value {
          color: #1a1a1a;
          text-align: right;
        }
        .items-section {
          margin: 32px 0;
        }
        .event-header {
          background: linear-gradient(135deg, #427d78 0%, #2d5a56 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 6px 6px 0 0;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .event-header.nye {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
        }
        .event-items {
          background: white;
          border: 2px solid #427d78;
          border-top: none;
          border-radius: 0 0 6px 6px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .event-items.nye {
          border-color: #7c3aed;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }
        .divider {
          border: none;
          border-top: 2px solid #427d78;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 16px;
          font-weight: 600;
        }
        .grand-total {
          background: #f0fdf4;
          padding: 16px 20px;
          border-radius: 6px;
          border: 2px solid #86efac;
          margin: 24px 0;
        }
        .grand-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 22px;
          font-weight: 700;
          color: #166534;
        }
        .attachment-notice {
          background: #eff6ff;
          border: 2px solid #93c5fd;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 24px 0;
        }
        .footer-text {
          text-align: center;
          color: #718096;
          font-size: 13px;
          padding: 20px 30px;
          border-top: 1px solid #e2e8f0;
        }
        h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
        }
        .message-text {
          font-size: 17px;
          margin: 0 0 24px 0;
          text-align: center;
          color: #2d3748;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="ticket-icon">🎟️</div>
          <h1>Ticket Purchase Receipt</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">Ukiah Senior Center</p>
        </div>

        <div class="content">
          <div class="transaction-id">
            Transaction #${transactionId}
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Customer:</span>
              <span class="info-value">${customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment:</span>
              <span class="info-value">${paymentMethod}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Processed:</span>
              <span class="info-value">${timestamp}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Staff:</span>
              <span class="info-value">${staffInitials}</span>
            </div>
          </div>

          <div class="items-section">
            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1a1a1a;">Items Purchased</h2>

            ${christmasTotal > 0 ? `
            <div class="event-header">
              🎄 Christmas Drive-Thru Meal
            </div>
            <div class="event-items">
              ${christmasMember > 0 ? `
              <div class="item-row">
                <span>${christmasMember} Member Ticket${christmasMember > 1 ? 's' : ''} @ $15.00</span>
                <span style="font-weight: 600;">$${(christmasMember * 15).toFixed(2)}</span>
              </div>
              ` : ''}
              ${christmasNonMember > 0 ? `
              <div class="item-row">
                <span>${christmasNonMember} Non-Member Ticket${christmasNonMember > 1 ? 's' : ''} @ $20.00</span>
                <span style="font-weight: 600;">$${(christmasNonMember * 20).toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="item-row" style="border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-weight: 600; color: #427d78;">
                <span>Christmas Subtotal:</span>
                <span>$${christmasSubtotal.toFixed(2)}</span>
              </div>
            </div>
            ` : ''}

            ${nyeTotal > 0 ? `
            <div class="event-header nye">
              🎉 New Year's Eve Gala Dance
            </div>
            <div class="event-items nye">
              ${nyeMember > 0 ? `
              <div class="item-row">
                <span>${nyeMember} Member Ticket${nyeMember > 1 ? 's' : ''} @ $35.00</span>
                <span style="font-weight: 600;">$${(nyeMember * 35).toFixed(2)}</span>
              </div>
              ` : ''}
              ${nyeNonMember > 0 ? `
              <div class="item-row">
                <span>${nyeNonMember} Non-Member Ticket${nyeNonMember > 1 ? 's' : ''} @ $45.00</span>
                <span style="font-weight: 600;">$${(nyeNonMember * 45).toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="item-row" style="border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-weight: 600; color: #7c3aed;">
                <span>NYE Subtotal:</span>
                <span>$${nyeSubtotal.toFixed(2)}</span>
              </div>
            </div>
            ` : ''}
          </div>

          <hr class="divider">

          <div class="total-row">
            <span>Ticket Subtotal:</span>
            <span>$${ticketSubtotal.toFixed(2)}</span>
          </div>
          ${donationAmount > 0 ? `
          <div class="total-row" style="color: #dc2626;">
            <span>Donation (Thank you! ❤️):</span>
            <span>$${donationAmount.toFixed(2)}</span>
          </div>
          ` : ''}

          <div class="grand-total">
            <div class="grand-total-row">
              <span>TOTAL PAID:</span>
              <span>$${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="attachment-notice">
            <div style="font-size: 40px; margin-bottom: 12px;">📎</div>
            <div style="font-size: 17px; font-weight: 600; color: #1e40af; margin-bottom: 6px;">
              Your Tickets Are Attached
            </div>
            <div style="font-size: 14px; color: #4b5563;">
              Open the PDF attachment to view and print your tickets.<br/>
              Each ticket includes event details and your confirmation number.
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <div style="font-size: 14px; color: #92400e; line-height: 1.6;">
              <strong>Questions or Need Help?</strong><br/>
              Call us at <strong>(707) 462-4343 ext. 209</strong><br/>
              Or reply to this email
            </div>
          </div>
        </div>

        <div class="footer-text">
          <strong>Ukiah Senior Center</strong><br/>
          Bartlett Event Center • 495 Leslie Street, Ukiah, CA 95482<br/>
          (707) 462-4343 • cashier@seniorctr.org
        </div>
      </div>
    </body>
    </html>
  `;
}
