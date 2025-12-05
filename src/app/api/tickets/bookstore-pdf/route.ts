import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Load logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    const customerName = 'Mendocino Book Company';
    const tickets: Array<{
      eventName: string;
      isNYE: boolean;
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate 20 NYE tickets first
    for (let i = 0; i < 20; i++) {
      tickets.push({
        eventName: 'New Year\'s Eve Gala Dance',
        isNYE: true,
        ticketNumber: i + 1,
        totalTickets: 20,
      });
    }

    // Then 20 Christmas tickets
    for (let i = 0; i < 20; i++) {
      tickets.push({
        eventName: 'Christmas Prime Rib Meal',
        isNYE: false,
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

    // Helper function to draw a ticket - SIMPLIFIED for senior-friendly reading
    const drawTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;
      const isNYE = ticket.isNYE;
      const borderColor: [number, number, number] = isNYE ? [124, 58, 237] : [66, 125, 120];
      const accentColor: [number, number, number] = isNYE ? [124, 58, 237] : [66, 125, 120];

      // Background
      doc.setFillColor(isNYE ? 250 : 255, isNYE ? 245 : 255, isNYE ? 255 : 255);
      doc.rect(x, y, width, height, 'F');

      // Border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.02);
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

      // Event title - LARGE, centered in text area
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      const title = isNYE ? "New Year's Eve Gala" : 'Christmas Drive-Through';
      doc.text(title, textCenterX, y + 0.35, { align: 'center' });

      // Date and time - LARGE ON SAME LINE, centered in text area
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const dateTime = isNYE 
        ? 'Wednesday, Dec 31 • 6:00 PM' 
        : 'Tuesday, December 23';
      doc.text(dateTime, textCenterX, y + 0.6, { align: 'center' });

      // Important info - LARGE, centered in text area
      doc.setFontSize(10);
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
        
        doc.text(musicText, startX, y + 0.85);
        doc.setFont('helvetica', 'italic');
        doc.text(bandText, startX + musicWidth, y + 0.85);
        doc.setFont('helvetica', 'normal');
        
        doc.text('Appetizers & Dessert', textCenterX, y + 1.03, { align: 'center' });
        doc.setFontSize(9);
        doc.text('Ball Drops at 9 PM', textCenterX, y + 1.21, { align: 'center' });
      } else {
        doc.text('Prime Rib, Fixings, & Dessert', textCenterX, y + 0.85, { align: 'center' });
        doc.text('Pick Up: 12:00-12:30 PM', textCenterX, y + 1.05, { align: 'center' });
      }

      // Guest name - LARGE, centered in text area
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text(`${customerName} #${ticket.ticketNumber}`, textCenterX, y + 1.35, { align: 'center' });

      // Location - bottom
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Bartlett Event Center', x + width / 2, y + 1.7, { align: 'center' });
      doc.text('495 Leslie St • (707) 462-4343 ext 209', x + width / 2, y + 1.85, { align: 'center' });
    };

    // Layout tickets in 2x4 grid (8 per page) - optimized for 8.5x11
    const cols = 2;
    const rows = 4;
    const ticketsPerPage = cols * rows;
    const startX = 0.75;
    const startY = 0.5;
    const gapX = 0.25;
    const gapY = 0.2; // Reduced from 0.25 to 0.2

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
