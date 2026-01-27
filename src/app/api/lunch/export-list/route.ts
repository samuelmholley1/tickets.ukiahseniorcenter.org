import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import {
  getUSCLogo,
  validatePDFSize,
  USC_COLORS,
} from '@/lib/pdfUtils';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface Reservation {
  id: string;
  Name: string;
  Date: string;
  'Meal Type': string;
  'Member Status': string;
  'Payment Method': string;
  Notes?: string;
  Amount?: number;
}

/**
 * GET /api/lunch/export-list?date=YYYY-MM-DD
 * Generate a PDF list of lunch reservations for a specific date
 * Sorted alphabetically by last name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required (YYYY-MM-DD)' }, { status: 400 });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    // Fetch ALL reservations for the date (handle Airtable pagination - 100 record limit per request)
    const allRecords: Array<{ id: string; fields: Record<string, unknown> }> = [];
    let offset: string | undefined = undefined;
    // Use IS_SAME for date comparison - Airtable date fields need proper date comparison, not string equality
    const baseFilter = `filterByFormula=${encodeURIComponent(`IS_SAME({Date}, '${date}', 'day')`)}`;
    
    do {
      let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?${baseFilter}`;
      if (offset) {
        url += `&offset=${offset}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations from Airtable');
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset; // Will be undefined if no more pages
    } while (offset);

    const reservations: Reservation[] = allRecords.map((record) => ({
      id: record.id,
      Name: record.fields['Name'] as string || '',
      Date: record.fields['Date'] as string || '',
      'Meal Type': record.fields['Meal Type'] as string || '',
      'Member Status': record.fields['Member Status'] as string || '',
      'Payment Method': record.fields['Payment Method'] as string || '',
      Notes: record.fields['Notes'] as string || '',
      Amount: record.fields['Amount'] as number || 0,
    }));

    // Sort by last name alphabetically
    reservations.sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };
      return getLastName(a.Name).localeCompare(getLastName(b.Name));
    });

    // Format date for display
    const dateObj = new Date(date + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Load logo
    const logoBase64 = await getUSCLogo();

    // Create PDF - Letter size, portrait
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const margin = 0.5;
    const contentWidth = pageWidth - (2 * margin);
    let y = margin;

    // Helper function to draw table header
    const drawTableHeader = () => {
      doc.setFillColor(66, 125, 120);
      doc.rect(margin, y, contentWidth, 0.3, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      let hx = margin + 0.05;
      doc.text('#', hx, y + 0.2);
      hx += colWidths[0];
      doc.text('Name', hx, y + 0.2);
      hx += colWidths[1];
      doc.text('Type', hx, y + 0.2);
      hx += colWidths[2];
      doc.text('Status', hx, y + 0.2);
      hx += colWidths[3];
      doc.text('Payment', hx, y + 0.2);
      hx += colWidths[4];
      doc.text('Notes', hx, y + 0.2);
      
      y += 0.35;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    };

    // Helper to add new page if needed
    const checkNewPage = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        // Reprint header on new page
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${formattedDate} (continued)`, margin, y + 0.15);
        y += 0.3;
        drawTableHeader();
        return true;
      }
      return false;
    };

    const colWidths = [0.4, 2.2, 0.8, 0.8, 1.0, 2.3]; // #, Name, Type, Status, Payment, Notes

    // Header
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', margin, y, 0.6, 0.6);
    }
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...USC_COLORS.TEAL);
    doc.text('Lunch Reservations', margin + 0.75, y + 0.25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(formattedDate, margin + 0.75, y + 0.45);
    
    // Stats
    const dineInCount = reservations.filter(r => r['Meal Type'] === 'Dine In').length;
    const toGoCount = reservations.filter(r => r['Meal Type'] === 'To Go').length;
    const deliveryCount = reservations.filter(r => r['Meal Type'] === 'Delivery').length;
    
    doc.setFontSize(10);
    doc.text(`Total: ${reservations.length} | Dine In: ${dineInCount} | To Go: ${toGoCount} | Delivery: ${deliveryCount}`, margin + 0.75, y + 0.6);
    
    y += 0.9;

    // Table header (first page)
    drawTableHeader();

    // Table rows
    let x = margin; // row x position
    
    reservations.forEach((res, index) => {
      checkNewPage(0.25);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 0.05, contentWidth, 0.25, 'F');
      }
      
      x = margin + 0.05;
      doc.setFontSize(8);
      
      // Row number
      doc.text(String(index + 1), x, y + 0.12);
      x += colWidths[0];
      
      // Name (truncate if too long)
      const name = res.Name.length > 28 ? res.Name.substring(0, 26) + '...' : res.Name;
      doc.setFont('helvetica', 'bold');
      doc.text(name, x, y + 0.12);
      doc.setFont('helvetica', 'normal');
      x += colWidths[1];
      
      // Meal Type (abbreviated)
      const typeAbbrev = res['Meal Type'] === 'Dine In' ? 'DI' : res['Meal Type'] === 'To Go' ? 'TG' : 'DEL';
      doc.text(typeAbbrev, x, y + 0.12);
      x += colWidths[2];
      
      // Member Status (abbreviated)
      const statusAbbrev = res['Member Status'] === 'Member' ? 'M' : 'NM';
      doc.text(statusAbbrev, x, y + 0.12);
      x += colWidths[3];
      
      // Payment (abbreviated)
      const payment = res['Payment Method'] || '';
      const payAbbrev = payment === 'Lunch Card' ? 'LC' : 
                        payment === 'Cash' ? 'Cash' : 
                        payment === 'Check' ? 'Chk' : 
                        payment === 'Cash & Check' ? 'C&C' :
                        payment === 'Card (Zeffy)' ? 'Card' :
                        payment === 'Comp Card' ? 'Comp' : payment.substring(0, 4);
      doc.text(payAbbrev, x, y + 0.12);
      x += colWidths[4];
      
      // Notes (truncate)
      const notes = res.Notes ? (res.Notes.length > 30 ? res.Notes.substring(0, 28) + '...' : res.Notes) : '';
      doc.setFontSize(7);
      doc.text(notes, x, y + 0.12);
      
      y += 0.22;
    });

    // Footer
    y += 0.3;
    if (y < pageHeight - 0.5) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      doc.text('Ukiah Senior Center - Lunch Program', pageWidth - margin - 2.2, y);
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    validatePDFSize(pdfBuffer);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lunch-list-${date}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Lunch list export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
