import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appZ6HE5luAFV0Ot2';
const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3vvS5NSwR8XPDx';

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
  memberStatus: string;
  source: string;
  dateAdded?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParam = request.nextUrl.searchParams.get('search');
    
    if (!searchParam || searchParam.length < 2) {
      return NextResponse.json({ error: 'Search term must be at least 2 characters' }, { status: 400 });
    }

    const searchLower = searchParam.toLowerCase().replace(/"/g, '');
    
    // Build search formula for Contacts table
    const formula = `OR(
      FIND("${searchLower}", LOWER({First Name})),
      FIND("${searchLower}", LOWER({Last Name})),
      FIND("${searchLower}", LOWER({Email})),
      FIND("${searchLower}", LOWER({Phone}))
    )`;

    const encodedFormula = encodeURIComponent(formula);
    const url = `${AIRTABLE_API_BASE}/${BASE_ID}/${CONTACTS_TABLE_ID}?filterByFormula=${encodedFormula}&maxRecords=20`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      console.error('Airtable error:', response.status);
      return NextResponse.json({ error: 'Failed to search contacts' }, { status: 500 });
    }

    const data = (await response.json()) as AirtableResponse;
    
    const contacts: Contact[] = (data.records || []).map((record: AirtableRecord) => {
      const fields = record.fields;
      return {
        id: record.id,
        firstName: (fields['First Name'] as string) || '',
        lastName: (fields['Last Name'] as string) || '',
        email: (fields['Email'] as string) || '',
        phone: (fields['Phone'] as string) || '',
        memberStatus: (fields['Member Status'] as string) || 'Unknown',
        source: (fields['Source'] as string) || '',
        dateAdded: (fields['Date Added'] as string) || '',
      };
    });

    return NextResponse.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error('Contact search error:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts' },
      { status: 500 }
    );
  }
}
