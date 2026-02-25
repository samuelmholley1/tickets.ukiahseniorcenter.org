import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { validatePDFSize } from '@/lib/pdfUtils';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

import { titleCaseName } from '@/lib/nameUtils';

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
  { routeId: 'COYOTE VALLEY #6', name: 'Ronald Hoel Sr.', address: '128 Campbell Dr.' },
  { routeId: 'COYOTE VALLEY #7', name: 'Sherry Knight', address: '128 Campbell Dr.' },
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
function extractSpecialRequests(notes: string, name?: string): string[] {
  const requests: string[] = [];
  const lower = (notes || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  
  // Fulin Chang ALWAYS gets Vegetarian + No Garlic/Onions + No Dessert
  if (nameLower.includes('fulin') || nameLower.includes('fu lin') || nameLower.includes('fu-lin')) {
    requests.push('Vegetarian');
    requests.push('No Garlic/Onions');
    requests.push('No Dessert');
  } else if (nameLower.includes('vilner')) {
    // David Vilner ALWAYS gets Vegetarian
    requests.push('Vegetarian');
    if (lower.includes('no garlic') || lower.includes('no onion')) requests.push('No Garlic/Onions');
  } else {
    if (lower.includes('vegetarian')) requests.push('Vegetarian');
    // Combined: No Garlic/Onions is ONE category
    if (lower.includes('no garlic') || lower.includes('no onion')) requests.push('No Garlic/Onions');
  }
  
  if (lower.includes('gluten-free') || lower.includes('gluten free') || lower.includes('gf')) requests.push('Gluten-Free');
  if (lower.includes('no chocolate dessert') || lower.includes('no chocolate')) requests.push('No Chocolate Dessert');
  else if (lower.includes('no dessert')) requests.push('No Dessert');
  if (lower.includes('dairy-free') || lower.includes('dairy free') || lower.includes('no dairy')) requests.push('Dairy-Free');
  if (lower.includes('in fridge') || lower.includes('fridge')) requests.push('In Fridge');
  
  // Meal numbering markers (#1 hot, #2 frozen) — auto-added for Thu/Fri dual meals
  const mealNumMatch = (notes || '').match(/#(\d+)/);
  if (mealNumMatch) requests.unshift(`Meal #${mealNumMatch[1]}`);
  
  return requests;
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
    const baseFilter = `filterByFormula=${encodeURIComponent(`AND(IS_SAME({Date}, '${date}', 'day'), NOT({Cancelled}))`)}`;
    
    do {
      let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?${baseFilter}`;
      if (offset) url += `&offset=${offset}`;
      
      let response: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
        });
        if (response.ok) break;
        // Rate limit (429) or server error (5xx) - wait and retry
        if (response.status === 429 || response.status >= 500) {
          console.error(`Airtable returned ${response.status}, retrying (attempt ${attempt + 1}/3)...`);
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        break; // Client error (4xx) - don't retry
      }

      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'No response';
        console.error(`Airtable labels fetch failed: ${response?.status} - ${errorText}`);
        throw new Error(`Failed to fetch reservations from Airtable (${response?.status || 'unknown'})`);
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    const reservations: Reservation[] = allRecords.map((record) => ({
      id: record.id,
      Name: titleCaseName(record.fields['Name'] as string || ''),
      Date: record.fields['Date'] as string || '',
      'Meal Type': record.fields['Meal Type'] as string || '',
      'Member Status': record.fields['Member Status'] as string || '',
      'Payment Method': record.fields['Payment Method'] as string || '',
      Notes: record.fields['Notes'] as string || '',
      InFridge: record.fields['In Fridge'] as boolean || false,
    }));

    // Filter: labels only needed for To Go and Delivery (excluding Coyote Valley - they're hardcoded)
    const labelReservations = reservations.filter(r => 
      r['Meal Type'] === 'To Go' || r['Meal Type'] === 'Delivery'
    );

    // Sort by last name
    labelReservations.sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };
      return getLastName(a.Name).localeCompare(getLastName(b.Name));
    });
    
    // Check if Thursday - need to also fetch Friday frozen meals
    const targetDate = new Date(date + 'T12:00:00');
    const isThursday = targetDate.getDay() === 4;
    
    let fridayFrozenReservations: Reservation[] = [];
    if (isThursday) {
      // Calculate Friday's date
      const fridayDate = new Date(targetDate);
      fridayDate.setDate(fridayDate.getDate() + 1);
      const fridayDateStr = fridayDate.toISOString().split('T')[0];
      
      // Fetch Friday reservations where Frozen Friday = true
      const fridayFilter = `AND(IS_SAME({Date}, '${fridayDateStr}', 'day'), {Frozen Friday}, NOT({Cancelled}))`;
      let fridayOffset: string | undefined = undefined;
      const fridayRecords: Array<{ id: string; fields: Record<string, unknown> }> = [];
      
      do {
        let url = `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID}?filterByFormula=${encodeURIComponent(fridayFilter)}`;
        if (fridayOffset) url += `&offset=${fridayOffset}`;
        
        let fridayResp: Response | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          fridayResp = await fetch(url, {
            headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
          });
          if (fridayResp.ok) break;
          if (fridayResp.status === 429 || fridayResp.status >= 500) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          break;
        }
        
        if (fridayResp && fridayResp.ok) {
          const data = await fridayResp.json();
          fridayRecords.push(...data.records);
          fridayOffset = data.offset;
        } else {
          console.error(`Friday frozen fetch failed: ${fridayResp?.status}`);
          break;
        }
      } while (fridayOffset);
      
      // Only include To Go and Delivery for labels
      fridayFrozenReservations = fridayRecords
        .map((record) => ({
          id: record.id,
          Name: titleCaseName(record.fields['Name'] as string || ''),
          Date: record.fields['Date'] as string || '',
          'Meal Type': record.fields['Meal Type'] as string || '',
          'Member Status': record.fields['Member Status'] as string || '',
          'Payment Method': record.fields['Payment Method'] as string || '',
          Notes: record.fields['Notes'] as string || '',
          InFridge: record.fields['In Fridge'] as boolean || false,
        }))
        .filter(r => r['Meal Type'] === 'To Go' || r['Meal Type'] === 'Delivery');
      
      // Sort Friday frozen by last name
      fridayFrozenReservations.sort((a, b) => {
        const getLastName = (name: string) => {
          const parts = name.trim().split(/\s+/);
          return parts[parts.length - 1].toLowerCase();
        };
        return getLastName(a.Name).localeCompare(getLastName(b.Name));
      });
    }

    // Auto-number meals for anyone with multiple reservations (any day)
    // On Thursday: hot meals numbered first, then frozen meals continue the sequence
    {
      const normalizeName = (n: string) => n.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Count total meals per person (hot + frozen)
      const hotByName = new Map<string, Reservation[]>();
      for (const res of labelReservations) {
        const key = normalizeName(res.Name);
        if (!hotByName.has(key)) hotByName.set(key, []);
        hotByName.get(key)!.push(res);
      }
      const frozenByName = new Map<string, Reservation[]>();
      for (const res of fridayFrozenReservations) {
        const key = normalizeName(res.Name);
        if (!frozenByName.has(key)) frozenByName.set(key, []);
        frozenByName.get(key)!.push(res);
      }
      
      // Get all unique names
      const allNames = new Set([...hotByName.keys(), ...frozenByName.keys()]);
      
      for (const name of allNames) {
        const hotMeals = hotByName.get(name) || [];
        const frozenMeals = frozenByName.get(name) || [];
        const totalMeals = hotMeals.length + frozenMeals.length;
        
        if (totalMeals < 2) continue; // No numbering needed for single meals
        
        // Number hot meals first: #1, #2, ...
        let counter = 1;
        for (const res of hotMeals) {
          const existingNotes = (res.Notes || '').replace(/^#\d+\s*\|?\s*/, '').trim();
          res.Notes = existingNotes ? `#${counter} | ${existingNotes}` : `#${counter}`;
          counter++;
        }
        // Then frozen meals continue: #N+1, #N+2, ...
        for (const res of frozenMeals) {
          const existingNotes = (res.Notes || '').replace(/^#\d+\s*\|?\s*/, '').trim();
          res.Notes = existingNotes ? `#${counter} | ${existingNotes}` : `#${counter}`;
          counter++;
        }
      }
    }

    // Build label data
    interface LabelData {
      isCoyoteValley: boolean;
      isFrozenFriday?: boolean;
      routeId?: string;
      name: string;
      address?: string;
      mealType: string;
      memberStatus: string;
      specialRequests: string[];
      inFridge: boolean;
      mealNumber?: string; // e.g. "#1", "#2" — rendered in orange
    }
    
    const allLabels: LabelData[] = [];
    
    // Coyote Valley labels FIRST - ALWAYS included, hardcoded (not from database)
    for (const cv of COYOTE_VALLEY_ROUTE) {
      allLabels.push({
        isCoyoteValley: true,
        isFrozenFriday: false,
        routeId: cv.routeId,
        name: cv.name,
        address: cv.address,
        mealType: 'Delivery',
        memberStatus: 'Member',
        specialRequests: [],
        inFridge: false,
      });
    }

    // On Thursday, also add FROZEN labels for each Coyote Valley customer
    if (isThursday) {
      for (const cv of COYOTE_VALLEY_ROUTE) {
        allLabels.push({
          isCoyoteValley: true,
          isFrozenFriday: true,
          routeId: cv.routeId,
          name: cv.name,
          address: cv.address,
          mealType: 'Delivery',
          memberStatus: 'Member',
          specialRequests: [],
          inFridge: false,
        });
      }
    }
    
    // Other labels from database (Thursday hot meals)
    for (const res of labelReservations) {
      const notes = cleanNotes(res.Notes || '');
      const specialReqs = extractSpecialRequests(notes, res.Name);
      if (res.InFridge && !specialReqs.includes('In Fridge')) specialReqs.push('In Fridge');
      const mealNumEntry = specialReqs.find(r => /^Meal #\d+$/.test(r));
      const filteredReqs = specialReqs.filter(r => !/^Meal #\d+$/.test(r));
      
      allLabels.push({
        isCoyoteValley: false,
        isFrozenFriday: false,
        name: res.Name,
        mealType: res['Meal Type'],
        memberStatus: res['Member Status'],
        specialRequests: filteredReqs,
        inFridge: res.InFridge || false,
        mealNumber: mealNumEntry ? mealNumEntry.replace('Meal ', '') : undefined,
      });
    }
    
    // Friday Frozen labels (Thursday only) - INTEGRATED into same sorted list
    for (const res of fridayFrozenReservations) {
      const notes = cleanNotes(res.Notes || '');
      const specialReqs = extractSpecialRequests(notes, res.Name);
      if (res.InFridge && !specialReqs.includes('In Fridge')) specialReqs.push('In Fridge');
      const mealNumEntry = specialReqs.find(r => /^Meal #\d+$/.test(r));
      const filteredReqs = specialReqs.filter(r => !/^Meal #\d+$/.test(r));
      
      allLabels.push({
        isCoyoteValley: false,
        isFrozenFriday: true,
        name: res.Name,
        mealType: res['Meal Type'],
        memberStatus: res['Member Status'],
        specialRequests: filteredReqs,
        inFridge: res.InFridge || false,
        mealNumber: mealNumEntry ? mealNumEntry.replace('Meal ', '') : undefined,
      });
    }

    // Sort all non-CV labels together by last name (hot + frozen interleaved)
    const cvLabels = allLabels.filter(l => l.isCoyoteValley);
    const nonCvLabels = allLabels.filter(l => !l.isCoyoteValley);
    nonCvLabels.sort((a, b) => {
      const getLastName = (name: string) => {
        const parts = name.trim().split(/\s+/);
        return parts[parts.length - 1].toLowerCase();
      };
      return getLastName(a.name).localeCompare(getLastName(b.name));
    });
    const sortedLabels = [...cvLabels, ...nonCvLabels];

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

    // Usable area inside each label (with padding)
    const px = 0.08; // horizontal padding
    const py = 0.06; // vertical padding
    const maxW = labelWidth - px * 2;  // 2.465"
    const maxH = labelHeight - py * 2; // 0.88"

    // Find the largest font size where text fits within maxWidth
    function fitFontSize(text: string, font: 'bold' | 'normal', maxSize: number, minSize: number = 7): number {
      for (let size = maxSize; size >= minSize; size -= 0.5) {
        doc.setFontSize(size);
        doc.setFont('helvetica', font);
        if (doc.getTextWidth(text) <= maxW) return size;
      }
      return minSize;
    }

    // Cap regular-label name sizes at whatever "COYOTE VALLEY #1" renders at,
    // so shorter names don't blow up larger than that reference label.
    const NAME_MAX_SIZE = fitFontSize('COYOTE VALLEY #1', 'bold', 28);

    // Draw each label
    sortedLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage();
      }

      const pageIndex = index % labelsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = leftMargin + col * (labelWidth + hGap);
      const y = topMargin + row * labelHeight;

      // No border — clean labels for Avery 5160

      // Meal number badge (orange) — top-right corner, rendered for every label that has one
      if (label.mealNumber) {
        const badgeSize = 11;
        doc.setFontSize(badgeSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(210, 100, 0); // orange — unique color on labels
        doc.text(label.mealNumber, x + labelWidth - px, y + py, { align: 'right', baseline: 'top' });
      }

      if (label.isCoyoteValley) {
        // COYOTE VALLEY LABEL
        const hasReqs = label.specialRequests.length > 0;
        const reqText = hasReqs ? label.specialRequests.join(', ') : '';
        const isCvFrozen = label.isFrozenFriday === true;

        if (isCvFrozen) {
          // FROZEN Coyote Valley label: Route ID + FROZEN (yellow highlight)
          const rowH = maxH / 2;

          // Route ID (bold, black)
          const idSize = fitFontSize(label.routeId || '', 'bold', 26);
          doc.setFontSize(idSize);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(label.routeId || '', x + px, y + py + rowH * 0, { baseline: 'top' });

          // FROZEN (yellow highlight with black text)
          const frozenSize = fitFontSize('FROZEN', 'bold', 24);
          doc.setFontSize(frozenSize);
          doc.setFont('helvetica', 'bold');
          const frozenW = doc.getTextWidth('FROZEN');
          const frozenH = frozenSize / 72;
          doc.setFillColor(255, 255, 0);
          doc.rect(x + px - 0.02, y + py + rowH * 1 - 0.02, frozenW + 0.04, frozenH + 0.06, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text('FROZEN', x + px, y + py + rowH * 1, { baseline: 'top' });
        } else if (hasReqs) {
          // 3 rows: Route ID, Special Requests, Date - split height into 3
          const rowH = maxH / 3;

          // Route ID (bold, black) — as big as fits
          const idSize = fitFontSize(label.routeId || '', 'bold', 24);
          doc.setFontSize(idSize);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(label.routeId || '', x + px, y + py + rowH * 0, { baseline: 'top' });

          // Special Requests (red, bold)
          const reqSize = fitFontSize(reqText, 'bold', 18);
          doc.setFontSize(reqSize);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(180, 0, 0);
          doc.text(reqText, x + px, y + py + rowH * 1, { baseline: 'top' });

          // Date (gray)
          const dateSize = fitFontSize(shortDate, 'normal', 12);
          doc.setFontSize(dateSize);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(shortDate, x + px, y + py + rowH * 2, { baseline: 'top' });
        } else {
          // 2 rows: Route ID, Date - split height into 2
          const rowH = maxH / 2;

          const idSize = fitFontSize(label.routeId || '', 'bold', 28);
          doc.setFontSize(idSize);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(label.routeId || '', x + px, y + py + rowH * 0, { baseline: 'top' });

          const dateSize = fitFontSize(shortDate, 'normal', 16);
          doc.setFontSize(dateSize);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(shortDate, x + px, y + py + rowH * 1, { baseline: 'top' });
        }
      } else {
        // REGULAR LABEL (hot or frozen)
        const mealType = label.mealType === 'To Go' ? 'Pickup' : (label.mealType || 'Unknown');
        const hasReqs = label.specialRequests.length > 0;
        const reqText = hasReqs ? label.specialRequests.join(', ') : '';
        const isFrozen = label.isFrozenFriday === true;

        // Frozen labels: line 2 = "FROZEN" (yellow highlight). No date row.
        // Hot labels: line 2 = Meal Type (colored), last row = date.
        if (isFrozen) {
          if (hasReqs) {
            // 3 rows: Name, FROZEN, Special Requests
            const rowH = maxH / 3;

            // Name (bold, black)
            const nameSize = fitFontSize(label.name, 'bold', Math.min(NAME_MAX_SIZE, 22));
            doc.setFontSize(nameSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(label.name, x + px, y + py + rowH * 0, { baseline: 'top' });

            // FROZEN (yellow highlight with black text)
            const frozenSize = fitFontSize('FROZEN', 'bold', 20);
            doc.setFontSize(frozenSize);
            doc.setFont('helvetica', 'bold');
            const frozenW = doc.getTextWidth('FROZEN');
            const frozenH = frozenSize / 72; // text height in inches
            doc.setFillColor(255, 255, 0);
            doc.rect(x + px - 0.02, y + py + rowH * 1 - 0.02, frozenW + 0.04, frozenH + 0.06, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('FROZEN', x + px, y + py + rowH * 1, { baseline: 'top' });

            // Special Requests (red, bold)
            const reqSize = fitFontSize(reqText, 'bold', 16);
            doc.setFontSize(reqSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(180, 0, 0);
            doc.text(reqText, x + px, y + py + rowH * 2, { baseline: 'top' });
          } else {
            // 2 rows: Name, FROZEN
            const rowH = maxH / 2;

            // Name (bold, black)
            const nameSize = fitFontSize(label.name, 'bold', NAME_MAX_SIZE);
            doc.setFontSize(nameSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(label.name, x + px, y + py + rowH * 0, { baseline: 'top' });

            // FROZEN (yellow highlight with black text)
            const frozenSize = fitFontSize('FROZEN', 'bold', 24);
            doc.setFontSize(frozenSize);
            doc.setFont('helvetica', 'bold');
            const frozenW = doc.getTextWidth('FROZEN');
            const frozenH = frozenSize / 72;
            doc.setFillColor(255, 255, 0);
            doc.rect(x + px - 0.02, y + py + rowH * 1 - 0.02, frozenW + 0.04, frozenH + 0.06, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('FROZEN', x + px, y + py + rowH * 1, { baseline: 'top' });
          }
        } else {
          // HOT MEAL label
          if (hasReqs) {
            // 4 rows: Name, Meal Type, Special Requests, Date
            const rowH = maxH / 4;

            // Name (bold, black)
            const nameSize = fitFontSize(label.name, 'bold', Math.min(NAME_MAX_SIZE, 22));
            doc.setFontSize(nameSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(label.name, x + px, y + py + rowH * 0, { baseline: 'top' });

            // Meal Type (colored)
            const mealSize = fitFontSize(mealType, 'normal', 18);
            doc.setFontSize(mealSize);
            doc.setFont('helvetica', 'normal');
            if (mealType === 'Delivery') doc.setTextColor(180, 0, 0);
            else if (mealType === 'Pickup') doc.setTextColor(0, 100, 180);
            else doc.setTextColor(0, 120, 0);
            doc.text(mealType, x + px, y + py + rowH * 1, { baseline: 'top' });

            // Special Requests (red, bold)
            const reqSize = fitFontSize(reqText, 'bold', 16);
            doc.setFontSize(reqSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(180, 0, 0);
            doc.text(reqText, x + px, y + py + rowH * 2, { baseline: 'top' });

            // Date (gray)
            const dateSize = fitFontSize(shortDate, 'normal', 10);
            doc.setFontSize(dateSize);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(shortDate, x + px, y + py + rowH * 3, { baseline: 'top' });
          } else {
            // 3 rows: Name, Meal Type, Date
            const rowH = maxH / 3;

            // Name (bold, black)
            const nameSize = fitFontSize(label.name, 'bold', NAME_MAX_SIZE);
            doc.setFontSize(nameSize);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(label.name, x + px, y + py + rowH * 0, { baseline: 'top' });

            // Meal Type (colored)
            const mealSize = fitFontSize(mealType, 'normal', 20);
            doc.setFontSize(mealSize);
            doc.setFont('helvetica', 'normal');
            if (mealType === 'Delivery') doc.setTextColor(180, 0, 0);
            else if (mealType === 'Pickup') doc.setTextColor(0, 100, 180);
            else doc.setTextColor(0, 120, 0);
            doc.text(mealType, x + px, y + py + rowH * 1, { baseline: 'top' });

            // Date (gray)
            const dateSize = fitFontSize(shortDate, 'normal', 14);
            doc.setFontSize(dateSize);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(shortDate, x + px, y + py + rowH * 2, { baseline: 'top' });
          }
        }
      }
    });

    // Empty message
    if (sortedLabels.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      const dineInCount = reservations.filter(r => r['Meal Type'] === 'Dine In').length;
      const message = dineInCount > 0 
        ? `No Pickup or Delivery meals for this date (${dineInCount} Dine In only)`
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
