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
  donation?: number;
}

// Generate a unique transaction ID
function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    // Generate unique transaction ID for this sale
    const transactionId = generateTransactionId();
    
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
    const { quantities, customer, donation = 0 } = body;

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

    // Validate check number if payment method is check
    if (customer.paymentMethod === 'check' && !customer.checkNumber?.trim()) {
      return NextResponse.json({ error: 'Check number is required for check payments' }, { status: 400 });
    }

    // Validate donation amount
    if (donation < 0 || donation > 10000) {
      return NextResponse.json({ error: 'Donation must be between $0 and $10,000' }, { status: 400 });
    }
    if (!Number.isFinite(donation)) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    // Sanitize string inputs with length limits (Airtable has limits)
    customer.firstName = customer.firstName.trim().substring(0, 100);
    customer.lastName = customer.lastName.trim().substring(0, 100);
    customer.email = customer.email.trim().toLowerCase().substring(0, 255);
    customer.phone = customer.phone.trim().substring(0, 50);
    customer.staffInitials = customer.staffInitials.trim().substring(0, 50);
    if (customer.checkNumber) {
      customer.checkNumber = customer.checkNumber.trim().substring(0, 50);
    }

    const CHRISTMAS_MEMBER = 15;
    const CHRISTMAS_NON_MEMBER = 20;
    const NYE_MEMBER = 35;
    const NYE_NON_MEMBER = 45;

    const results = [];

    // Submit to Christmas table if any Christmas tickets selected
    const christmasTotal = 
      (quantities.christmasMember * CHRISTMAS_MEMBER) + 
      (quantities.christmasNonMember * CHRISTMAS_NON_MEMBER);
    
    const nyeTotal = 
      (quantities.nyeMember * NYE_MEMBER) + 
      (quantities.nyeNonMember * NYE_NON_MEMBER);
    
    // Determine where donation goes: Christmas if both selected, otherwise whichever event
    const donationGoesToChristmas = christmasTotal > 0;

    if (christmasTotal > 0) {
      const christmasTicketInfo = [];
      if (quantities.christmasMember > 0) {
        christmasTicketInfo.push(`${quantities.christmasMember} Member ($${CHRISTMAS_MEMBER} ea)`);
      }
      if (quantities.christmasNonMember > 0) {
        christmasTicketInfo.push(`${quantities.christmasNonMember} Non-Member ($${CHRISTMAS_NON_MEMBER} ea)`);
      }

      const christmasPayload = {
        fields: {
          'Transaction ID': transactionId,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          'Email': customer.email,
          'Phone': customer.phone,
          'Payment Method': customer.paymentMethod === 'cash' ? 'Cash' : 'Check',
          'Check Number': customer.checkNumber || '',
          'Ticket Subtotal': christmasTotal,
          'Donation Amount': donationGoesToChristmas ? donation : 0,
          'Amount Paid': donationGoesToChristmas ? christmasTotal + donation : christmasTotal,
          'Ticket Quantity': quantities.christmasMember + quantities.christmasNonMember,
          'Christmas Member Tickets': quantities.christmasMember,
          'Christmas Non-Member Tickets': quantities.christmasNonMember,
          'Staff Initials': customer.staffInitials,
        },
      };

      console.log('Submitting to Christmas table:', JSON.stringify(christmasPayload, null, 2));

      const christmasResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(christmasPayload),
        }
      );

      if (!christmasResponse.ok) {
        const errorText = await christmasResponse.text();
        console.error('Christmas Airtable API Error:', errorText);
        console.error('Payload sent:', JSON.stringify(christmasPayload, null, 2));
        
        // Try to parse error for better message
        let detailedError = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            detailedError = errorJson.error.message;
          }
        } catch {
          // Use raw error text
        }
        
        throw new Error(`Christmas table error (${christmasResponse.status}): ${detailedError}`);
      }

      const christmasData = await christmasResponse.json();
      console.log('Christmas record created:', christmasData.id);
      
      results.push({ event: 'Christmas Drive-Thru', total: christmasTotal, recordId: christmasData.id });
    }

    // Submit to NYE table if any NYE tickets selected
    if (nyeTotal > 0) {
      const nyeTicketInfo = [];
      if (quantities.nyeMember > 0) {
        nyeTicketInfo.push(`${quantities.nyeMember} Member ($${NYE_MEMBER} ea)`);
      }
      if (quantities.nyeNonMember > 0) {
        nyeTicketInfo.push(`${quantities.nyeNonMember} Non-Member ($${NYE_NON_MEMBER} ea)`);
      }

      const nyePayload = {
        fields: {
          'Transaction ID': transactionId,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          'Email': customer.email,
          'Phone': customer.phone,
          'Payment Method': customer.paymentMethod === 'cash' ? 'Cash' : 'Check',
          'Check Number': customer.checkNumber || '',
          'Ticket Subtotal': nyeTotal,
          'Donation Amount': !donationGoesToChristmas ? donation : 0,
          'Amount Paid': !donationGoesToChristmas ? nyeTotal + donation : nyeTotal,
          'Ticket Quantity': quantities.nyeMember + quantities.nyeNonMember,
          'NYE Member Tickets': quantities.nyeMember,
          'NYE Non-Member Tickets': quantities.nyeNonMember,
          'Staff Initials': customer.staffInitials,
        },
      };

      console.log('Submitting to NYE table:', JSON.stringify(nyePayload, null, 2));

      const nyeResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_NYE_TICKETS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nyePayload),
        }
      );

      if (!nyeResponse.ok) {
        const errorText = await nyeResponse.text();
        console.error('NYE Airtable API Error:', errorText);
        console.error('Payload sent:', JSON.stringify(nyePayload, null, 2));
        
        // Try to parse error for better message
        let detailedError = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            detailedError = errorJson.error.message;
          }
        } catch {
          // Use raw error text
        }
        
        // If Christmas succeeded but NYE failed, log warning
        if (christmasTotal > 0) {
          console.error('CRITICAL: Christmas record created but NYE failed. Customer may have partial order.');
        }
        
        throw new Error(`NYE table error (${nyeResponse.status}): ${detailedError}`);
      }

      const nyeData = await nyeResponse.json();
      console.log('NYE record created:', nyeData.id);
      
      results.push({ event: 'NYE Gala Dance', total: nyeTotal, recordId: nyeData.id });
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
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
