import { NextResponse } from 'next/server';
import {
  getUSCLogo,
  createUSCPDF,
  validatePDFSize,
  createPDFErrorResponse,
} from '@/lib/pdfUtils';

/**
 * POST /api/tickets/bookstore-valentines-pdf
 * Generate pre-made bookstore tickets (20 Valentine's Day Dance)
 */
export async function POST() {
  const startTime = Date.now();
  
  try {
    // Load logo asynchronously
    const logoBase64 = await getUSCLogo();
    
    const customerName = 'Mendocino Book Company';
    const tickets: Array<{
      eventName: string;
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate 20 Valentine's Day Dance tickets
    for (let i = 0; i < 20; i++) {
      tickets.push({
        eventName: "Valentine's Day Dance",
        ticketNumber: i + 1,
        totalTickets: 20,
      });
    }

    // Create PDF document with proper metadata
    const doc = createUSCPDF({
      title: 'Bookstore Valentine\'s Day Tickets',
      author: 'Ukiah Senior Center',
      subject: 'Pre-printed Valentine\'s Day tickets for Mendocino Book Company',
      creator: 'USC Ticketing System v2.0',
    });

    // Helper function to draw a ticket - SIMPLIFIED for senior-friendly reading
    const drawTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;
      const borderColor: [number, number, number] = [219, 39, 119]; // Pink (pink-600)
      const accentColor: [number, number, number] = [219, 39, 119]; // Pink (pink-600)

      // Background - light pink
      doc.setFillColor(253, 242, 248); // pink-50
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
      doc.text("Valentine's Day Dance", textCenterX, y + 0.35, { align: 'center' });

      // Date and time - LARGE ON SAME LINE, centered in text area
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Saturday, Feb 14 • 6:00 PM', textCenterX, y + 0.6, { align: 'center' });

      // Important info - LARGE, centered in text area
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Live Music
      doc.text('Live Music & Dancing', textCenterX, y + 0.85, { align: 'center' });
      doc.text('Doors Open 6pm • Dance 7-10pm', textCenterX, y + 1.03, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Light Refreshments', textCenterX, y + 1.21, { align: 'center' });

      // Guest name - anchored from bottom like customer PDF
      const guestY = y + height - 0.5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...accentColor);
      doc.text(`${customerName} #${ticket.ticketNumber}`, textCenterX, guestY, { align: 'center' });

      // Location - bottom
      const footerY1 = y + height - 0.3;
      const footerY2 = y + height - 0.15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Bartlett Event Center', textCenterX, footerY1, { align: 'center' });
      doc.text('495 Leslie St • (707) 462-4343 ext 209', textCenterX, footerY2, { align: 'center' });
    };

    // Layout tickets in 2x4 grid (8 per page) - optimized for 8.5x11
    const cols = 2;
    const rows = 4;
    const ticketsPerPage = cols * rows;
    const startX = 0.75;
    const startY = 0.5;
    const gapX = 0.25;
    const gapY = 0.2;

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
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Validate PDF size
    validatePDFSize(pdfBuffer);
    
    // Log success metrics
    console.info('[Bookstore Valentine\'s PDF] Generated successfully', {
      totalTickets: tickets.length,
      valentinesTickets: 20,
      sizeBytes: pdfBuffer.length,
      sizeMB: (pdfBuffer.length / (1024 * 1024)).toFixed(2),
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Mendocino-Book-Company-Valentines-Tickets-${Date.now()}.pdf"`,
        'X-PDF-Size-Bytes': pdfBuffer.length.toString(),
        'X-Ticket-Count': tickets.length.toString(),
      },
    });
    
  } catch (error) {
    // Comprehensive error handling
    const errorResponse = createPDFErrorResponse(error, 'Bookstore Valentine\'s PDF generation');
    
    console.error('[Bookstore Valentine\'s PDF] Generation failed:', {
      ...errorResponse,
      durationMs: Date.now() - startTime,
    });
    
    return NextResponse.json(errorResponse, { 
      status: error instanceof Error && error.name === 'PDFValidationError' ? 400 : 500 
    });
  }
}
