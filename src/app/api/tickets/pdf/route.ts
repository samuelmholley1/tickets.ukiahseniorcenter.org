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

    // Generate Christmas tickets - each Christmas ticket numbered within Christmas group
    const totalChristmas = christmasMember + christmasNonMember;
    for (let i = 0; i < totalChristmas; i++) {
      tickets.push({
        eventName: 'Christmas Prime Rib Meal',
        isNYE: false,
        ticketNumber: i + 1,
        totalTickets: totalChristmas,
      });
    }

    // Generate NYE tickets - each NYE ticket numbered within NYE group
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

      // Background - pure white like bookstore cards
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, width, height, 'F');

      // Border - thicker like bookstore (3px)
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.04); // ~3pt to match bookstore
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Logo - 30% width on left side
      const logoWidth = width * 0.3;
      const logoHeight = logoWidth; // Keep square
      const logoX = x + 0.1;
      const logoY = y + (height - logoHeight) / 2; // Vertically centered
      try {
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (e) {
        console.error('Error adding logo:', e);
      }

      // Text area - right 70% with better spacing
      const textStartX = x + logoWidth + 0.2;
      const textWidth = width * 0.7 - 0.3;
      const textCenterX = textStartX + textWidth / 2;
      
      let textY = y + 0.35;

      // Event Title - 18pt centered in text area (matches bookstore ratio)
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const title = isNYE ? "New Year's Eve Gala" : 'Christmas Drive-Thru';
      doc.text(title, textCenterX, textY, { align: 'center' });

      textY += 0.25;

      // Date & Time - 14pt centered in text area (bold like bookstore)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const dateTime = isNYE 
        ? 'Wednesday, Dec 31 • 7:00-10:00 PM'
        : 'Tuesday, December 23';
      doc.text(dateTime, textCenterX, textY, { align: 'center' });

      textY += 0.25;

      // Key info lines - 12pt centered in text area
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (isNYE) {
        // Music by Beatz Werkin - centered with italic band name
        const musicText = 'Music by ';
        const bandText = 'Beatz Werkin';
        const musicWidth = doc.getTextWidth(musicText);
        doc.setFont('helvetica', 'italic');
        const bandWidth = doc.getTextWidth(bandText);
        doc.setFont('helvetica', 'normal');
        const totalWidth = musicWidth + bandWidth;
        const startX = textCenterX - (totalWidth / 2);
        
        doc.text(musicText, startX, textY);
        doc.setFont('helvetica', 'italic');
        doc.text(bandText, startX + musicWidth, textY);
        doc.setFont('helvetica', 'normal');
        
        textY += 0.18;
        doc.text('Appetizers & Dessert', textCenterX, textY, { align: 'center' });
        textY += 0.18;
        doc.setFontSize(9);
        doc.text('Ball Drops at 9 PM', textCenterX, textY, { align: 'center' });
      } else {
        doc.text('Prime Rib, Fixings, & Dessert', textCenterX, textY, { align: 'center' });
        textY += 0.2;
        doc.text('Pick Up: 12:00-12:30 PM', textCenterX, textY, { align: 'center' });
      }

      // Guest Name - 11pt centered in text area
      const guestY = y + height - 0.45;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const guestText = `${customerName} • ${ticket.ticketNumber} of ${ticket.totalTickets}`;
      doc.text(guestText, textCenterX, guestY, { align: 'center' });

      // Footer - 10pt centered, black like bookstore
      const footerY = y + height - 0.2;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const footer = '495 Leslie St, Ukiah • (707) 462-4343 ext 209';
      const footerWidth = doc.getTextWidth(footer);
      doc.text(footer, x + (width - footerWidth) / 2, footerY);
    };

    // Layout tickets in 2x4 grid (8 per page) - optimized for 8.5x11
    // Available height: 11" - 1" margins = 10"
    // 4 tickets at 2" + 3 gaps at 0.2" = 8.6"
    let ticketIndex = 0;
    const ticketsPerPage = 8;
    for (let pageIndex = 0; pageIndex < Math.ceil(tickets.length / ticketsPerPage); pageIndex++) {
      if (pageIndex > 0) doc.addPage();
      
      for (let i = 0; i < ticketsPerPage && ticketIndex < tickets.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = 0.5 + col * 3.75;
        const y = 0.5 + row * 2.2; // Reduced gap from 2.25 to 2.2
        drawTicket(tickets[ticketIndex], x, y);
        ticketIndex++;
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
