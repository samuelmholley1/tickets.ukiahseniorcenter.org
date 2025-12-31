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
    if (!process.env.AIRTABLE_NYE_TICKETS_TABLE_ID) {
      throw new Error('AIRTABLE_NYE_TICKETS_TABLE_ID is not configured');
    }

    // Fetch NYE tickets from Airtable
    const response = await fetch(
      `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_NYE_TICKETS_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error:', errorText);
      throw new Error(`Failed to fetch NYE attendance data: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out refunded records
    const activeRecords = data.records.filter((record: AirtableRecord) => !record.fields.Refunded);
    
    // Group by email to merge multiple transactions from the same person
    const groupedByEmail = new Map<string, {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      totalTickets: number;
    }>();
    
    activeRecords.forEach((record: AirtableRecord) => {
      const email = record.fields['Email']?.toLowerCase() || '';
      const existing = groupedByEmail.get(email);
      
      if (existing) {
        // Merge: add ticket quantities
        existing.totalTickets += record.fields['Ticket Quantity'] || 0;
      } else {
        // New entry
        groupedByEmail.set(email, {
          firstName: record.fields['First Name'] || '',
          lastName: record.fields['Last Name'] || '',
          email: record.fields['Email'] || '',
          phone: record.fields['Phone'] || '',
          totalTickets: record.fields['Ticket Quantity'] || 0,
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
      }
    }));

    return NextResponse.json({ records });

  } catch (error) {
    console.error('Error fetching NYE attendance:', error);
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
