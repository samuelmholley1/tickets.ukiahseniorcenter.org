// Fix Harry & Evelyn Vance - add 2 meals back (they weren't marked as paid)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const LUNCH_CARDS_TABLE = 'tblOBnt2ZatrSugbj';
const RESERVATIONS_TABLE = 'tblF83nL5KPuPUDqx';

async function fix() {
  // Find their card
  const searchFormula = `SEARCH("harry vance", LOWER({Name}))`;
  const cardsRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}?filterByFormula=${encodeURIComponent(searchFormula)}`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
  );
  
  const cardsData = await cardsRes.json();
  
  if (cardsData.records && cardsData.records.length > 0) {
    const card = cardsData.records[0];
    console.log('Found card:', card.fields['Name']);
    console.log('Current meals:', card.fields['Remaining Meals']);
    
    // Add 2 meals back
    const newMeals = (card.fields['Remaining Meals'] || 0) + 2;
    
    const updateRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}/${card.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: { 'Remaining Meals': newMeals } })
      }
    );
    
    if (updateRes.ok) {
      console.log(`✅ Added 2 meals back: ${card.fields['Remaining Meals']} → ${newMeals}`);
    }
  }
  
  // Update reservations to remove card link and mark as Unknown payment
  const resFormula = `AND({Date}='2026-02-04', OR({Name}='Evelyn Vance', {Name}='Harry Vance'))`;
  const resRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}?filterByFormula=${encodeURIComponent(resFormula)}`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
  );
  
  const resData = await resRes.json();
  console.log('\nFound reservations:', resData.records?.length || 0);
  
  for (const rec of (resData.records || [])) {
    console.log(`  Updating ${rec.fields['Name']}...`);
    
    await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${RESERVATIONS_TABLE}/${rec.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          fields: { 
            'Payment Method': 'Cash',  // Will need to collect
            'Notes': 'Payment not marked on sheet - needs collection',
            'Lunch Card': []  // Remove card link
          } 
        })
      }
    );
    console.log('  ✅ Updated');
  }
}

fix();
