import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateReceiptEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('[send-receipt] Starting email receipt process');
    const body = await request.json();
    console.log('[send-receipt] Request body:', JSON.stringify(body, null, 2));
    
    const {
      transactionId,
      firstName,
      lastName,
      email,
      phone,
      christmasMember = 0,
      christmasNonMember = 0,
      nyeMember = 0,
      nyeNonMember = 0,
      ticketSubtotal,
      donationAmount = 0,
      grandTotal,
      paymentMethod,
      staffInitials,
    } = body;

    if (!email) {
      console.error('[send-receipt] Error: No email address provided');
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    
    console.log('[send-receipt] Recipient email:', email);

    const customerName = `${firstName} ${lastName}`;
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Generate PDF by calling our PDF generation endpoint
    console.log('[send-receipt] Generating PDF for tickets');
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tickets/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        christmasMember,
        christmasNonMember,
        nyeMember,
        nyeNonMember,
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('[send-receipt] PDF generation failed:', errorText);
      throw new Error(`Failed to generate PDF: ${errorText}`);
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    console.log('[send-receipt] PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Generate email HTML
    const emailHTML = generateReceiptEmail({
      transactionId,
      customerName,
      customerEmail: email,
      customerPhone: phone,
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
    });

    // Send email with PDF attachment
    console.log('[send-receipt] Sending email to:', email);
    console.log('[send-receipt] EMAIL_PASSWORD set:', !!process.env.EMAIL_PASSWORD);
    console.log('[send-receipt] EMAIL_USER:', process.env.EMAIL_USER || 'cashier@seniorctr.org');
    
    const result = await sendEmail({
      to: email,
      subject: `Your Ticket Receipt - ${transactionId}`,
      html: emailHTML,
      attachments: [
        {
          filename: `tickets_${transactionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    if (result.success) {
      console.log('[send-receipt] Email sent successfully! Message ID:', result.messageId);
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      console.error('[send-receipt] Email failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error?.message || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[send-receipt] Error sending receipt email:', error);
    console.error('[send-receipt] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
