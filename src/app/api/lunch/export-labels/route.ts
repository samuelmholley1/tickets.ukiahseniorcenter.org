import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { validatePDFSize } from '@/lib/pdfUtils';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Avery 5160 Label Specifications (standard mailing labels)
 * Sheet: 8.5" x 11" letter
 * Labels per sheet: 30 (3 columns x 10 rows)
 * Label size: 2.625" x 1" (2-5/8" x 1")
 * Top margin: 0.5"
 * Left margin: 0.1875" (3/16")
 * Horizontal gap: 0.125" (1/8")
 * Vertical gap: 0" (labels touch vertically)
 */
const AVERY_5160 = {
  pageWidth: 8.5,
  pageHeight: 11,
  cols: 3,
  rows: 10,
  labelWidth: 2.625,
  labelHeight: 1,
  topMargin: 0.5,
  leftMargin: 0.1875,
  hGap: 0.125,
  vGap: 0,
};

interface Reservation {
  id: string;
  Name: string;
  Date: string;
  'Meal Type': string;
  'Member Status': string;
  'Payment Method': string;
  Notes?: string; // aka "Special Request" in the UI
}

/**
 * GET /api/lunch/export-labels?date=YYYY-MM-DD
 * Generate Avery 5160 labels for lunch reservations
 * Each label shows: Name, Meal Type, Member Status, Notes
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
    }));

    // Filter out Dine In - labels only needed for To Go and Delivery
    const labelReservations = reservations.filter(r => 
      r['Meal Type'] === 'To Go' || r['Meal Type'] === 'Delivery'
    );

    // Sort by last name alphabetically
    labelReservations.sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };
      return getLastName(a.Name).localeCompare(getLastName(b.Name));
    });

    // Create PDF - Letter size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const { cols, rows, labelWidth, labelHeight, topMargin, leftMargin, hGap } = AVERY_5160;
    const labelsPerPage = cols * rows;

    // Format date for display on labels
    const dateObj = new Date(date + 'T12:00:00');
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Draw each label
    labelReservations.forEach((res, index) => {
      // Add new page if needed
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage();
      }

      // Calculate position
      const pageIndex = index % labelsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = leftMargin + col * (labelWidth + hGap);
      const y = topMargin + row * labelHeight;

      // Draw label border (light gray, helps with alignment when printing)
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.01);
      doc.rect(x, y, labelWidth, labelHeight);

      // Padding inside label
      const px = 0.08; // horizontal padding
      const py = 0.1;  // vertical padding

      // Row 1: Name (large, bold)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Truncate name if too long
      let name = res.Name;
      if (name.length > 24) {
        name = name.substring(0, 22) + '...';
      }
      doc.text(name, x + px, y + py + 0.12);

      // Row 2: Meal Type & Member Status
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const mealType = res['Meal Type'] || 'Unknown';
      const memberStatus = res['Member Status'] === 'Member' ? 'M' : 'NM';
      
      // Color code meal type
      if (mealType === 'Delivery') {
        doc.setTextColor(180, 0, 0); // Red for delivery
      } else if (mealType === 'To Go') {
        doc.setTextColor(0, 100, 180); // Blue for to-go
      } else {
        doc.setTextColor(0, 120, 0); // Green for dine-in
      }
      
      doc.text(`${mealType} (${memberStatus})`, x + px, y + py + 0.32);

      // Row 3: Date and Notes (small)
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      
      let bottomLine = shortDate;
      if (res.Notes && res.Notes.trim()) {
        // Truncate notes to fit
        const notes = res.Notes.length > 25 ? res.Notes.substring(0, 23) + '...' : res.Notes;
        bottomLine += ` | ${notes}`;
      }
      doc.text(bottomLine, x + px, y + py + 0.52);

      // Number badge in corner (for counting/verification)
      doc.setFillColor(66, 125, 120);
      const badgeRadius = 0.12;
      const badgeCenterX = x + labelWidth - 0.18;
      const badgeCenterY = y + 0.18;
      doc.circle(badgeCenterX, badgeCenterY, badgeRadius, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const numText = String(index + 1);
      // Center text in badge
      const textWidth = doc.getTextWidth(numText);
      doc.text(numText, badgeCenterX - textWidth / 2, badgeCenterY + 0.03);
    });

    // If no To Go/Delivery reservations, add a message
    if (labelReservations.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      const dineInCount = reservations.filter(r => r['Meal Type'] === 'Dine In').length;
      const message = dineInCount > 0 
        ? `No To Go or Delivery meals for this date (${dineInCount} Dine In only)`
        : 'No reservations for this date';
      doc.text(message, AVERY_5160.pageWidth / 2, AVERY_5160.pageHeight / 2, { align: 'center' });
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    validatePDFSize(pdfBuffer);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lunch-labels-${date}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Lunch labels export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
