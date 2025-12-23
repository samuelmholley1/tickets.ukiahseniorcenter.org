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
    'Vegetarian Meals'?: number;
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
    if (!process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID) {
      throw new Error('AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID is not configured');
    }

    // Fetch Christmas tickets from Airtable
    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error:', errorText);
      throw new Error(`Failed to fetch Christmas attendance data: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out refunded records and return only the fields needed for attendance list
    const records = data.records
      .filter((record: AirtableRecord) => !record.fields.Refunded)
      .map((record: AirtableRecord) => ({
        id: record.id,
        fields: {
          'First Name': record.fields['First Name'] || '',
          'Last Name': record.fields['Last Name'] || '',
          'Phone': record.fields['Phone'] || '',
          'Ticket Quantity': record.fields['Ticket Quantity'] || 0,
          'Vegetarian Meals': record.fields['Vegetarian Meals'] || 0,
        }
      }));

    return NextResponse.json({ records });

  } catch (error) {
    console.error('Error fetching Christmas attendance:', error);
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
