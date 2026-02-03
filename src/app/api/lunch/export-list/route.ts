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
  Notes?: string; // aka "Special Request" in the UI
  Amount?: number;
  LunchCardId?: string; // Linked lunch card record ID
  LunchCardRemaining?: number; // Remaining meals on lunch card
  InFridge?: boolean; // Wants meal left in fridge
}

// Dietary/special request keywords to detect
const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian', 'veggie', 'veg', 'vegetable'],
  glutenFree: ['gluten-free', 'gluten free', 'gf', 'no gluten'],
  noDessert: ['no dessert', 'no desert'],
  noGarlic: ['no garlic'],
  noOnions: ['no onions', 'no onion'],
  dairyFree: ['dairy-free', 'dairy free', 'no dairy', 'lactose'],
  inFridge: ['in fridge', 'fridge', 'leave in fridge'],
};

// Parse notes to extract dietary restrictions (returns array of detected types)
function parseDietaryRestrictions(notes: string): string[] {
  if (!notes) return [];
  const lower = notes.toLowerCase();
  const detected: string[] = [];
  
  // Check for each dietary keyword
  if (DIETARY_KEYWORDS.vegetarian.some(k => lower.includes(k))) detected.push('Vegetarian');
  if (DIETARY_KEYWORDS.glutenFree.some(k => lower.includes(k))) detected.push('Gluten-Free');
  if (DIETARY_KEYWORDS.noDessert.some(k => lower.includes(k))) detected.push('No Dessert');
  if (DIETARY_KEYWORDS.noGarlic.some(k => lower.includes(k))) detected.push('No Garlic');
  if (DIETARY_KEYWORDS.noOnions.some(k => lower.includes(k))) detected.push('No Onions');
  if (DIETARY_KEYWORDS.dairyFree.some(k => lower.includes(k))) detected.push('Dairy-Free');
  if (DIETARY_KEYWORDS.inFridge.some(k => lower.includes(k))) detected.push('In Fridge');
  
  return detected;
}

