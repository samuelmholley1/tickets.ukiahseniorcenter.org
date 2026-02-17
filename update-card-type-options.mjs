// Update the Card Type field options in Lunch Cards table
// Add: Dine In, Pick Up, Delivery
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const API_KEY = apiKeyMatch?.[1];
const BASE_ID = baseIdMatch?.[1];
const TABLE_ID = 'tblOBnt2ZatrSugbj'; // Lunch Cards
const FIELD_ID = 'fldB9eGNWBFzAGOQY'; // Card Type

if (!API_KEY || !BASE_ID) {
  console.error('Missing env vars');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  // Fetch current field info for Lunch Cards and Lunch Reservations
  const metaUrl = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  const metaRes = await fetch(metaUrl, { headers });
  const metaData = await metaRes.json();

  if (metaData.error) {
    console.error('Error fetching metadata:', metaData.error);
    return;
  }

  // Lunch Cards table
  const cardsTable = metaData.tables?.find(t => t.id === TABLE_ID);
  if (cardsTable) {
    console.log('=== Lunch Cards Table ===');
    const cardTypeField = cardsTable.fields?.find(f => f.id === FIELD_ID);
    console.log('Card Type options:', cardTypeField?.options?.choices?.map(c => c.name));
    const payField = cardsTable.fields?.find(f => f.name === 'Payment Method');
    console.log('Payment Method options:', payField?.options?.choices?.map(c => c.name));
  }

  // Lunch Reservations table
  const resTable = metaData.tables?.find(t => t.id === 'tblF83nL5KPuPUDqx');
  if (resTable) {
    console.log('\n=== Lunch Reservations Table ===');
    const payField = resTable.fields?.find(f => f.name === 'Payment Method');
    console.log('Payment Method options:', payField?.options?.choices?.map(c => c.name));
    const mealTypeField = resTable.fields?.find(f => f.name === 'Meal Type');
    console.log('Meal Type options:', mealTypeField?.options?.choices?.map(c => c.name));
  }
}

main().catch(console.error);
