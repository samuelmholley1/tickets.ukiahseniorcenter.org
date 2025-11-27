import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Payment Method': string;
    'Check Number'?: string;
    'Amount Paid': number;
    'Ticket Quantity'?: number;
    'Christmas Member Tickets'?: number;
    'Christmas Non-Member Tickets'?: number;
    'NYE Member Tickets'?: number;
    'NYE Non-Member Tickets'?: number;
    'Staff Initials': string;
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
    const event = searchParams.get('event') || 'all';

    // Validate event parameter
    if (!['christmas', 'nye', 'all'].includes(event)) {
      return NextResponse.json({ error: 'Invalid event parameter' }, { status: 400 });
    }

    const records: Array<AirtableRecord & { event: string }> = [];

    // Fetch Christmas tickets
    if (event === 'christmas' || event === 'all') {
      if (!process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID) {
        throw new Error('AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID is not configured');
      }

      const christmasResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!christmasResponse.ok) {
        const errorText = await christmasResponse.text();
        console.error('Christmas Airtable API Error:', errorText);
        throw new Error(`Failed to fetch Christmas tickets: ${christmasResponse.status}`);
      }

      const christmasData = await christmasResponse.json();
      records.push(...christmasData.records.map((r: AirtableRecord) => ({ ...r, event: 'Christmas Drive-Thru' })));
    }

    // Fetch NYE tickets
    if (event === 'nye' || event === 'all') {
      if (!process.env.AIRTABLE_NYE_TICKETS_TABLE_ID) {
        throw new Error('AIRTABLE_NYE_TICKETS_TABLE_ID is not configured');
      }

      const nyeResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_NYE_TICKETS_TABLE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!nyeResponse.ok) {
        const errorText = await nyeResponse.text();
        console.error('NYE Airtable API Error:', errorText);
        throw new Error(`Failed to fetch NYE tickets: ${nyeResponse.status}`);
      }

      const nyeData = await nyeResponse.json();
      records.push(...nyeData.records.map((r: AirtableRecord) => ({ ...r, event: 'NYE Gala Dance' })));
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