// Clean up notes to remove system/internal markers and keep only meaningful content
function cleanNotes(notes: string): string {
  if (!notes) return '';
  
  // Remove common system markers
  const cleaned = notes
    .replace(/handwritten/gi, '')
    .replace(/handwritten entry/gi, '')
    .replace(/handwritten;?\s*/gi, '')
    .replace(/DIET:\s*/gi, '')
    .replace(/pink highlight\s*['"]\+['"]/gi, '')
    .replace(/pink highlight/gi, '')
    .replace(/green highlight[^|]*/gi, '')
    .replace(/highlighted/gi, '')
    .replace(/\(Highlighted\)/gi, '')
    .replace(/marked\s*['"][^'"]+['"]\s*with\s*/gi, '')
    .replace(/\s*\|\s*\|\s*/g, ' | ') // Fix double pipes
    .replace(/^\s*\|\s*/g, '') // Remove leading pipe
    .replace(/\s*\|\s*$/g, '') // Remove trailing pipe
    .trim();
  
  // If only system markers remain or is empty after cleaning, return empty
  if (cleaned.length < 2) return '';
  
  return cleaned;
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

    const reservations: Reservation[] = allRecords.map((record) => {
      // Get linked lunch card ID (Airtable stores linked records as arrays)
      const lunchCardLinks = record.fields['Lunch Card'] as string[] | undefined;
      const lunchCardId = lunchCardLinks?.[0];
      
      return {
        id: record.id,
        Name: record.fields['Name'] as string || '',
        Date: record.fields['Date'] as string || '',
        'Meal Type': record.fields['Meal Type'] as string || '',
        'Member Status': record.fields['Member Status'] as string || '',
        'Payment Method': record.fields['Payment Method'] as string || '',
        Notes: record.fields['Notes'] as string || '',
        Amount: record.fields['Amount'] as number || 0,
        LunchCardId: lunchCardId,
      };
    });

    // Fetch lunch card remaining meals for reservations that use lunch cards
    const lunchCardIds = [...new Set(reservations.filter(r => r.LunchCardId).map(r => r.LunchCardId!))];
    
    if (lunchCardIds.length > 0 && process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID) {
      // Fetch lunch cards in batch using OR formula
      const cardFilter = `OR(${lunchCardIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
      const cardUrl = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}?filterByFormula=${encodeURIComponent(cardFilter)}`;
      
      const cardResponse = await fetch(cardUrl, {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });
      
      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        const cardMap = new Map<string, number>();
        
        for (const card of cardData.records) {
          cardMap.set(card.id, card.fields['Remaining Meals'] as number || 0);
        }
        
        // Update reservations with remaining meals
        for (const res of reservations) {
          if (res.LunchCardId && cardMap.has(res.LunchCardId)) {
            res.LunchCardRemaining = cardMap.get(res.LunchCardId);
          }
        }
      }
    }

    // Fetch Weekly Delivery customers (auto-include Mon-Thu, + frozen Fri on Thu)
    const targetDate = new Date(date + 'T12:00:00');
    const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4; // Mon-Thu
    const isThursday = dayOfWeek === 4;
    
    // Track names already in reservations to avoid duplicates
    const existingNames = new Set(reservations.map(r => r.Name.toLowerCase().trim()));
    
    if (isWeekday && process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID) {
      // Fetch all active weekly delivery customers
      const weeklyFilter = `AND({Weekly Delivery}, {Remaining Meals} > 0)`;
      const weeklyUrl = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}?filterByFormula=${encodeURIComponent(weeklyFilter)}`;
      
      const weeklyResponse = await fetch(weeklyUrl, {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });
      
      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        
        for (const card of weeklyData.records) {
          const cardName = card.fields['Name'] as string || 'Unknown';
          const memberStatus = card.fields['Member Status'] as string || 'Member';
          const deliveryAddress = card.fields['Delivery Address'] as string || '';
          const includeFrozenFriday = card.fields['Include Frozen Friday'] as boolean || false;
          const remainingMeals = card.fields['Remaining Meals'] as number || 0;
          
          // Skip if this customer already has a manual reservation for today
          if (existingNames.has(cardName.toLowerCase().trim())) {
            continue;
          }
          
          // Add regular daily delivery
          reservations.push({
            id: `weekly-${card.id}`,
            Name: cardName,
            Date: date,
            'Meal Type': 'Delivery',
            'Member Status': memberStatus,
            'Payment Method': 'Prepaid Weekly',
            Notes: deliveryAddress ? `📍 ${deliveryAddress}` : '',
            Amount: 0,
            LunchCardId: card.id,
            LunchCardRemaining: remainingMeals,
          });
          
          // On Thursday, also add frozen Friday meal
          if (isThursday && includeFrozenFriday) {
            reservations.push({
              id: `weekly-fri-${card.id}`,
              Name: cardName,
              Date: date,
              'Meal Type': 'Delivery',
              'Member Status': memberStatus,
              'Payment Method': 'Prepaid Weekly',
              Notes: `🧊 FROZEN FRIDAY | ${deliveryAddress ? `📍 ${deliveryAddress}` : ''}`.trim(),
              Amount: 0,
              LunchCardId: card.id,
              LunchCardRemaining: remainingMeals,
            });
          }
        }
      }
    }

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

    // Calculate meal type counts
    const dineInCount = reservations.filter(r => r['Meal Type'] === 'Dine In').length;
    const toGoCount = reservations.filter(r => r['Meal Type'] === 'To Go').length;
    const deliveryCount = reservations.filter(r => r['Meal Type'] === 'Delivery').length;

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

    // Column widths: #, Name, Type, Status, Paid, Special Requests, Meals Remaining
    const colWidths = [0.35, 1.9, 0.7, 0.85, 0.5, 1.8, 1.4];

    // Helper function to draw a colored pill/badge
    const drawPill = (text: string, x: number, yPos: number, bgColor: [number, number, number], textColor: [number, number, number] = [255, 255, 255]) => {
      doc.setFontSize(9);
      const textWidth = doc.getTextWidth(text);
      const pillWidth = textWidth + 0.15;
      const pillHeight = 0.22;
      
      // Draw rounded rectangle
      doc.setFillColor(...bgColor);
      doc.roundedRect(x, yPos - 0.15, pillWidth, pillHeight, 0.05, 0.05, 'F');
      
      // Draw text
      doc.setTextColor(...textColor);
      doc.text(text, x + 0.075, yPos);
      
      return pillWidth + 0.1; // Return width for positioning next pill
    };

    // Helper function to draw table header (2 rows for long headers)
    const drawTableHeader = () => {
      doc.setFillColor(66, 125, 120);
      doc.rect(margin, y, contentWidth, 0.45, 'F'); // Taller header for 2 lines
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      let hx = margin + 0.05;
      
      // Row 1 headers
      doc.text('#', hx, y + 0.18);
      hx += colWidths[0];
      
      doc.text('Name', hx, y + 0.18);
      hx += colWidths[1];
      
      doc.text('Type', hx, y + 0.18);
      hx += colWidths[2];
      
      doc.text('Status', hx, y + 0.18);
      hx += colWidths[3];
      
      doc.text('Paid', hx, y + 0.18);
      hx += colWidths[4];
      
      // Multi-line header: Special Requests
      doc.text('Special', hx, y + 0.13);
      doc.text('Requests', hx, y + 0.28);
      hx += colWidths[5];
      
      // Multi-line header: Meals Remaining
      doc.text('Meals', hx, y + 0.13);
      doc.text('Remaining', hx, y + 0.28);
      
      y += 0.5;
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

    // Calculate dietary totals
    let vegetarianCount = 0;
    let glutenFreeCount = 0;
    let noDessertCount = 0;
    let noGarlicCount = 0;
    let noOnionsCount = 0;
    let dairyFreeCount = 0;
    let inFridgeCount = 0;
    
    for (const res of reservations) {
      const cleanedNotes = cleanNotes(res.Notes || '');
      const dietary = parseDietaryRestrictions(cleanedNotes);
      if (dietary.includes('Vegetarian')) vegetarianCount++;
      if (dietary.includes('Gluten-Free')) glutenFreeCount++;
      if (dietary.includes('No Dessert')) noDessertCount++;
      if (dietary.includes('No Garlic')) noGarlicCount++;
      if (dietary.includes('No Onions')) noOnionsCount++;
      if (dietary.includes('Dairy-Free')) dairyFreeCount++;
      if (dietary.includes('In Fridge') || res.InFridge) inFridgeCount++;
    }

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
    
    // Stats row 1 - Meal type pills with distinct colors
    y += 0.75;
    doc.setFont('helvetica', 'bold');
    let pillX = margin;
    
    // Total pill (dark gray)
    pillX += drawPill(`Total: ${reservations.length}`, pillX, y, [80, 80, 80]);
    
    // Dine In pill (teal/green)
    pillX += drawPill(`Dine In: ${dineInCount}`, pillX, y, [66, 125, 120]);
    
    // To Go pill (orange)
    pillX += drawPill(`To Go: ${toGoCount}`, pillX, y, [230, 126, 34]);
    
    // Delivery pill (blue) - no need to capture return value
    drawPill(`Delivery: ${deliveryCount}`, pillX, y, [52, 152, 219]);
    
    // Stats row 2 - Dietary totals
    y += 0.35;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const dietaryStats = [
      `Vegetarian: ${vegetarianCount}`,
      `Gluten-Free: ${glutenFreeCount}`,
      `No Dessert: ${noDessertCount}`,
      `No Garlic: ${noGarlicCount}`,
      `No Onions: ${noOnionsCount}`,
      `Dairy-Free: ${dairyFreeCount}`,
      `In Fridge: ${inFridgeCount}`,
    ].join('  |  ');
    
    doc.text(dietaryStats, margin, y);
    
    y += 0.35;

    // Table header (first page)
    drawTableHeader();

    // Table rows
    let x = margin; // row x position
    
    reservations.forEach((res, index) => {
      checkNewPage(0.28);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 0.05, contentWidth, 0.28, 'F');
      }
      
      x = margin + 0.05;
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      // Row number
      doc.text(String(index + 1), x, y + 0.12);
      x += colWidths[0];
      
      // Name (truncate if too long)
      const name = res.Name.length > 24 ? res.Name.substring(0, 22) + '...' : res.Name;
      doc.setFont('helvetica', 'bold');
      doc.text(name, x, y + 0.12);
      doc.setFont('helvetica', 'normal');
      x += colWidths[1];
      
      // Meal Type - written out fully
      doc.text(res['Meal Type'] || '', x, y + 0.12);
      x += colWidths[2];
      
      // Member Status - written out fully
      doc.text(res['Member Status'] || '', x, y + 0.12);
      x += colWidths[3];
      
      // Paid column - simple checkmark or empty
      const payment = res['Payment Method'] || '';
      const isPaid = payment === 'Cash' || payment === 'Check' || payment === 'Card (Zeffy)' || 
                     payment === 'Lunch Card' || payment === 'Prepaid Weekly' || payment === 'Comp Card';
      doc.setFontSize(10);
      if (isPaid) {
        doc.setTextColor(0, 128, 0);
        doc.text('✓', x + 0.1, y + 0.13);
      }
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      x += colWidths[4];
      
      // Special Requests - extract and display dietary restrictions with color coding
      const cleanedNotes = cleanNotes(res.Notes || '');
      const dietary = parseDietaryRestrictions(cleanedNotes);
      
      if (dietary.length > 0) {
        doc.setFontSize(7);
        let reqX = x;
        const reqY = y + 0.08;
        
        for (const item of dietary) {
          // Color code different dietary items
          if (item === 'Vegetarian') {
            doc.setTextColor(34, 139, 34); // Forest green
            doc.setFont('helvetica', 'bold');
          } else if (item === 'No Dessert') {
            doc.setTextColor(139, 69, 19); // Saddle brown
            doc.setFont('helvetica', 'bold');
          } else if (item === 'No Garlic' || item === 'No Onions') {
            doc.setTextColor(128, 0, 128); // Purple
            doc.setFont('helvetica', 'bold');
          } else if (item === 'Gluten-Free') {
            doc.setTextColor(184, 134, 11); // Dark goldenrod
            doc.setFont('helvetica', 'bold');
          } else if (item === 'Dairy-Free') {
            doc.setTextColor(0, 0, 139); // Dark blue
            doc.setFont('helvetica', 'bold');
          } else if (item === 'In Fridge') {
            doc.setTextColor(0, 128, 255); // Bright blue
            doc.setFont('helvetica', 'bold');
          }
          
          const itemText = item + (dietary.indexOf(item) < dietary.length - 1 ? ', ' : '');
          doc.text(itemText, reqX, reqY + 0.05);
          reqX += doc.getTextWidth(itemText);
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      }
      x += colWidths[5];
      
      // Meals Remaining column
      doc.setFontSize(8);
      if (res.LunchCardRemaining !== undefined) {
        const remaining = res.LunchCardRemaining;
        
        // Color-code based on remaining meals
        if (remaining <= 1) {
          // Red highlight for 1-2 remaining
          doc.setFillColor(255, 200, 200);
          doc.rect(x - 0.05, y - 0.03, colWidths[6] - 0.1, 0.24, 'F');
          doc.setTextColor(139, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${remaining}`, x, y + 0.12);
          // Warning emoji for 1 remaining
          if (remaining === 1) {
            doc.text(' ⚠️', x + 0.15, y + 0.12);
          }
        } else if (remaining === 2) {
          // Red highlight for 2 remaining
          doc.setFillColor(255, 200, 200);
          doc.rect(x - 0.05, y - 0.03, colWidths[6] - 0.1, 0.24, 'F');
          doc.setTextColor(139, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${remaining}`, x, y + 0.12);
        } else if (remaining === 3) {
          // Yellow highlight for 3 remaining
          doc.setFillColor(255, 255, 200);
          doc.rect(x - 0.05, y - 0.03, colWidths[6] - 0.1, 0.24, 'F');
          doc.setTextColor(139, 119, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${remaining}`, x, y + 0.12);
        } else {
          // Normal display for 4+ remaining
          doc.setTextColor(0, 0, 0);
          doc.text(`${remaining}`, x, y + 0.12);
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      } else {
        // No lunch card
        doc.setTextColor(150, 150, 150);
        doc.text('N/A', x, y + 0.12);
        doc.setTextColor(0, 0, 0);
      }
      
      y += 0.25;
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
