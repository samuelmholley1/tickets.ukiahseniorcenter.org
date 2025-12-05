import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Load logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    const body = await request.json();
    const {
      firstName,
      lastName,
      christmasMember = 0,
      christmasNonMember = 0,
      nyeMember = 0,
      nyeNonMember = 0,
    } = body;

    const customerName = `${firstName} ${lastName}`;
    const tickets: Array<{
      eventName: string;
      isNYE: boolean;
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate Christmas tickets
    const totalChristmas = christmasMember + christmasNonMember;
    for (let i = 0; i < totalChristmas; i++) {
      tickets.push({
        eventName: 'Christmas Prime Rib Meal',
        isNYE: false,
        ticketNumber: i + 1,
        totalTickets: totalChristmas,
      });
    }

    // Generate NYE tickets
    const totalNYE = nyeMember + nyeNonMember;
    for (let i = 0; i < totalNYE; i++) {
      tickets.push({
        eventName: 'New Year&apos;s Eve Gala',
        isNYE: true,
        ticketNumber: i + 1,
        totalTickets: totalNYE,
      });
    }

    // Create PDF document (8.5" x 11" letter size)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    // Helper function to draw a senior-friendly ticket
    const drawTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;
      const isNYE = ticket.isNYE;
      const borderColor: [number, number, number] = isNYE ? [124, 58, 237] : [66, 125, 120];

      // Background
      doc.setFillColor(isNYE ? 250 : 255, isNYE ? 245 : 255, isNYE ? 255 : 255);
      doc.rect(x, y, width, height, 'F');

      // Border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.015);
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Logo - top left
      try {
        doc.addImage(logoBase64, 'PNG', x + 0.15, y + 0.15, 0.35, 0.35);
      } catch (e) {
        console.error('Error adding logo:', e);
      }

      let textY = y + 0.35;

      // Event Title - 14pt centered
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const title = isNYE ? "New Year's Eve Gala" : 'Christmas Prime Rib';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, x + (width - titleWidth) / 2, textY);

      textY += 0.25;

      // Date & Time - 11pt centered on same line
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      const dateTime = isNYE 
        ? 'Wednesday, Dec 31 • 7:00-10:00 PM'
        : 'Tuesday, Dec 23 • 12:00-12:30 PM';
      const dateWidth = doc.getTextWidth(dateTime);
      doc.text(dateTime, x + (width - dateWidth) / 2, textY);

      textY += 0.25;

      // Key info line 1 - 10pt centered
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const info1 = isNYE ? 'Appetizers & Dessert' : 'Pick Up Window 12:00-12:30';
      const info1Width = doc.getTextWidth(info1);
      doc.text(info1, x + (width - info1Width) / 2, textY);

      textY += 0.2;

      // Key info line 2 - 10pt centered
      const info2 = isNYE ? 'Beatz Werkin Band' : 'Drive-Thru Only';
      const info2Width = doc.getTextWidth(info2);
      doc.text(info2, x + (width - info2Width) / 2, textY);

      // Guest Name - 11pt centered
      const guestY = y + height - 0.45;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const guestText = `${customerName} #${ticket.ticketNumber}`;
      const guestWidth = doc.getTextWidth(guestText);
      doc.text(guestText, x + (width - guestWidth) / 2, guestY);

      // Footer - 8pt centered
      const footerY = y + height - 0.2;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const footer = '495 Leslie St, Ukiah • (707) 462-4343 ext 209';
      const footerWidth = doc.getTextWidth(footer);
      doc.text(footer, x + (width - footerWidth) / 2, footerY);
    };

    // Layout tickets in 2x5 grid
    let ticketIndex = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 2; col++) {
        if (ticketIndex < tickets.length) {
          const x = 0.5 + col * 3.75;
          const y = 0.5 + row * 2.25;
          drawTicket(tickets[ticketIndex], x, y);
          ticketIndex++;
        }
      }
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tickets.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
