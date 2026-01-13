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
 * Generate event ticket PDFs for 2026 events
 * - Valentine's Day Dance (pink theme)
 * - Speakeasy Gala (gold/dark theme)
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
    
    const {
      firstName,
      lastName,
      valentinesMember,
      valentinesNonMember,
      speakeasy,
    } = validation.data;

    const customerName = `${firstName} ${lastName}`;
    
    // Load logo asynchronously (cached after first call)
    const logoBase64 = await getUSCLogo();
    
    const tickets: Array<{
      eventName: string;
      eventType: 'valentines' | 'speakeasy';
      ticketNumber: number;
      totalTickets: number;
    }> = [];

    // Generate Valentine's tickets
    const totalValentines = valentinesMember + valentinesNonMember;
    for (let i = 0; i < totalValentines; i++) {
      tickets.push({
        eventName: "Valentine's Day Dance",
        eventType: 'valentines',
        ticketNumber: i + 1,
        totalTickets: totalValentines,
      });
    }

    // Generate Speakeasy tickets
    for (let i = 0; i < speakeasy; i++) {
      tickets.push({
        eventName: 'An Affair to Remember',
        eventType: 'speakeasy',
        ticketNumber: i + 1,
        totalTickets: speakeasy,
      });
    }

    // Create PDF document with proper metadata
    const doc = createUSCPDF({
      title: 'Event Tickets',
      author: 'Ukiah Senior Center',
      subject: `Tickets for ${customerName}`,
      creator: 'USC Ticketing System v3.0',
    });

    // Helper function to draw Valentine's ticket (PINK theme)
    const drawValentinesTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;

      // Pink gradient-like background
      doc.setFillColor(...USC_COLORS.PINK_LIGHT);
      doc.rect(x, y, width, height, 'F');

      // Pink border
      doc.setDrawColor(...USC_COLORS.PINK);
      doc.setLineWidth(0.04);
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Logo
      if (logoBase64) {
        const logoWidth = width * 0.28;
        const logoHeight = logoWidth;
        const logoX = x + 0.1;
        const logoY = y + (height - logoHeight) / 2;
        try {
          doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          console.error('[Tickets PDF] Error adding logo:', e);
        }
      }

      // Text area
      const logoWidth = logoBase64 ? width * 0.28 : 0;
      const textStartX = x + logoWidth + 0.2;
      const textWidth = width * (logoBase64 ? 0.72 : 1.0) - 0.3;
      const textCenterX = textStartX + textWidth / 2;
      
      let textY = y + 0.26;

      // Event Title with heart
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.PINK);
      doc.text("💕 Valentine's Day Dance", textCenterX, textY, { align: 'center' });

      textY += 0.22;

      // Date
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.BLACK);
      doc.text('Saturday, February 14, 2026', textCenterX, textY, { align: 'center' });

      textY += 0.18;

      // Time & Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Doors Open 6pm • Dance 7-10pm', textCenterX, textY, { align: 'center' });

      textY += 0.16;
      doc.setFontSize(9);
      doc.text('Music • Dancing • Refreshments', textCenterX, textY, { align: 'center' });

      // Guest Name
      const guestY = y + height - 0.42;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.PINK);
      const guestText = `${customerName} • ${ticket.ticketNumber} of ${ticket.totalTickets}`;
      doc.text(guestText, textCenterX, guestY, { align: 'center' });

      // Footer
      const footerY = y + height - 0.22;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.BLACK);
      const footer = '495 Leslie St, Ukiah • (707) 462-4343 ext 209';
      doc.text(footer, x + width / 2, footerY, { align: 'center' });
    };

    // Helper function to draw Speakeasy ticket (Gold/Dark theme)
    const drawSpeakeasyTicket = (ticket: typeof tickets[0], x: number, y: number) => {
      const width = 3.5;
      const height = 2;

      // Dark navy background
      doc.setFillColor(...USC_COLORS.DARK_NAVY);
      doc.rect(x, y, width, height, 'F');

      // Gold border
      doc.setDrawColor(...USC_COLORS.GOLD);
      doc.setLineWidth(0.05);
      doc.roundedRect(x, y, width, height, 0.05, 0.05);

      // Inner gold border for art deco feel
      doc.setLineWidth(0.02);
      doc.roundedRect(x + 0.08, y + 0.08, width - 0.16, height - 0.16, 0.03, 0.03);

      // Logo (optional - may skip for dark theme)
      if (logoBase64) {
        const logoWidth = width * 0.22;
        const logoHeight = logoWidth;
        const logoX = x + 0.12;
        const logoY = y + (height - logoHeight) / 2;
        try {
          doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          console.error('[Tickets PDF] Error adding logo:', e);
        }
      }

      // Text area
      const logoWidth = logoBase64 ? width * 0.22 : 0;
      const textStartX = x + logoWidth + 0.18;
      const textWidth = width * (logoBase64 ? 0.78 : 1.0) - 0.3;
      const textCenterX = textStartX + textWidth / 2;
      
      let textY = y + 0.24;

      // Event Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.GOLD);
      doc.text('An Affair to Remember', textCenterX, textY, { align: 'center' });

      textY += 0.18;

      // Subtitle
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('🎭 A Night at the Speakeasy', textCenterX, textY, { align: 'center' });

      textY += 0.20;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.WHITE);
      doc.text('Saturday, April 11, 2026', textCenterX, textY, { align: 'center' });

      textY += 0.16;

      // Time
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Doors 6pm • Entertainment 7-10pm', textCenterX, textY, { align: 'center' });

      // Guest Name
      const guestY = y + height - 0.40;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.GOLD);
      const guestText = `${customerName} • ${ticket.ticketNumber} of ${ticket.totalTickets}`;
      doc.text(guestText, textCenterX, guestY, { align: 'center' });

      // Footer
      const footerY = y + height - 0.20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...USC_COLORS.WHITE);
      const footer = '495 Leslie St, Ukiah • (707) 462-4343 ext 209';
      doc.text(footer, x + width / 2, footerY, { align: 'center' });
    };

    // Layout tickets in 2x4 grid (8 per page)
    let ticketIndex = 0;
    const ticketsPerPage = 8;
    for (let pageIndex = 0; pageIndex < Math.ceil(tickets.length / ticketsPerPage); pageIndex++) {
      if (pageIndex > 0) doc.addPage();
      
      for (let i = 0; i < ticketsPerPage && ticketIndex < tickets.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = 0.5 + col * 3.75;
        const y = 0.5 + row * 2.2;
        
        const ticket = tickets[ticketIndex];
        if (ticket.eventType === 'valentines') {
          drawValentinesTicket(ticket, x, y);
        } else {
          drawSpeakeasyTicket(ticket, x, y);
        }
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
      valentinesTickets: totalValentines,
      speakeasyTickets: speakeasy,
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
