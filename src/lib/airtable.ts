// Airtable API helper functions for ticket management

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

interface TicketData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: 'Cash' | 'Check';
  checkNumber?: string;
  amountPaid: number;
  staffInitials: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Payment Method': string;
    'Check Number'?: string;
    'Amount Paid': number;
    'Staff Initials': string;
    'Created Time'?: string;
  };
  createdTime?: string;
}

/**
 * Create a new ticket record in Airtable
 */
export async function createTicketRecord(
  eventType: 'christmas' | 'nye',
  data: TicketData
): Promise<AirtableRecord> {
  const tableId = eventType === 'christmas' 
    ? process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID
    : process.env.AIRTABLE_NYE_TICKETS_TABLE_ID;

  const response = await fetch(
    `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${tableId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'First Name': data.firstName,
          'Last Name': data.lastName,
          'Email': data.email,
          'Phone': data.phone,
          'Payment Method': data.paymentMethod,
          'Check Number': data.checkNumber || '',
          'Amount Paid': data.amountPaid,
          'Staff Initials': data.staffInitials,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get all ticket records for an event
 */
export async function getTicketRecords(
  eventType: 'christmas' | 'nye'
): Promise<AirtableRecord[]> {
  const tableId = eventType === 'christmas' 
    ? process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID
    : process.env.AIRTABLE_NYE_TICKETS_TABLE_ID;

  const response = await fetch(
    `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${tableId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.records;
}

/**
 * Find ticket by email
 */
export async function findTicketByEmail(
  eventType: 'christmas' | 'nye',
  email: string
): Promise<AirtableRecord | null> {
  const tableId = eventType === 'christmas' 
    ? process.env.AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID
    : process.env.AIRTABLE_NYE_TICKETS_TABLE_ID;

  const filterFormula = encodeURIComponent(`{Email}='${email}'`);
  
  const response = await fetch(
    `${AIRTABLE_API_BASE}/${process.env.AIRTABLE_BASE_ID}/${tableId}?filterByFormula=${filterFormula}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.records.length > 0 ? data.records[0] : null;
}

/**
 * Get total sales for an event
 */
export async function getTotalSales(
  eventType: 'christmas' | 'nye'
): Promise<number> {
  const records = await getTicketRecords(eventType);
  return records.reduce((total, record) => {
    return total + (record.fields['Amount Paid'] || 0);
  }, 0);
}

/**
 * Get ticket count for an event
 */
export async function getTicketCount(
  eventType: 'christmas' | 'nye'
): Promise<number> {
  const records = await getTicketRecords(eventType);
  return records.length;
}
