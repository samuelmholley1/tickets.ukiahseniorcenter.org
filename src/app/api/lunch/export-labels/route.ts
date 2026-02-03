import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { validatePDFSize } from '@/lib/pdfUtils';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Avery 5160 Label Specifications (standard mailing labels)
 * Sheet: 8.5" x 11" letter
 * Labels per sheet: 30 (3 columns x 10 rows)
 * Label size: 2.625" x 1" (2-5/8" x 1")
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
  Notes?: string;
  InFridge?: boolean;
}

// Hardcoded Coyote Valley delivery route - always in this exact order
const COYOTE_VALLEY_ROUTE = [
  { routeId: 'COYOTE VALLEY #1', name: 'Iris Martinez', address: '5875 Hwy 20' },
  { routeId: 'COYOTE VALLEY #2', name: 'Margaret Olea', address: '7601 N State St, Tribal Office' },
  { routeId: 'COYOTE VALLEY #3', name: 'Victor Olea', address: '7601 N State St, Tribal Office' },
  { routeId: 'COYOTE VALLEY #4', name: 'Michael Brown', address: '104 Coyote Valley Blvd.' },
  { routeId: 'COYOTE VALLEY #5', name: 'Guadalupe Munoz', address: '4 Shodakai Ct.' },
  { routeId: 'COYOTE VALLEY #6 + #7', name: 'Ronald Hoel Sr. & Sherry Knight', address: '128 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #8', name: 'Trudy Ramos', address: '129 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #9', name: 'John Feliz Sr.', address: '6 Coyote Valley Blvd.' },
];

// Clean notes to remove system markers
function cleanNotes(notes: string): string {
  if (!notes) return '';
  return notes
    .replace(/handwritten/gi, '')
    .replace(/\(handwritten\)/gi, '')
    .replace(/handwritten;?\s*/gi, '')
    .replace(/DIET:\s*/gi, '')
    .replace(/pink highlight[^|]*/gi, '')
    .replace(/green highlight[^|]*/gi, '')
    .replace(/highlighted/gi, '')
    .replace(/\s*\|\s*\|\s*/g, ' | ')
    .replace(/^\s*\|\s*/g, '')
    .replace(/\s*\|\s*$/g, '')
    .trim();
}

// Extract dietary/special requests from notes
function extractSpecialRequests(notes: string): string[] {
  if (!notes) return [];
  const lower = notes.toLowerCase();
  const requests: string[] = [];
  
  if (lower.includes('vegetarian')) requests.push('Vegetarian');
  if (lower.includes('gluten-free') || lower.includes('gluten free') || lower.includes('gf')) requests.push('Gluten-Free');
  if (lower.includes('no dessert')) requests.push('No Dessert');
  if (lower.includes('no garlic')) requests.push('No Garlic');
  if (lower.includes('no onion')) requests.push('No Onions');
  if (lower.includes('dairy-free') || lower.includes('dairy free') || lower.includes('no dairy')) requests.push('Dairy-Free');
  if (lower.includes('in fridge') || lower.includes('fridge')) requests.push('In Fridge');
  
  return requests;
}

// Check if name matches a Coyote Valley customer
// Uses strict matching to avoid false positives (e.g. "Michael" shouldn't match "Michael Brown")
function isCoyoteValleyCustomer(name: string): boolean {
  const resNameLower = name.toLowerCase().trim();
  if (resNameLower.length < 3) return false; // Ignore tiny names

  return COYOTE_VALLEY_ROUTE.some(cv => {
    const cvNames = cv.name.toLowerCase().split(/\s*&\s*/);
    return cvNames.some(targetName => {
      // 1. Exact match
      if (resNameLower === targetName) return true;
      
      // 2. Reservation matches full target name (e.g. "Michael Brown (Manager)")
      if (resNameLower.includes(targetName)) return true;
      
      // 3. Target matches full reservation name, BUT reservation must have space (First Last)
      // This prevents "Michael" from matching "Michael Brown"
      if (targetName.includes(resNameLower) && resNameLower.includes(' ')) return true;
      
      return false;
    });
  });
}

