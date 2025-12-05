import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      christmasMember = 0,
      christmasNonMember = 0,
      nyeMember = 0,
      nyeNonMember = 0,
    } = body;

    // Build the ticket print HTML
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
        eventName: 'New Year\'s Eve Gala Dance',
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

    // Helper function to draw a ticket
    const drawTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;
      const isNYE = ticket.isNYE;
      const borderColor: [number, number, number] = isNYE ? [124, 58, 237] : [66, 125, 120]; // RGB
      const accentColor: [number, number, number] = isNYE ? [124, 58, 237] : [66, 125, 120];

      // Background (light tint)
      doc.setFillColor(isNYE ? 250 : 255, isNYE ? 245 : 255, isNYE ? 255 : 255);
      doc.rect(x, y, width, height, 'F');

      // Border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.015);
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Header section with border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.01);
      doc.line(x + 0.1, y + 0.4, x + width - 0.1, y + 0.4);

      // Event title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text(isNYE ? "New Year's Eve Gala Dance" : 'Christmas Prime Rib Meal', x + 0.15, y + 0.2);

      // Date and time
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(isNYE ? 'Wednesday • December 31, 2025' : 'Tuesday • December 23, 2025', x + 0.15, y + 0.3);

      if (isNYE) {
        doc.text('Doors: 6:00 PM • Dance: 7:00-10:00 PM', x + 0.15, y + 0.36);
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(6);
        doc.text('Ball Drop: 9:00 PM (NY Time!)', x + 0.15, y + 0.41);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text('PICKUP: 12:00-12:30 PM', x + 0.15, y + 0.36);
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(6);
        doc.text('Drive-Thru Only • Stay in Vehicle', x + 0.15, y + 0.41);
      }

      // Event details section
      let detailY = y + 0.55;
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      if (isNYE) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('INCLUDES:', x + 0.15, detailY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("Appetizers, Hors d'oeuvres & Dessert", x + 0.55, detailY);

        detailY += 0.12;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('MUSIC:', x + 0.15, detailY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Beatz Werkin Band', x + 0.45, detailY);

        detailY += 0.12;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('ATTIRE:', x + 0.15, detailY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Flashy Attire!', x + 0.45, detailY);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('MENU:', x + 0.15, detailY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const menuText = 'Prime Rib w/ Horseradish, Garlic Mashed Potatoes,';
        doc.text(menuText, x + 0.4, detailY);
        doc.text('Vegetable, Caesar Salad, Garlic Bread, Cheesecake', x + 0.15, detailY + 0.08);

        detailY += 0.2;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text('⚠️ Arrive within 12:00-12:30 PM window', x + 0.15, detailY);
      }

      // Guest info section with border
      const guestY = y + height - 0.45;
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.005);
      doc.line(x + 0.15, guestY, x + width - 0.15, guestY);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text('Guest:', x + 0.15, guestY + 0.12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${customerName} #${ticket.ticketNumber}`, x + 0.45, guestY + 0.12);

      // Footer section with border
      const footerY = y + height - 0.25;
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.01);
      doc.line(x + 0.1, footerY, x + width - 0.1, footerY);

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      const footerText = 'Bartlett Event Center • 495 Leslie St, Ukiah, CA 95482 • (707) 462-4343';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, x + (width - footerWidth) / 2, footerY + 0.12);
    };

    // Layout tickets in 2x5 grid
    let ticketIndex = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 2; col++) {
        if (ticketIndex < tickets.length) {
          const x = 0.5 + col * 3.75; // 0.5" margin + 3.5" width + 0.25" gap
          const y = 0.5 + row * 2.25;  // 0.5" margin + 2" height + 0.25" gap
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
