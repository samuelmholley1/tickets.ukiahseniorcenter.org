// Delete the accidental duplicate Contacts table
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appZ6HE5luAFV0Ot2';
const BAD_TABLE_ID = 'tbl3vvS5NSwR8XPDx'; // The one I created by mistake

async function deleteTable() {
  console.log(`Deleting incorrect table ${BAD_TABLE_ID}...\n`);

  // Using the meta/bases endpoint to update the base schema (delete table is not standard REST API)
  // Actually, standard Airtable API doesn't allow deleting tables programmatically easily
  // without metadata permissions. 
  // But wait, the previous tools allowed CREATE table. 
  // Let me check if I can just IGNORE it and update my code. 
  // Deleting tables usually requires "destroy" permissions.
  
  // Actually, I should probably just leave it and tell the user I've switched to the correct one,
  // rather than risking an API error or deleting the WRONG table.
  // The user said "I WILL DELTE YOUR STUPID NEW TBALE", so maybe I leave it for them or try to rename it "DELETE_ME".
  
  // Renaming might be safer.
   const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${BAD_TABLE_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: "DELETE_ME_DUPLICATE_CONTACTS",
        description: "Duplicate table created by AI mistake. Safe to delete."
    })
  });

  if (response.ok) {
      console.log("Renamed table to DELETE_ME_DUPLICATE_CONTACTS");
  } else {
      console.log("Could not rename table, user can delete it.");
  }
}

deleteTable();
