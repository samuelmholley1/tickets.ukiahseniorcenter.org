import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/* ========== 2026 EVENTS ==========
 * Valentine's Day Dance - February 14, 2026
 *   - Member: $30 until Feb 9, then $35
 *   - Non-Member: $45 (always)
 * 
 * Speakeasy Gala - April 11, 2026
 *   - All tickets: $100 until Mar 28, then $110
 * ================================= */

interface TicketQuantities {
  // 2026 Events
  valentinesMember: number;
  valentinesNonMember: number;
  speakeasy: number;
  
  /* ========== CHRISTMAS/NYE 2025 - COMMENTED OUT ==========
  christmasMember: number;
  christmasNonMember: number;
  nyeMember: number;
  nyeNonMember: number;
  ========================================================= */
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: 'cash' | 'check' | 'cashCheckSplit' | 'comp' | 'other';
  checkNumber?: string;
  cashAmount?: string;
  checkAmount?: string;
  otherPaymentDetails?: string;
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

// Dynamic pricing based on current date
function getValentinesMemberPrice(): number {
  const today = new Date();
  const priceChangeDate = new Date('2026-02-10T00:00:00');
  return today < priceChangeDate ? 30 : 35;
}

function getSpeakeasyPrice(): number {
  const today = new Date();
  const priceChangeDate = new Date('2026-03-29T00:00:00');
  return today < priceChangeDate ? 100 : 110;
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
    if (!process.env.AIRTABLE_VALENTINES_TABLE_ID) {
      throw new Error('AIRTABLE_VALENTINES_TABLE_ID is not configured');
    }
    if (!process.env.AIRTABLE_SPEAKEASY_TABLE_ID) {
      throw new Error('AIRTABLE_SPEAKEASY_TABLE_ID is not configured');
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

    // Validate check number if payment method is check or cash & check
    if ((customer.paymentMethod === 'check' || customer.paymentMethod === 'cashCheckSplit') && !customer.checkNumber?.trim()) {
      return NextResponse.json({ error: 'Check number is required for check payments' }, { status: 400 });
    }

    // Validate other payment details if payment method is other
    if (customer.paymentMethod === 'other' && !customer.otherPaymentDetails?.trim()) {
      return NextResponse.json({ error: 'Payment details are required when selecting Other payment method' }, { status: 400 });
    }

    // Validate cash & check amounts if split payment
    if (customer.paymentMethod === 'cashCheckSplit') {
      const cashAmt = parseFloat(customer.cashAmount || '0');
      const checkAmt = parseFloat(customer.checkAmount || '0');
      
      if (cashAmt <= 0 || checkAmt <= 0) {
        return NextResponse.json({ error: 'Both cash and check amounts must be greater than zero for split payments' }, { status: 400 });
      }
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
    if (customer.otherPaymentDetails) {
      customer.otherPaymentDetails = customer.otherPaymentDetails.trim().substring(0, 255);
    }

    // Get current prices (dynamic based on date)
    const VALENTINES_MEMBER = getValentinesMemberPrice();
    const VALENTINES_NON_MEMBER = 45;
    const SPEAKEASY = getSpeakeasyPrice();

    const results = [];

    // Calculate totals
    const valentinesTotal = 
      (quantities.valentinesMember * VALENTINES_MEMBER) + 
      (quantities.valentinesNonMember * VALENTINES_NON_MEMBER);
    
    const speakeasyTotal = quantities.speakeasy * SPEAKEASY;
    
    // Determine where donation goes: Valentine's if selected, otherwise Speakeasy
    const donationGoesToValentines = valentinesTotal > 0;

    // Build payment method display text and notes helper
    const getPaymentInfo = () => {
      let paymentMethodText = 'Cash';
      let paymentNotes = '';
      
      if (customer.paymentMethod === 'check') {
        paymentMethodText = 'Check';
      } else if (customer.paymentMethod === 'cashCheckSplit') {
        paymentMethodText = 'Cash & Check';
        const cashAmt = parseFloat(customer.cashAmount || '0');
        const checkAmt = parseFloat(customer.checkAmount || '0');
        paymentNotes = `Cash: $${cashAmt.toFixed(2)}, Check: $${checkAmt.toFixed(2)}`;
      } else if (customer.paymentMethod === 'comp') {
        paymentMethodText = 'Comp';
      } else if (customer.paymentMethod === 'other') {
        paymentMethodText = 'Other';
        paymentNotes = customer.otherPaymentDetails || '';
      }
      
      return { paymentMethodText, paymentNotes };
    };

    // Submit to Valentine's table if any Valentine's tickets selected
    if (valentinesTotal > 0) {
      const { paymentMethodText, paymentNotes } = getPaymentInfo();

      const valentinesPayload = {
        fields: {
          'Transaction ID': transactionId,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          'Email': customer.email,
          'Phone': customer.phone,
          'Payment Method': paymentMethodText,
          'Check Number': customer.checkNumber || '',
          'Payment Notes': paymentNotes,
          'Purchase Date': new Date().toISOString(),
          'Ticket Quantity': quantities.valentinesMember + quantities.valentinesNonMember,
          'Member Tickets': quantities.valentinesMember,
          'Non-Member Tickets': quantities.valentinesNonMember,
          'Amount Paid': valentinesTotal,
          'Donation Amount': donationGoesToValentines ? donation : 0,
          'Staff Initials': customer.staffInitials,
        },
      };

      console.log('Submitting to Valentine\'s table:', JSON.stringify(valentinesPayload, null, 2));

      const valentinesResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_VALENTINES_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(valentinesPayload),
        }
      );

      if (!valentinesResponse.ok) {
        const errorText = await valentinesResponse.text();
        console.error('Valentine\'s Airtable API Error:', errorText);
        console.error('Payload sent:', JSON.stringify(valentinesPayload, null, 2));
        
        let detailedError = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            detailedError = errorJson.error.message;
          }
        } catch {
          // Use raw error text
        }
        
        throw new Error(`Valentine's table error (${valentinesResponse.status}): ${detailedError}`);
      }

