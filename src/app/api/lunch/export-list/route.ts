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
  Phone?: string; // Customer phone number
  ContactId?: string; // Linked Contact record ID
}

// Dietary/special request keywords to detect
const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian', 'veggie', 'veg', 'vegetable'],
  glutenFree: ['gluten-free', 'gluten free', 'gf', 'no gluten'],
  noDessert: ['no dessert', 'no desert'],
  noGarlicOnions: ['no garlic', 'no onion', 'no onions'], // Combined into one category
  dairyFree: ['dairy-free', 'dairy free', 'no dairy', 'lactose'],
  inFridge: ['in fridge', 'fridge', 'leave in fridge'],
};

// Parse notes to extract dietary restrictions (returns array of detected types)
// Also handles auto-fill for specific customers like Fulin Chang
function parseDietaryRestrictions(notes: string, name?: string): string[] {
  const lower = (notes || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const detected: string[] = [];
  
  // Fulin Chang ALWAYS gets Vegetarian + No Garlic/Onions
  if (nameLower.includes('fulin') || nameLower.includes('fu lin')) {
    detected.push('Vegetarian');
    detected.push('No Garlic/Onions');
  } else {
    if (DIETARY_KEYWORDS.vegetarian.some(k => lower.includes(k))) detected.push('Vegetarian');
    if (DIETARY_KEYWORDS.noGarlicOnions.some(k => lower.includes(k))) detected.push('No Garlic/Onions');
  }
  
  if (DIETARY_KEYWORDS.glutenFree.some(k => lower.includes(k))) detected.push('Gluten-Free');
  if (DIETARY_KEYWORDS.noDessert.some(k => lower.includes(k))) detected.push('No Dessert');
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
      
      // Get linked contact ID
      const contactLinks = record.fields['Contact'] as string[] | undefined;
      const contactId = contactLinks?.[0];
      
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
        ContactId: contactId,
      };
    });

    // 1. Fetch Phone Numbers from linked Contacts
    const contactIds = [...new Set(reservations.filter(r => r.ContactId).map(r => r.ContactId!))];
    const contactPhoneMap = new Map<string, string>();
    const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3PQZzXGpT991dH';
    
    if (contactIds.length > 0) {
      try {
        const contactFilter = `OR(${contactIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
        const contactUrl = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${CONTACTS_TABLE_ID}?filterByFormula=${encodeURIComponent(contactFilter)}`;
        
        const contactRes = await fetch(contactUrl, {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });
        
        if (contactRes.ok) {
          const contactData = await contactRes.json();
          for (const c of contactData.records) {
            const phone = (c.fields['Phone Cell'] || c.fields['Phone Home'] || c.fields['Phone']) as string;
            if (phone) contactPhoneMap.set(c.id, phone);
          }
        }
      } catch (e) {
        console.error('Failed to fetch contacts for list:', e);
      }
    }

    // 2. Fetch lunch card info (Remaining Meals + Phone)
    const lunchCardIds = [...new Set(reservations.filter(r => r.LunchCardId).map(r => r.LunchCardId!))];
    const cardPhoneMap = new Map<string, string>();
    
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
          // Also capture phone from card if available
          const phone = card.fields['Phone'] as string;
          if (phone) cardPhoneMap.set(card.id, phone);
        }
        
        // Update reservations with remaining meals AND phones
        for (const res of reservations) {
          if (res.LunchCardId && cardMap.has(res.LunchCardId)) {
            res.LunchCardRemaining = cardMap.get(res.LunchCardId);
          }
        }
      }
    }

    // 3. For reservations without explicit lunch card links, look up by name
    // This helps with handwritten entries that weren't linked to cards
    if (process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID) {
      const reservationsWithoutCard = reservations.filter(r => r.LunchCardRemaining === undefined && r.Name);
      
      if (reservationsWithoutCard.length > 0) {
        // Fetch ALL active lunch cards to do name matching
        const activeCardsUrl = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID}?filterByFormula=${encodeURIComponent('{Remaining Meals}>0')}`;
        
        const activeCardsResponse = await fetch(activeCardsUrl, {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });
        
        if (activeCardsResponse.ok) {
          const activeCardsData = await activeCardsResponse.json();
          
          // Build a map of lowercase name -> {remaining, phone}
          const nameToInfo = new Map<string, { remaining: number; phone?: string }>();
          for (const card of activeCardsData.records) {
            const cardName = (card.fields['Name'] as string || '').toLowerCase().trim();
            const remaining = card.fields['Remaining Meals'] as number || 0;
            const phone = card.fields['Phone'] as string;
            
            // If multiple cards for same name, use the one with more remaining meals
            if (!nameToInfo.has(cardName) || (nameToInfo.get(cardName)?.remaining || 0) < remaining) {
              nameToInfo.set(cardName, { remaining, phone });
            }
          }
          
          // Match reservations by name
          for (const res of reservationsWithoutCard) {
            const resName = res.Name.toLowerCase().trim();
            if (nameToInfo.has(resName)) {
              const info = nameToInfo.get(resName)!;
              res.LunchCardRemaining = info.remaining;
              // If we found a phone here and don't have one yet, use it?
              // Actually, populate into cardPhoneMap but we don't have card ID.
              // We'll set it directly on the object momentarily
              if (!res.Phone && info.phone) {
                 res.Phone = info.phone;
              }
            }
          }
        }
      }
    }
    
    // 4. Assign Final Phones (Priority: Contact > Lunch Card > Name Match)
    for (const res of reservations) {
      if (res.ContactId && contactPhoneMap.has(res.ContactId)) {
        res.Phone = contactPhoneMap.get(res.ContactId);
      } else if (res.LunchCardId && cardPhoneMap.has(res.LunchCardId)) {
        res.Phone = cardPhoneMap.get(res.LunchCardId);
      }
      // Name match phone was already assigned in step 3
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
    
    // On Thursday, also fetch Friday's Frozen Friday reservations (picked up Thursday)
    let fridayFrozenReservations: Reservation[] = [];
    if (isThursday) {
      // Calculate Friday's date
      const fridayDate = new Date(targetDate);
      fridayDate.setDate(fridayDate.getDate() + 1);
      const fridayDateStr = fridayDate.toISOString().split('T')[0];
      
      // Fetch Friday reservations where Frozen Friday = true
      const fridayFilter = `AND(IS_SAME({Date}, '${fridayDateStr}', 'day'), {Frozen Friday})`;
      let fridayOffset: string | undefined = undefined;
      const fridayRecords: Array<{ id: string; fields: Record<string, unknown> }> = [];
      
      do {
        let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?filterByFormula=${encodeURIComponent(fridayFilter)}`;
        if (fridayOffset) url += `&offset=${fridayOffset}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          fridayRecords.push(...data.records);
          fridayOffset = data.offset;
        } else {
          break;
        }
      } while (fridayOffset);
      
      fridayFrozenReservations = fridayRecords.map((record) => ({
        id: record.id,
        Name: record.fields['Name'] as string || '',
        Date: record.fields['Date'] as string || '',
        'Meal Type': record.fields['Meal Type'] as string || '',
        'Member Status': record.fields['Member Status'] as string || '',
        'Payment Method': record.fields['Payment Method'] as string || '',
        Notes: `🧊 FROZEN FRIDAY | ${record.fields['Notes'] as string || ''}`.trim(),
        Amount: record.fields['Amount'] as number || 0,
        LunchCardId: (record.fields['Lunch Card'] as string[] | undefined)?.[0],
      }));
      
      // Sort Friday frozen by last name too
      fridayFrozenReservations.sort((a, b) => {
        const getLastName = (name: string) => {
          const parts = name.trim().split(/\s+/);
          return parts[parts.length - 1].toLowerCase();
        };
        return getLastName(a.Name).localeCompare(getLastName(b.Name));
      });
    }

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

    // Column widths: #, Name, Phone, Type, Status, Paid, Special Requests, Meals Remaining
    // Total width available: 7.5 inches
    const colWidths = [0.3, 1.5, 1.1, 0.6, 0.7, 0.4, 1.5, 1.4];

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

      doc.text('Phone', hx, y + 0.18);
      hx += colWidths[2];
      
      doc.text('Type', hx, y + 0.18);
      hx += colWidths[3];
      
      doc.text('Status', hx, y + 0.18);
      hx += colWidths[4];
      
      doc.text('Paid', hx, y + 0.18);
      hx += colWidths[5];
      
      // Multi-line header: Special Requests
      doc.text('Special', hx, y + 0.13);
      doc.text('Requests', hx, y + 0.28);
      hx += colWidths[6];
      
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
    let noGarlicOnionsCount = 0;
    let dairyFreeCount = 0;
    let inFridgeCount = 0;
    
    for (const res of reservations) {
      const cleanedNotes = cleanNotes(res.Notes || '');
      const dietary = parseDietaryRestrictions(cleanedNotes, res.Name);
      if (dietary.includes('Vegetarian')) vegetarianCount++;
      if (dietary.includes('Gluten-Free')) glutenFreeCount++;
      if (dietary.includes('No Dessert')) noDessertCount++;
      if (dietary.includes('No Garlic/Onions')) noGarlicOnionsCount++;
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
      `No Garlic/Onions: ${noGarlicOnionsCount}`,
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
      // 1. Prepare Content & Calculate Height
      // Name wrapping
      const nameLines = doc.splitTextToSize(res.Name, colWidths[1] - 0.1);
      
      // Special Requests / Dietary logic
      const cleanedNotes = cleanNotes(res.Notes || '');
      const dietary = parseDietaryRestrictions(cleanedNotes, res.Name);
      
      // Calculate height for Requests column (simulate wrapping)
      let reqLinesCount = 1;
      if (dietary.length > 0) {
        let currentLineWidth = 0;
        const maxReqWidth = colWidths[6] - 0.1;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        for (let i = 0; i < dietary.length; i++) {
          const itemText = dietary[i] + (i < dietary.length - 1 ? ', ' : '');
          const w = doc.getTextWidth(itemText);
          if (currentLineWidth + w > maxReqWidth && currentLineWidth > 0) {
            reqLinesCount++;
            currentLineWidth = w;
          } else {
            currentLineWidth += w;
          }
        }
      }
      
      const maxLines = Math.max(nameLines.length, reqLinesCount);
      const lineHeight = 0.14;
      const rowHeight = Math.max(0.28, (maxLines * lineHeight) + 0.14);
      
      checkNewPage(rowHeight);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 0.05, contentWidth, rowHeight, 'F');
      }
      
      let x = margin + 0.05;
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      // 1. Row number
      doc.text(String(index + 1), x, y + 0.12);
      x += colWidths[0];
      
      // 2. Name (Wrapped)
      doc.setFont('helvetica', 'bold');
      doc.text(nameLines, x, y + 0.12);
      doc.setFont('helvetica', 'normal');
      x += colWidths[1];
      
      // 3. Phone (New)
      doc.text(res.Phone || '', x, y + 0.12);
      x += colWidths[2];
      
      // 4. Meal Type
      doc.text(res['Meal Type'] || '', x, y + 0.12);
      x += colWidths[3];
      
      // 5. Member Status
      doc.text(res['Member Status'] || '', x, y + 0.12);
      x += colWidths[4];
      
      // 6. Paid
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
      x += colWidths[5];
      
      // 7. Special Requests (Wrapped & Colored)
      if (dietary.length > 0) {
        doc.setFontSize(7);
        let reqX = x;
        let reqY = y + 0.13; // slightly offset for alignment
        let currentLineWidth = 0;
        const maxReqWidth = colWidths[6] - 0.1;
        
        for (let i = 0; i < dietary.length; i++) {
          const item = dietary[i];
          
          // Color code
          if (item === 'Vegetarian') doc.setTextColor(34, 139, 34);
          else if (item === 'No Dessert') doc.setTextColor(139, 69, 19);
          else if (item === 'No Garlic/Onions') doc.setTextColor(128, 0, 128);
          else if (item === 'Gluten-Free') doc.setTextColor(184, 134, 11);
          else if (item === 'Dairy-Free') doc.setTextColor(0, 0, 139);
          else if (item === 'In Fridge') doc.setTextColor(0, 128, 255);
          else doc.setTextColor(0, 0, 0);
          
          doc.setFont('helvetica', 'bold');
          
          const itemText = item + (i < dietary.length - 1 ? ', ' : '');
          const w = doc.getTextWidth(itemText);
          
          // Wrap if needed
          if (currentLineWidth + w > maxReqWidth && currentLineWidth > 0) {
            reqX = x;
            reqY += lineHeight;
            currentLineWidth = 0;
          }
          
          doc.text(itemText, reqX, reqY); // relative to baseline
          reqX += w;
          currentLineWidth += w;
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      }
      x += colWidths[6];
      
      // 8. Meals Remaining
      doc.setFontSize(8);
      if (res.LunchCardRemaining !== undefined) {
        const remaining = res.LunchCardRemaining;
        
        // Color-code based on remaining meals
        if (remaining <= 1) {
          doc.setFillColor(255, 200, 200);
          doc.rect(x - 0.05, y - 0.03, colWidths[7] - 0.1, 0.24, 'F');
          doc.setTextColor(139, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${remaining}`, x, y + 0.12);
          if (remaining === 1) doc.text(' (!)', x + 0.15, y + 0.12);
        } else if (remaining === 3) {
          doc.setFillColor(255, 255, 200);
          doc.rect(x - 0.05, y - 0.03, colWidths[7] - 0.1, 0.24, 'F');
          doc.setTextColor(139, 119, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${remaining}`, x, y + 0.12);
        } else {
          doc.setTextColor(0, 0, 0);
          doc.text(`${remaining}`, x, y + 0.12);
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('N/A', x, y + 0.12);
        doc.setTextColor(0, 0, 0);
      }
      
      y += rowHeight; // Advance by calculated height
    });

    // ========== FRIDAY FROZEN SECTION (only on Thursdays) ==========
    if (isThursday && fridayFrozenReservations.length > 0) {
      // Start on a new page for Friday frozen meals
      doc.addPage();
      y = margin;
      
      // Friday Frozen header
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, y, 0.6, 0.6);
      }
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 152, 219); // Blue for frozen
      doc.text('🧊 Friday Frozen Meals', margin + 0.75, y + 0.25);
      
      const fridayDate = new Date(targetDate);
      fridayDate.setDate(fridayDate.getDate() + 1);
      const fridayFormattedDate = fridayDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${fridayFormattedDate} (Pick up Thursday)`, margin + 0.75, y + 0.45);
      
      // Stats
      y += 0.75;
      const fridayDineIn = fridayFrozenReservations.filter(r => r['Meal Type'] === 'Dine In').length;
      const fridayToGo = fridayFrozenReservations.filter(r => r['Meal Type'] === 'To Go').length;
      const fridayDelivery = fridayFrozenReservations.filter(r => r['Meal Type'] === 'Delivery').length;
      
      let pillX = margin;
      pillX += drawPill(`Total: ${fridayFrozenReservations.length}`, pillX, y, [52, 152, 219]);
      pillX += drawPill(`Dine In/Pickup: ${fridayDineIn + fridayToGo}`, pillX, y, [66, 125, 120]);
      drawPill(`Delivery: ${fridayDelivery}`, pillX, y, [230, 126, 34]);
      
      y += 0.45;
      drawTableHeader();
      
      // Friday frozen rows
      fridayFrozenReservations.forEach((res, index) => {
        checkNewPage(0.28);
        
        // Alternating row colors - blue tint for frozen
        if (index % 2 === 0) {
          doc.setFillColor(230, 244, 255);
        } else {
          doc.setFillColor(245, 250, 255);
        }
        doc.rect(margin, y - 0.05, contentWidth, 0.28, 'F');
        
        x = margin + 0.05;
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        
        // Row number
        doc.text(String(index + 1), x, y + 0.12);
        x += colWidths[0];
        
        // Name
        const name = res.Name.length > 24 ? res.Name.substring(0, 22) + '...' : res.Name;
        doc.setFont('helvetica', 'bold');
        doc.text(name, x, y + 0.12);
        doc.setFont('helvetica', 'normal');
        x += colWidths[1];
        
        // Meal Type
        doc.text(res['Meal Type'] || '', x, y + 0.12);
        x += colWidths[2];
        
        // Member Status
        const statusShort = res['Member Status'] === 'Member' ? 'Member' : 'Non-Mem';
        doc.text(statusShort, x, y + 0.12);
        x += colWidths[3];
        
        // Paid (checkmark or X)
        const isPaid = res['Payment Method'] && res['Payment Method'] !== 'Unpaid';
        doc.text(isPaid ? '✓' : '✗', x, y + 0.12);
        x += colWidths[4];
        
        // Notes (simplified for frozen)
        const cleanedNotes = cleanNotes(res.Notes || '').replace(/🧊 FROZEN FRIDAY \|?\s*/g, '');
        if (cleanedNotes) {
          doc.setFontSize(7);
          const truncatedNotes = cleanedNotes.length > 25 ? cleanedNotes.substring(0, 23) + '...' : cleanedNotes;
          doc.text(truncatedNotes, x, y + 0.12);
          doc.setFontSize(8);
        }
        x += colWidths[5];
        
        // Meals remaining - N/A for frozen section
        doc.setTextColor(150, 150, 150);
        doc.text('N/A', x, y + 0.12);
        doc.setTextColor(0, 0, 0);
        
        y += 0.25;
      });
    }

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
