// Cross-reference lunch list names with lunch cards to determine member status
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const LUNCH_CARDS_TABLE = 'tblOBnt2ZatrSugbj';

// Names from the JSON
const namesFromList = [
  'Joanne Calson',     // Note: might be "Carlson" in database
  'Ful-Lin Chang',
  'Gerry DeTreville',
  'Dick Hooper',
  'Evelyn Vance',
  'Harry Vance',
  'David Vilner',
  'Jean Woodward',
  'Jan or Renata Pohl',
  'MacDonalds',
  'Tom DesRoches',
  'Katherine McElwee',
  'Val Parker',
  'Liz MacMillan',
  'Greg Bryan',       // Note: might be "Bryant" in database
  'Nancy Gilmore',
  'Carol Ann Hulsmann',
  'John Attaway',
  'Thomas Arendell',
  'Jim Denham',
];

async function analyze() {
  // Fetch ALL lunch cards
  const cardsRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${LUNCH_CARDS_TABLE}?pageSize=100`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
  );
  
  const cardsData = await cardsRes.json();
  const cards = cardsData.records || [];
  
  console.log('=== CROSS-REFERENCE ANALYSIS ===\n');
  
  for (const name of namesFromList) {
    const searchName = name.toLowerCase().replace(/[^a-z ]/g, '');
    const searchWords = searchName.split(' ').filter(w => w.length > 2);
    
    // Find matching cards
    const matches = cards.filter(card => {
      const cardName = (card.fields['Name'] || '').toLowerCase();
      // Check if any significant word matches
      return searchWords.some(word => cardName.includes(word));
    });
    
    if (matches.length > 0) {
      const card = matches[0];
      const memberStatus = card.fields['Member Status'] || 'Unknown';
      const remaining = card.fields['Remaining Meals'] || 0;
      console.log(`✅ ${name}`);
      console.log(`   Card: ${card.fields['Name']} | ${memberStatus} | ${remaining} meals left`);
    } else {
      console.log(`❓ ${name} - NO CARD FOUND`);
    }
  }
  
  console.log('\n=== CARDS WITH MEALS (for reference) ===');
  const activeCards = cards.filter(c => (c.fields['Remaining Meals'] || 0) > 0)
    .sort((a, b) => (a.fields['Name'] || '').localeCompare(b.fields['Name'] || ''));
  
  for (const card of activeCards.slice(0, 30)) {
    console.log(`  ${card.fields['Name']} - ${card.fields['Member Status']} - ${card.fields['Remaining Meals']} meals`);
  }
}

analyze();
