// Check fields in Lunch Reservations table
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const RESERVATIONS_TABLE = 'tblF83nL5KPuPUDqx';

async function checkFields() {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}?maxRecords=1`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
  );
  
  const data = await res.json();
  if (data.records && data.records.length > 0) {
    console.log('Fields available in Lunch Reservations:');
    console.log(Object.keys(data.records[0].fields));
  } else {
    console.log('No records found');
  }
}

checkFields();
