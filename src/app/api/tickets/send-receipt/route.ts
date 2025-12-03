import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateReceiptEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const customerName = `${firstName} ${lastName}`;
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Generate PDF by calling our PDF generation endpoint
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
      throw new Error('Failed to generate PDF');
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

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
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
