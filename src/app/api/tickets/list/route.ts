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
    'Payment Method': string;
    'Check Number'?: string;
    'Ticket Subtotal'?: number;
    'Donation Amount'?: number;
    'Amount Paid': number;
    'Ticket Quantity'?: number;
    'Valentine Member Tickets'?: number;
    'Valentine Non-Member Tickets'?: number;
    'Speakeasy Tickets'?: number;
    'Staff Initials': string;
    'Purchase Date'?: string;
    'Refunded'?: boolean;
  };
}

// Simple in-memory rate limiting (resets on deployment)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 60 seconds
    return true;
  }
  
  if (limit.count >= 30) { // Max 30 requests per minute
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

    const searchParams = request.nextUrl.searchParams;
    const event = searchParams.get('event') || 'valentines';

    // Validate event parameter
    if (!['valentines', 'speakeasy'].includes(event)) {
      return NextResponse.json({ error: 'Invalid event parameter' }, { status: 400 });
    }

    const records: Array<AirtableRecord & { event: string }> = [];

    // Fetch Valentine's Day Dance tickets
    if (event === 'valentines') {
      if (!process.env.AIRTABLE_VALENTINES_TABLE_ID) {
        throw new Error('AIRTABLE_VALENTINES_TABLE_ID is not configured');
      }

      const valentinesResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!valentinesResponse.ok) {
        const errorText = await valentinesResponse.text();
        console.error('Valentine Airtable API Error:', errorText);
        throw new Error(`Failed to fetch Valentine tickets: ${valentinesResponse.status}`);
      }

      const valentinesData = await valentinesResponse.json();
      const valentinesRecords = valentinesData.records.filter((r: AirtableRecord) => !r.fields.Refunded);
      records.push(...valentinesRecords.map((r: AirtableRecord) => ({ ...r, event: "Valentine's Day Dance" })));
    }

    // Fetch An Affair to Remember (Speakeasy) tickets
    if (event === 'speakeasy') {
      if (!process.env.AIRTABLE_SPEAKEASY_TABLE_ID) {
        throw new Error('AIRTABLE_SPEAKEASY_TABLE_ID is not configured');
      }

      const speakeasyResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_SPEAKEASY_TABLE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!speakeasyResponse.ok) {
        const errorText = await speakeasyResponse.text();
        console.error('Speakeasy Airtable API Error:', errorText);
        throw new Error(`Failed to fetch Speakeasy tickets: ${speakeasyResponse.status}`);
      }

      const speakeasyData = await speakeasyResponse.json();
      const speakeasyRecords = speakeasyData.records.filter((r: AirtableRecord) => !r.fields.Refunded);
      records.push(...speakeasyRecords.map((r: AirtableRecord) => ({ ...r, event: 'An Affair to Remember' })));
    }

    // Sort all records by creation time (newest first)
    records.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

    return NextResponse.json({ records });

  } catch (error) {
    console.error('Error fetching ticket list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets';
    
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { 
        error: isProduction ? 'An error occurred fetching tickets' : errorMessage
      },
      { status: 500 }
    );
  }
}
