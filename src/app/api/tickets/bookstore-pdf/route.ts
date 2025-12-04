import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST() {
  try {
    const customerName = 'Mendocino Book Company';
    const tickets: Array<{
      eventName: string;
      isNYE: boolean;
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate 20 Christmas tickets
    for (let i = 0; i < 20; i++) {
      tickets.push({
        eventName: 'Christmas Prime Rib Meal',
        isNYE: false,
        ticketNumber: i + 1,
        totalTickets: 20,
      });
    }

    // Generate 20 NYE tickets
    for (let i = 0; i < 20; i++) {
      tickets.push({
        eventName: 'New Year\'s Eve Gala Dance',
        isNYE: true,
        ticketNumber: i + 1,
        totalTickets: 20,
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
      const borderColor = isNYE ? [124, 58, 237] : [66, 125, 120]; // RGB
      const accentColor = isNYE ? [124, 58, 237] : [66, 125, 120];

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
      doc.text(isNYE ? 'Wednesday • Dec 31, 2025' : 'Tuesday • Dec 23, 2025', x + 0.15, y + 0.3);

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
        doc.text('Prime Rib w/ Horseradish, Garlic Mashed', x + 0.45, detailY);

        detailY += 0.1;
        doc.text('Potatoes, Vegetable, Caesar Salad,', x + 0.45, detailY);

        detailY += 0.1;
        doc.text('Garlic Bread, Cheesecake', x + 0.45, detailY);

        detailY += 0.15;
        doc.setFontSize(6);
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ Arrive within 12:00-12:30 PM window', x + 0.15, detailY);
      }

      // Guest section with border
      const guestY = y + height - 0.5;
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
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const footerText = 'Bartlett Event Center • 495 Leslie St, Ukiah, CA 95482 • (707) 462-4343';
      const textWidth = doc.getTextWidth(footerText);
      const centerX = x + (width / 2) - (textWidth / 2);
      doc.text(footerText, centerX, footerY + 0.12);
    };

    // Layout: 2 columns, 5 rows per page (10 tickets per page)
    const cols = 2;
    const rows = 5;
    const ticketsPerPage = cols * rows;
    const startX = 0.75; // 0.75" from left
    const startY = 0.5;  // 0.5" from top
    const gapX = 0.25;   // Gap between columns
    const gapY = 0.25;   // Gap between rows

    tickets.forEach((ticket, index) => {
      // Add new page if needed
      if (index > 0 && index % ticketsPerPage === 0) {
        doc.addPage();
      }

      // Calculate position
      const posInPage = index % ticketsPerPage;
      const col = posInPage % cols;
      const row = Math.floor(posInPage / cols);

      const x = startX + col * (3.5 + gapX);
      const y = startY + row * (2 + gapY);

      drawTicket(ticket, x, y);
    });

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Mendocino-Book-Company-Tickets-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating bookstore PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
