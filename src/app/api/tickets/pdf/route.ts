import { NextRequest, NextResponse } from 'next/server';
import {
  getUSCLogo,
  createUSCPDF,
  validatePDFSize,
  createPDFErrorResponse,
  USC_COLORS,
} from '@/lib/pdfUtils';
import { validateTicketRequest } from '@/lib/ticketValidation';

/**
 * POST /api/tickets/pdf
 * Generate event ticket PDFs with enterprise-grade error handling
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = validateTicketRequest(body);
    
    if (!validation.success || !validation.data) {
      console.warn('[Tickets PDF] Validation failed:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Invalid request',
          code: 'VALIDATION_FAILED',
          details: validation.errors,
        },
        { status: 400 }
      );
    }
    
    // TypeScript now knows validation.data is defined
    const {
      firstName,
      lastName,
      christmasMember,
      christmasNonMember,
      nyeMember,
      nyeNonMember,
    } = validation.data;

    const customerName = `${firstName} ${lastName}`;
    
    // Load logo asynchronously (cached after first call)
    const logoBase64 = await getUSCLogo();
    
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
        eventName: "New Year's Eve Gala",
        isNYE: true,
        ticketNumber: i + 1,
        totalTickets: totalNYE,
      });
    }

    // Create PDF document with proper metadata
    const doc = createUSCPDF({
      title: 'Event Tickets',
      author: 'Ukiah Senior Center',
      subject: `Tickets for ${customerName}`,
      creator: 'USC Ticketing System v2.0',
    });

    // Helper function to draw a senior-friendly ticket
    const drawTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;
      const isNYE = ticket.isNYE;
      const borderColor = isNYE ? USC_COLORS.PURPLE : USC_COLORS.TEAL;

      // Background - pure white like bookstore cards
      doc.setFillColor(...USC_COLORS.WHITE);
      doc.rect(x, y, width, height, 'F');

      // Border - thicker like bookstore (3px)
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.04); // ~3pt to match bookstore
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Logo - 30% width on left side (gracefully handle missing logo)
      if (logoBase64) {
        const logoWidth = width * 0.3;
        const logoHeight = logoWidth; // Keep square
        const logoX = x + 0.1;
        const logoY = y + (height - logoHeight) / 2; // Vertically centered
        try {
          doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          console.error('[Tickets PDF] Error adding logo:', e);
          // Continue without logo
        }
      }

      // Text area - right 70% with better spacing
      const logoWidth = logoBase64 ? width * 0.3 : 0;
      const textStartX = x + logoWidth + 0.2;
      const textWidth = width * (logoBase64 ? 0.7 : 1.0) - 0.3;
      const textCenterX = textStartX + textWidth / 2;
      
      let textY = y + 0.28;

      // Event Title - 16pt centered in text area (balanced for 2" height)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const title = isNYE ? "New Year's Eve Gala" : 'Christmas Drive-Thru';
      doc.text(title, textCenterX, textY, { align: 'center' });

      textY += 0.20;

      // Date & Time - 11pt centered in text area
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.BLACK);
      const dateTime = isNYE 
        ? 'Wed Dec 31, 7-10pm'
        : 'Tues Dec 23, 12-12:30pm';
      doc.text(dateTime, textCenterX, textY, { align: 'center' });

      textY += 0.18;

      // Key info lines - 10pt centered in text area
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...USC_COLORS.BLACK);
      
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
        
        textY += 0.16;
        doc.text('Appetizers & Dessert', textCenterX, textY, { align: 'center' });
        textY += 0.16;
        doc.setFontSize(9);
        doc.text('Ball Drops at 9pm', textCenterX, textY, { align: 'center' });
      } else {
        doc.text('Prime Rib & Dessert', textCenterX, textY, { align: 'center' });
        textY += 0.16;
        doc.text('Drive-Thru Pickup', textCenterX, textY, { align: 'center' });
      }

      // Guest Name - 10pt centered in text area
      const guestY = y + height - 0.42;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...borderColor);
      const guestText = `${customerName} • ${ticket.ticketNumber} of ${ticket.totalTickets}`;
      doc.text(guestText, textCenterX, guestY, { align: 'center' });

      // Footer - 8pt centered
      const footerY = y + height - 0.22;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.BLACK);
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
    
    // Validate PDF size
    validatePDFSize(pdfBuffer);
    
    // Log success metrics
    console.info('[Tickets PDF] Generated successfully', {
      customerName,
      totalTickets: tickets.length,
      christmasTickets: totalChristmas,
      nyeTickets: totalNYE,
      sizeBytes: pdfBuffer.length,
      sizeMB: (pdfBuffer.length / (1024 * 1024)).toFixed(2),
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tickets_${firstName}_${lastName}.pdf"`,
        'X-PDF-Size-Bytes': pdfBuffer.length.toString(),
        'X-Ticket-Count': tickets.length.toString(),
      },
    });
    
  } catch (error) {
    // Comprehensive error handling with proper logging
    const errorResponse = createPDFErrorResponse(error, 'Ticket PDF generation');
    
    console.error('[Tickets PDF] Generation failed:', {
      ...errorResponse,
      durationMs: Date.now() - startTime,
    });
    
    return NextResponse.json(errorResponse, { 
      status: error instanceof Error && error.name === 'PDFValidationError' ? 400 : 500 
    });
  }
}
