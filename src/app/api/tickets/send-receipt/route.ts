import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateValentinesEmail, generateSpeakeasyEmail } from '@/lib/email';

// Dynamic pricing functions (must match submit route)
function getValentinesMemberPrice(): number {
  const priceIncreaseDate = new Date('2026-02-10T00:00:00-08:00');
  return new Date() < priceIncreaseDate ? 30 : 35;
}

function getSpeakeasyPrice(): number {
  const priceIncreaseDate = new Date('2026-03-29T00:00:00-07:00');
  return new Date() < priceIncreaseDate ? 100 : 110;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[send-receipt] Starting email receipt process');
    const body = await request.json();
    console.log('[send-receipt] Request body:', JSON.stringify(body, null, 2));
    
    const {
      firstName,
      lastName,
      email,
      phone,
      valentinesMember = 0,
      valentinesNonMember = 0,
      speakeasy = 0,
      donationAmount = 0,
      paymentMethod,
      additionalCC = [],
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

    // Calculate if we have tickets for each event
    const hasValentines = valentinesMember > 0 || valentinesNonMember > 0;
    const hasSpeakeasy = speakeasy > 0;
    
    // Calculate prices
    const memberPrice = getValentinesMemberPrice();
    const nonMemberPrice = 45; // Always $45 for non-members
    const speakeasyPrice = getSpeakeasyPrice();
    
    // Calculate subtotals for each event
    const valentinesSubtotal = (valentinesMember * memberPrice) + (valentinesNonMember * nonMemberPrice);
    const speakeasySubtotal = speakeasy * speakeasyPrice;

    const results: { event: string; success: boolean; messageId?: string; error?: string }[] = [];

    // ======== Send Valentine's Email if they have Valentine's tickets ========
    if (hasValentines) {
      console.log('[send-receipt] Generating Valentine\'s PDF');
      const valentinesPdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tickets/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          valentinesMember,
          valentinesNonMember,
          speakeasy: 0, // Only Valentine's tickets in this PDF
        }),
      });

      if (!valentinesPdfResponse.ok) {
        const errorText = await valentinesPdfResponse.text();
        console.error('[send-receipt] Valentine\'s PDF generation failed:', errorText);
        throw new Error(`Failed to generate Valentine's PDF: ${errorText}`);
      }

      const valentinesPdfBuffer = Buffer.from(await valentinesPdfResponse.arrayBuffer());
      console.log('[send-receipt] Valentine\'s PDF generated, size:', valentinesPdfBuffer.length, 'bytes');

      // Donation goes on Valentine's email if both events, or if only Valentine's
      const valentinesDonation = hasSpeakeasy ? donationAmount : donationAmount;
      const valentinesGrandTotal = valentinesSubtotal + (hasSpeakeasy ? donationAmount : donationAmount);

      const valentinesEmailHTML = generateValentinesEmail({
        customerName,
        customerEmail: email,
        customerPhone: phone,
        memberTickets: valentinesMember,
        nonMemberTickets: valentinesNonMember,
        ticketSubtotal: valentinesSubtotal,
        donationAmount: valentinesDonation,
        grandTotal: valentinesGrandTotal,
        paymentMethod,
        timestamp,
        memberPrice,
        nonMemberPrice,
      });

      console.log('[send-receipt] Sending Valentine\'s email...');
      const valentinesResult = await sendEmail({
        to: email,
        subject: `Your Valentine's Day Dance Reservation is Confirmed! 💕`,
        html: valentinesEmailHTML,
        additionalCC,
        attachments: [
          {
            filename: `ValentinesDay_Tickets_${firstName}${lastName}.pdf`,
            content: valentinesPdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      results.push({
        event: 'valentines',
        success: valentinesResult.success,
        messageId: valentinesResult.messageId,
        error: valentinesResult.error instanceof Error ? valentinesResult.error.message : undefined,
      });
    }

    // ======== Send Speakeasy Email if they have Speakeasy tickets ========
    if (hasSpeakeasy) {
      console.log('[send-receipt] Generating Speakeasy PDF');
      const speakeasyPdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tickets/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          valentinesMember: 0, // Only Speakeasy tickets in this PDF
          valentinesNonMember: 0,
          speakeasy,
        }),
      });

      if (!speakeasyPdfResponse.ok) {
        const errorText = await speakeasyPdfResponse.text();
        console.error('[send-receipt] Speakeasy PDF generation failed:', errorText);
        throw new Error(`Failed to generate Speakeasy PDF: ${errorText}`);
      }

      const speakeasyPdfBuffer = Buffer.from(await speakeasyPdfResponse.arrayBuffer());
      console.log('[send-receipt] Speakeasy PDF generated, size:', speakeasyPdfBuffer.length, 'bytes');

      // Donation only goes on Speakeasy email if they ONLY bought Speakeasy tickets
      const speakeasyDonation = hasValentines ? 0 : donationAmount;
      const speakeasyGrandTotal = speakeasySubtotal + speakeasyDonation;

      const speakeasyEmailHTML = generateSpeakeasyEmail({
        customerName,
        customerEmail: email,
        customerPhone: phone,
        ticketQuantity: speakeasy,
        ticketPrice: speakeasyPrice,
        ticketSubtotal: speakeasySubtotal,
        donationAmount: speakeasyDonation,
        grandTotal: speakeasyGrandTotal,
        paymentMethod,
        timestamp,
      });

      console.log('[send-receipt] Sending Speakeasy email...');
      const speakeasyResult = await sendEmail({
        to: email,
        subject: `Your Speakeasy Gala Reservation is Confirmed! 🎭`,
        html: speakeasyEmailHTML,
        additionalCC,
        attachments: [
          {
            filename: `Speakeasy_Tickets_${firstName}${lastName}.pdf`,
            content: speakeasyPdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      results.push({
        event: 'speakeasy',
        success: speakeasyResult.success,
        messageId: speakeasyResult.messageId,
        error: speakeasyResult.error instanceof Error ? speakeasyResult.error.message : undefined,
      });
    }

    // Check results
    const allSuccessful = results.every(r => r.success);
    const anySuccessful = results.some(r => r.success);

    if (allSuccessful) {
      console.log('[send-receipt] All emails sent successfully!');
      return NextResponse.json({ 
        success: true, 
        results,
        message: `Sent ${results.length} email(s) successfully`
      });
    } else if (anySuccessful) {
      console.warn('[send-receipt] Some emails failed:', results);
      return NextResponse.json({ 
        success: true, 
        partial: true,
        results,
        message: 'Some emails sent successfully, but some failed'
      });
    } else {
      console.error('[send-receipt] All emails failed:', results);
      return NextResponse.json(
        { error: 'Failed to send all emails', results },
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
