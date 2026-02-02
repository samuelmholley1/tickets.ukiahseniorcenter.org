// Import existing ticket purchasers into the Contacts table
// Run with: node sync-contacts-from-tickets.mjs

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const CONTACTS_TABLE_ID = process.env.AIRTABLE_CONTACTS_TABLE_ID || 'tbl3PQZzXGpT991dH';

// Source tables
const TABLES = {
  valentines: { id: 'tblgQA8BawIrlk2kh', name: "Valentine's 2026" },
  speakeasy: { id: 'tblMmwD5JEE5iCfLl', name: 'Speakeasy 2026' },
  nye: { id: 'tbl5OyCybJCfrebOb', name: 'NYE 2025' },
  christmas: { id: 'tbljtMTsXvSP3MDt4', name: 'Christmas 2025' },
  lunchCards: { id: 'tblOBnt2ZatrSugbj', name: 'Lunch Cards' },
};

async function fetchAllRecords(tableId) {
  let allRecords = [];
  let offset = null;
  
  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}${offset ? `?offset=${offset}` : ''}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    
    if (!response.ok) {
      console.error(`Error fetching from ${tableId}:`, response.status);
      break;
    }
    
    const data = await response.json();
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset;
  } while (offset);
  
  return allRecords;
}

async function checkContactExists(firstName, lastName, email, phone) {
  let formula = '';
  if (email && email !== 'cashier@seniorctr.org') {
    formula = `LOWER({Email}) = "${email.toLowerCase()}"`;
  } else {
    formula = `AND(LOWER({First Name}) = "${firstName.toLowerCase()}", LOWER({Last Name}) = "${lastName.toLowerCase()}")`;
  }
  
  const url = `https://api.airtable.com/v0/${BASE_ID}/${CONTACTS_TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  
  if (!response.ok) return false;
  const data = await response.json();
  return data.records && data.records.length > 0;
}

async function createContact(contact) {
  const contactType = contact.memberStatus === 'Member' ? 'Member' : 'Other';
  const sourceValue = 'Internal';
  
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${CONTACTS_TABLE_ID}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        fields: {
          'Name': `${contact.firstName} ${contact.lastName}`,
          'First Name': contact.firstName,
          'Last Name': contact.lastName,
          'Email': contact.email || undefined,
          'Phone Cell': contact.phone || undefined,
          'Contact Type': contactType,
          'Source': sourceValue,
          'Notes': `Synced from ${contact.source}`,
        },
      }],
    }),
  });
  
  if (!response.ok) {
      const resp = await response.json();
      console.error('Create failed:', JSON.stringify(resp));
  }
  return response.ok;
}

async function syncContacts() {
  console.log('Starting contact sync from ticket tables to MAIN CONTACTS table (tbl3PQZzXGpT991dH)...\n');
  
  const contactsMap = new Map(); // Key: normalized key, Value: contact info
  
  for (const [tableKey, tableInfo] of Object.entries(TABLES)) {
    console.log(`Fetching from ${tableInfo.name}...`);
    const records = await fetchAllRecords(tableInfo.id);
    console.log(`  Found ${records.length} records`);
    
    for (const record of records) {
      const fields = record.fields;
      const firstName = (fields['First Name'] || '').trim();
      const lastName = (fields['Last Name'] || '').trim();
      const email = (fields['Email'] || '').trim();
      const phone = (fields['Phone'] || '').trim();
      
      // Skip if no name
      if (!firstName || !lastName) continue;
      
      // Skip cashier@seniorctr.org emails
      const cleanEmail = email && email !== 'cashier@seniorctr.org' ? email : '';
      
      // Create unique key
      const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${cleanEmail.toLowerCase()}`;
      
      // Determine member status
      let memberStatus = 'Unknown';
      if (fields['Member Status']) {
        memberStatus = fields['Member Status'];
      } else if (fields['Member Tickets'] && fields['Member Tickets'] > 0) {
        memberStatus = 'Member';
      } else if (fields['Non-Member Tickets'] && fields['Non-Member Tickets'] > 0) {
        memberStatus = 'Non-Member';
      } else if (tableKey === 'lunchCards') {
        memberStatus = fields['Member Status'] || 'Unknown';
      }
      
      // Add to map (only first occurrence)
      if (!contactsMap.has(key)) {
        contactsMap.set(key, {
          firstName,
          lastName,
          email: cleanEmail,
          phone,
          memberStatus,
          source: tableInfo.name,
        });
      }
    }
  }
  
  console.log(`\nFound ${contactsMap.size} unique contacts to sync`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const [key, contact] of contactsMap) {
    // Check if already exists
    const exists = await checkContactExists(contact.firstName, contact.lastName, contact.email, contact.phone);
    
    if (exists) {
      skipped++;
      continue;
    }
    
    // Create new contact
    const success = await createContact(contact);
    if (success) {
      created++;
      console.log(`  ✓ Created: ${contact.firstName} ${contact.lastName}`);
    } else {
      errors++;
      console.log(`  ✗ Failed: ${contact.firstName} ${contact.lastName}`);
    }
    
    // Rate limit - Airtable allows 5 requests per second
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  console.log('\n========== SYNC COMPLETE ==========');
  console.log(`Created: ${created}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

syncContacts();
