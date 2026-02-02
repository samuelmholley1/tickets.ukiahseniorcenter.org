import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appZ6HE5luAFV0Ot2';
const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3vvS5NSwR8XPDx';

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records?: AirtableRecord[];
}

// Add a new contact to the Contacts table (if not already exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, memberStatus, source } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name required' }, { status: 400 });
    }

    // Check if contact already exists (by email or by name+phone)
    let formula = '';
    if (email && email !== 'cashier@seniorctr.org') {
      // Search by email (most reliable)
      formula = `LOWER({Email}) = "${email.toLowerCase()}"`;
    } else if (phone) {
      // Search by name + phone
      formula = `AND(LOWER({First Name}) = "${firstName.toLowerCase()}", LOWER({Last Name}) = "${lastName.toLowerCase()}", {Phone} = "${phone}")`;
    } else {
      // Search by name only (least reliable, but better than duplicates)
      formula = `AND(LOWER({First Name}) = "${firstName.toLowerCase()}", LOWER({Last Name}) = "${lastName.toLowerCase()}")`;
    }

    const checkUrl = `${AIRTABLE_API_BASE}/${BASE_ID}/${CONTACTS_TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
    
    const checkResponse = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!checkResponse.ok) {
      console.error('Airtable check error:', checkResponse.status);
      return NextResponse.json({ error: 'Failed to check for existing contact' }, { status: 500 });
    }

    const checkData = (await checkResponse.json()) as AirtableResponse;
    
    if (checkData.records && checkData.records.length > 0) {
      // Contact already exists - return existing record
      const existing = checkData.records[0];
      return NextResponse.json({
        success: true,
        exists: true,
        contact: {
          id: existing.id,
          firstName: existing.fields['First Name'],
          lastName: existing.fields['Last Name'],
          email: existing.fields['Email'],
          phone: existing.fields['Phone'],
          memberStatus: existing.fields['Member Status'] || 'Unknown',
        },
      });
    }

    // Contact doesn't exist - create new one
    const createResponse = await fetch(`${AIRTABLE_API_BASE}/${BASE_ID}/${CONTACTS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'First Name': firstName,
            'Last Name': lastName,
            'Email': email && email !== 'cashier@seniorctr.org' ? email : '',
            'Phone': phone || '',
            'Member Status': memberStatus || 'Unknown',
            'Source': source || 'Manual Entry',
            'Date Added': new Date().toISOString(),
          },
        }],
      }),
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      console.error('Airtable create error:', errText);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    const createData = await createResponse.json();
    const newRecord = createData.records[0];

    return NextResponse.json({
      success: true,
      exists: false,
      contact: {
        id: newRecord.id,
        firstName: newRecord.fields['First Name'],
        lastName: newRecord.fields['Last Name'],
        email: newRecord.fields['Email'],
        phone: newRecord.fields['Phone'],
        memberStatus: newRecord.fields['Member Status'] || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Contact add error:', error);
    return NextResponse.json(
      { error: 'Failed to add contact' },
      { status: 500 }
    );
  }
}
