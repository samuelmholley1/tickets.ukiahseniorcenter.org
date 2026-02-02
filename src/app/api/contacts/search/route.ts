import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

// Table IDs to search
const TABLES = {
  valentine: process.env.AIRTABLE_VALENTINE_TABLE_ID || 'tblgQA8BawIrlk2kh',
  speakeasy: process.env.AIRTABLE_SPEAKEASY_TABLE_ID || 'tblMmwD5JEE5iCfLl',
  nye: process.env.AIRTABLE_NYE_TABLE_ID || 'tbl5OyCybJCfrebOb',
  christmas: process.env.AIRTABLE_CHRISTMAS_TABLE_ID || 'tbljtMTsXvSP3MDt4',
  lunchCards: process.env.AIRTABLE_LUNCH_CARDS_TABLE_ID || 'tblOBnt2ZatrSugbj',
};

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records?: AirtableRecord[];
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberStatus?: string;
  source: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParam = request.nextUrl.searchParams.get('search');
    
    if (!searchParam || searchParam.length < 2) {
      return NextResponse.json({ error: 'Search term must be at least 2 characters' }, { status: 400 });
    }

    const search = searchParam.toLowerCase();
    const contactsMap = new Map<string, Contact>();

    // Search each table
    const searchPromises = Object.entries(TABLES).map(async ([source, tableId]) => {
      try {
        // Build search formula - search first name OR last name OR email OR phone
        const searchLower = search.replace(/"/g, '');
        const formula = `OR(
          FIND("${searchLower}", LOWER({First Name})),
          FIND("${searchLower}", LOWER({Last Name})),
          FIND("${searchLower}", LOWER({Email})),
          FIND("${searchLower}", LOWER({Phone}))
        )`;

        // Build URL with encoded formula
        const encodedFormula = encodeURIComponent(formula);
        const urlWithFormula = `${AIRTABLE_API_BASE}/${BASE_ID}/${tableId}?filterByFormula=${encodedFormula}`;

        const formResponse = await fetch(urlWithFormula, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });

        if (!formResponse.ok) {
          console.error(`Airtable error for ${source}:`, formResponse.status);
          return;
        }

        const data = (await formResponse.json()) as AirtableResponse;
        
        if (data.records && Array.isArray(data.records)) {
          data.records.forEach((record: AirtableRecord) => {
            const fields = record.fields as Record<string, unknown>;
            const firstName = (fields['First Name'] as string) || '';
            const lastName = (fields['Last Name'] as string) || '';
            const email = (fields['Email'] as string) || '';
            const phone = (fields['Phone'] as string) || '';
            
            // Use email as unique key to deduplicate
            const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${email.toLowerCase()}`;
            
            if (!contactsMap.has(key) && (firstName || lastName)) {
              contactsMap.set(key, {
                id: record.id,
                firstName,
                lastName,
                email,
                phone,
                memberStatus: determineMemberStatus(fields, source),
                source: source,
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error searching ${source}:`, error);
      }
    });

    await Promise.all(searchPromises);

    const contacts = Array.from(contactsMap.values());

    return NextResponse.json({
      success: true,
      count: contacts.length,
      contacts: contacts.slice(0, 20), // Limit to 20 results
    });
  } catch (error) {
    console.error('Contact search error:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts' },
      { status: 500 }
    );
  }
}

function determineMemberStatus(fields: Record<string, unknown>, source: string): string {
  // Check for explicit membership status field
  if (fields['Member Status']) {
    return fields['Member Status'] as string;
  }
  
  // For event tables, try to infer from pricing or member field
  const memberTickets = fields['Member Tickets'] as number | undefined;
  const nonMemberTickets = fields['Non-Member Tickets'] as number | undefined;
  
  if (memberTickets !== undefined && nonMemberTickets !== undefined) {
    if (memberTickets > 0) return 'Member';
    if (nonMemberTickets > 0) return 'Non-Member';
  }
  
  // Default based on source
  if (source === 'lunchCards') {
    return 'Unknown';
  }
  
  return 'Unknown';
}
