// Import contact info (Email, Phone) from Contacts table to Lunch Res & Cards
import fs from 'fs';
import Airtable from 'airtable';

// 1. Setup Environment
const envContent = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`${key}=([^\\s\\r\\n]+)`));
  return match ? match[1] : null;
};

const AIRTABLE_API_KEY = getEnv('AIRTABLE_API_KEY');
const AIRTABLE_BASE_ID = getEnv('AIRTABLE_BASE_ID');
const CONTACTS_TABLE_ID = 'tbl3PQZzXGpT991dH';
// Use Table IDs from Schema
const LUNCH_RESERVATIONS_TABLE_ID = 'tblF83nL5KPuPUDqx';
const LUNCH_CARDS_TABLE_ID = 'tblOBnt2ZatrSugbj'; 

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing API Key or Base ID in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// 2. Helper: Check if field exists by trying to select it
async function checkFieldAccess(tableId, fieldName) {
  try {
    await base(tableId).select({ fields: [fieldName], maxRecords: 1 }).firstPage();
    return true;
  } catch (err) {
    if (err.error === 'UNKNOWN_FIELD_NAME') return false;
    throw err;
  }
}

// 3. Helper: Fetch All Records
async function fetchAll(tableId, fields) {
  let allRecords = [];
  try {
    await base(tableId).select({ fields }).eachPage((records, fetchNextPage) => {
      allRecords = [...allRecords, ...records];
      fetchNextPage();
    });
  } catch (err) {
    console.error(`Error fetching table ${tableId}:`, err);
  }
  return allRecords;
}

// 4. Main
async function main() {
  console.log('🚀 Starting Import...');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);

  // --- Step A: Check Attributes ---
  console.log('\n--- Checking Fields ---');
  
  const resEmailExists = await checkFieldAccess(LUNCH_RESERVATIONS_TABLE_ID, 'Email');
  const resPhoneExists = await checkFieldAccess(LUNCH_RESERVATIONS_TABLE_ID, 'Phone');
  const cardEmailExists = await checkFieldAccess(LUNCH_CARDS_TABLE_ID, 'Email');
  const cardPhoneExists = await checkFieldAccess(LUNCH_CARDS_TABLE_ID, 'Phone');

  console.log(`Lunch Reservations: Email=${resEmailExists ? '✅' : '❌'}, Phone=${resPhoneExists ? '✅' : '❌'}`);
  console.log(`Lunch Cards:        Email=${cardEmailExists ? '✅' : '❌'}, Phone=${cardPhoneExists ? '✅' : '❌'}`);

  if (!resEmailExists || !resPhoneExists || !cardEmailExists) {
    console.log('\n⚠️  MISSING FIELDS DETECTED ⚠️');
    console.log('Please add these fields in Airtable to allow full import:');
    if (!resEmailExists) console.log(`- Table "Lunch Reservations": Add field "Email" (Type: Email)`);
    if (!resPhoneExists) console.log(`- Table "Lunch Reservations": Add field "Phone" (Type: Phone Number)`);
    if (!cardEmailExists) console.log(`- Table "Lunch Cards": Add field "Email" (Type: Email)`);
    console.log('\nStarting partial import for available fields...\n');
  }

  // --- Step B: Fetch Data ---
  console.log('Fetching Contacts...');
  const contacts = await fetchAll(CONTACTS_TABLE_ID, ['Name', 'Email', 'Phone Cell', 'Phone Home']);
  console.log(`Found ${contacts.length} contacts.`);
  
  console.log('Fetching Lunch Reservations...');
  // Only fetch fields that exist + Name/Contact
  const resFields = ['Name', 'Contact'];
  if (resEmailExists) resFields.push('Email');
  if (resPhoneExists) resFields.push('Phone');
  const reservations = await fetchAll(LUNCH_RESERVATIONS_TABLE_ID, resFields);
  
  console.log('Fetching Lunch Cards...');
  const cardFields = ['Name', 'Contact'];
  if (cardEmailExists) cardFields.push('Email');
  if (cardPhoneExists) cardFields.push('Phone');
  const cards = await fetchAll(LUNCH_CARDS_TABLE_ID, cardFields);

  // --- Step C: Build Lookup Maps ---
  const contactMapById = {};
  const contactMapByName = {};

  contacts.forEach(c => {
    const email = c.get('Email');
    const phone = c.get('Phone Cell') || c.get('Phone Home');
    const name = c.get('Name');
    
    if (email || phone) {
      const info = { id: c.id, email, phone };
      contactMapById[c.id] = info;
      if (name) {
        contactMapByName[name.trim().toLowerCase()] = info;
      }
    }
  });

  // --- Step D: Process & Update ---
  
  // Helper to process list
  const processList = async (list, tableName, tableId, hasEmail, hasPhone) => {
    if (!hasEmail && !hasPhone) {
      console.log(`Skipping ${tableName} (no target fields available).`);
      return;
    }

    console.log(`\nProcessing ${tableName} (${list.length} records)...`);
    const updates = [];

    for (const rec of list) {
      const contactLink = rec.get('Contact');
      const currentEmail = hasEmail ? rec.get('Email') : null;
      const currentPhone = hasPhone ? rec.get('Phone') : null;
      const name = rec.get('Name');

      let match = null;

      // 1. Try Linked Record
      if (contactLink && contactLink.length > 0) {
        match = contactMapById[contactLink[0]];
      }

      // 2. Try Name Match if no link
      if (!match && name) {
        match = contactMapByName[name.trim().toLowerCase()];
      }

      if (match) {
        const fieldsToUpdate = {};
        // Update if missing in target AND field exists in schema
        if (hasEmail && !currentEmail && match.email) fieldsToUpdate['Email'] = match.email;
        if (hasPhone && !currentPhone && match.phone) fieldsToUpdate['Phone'] = match.phone;

        if (Object.keys(fieldsToUpdate).length > 0) {
          updates.push({
            id: rec.id,
            fields: fieldsToUpdate
          });
        }
      }
    }

    console.log(`Found ${updates.length} records to update in ${tableName}.`);

    if (updates.length > 0) {
      // Execute Batched Updates
      for (let i = 0; i < updates.length; i += 10) {
        const batch = updates.slice(i, i + 10);
        try {
          await base(tableId).update(batch);
          process.stdout.write('.');
        } catch (err) {
          console.error(`\n❌ Error updating batch:`, err);
        }
      }
      console.log('\nDone.');
    } else {
      console.log('No updates needed.');
    }
  };

  await processList(reservations, 'Lunch Reservations', LUNCH_RESERVATIONS_TABLE_ID, resEmailExists, resPhoneExists);
  await processList(cards, 'Lunch Cards', LUNCH_CARDS_TABLE_ID, cardEmailExists, cardPhoneExists);

  console.log('\n✨ Import Complete!');
}

main();
