import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    'Transaction ID'?: string;
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Ticket Quantity'?: number;
    'Member Tickets'?: number;
    'Non-Member Tickets'?: number;
    'Refunded'?: boolean;
  };
}

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 30) {
    return false;
  }
  
  limit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    // Validate environment variables
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY is not configured');
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID is not configured');
    }
    if (!process.env.AIRTABLE_VALENTINES_TABLE_ID) {
      throw new Error('AIRTABLE_VALENTINES_TABLE_ID is not configured');
    }

    // Fetch Valentine's tickets from Airtable (handle pagination)
    let allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`);
      if (offset) url.searchParams.set('offset', offset);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable API Error:', errorText);
        throw new Error(`Failed to fetch Valentine's attendance data: ${response.status}`);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    // Filter out refunded records
    const activeRecords = allRecords.filter((record: AirtableRecord) => !record.fields.Refunded);
    
    // Group by email to merge multiple transactions from the same person
    const groupedByEmail = new Map<string, {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      totalTickets: number;
      memberTickets: number;
      nonMemberTickets: number;
    }>();
    
    activeRecords.forEach((record: AirtableRecord) => {
      const email = (record.fields['Email'] || '').toLowerCase().trim();
      const key = email || `no-email-${record.id}`;
      const existing = groupedByEmail.get(key);
      
      const ticketQty = record.fields['Ticket Quantity'] || 0;
      const memberQty = record.fields['Member Tickets'] || 0;
      const nonMemberQty = record.fields['Non-Member Tickets'] || 0;
      
      if (existing) {
        existing.totalTickets += ticketQty;
        existing.memberTickets += memberQty;
        existing.nonMemberTickets += nonMemberQty;
      } else {
        groupedByEmail.set(key, {
          firstName: record.fields['First Name'] || '',
          lastName: record.fields['Last Name'] || '',
          email: record.fields['Email'] || '',
          phone: record.fields['Phone'] || '',
          totalTickets: ticketQty,
          memberTickets: memberQty,
          nonMemberTickets: nonMemberQty,
        });
      }
    });
    
    // Convert back to array format
    const records = Array.from(groupedByEmail.values()).map((person, index) => ({
      id: `merged-${index}`,
      fields: {
        'First Name': person.firstName,
        'Last Name': person.lastName,
        'Email': person.email,
        'Phone': person.phone,
        'Ticket Quantity': person.totalTickets,
        'Member Tickets': person.memberTickets,
        'Non-Member Tickets': person.nonMemberTickets,
      }
    }));

    return NextResponse.json({ records });

  } catch (error) {
    console.error('Error fetching Valentine\'s attendance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance data';
    
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { 
        error: isProduction ? 'An error occurred fetching attendance data' : errorMessage
      },
      { status: 500 }
    );
  }
}
