import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface TicketQuantities {
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: 'cash' | 'check';
  checkNumber?: string;
  staffInitials: string;
}

interface RequestBody {
  quantities: TicketQuantities;
  customer: CustomerInfo;
}

export async function POST(request: NextRequest) {
  try {
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
    if (!process.env.AIRTABLE_NYE_TICKETS_TABLE_ID) {
      throw new Error('AIRTABLE_NYE_TICKETS_TABLE_ID is not configured');
    }

    const body: RequestBody = await request.json();
    const { quantities, customer } = body;

    // Input validation
    if (!customer.firstName?.trim() || !customer.lastName?.trim()) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
    }
    if (!customer.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!customer.phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!customer.staffInitials?.trim()) {
      return NextResponse.json({ error: 'Staff initials are required' }, { status: 400 });
    }

    // Validate quantities are non-negative integers
    const allQuantities = Object.values(quantities);
    if (allQuantities.some(q => !Number.isInteger(q) || q < 0)) {
      return NextResponse.json({ error: 'Invalid ticket quantities' }, { status: 400 });
    }

    // Prevent excessive orders (max 50 tickets per transaction)
    const totalTickets = allQuantities.reduce((sum, q) => sum + q, 0);
    if (totalTickets === 0) {
      return NextResponse.json({ error: 'At least one ticket must be selected' }, { status: 400 });
    }
    if (totalTickets > 50) {
      return NextResponse.json({ error: 'Maximum 50 tickets per order' }, { status: 400 });
    }

    // Sanitize string inputs
    customer.firstName = customer.firstName.trim();
    customer.lastName = customer.lastName.trim();
    customer.email = customer.email.trim().toLowerCase();
    customer.phone = customer.phone.trim();
    customer.staffInitials = customer.staffInitials.trim();
    if (customer.checkNumber) {
      customer.checkNumber = customer.checkNumber.trim();
    }

    const CHRISTMAS_MEMBER = 15;
    const CHRISTMAS_NON_MEMBER = 20;
    const NYE_MEMBER = 35;
    const NYE_NON_MEMBER = 40;

    const results = [];

    // Submit to Christmas table if any Christmas tickets selected
    const christmasTotal = 
      (quantities.christmasMember * CHRISTMAS_MEMBER) + 
      (quantities.christmasNonMember * CHRISTMAS_NON_MEMBER);

    if (christmasTotal > 0) {
      const christmasTicketInfo = [];
      if (quantities.christmasMember > 0) {
        christmasTicketInfo.push(`${quantities.christmasMember} Member ($${CHRISTMAS_MEMBER} ea)`);
      }
      if (quantities.christmasNonMember > 0) {
        christmasTicketInfo.push(`${quantities.christmasNonMember} Non-Member ($${CHRISTMAS_NON_MEMBER} ea)`);
      }

      const christmasResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'First Name': customer.firstName,
              'Last Name': customer.lastName,
              'Email': customer.email,
              'Phone': customer.phone,
              'Payment Method': customer.paymentMethod === 'cash' ? 'Cash' : 'Check',
              'Check Number': customer.checkNumber || '',
              'Amount Paid': christmasTotal,
              'Staff Initials': customer.staffInitials,
            },
          }),
        }
      );

      if (!christmasResponse.ok) {
        const errorText = await christmasResponse.text();
        console.error('Christmas Airtable API Error:', errorText);
        throw new Error(`Christmas table error (${christmasResponse.status}): ${errorText}`);
      }

      results.push({ event: 'Christmas Drive-Thru', total: christmasTotal });
    }

    // Submit to NYE table if any NYE tickets selected
    const nyeTotal = 
      (quantities.nyeMember * NYE_MEMBER) + 
      (quantities.nyeNonMember * NYE_NON_MEMBER);

    if (nyeTotal > 0) {
      const nyeTicketInfo = [];
      if (quantities.nyeMember > 0) {
        nyeTicketInfo.push(`${quantities.nyeMember} Member ($${NYE_MEMBER} ea)`);
      }
      if (quantities.nyeNonMember > 0) {
        nyeTicketInfo.push(`${quantities.nyeNonMember} Non-Member ($${NYE_NON_MEMBER} ea)`);
      }

      const nyeResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_NYE_TICKETS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'First Name': customer.firstName,
              'Last Name': customer.lastName,
              'Email': customer.email,
              'Phone': customer.phone,
              'Payment Method': customer.paymentMethod === 'cash' ? 'Cash' : 'Check',
              'Check Number': customer.checkNumber || '',
              'Amount Paid': nyeTotal,
              'Staff Initials': customer.staffInitials,
            },
          }),
        }
      );

      if (!nyeResponse.ok) {
        const errorText = await nyeResponse.text();
        console.error('NYE Airtable API Error:', errorText);
        throw new Error(`NYE table error (${nyeResponse.status}): ${errorText}`);
      }

      results.push({ event: 'NYE Gala Dance', total: nyeTotal });
    }

    return NextResponse.json({ 
      success: true, 
      results,
      grandTotal: christmasTotal + nyeTotal
    });

  } catch (error) {
    console.error('Error submitting ticket sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit ticket sale';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Don't expose stack traces or sensitive info in production
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { 
        error: isProduction ? 'An error occurred processing your request. Please try again.' : errorMessage,
        ...(isProduction ? {} : { details: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    );
  }
}