      const valentinesData = await valentinesResponse.json();
      console.log('Valentine\'s record created:', valentinesData.id);
      
      results.push({ event: 'Valentine\'s Day Dance', total: valentinesTotal, recordId: valentinesData.id });
    }

    // Submit to Speakeasy table if any Speakeasy tickets selected
    if (speakeasyTotal > 0) {
      const { paymentMethodText, paymentNotes } = getPaymentInfo();

      const speakeasyPayload = {
        fields: {
          'Transaction ID': transactionId,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          'Email': customer.email,
          'Phone': customer.phone,
          'Payment Method': paymentMethodText,
          'Check Number': customer.checkNumber || '',
          'Payment Notes': paymentNotes,
          'Purchase Date': new Date().toISOString(),
          'Ticket Quantity': quantities.speakeasy,
          'Amount Paid': speakeasyTotal,
          'Donation Amount': !donationGoesToValentines ? donation : 0,
          'Staff Initials': customer.staffInitials,
        },
      };

      console.log('Submitting to Speakeasy table:', JSON.stringify(speakeasyPayload, null, 2));

      const speakeasyResponse = await fetch(
        `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_SPEAKEASY_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(speakeasyPayload),
        }
      );

      if (!speakeasyResponse.ok) {
        const errorText = await speakeasyResponse.text();
        console.error('Speakeasy Airtable API Error:', errorText);
        console.error('Payload sent:', JSON.stringify(speakeasyPayload, null, 2));
        
        let detailedError = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            detailedError = errorJson.error.message;
          }
        } catch {
          // Use raw error text
        }
        
        // If Valentine's succeeded but Speakeasy failed, log warning
        if (valentinesTotal > 0) {
          console.error('CRITICAL: Valentine\'s record created but Speakeasy failed. Customer may have partial order.');
        }
        
        throw new Error(`Speakeasy table error (${speakeasyResponse.status}): ${detailedError}`);
      }

      const speakeasyData = await speakeasyResponse.json();
      console.log('Speakeasy record created:', speakeasyData.id);
      
      results.push({ event: 'Speakeasy Gala', total: speakeasyTotal, recordId: speakeasyData.id });
    }

    // TODO: Add email receipt sending for 2026 events when templates are ready

    return NextResponse.json({ 
      success: true, 
      transactionId,
      results,
      grandTotal: valentinesTotal + speakeasyTotal + donation
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
