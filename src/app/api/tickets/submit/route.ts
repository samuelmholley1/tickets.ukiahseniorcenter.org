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
    const body: RequestBody = await request.json();
    const { quantities, customer } = body;

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
              'Ticket Details': christmasTicketInfo.join(', '),
            },
          }),
        }
      );

      if (!christmasResponse.ok) {
        const error = await christmasResponse.json();
        throw new Error(`Christmas table error: ${JSON.stringify(error)}`);
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
              'Ticket Details': nyeTicketInfo.join(', '),
            },
          }),
        }
      );

      if (!nyeResponse.ok) {
        const error = await nyeResponse.json();
        throw new Error(`NYE table error: ${JSON.stringify(error)}`);
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit ticket sale' },
      { status: 500 }
    );
  }
}