/**
 * GET /api/lunch/export-labels?date=YYYY-MM-DD
 * Generate Avery 5160 labels for lunch reservations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required (YYYY-MM-DD)' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID) {
      throw new Error('Airtable environment variables not configured');
    }

    // Fetch ALL reservations for the date
    const allRecords: Array<{ id: string; fields: Record<string, unknown> }> = [];
    let offset: string | undefined = undefined;
    const baseFilter = `filterByFormula=${encodeURIComponent(`IS_SAME({Date}, '${date}', 'day')`)}`;
    
    do {
      let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?${baseFilter}`;
      if (offset) url += `&offset=${offset}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });

      if (!response.ok) throw new Error('Failed to fetch reservations from Airtable');

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    const reservations: Reservation[] = allRecords.map((record) => ({
      id: record.id,
      Name: record.fields['Name'] as string || '',
      Date: record.fields['Date'] as string || '',
      'Meal Type': record.fields['Meal Type'] as string || '',
      'Member Status': record.fields['Member Status'] as string || '',
      'Payment Method': record.fields['Payment Method'] as string || '',
      Notes: record.fields['Notes'] as string || '',
      InFridge: record.fields['In Fridge'] as boolean || false,
    }));

    // Filter: labels only needed for To Go and Delivery
    const labelReservations = reservations.filter(r => 
      r['Meal Type'] === 'To Go' || r['Meal Type'] === 'Delivery'
    );

    // Separate Coyote Valley from others
    const coyoteValleyRes: Reservation[] = [];
    const otherRes: Reservation[] = [];
    
    for (const res of labelReservations) {
      if (res['Meal Type'] === 'Delivery' && isCoyoteValleyCustomer(res.Name)) {
        coyoteValleyRes.push(res);
      } else {
        otherRes.push(res);
      }
    }

    // Sort others by last name
    otherRes.sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };
      return getLastName(a.Name).localeCompare(getLastName(b.Name));
    });

    // Build label data
    interface LabelData {
      isCoyoteValley: boolean;
      routeId?: string;
      name: string;
      address?: string;
      mealType: string;
      memberStatus: string;
      specialRequests: string[];
      inFridge: boolean;
    }
    
    const allLabels: LabelData[] = [];
    
    // Coyote Valley labels FIRST in hardcoded order (one label per route stop)
    for (const cv of COYOTE_VALLEY_ROUTE) {
      const cvNames = cv.name.toLowerCase().split(/\s*&\s*/);
      
      // Find if ANY reservation matches this CV stop (using same strict logic)
      const hasReservation = coyoteValleyRes.some(res => isCoyoteValleyCustomer(res.Name) && 
        cvNames.some(targetName => {
          const resNameLower = res.Name.toLowerCase().trim();
          if (resNameLower === targetName) return true;
          if (resNameLower.includes(targetName)) return true;
          if (targetName.includes(resNameLower) && resNameLower.includes(' ')) return true;
          return false;
        })
      );
      
      if (hasReservation) {
        // Get notes from matching reservation for special requests
        const matchingRes = coyoteValleyRes.find(res => isCoyoteValleyCustomer(res.Name) &&
          cvNames.some(targetName => {
            const resNameLower = res.Name.toLowerCase().trim();
            if (resNameLower === targetName) return true;
            if (resNameLower.includes(targetName)) return true;
            if (targetName.includes(resNameLower) && resNameLower.includes(' ')) return true;
            return false;
          })
        );
        
        const notes = cleanNotes(matchingRes?.Notes || '');
        const specialReqs = extractSpecialRequests(notes);
        if (matchingRes?.InFridge) specialReqs.push('In Fridge');
        
        allLabels.push({
          isCoyoteValley: true,
          routeId: cv.routeId,
          name: cv.name,
          address: cv.address,
          mealType: 'Delivery',
          memberStatus: matchingRes?.['Member Status'] || 'Member',
          specialRequests: specialReqs,
          inFridge: matchingRes?.InFridge || false,
        });
      }
    }
    
    // Other labels
    for (const res of otherRes) {
      const notes = cleanNotes(res.Notes || '');
      const specialReqs = extractSpecialRequests(notes);
      if (res.InFridge) specialReqs.push('In Fridge');
      
      allLabels.push({
        isCoyoteValley: false,
        name: res.Name,
        mealType: res['Meal Type'],
        memberStatus: res['Member Status'],
        specialRequests: specialReqs,
        inFridge: res.InFridge || false,
      });
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const { cols, rows, labelWidth, labelHeight, topMargin, leftMargin, hGap } = AVERY_5160;
    const labelsPerPage = cols * rows;

    const dateObj = new Date(date + 'T12:00:00');
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Draw each label
    allLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % labelsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = leftMargin + col * (labelWidth + hGap);
      const y = topMargin + row * labelHeight;

      // Label border
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.01);
      doc.rect(x, y, labelWidth, labelHeight);

      const px = 0.08;
      const py = 0.08;

      if (label.isCoyoteValley) {
        // COYOTE VALLEY LABEL
        // Row 1: Route ID (bold, black)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(label.routeId || '', x + px, y + py + 0.12);

        // Row 2: Name
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        let name = label.name;
        if (name.length > 32) name = name.substring(0, 30) + '...';
        doc.text(name, x + px, y + py + 0.28);

        // Row 3: Address
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        const addr = label.address || '';
        doc.text(addr.length > 38 ? addr.substring(0, 36) + '...' : addr, x + px, y + py + 0.42);

        // Row 4: Special requests + In Fridge
        doc.setFontSize(7);
        if (label.specialRequests.length > 0) {
          doc.setTextColor(180, 0, 0);
          doc.setFont('helvetica', 'bold');
          const reqText = label.specialRequests.join(', ');
          doc.text(reqText.length > 40 ? reqText.substring(0, 38) + '...' : reqText, x + px, y + py + 0.56);
        } else {
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(shortDate, x + px, y + py + 0.56);
        }
      } else {
        // REGULAR LABEL
        // Row 1: Name (bold)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        let name = label.name;
        if (name.length > 26) name = name.substring(0, 24) + '...';
        doc.text(name, x + px, y + py + 0.12);

        // Row 2: Meal Type + Member Status (full word)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const mealType = label.mealType || 'Unknown';
        const memberStatus = label.memberStatus === 'Member' ? 'Member' : 'Non-Member';
        
        if (mealType === 'Delivery') {
          doc.setTextColor(180, 0, 0);
        } else if (mealType === 'To Go') {
          doc.setTextColor(0, 100, 180);
        } else {
          doc.setTextColor(0, 120, 0);
        }
        
        doc.text(`${mealType} · ${memberStatus}`, x + px, y + py + 0.30);

        // Row 3: Special Requests (red, bold if present)
        if (label.specialRequests.length > 0) {
          doc.setFontSize(8);
          doc.setTextColor(180, 0, 0);
          doc.setFont('helvetica', 'bold');
          const reqText = label.specialRequests.join(', ');
          doc.text(reqText.length > 35 ? reqText.substring(0, 33) + '...' : reqText, x + px, y + py + 0.46);
          
          // Row 4: Date
          doc.setFontSize(6);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(shortDate, x + px, y + py + 0.58);
        } else {
          // No special requests - just date
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(shortDate, x + px, y + py + 0.46);
        }
      }
    });

    // Empty message
    if (allLabels.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      const dineInCount = reservations.filter(r => r['Meal Type'] === 'Dine In').length;
      const message = dineInCount > 0 
        ? `No To Go or Delivery meals for this date (${dineInCount} Dine In only)`
        : 'No reservations for this date';
      doc.text(message, AVERY_5160.pageWidth / 2, AVERY_5160.pageHeight / 2, { align: 'center' });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    validatePDFSize(pdfBuffer);

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
