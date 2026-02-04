// Fix Carol Ann Hilsmann's name in Contacts table
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const CONTACTS_TABLE = 'tbl3PQZzXGpT991dH';

async function fixCarolAnn() {
  console.log('Checking Carol Ann Hulsmann links...\n');
  
  const LUNCH_CARDS_TABLE = 'tblOBnt2ZatrSugbj';
  const CONTACTS_TABLE = 'tbl3PQZzXGpT991dH';
  
  // Find Carol Ann in Lunch Cards
  const searchFormula = `SEARCH("carol ann hulsmann", LOWER({Name}))`;
  const cardsRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}?filterByFormula=${encodeURIComponent(searchFormula)}`,
    {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    }
  );
  
  const cardsData = await cardsRes.json();
  let cardRecord = null;
  
  if (cardsData.records && cardsData.records.length > 0) {
    cardRecord = cardsData.records[0];
    console.log('LUNCH CARD:');
    console.log('  ID:', cardRecord.id);
    console.log('  Name:', cardRecord.fields['Name']);
    console.log('  Contact Link:', cardRecord.fields['Contact'] || 'NOT LINKED');
  }
  
  // Find Carol Ann in Contacts
  const contactsRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${CONTACTS_TABLE}?filterByFormula=${encodeURIComponent(searchFormula)}`,
    {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    }
  );
  
  const contactsData = await contactsRes.json();
  let contactRecord = null;
  
  if (contactsData.records && contactsData.records.length > 0) {
    contactRecord = contactsData.records[0];
    console.log('\nCONTACT:');
    console.log('  ID:', contactRecord.id);
    console.log('  Name:', contactRecord.fields['Name']);
    console.log('  First Name:', contactRecord.fields['First Name']);
    console.log('  Last Name:', contactRecord.fields['Last Name']);
    console.log('  Lunch Cards Link:', contactRecord.fields['Lunch Cards'] || 'NOT LINKED');
  }
  
  // If both exist but not linked, link them
  if (cardRecord && contactRecord) {
    const cardLinkedContact = cardRecord.fields['Contact'];
    
    if (!cardLinkedContact || cardLinkedContact.length === 0) {
      console.log('\n⚠️ Card NOT linked to Contact. Linking now...');
      
      const updateRes = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}/${cardRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Contact': [contactRecord.id]
            }
          })
        }
      );
      
      if (updateRes.ok) {
        console.log('✅ Linked Lunch Card to Contact!');
      } else {
        console.log('❌ Link failed:', await updateRes.text());
      }
    } else {
      console.log('\n✅ Already linked!');
    }
  }
}

fixCarolAnn();
