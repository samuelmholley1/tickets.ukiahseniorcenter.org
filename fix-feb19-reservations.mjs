// Fix Lunch Reservations for 2/19/2026
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/);
const baseIdMatch = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/);

const AIRTABLE_API_KEY = apiKeyMatch?.[1];
const AIRTABLE_BASE_ID = baseIdMatch?.[1];
const TABLE_ID = 'tblF83nL5KPuPUDqx';

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Step 1: Fetch all records for 2/19/2026
async function fetchAll() {
  const allRecords = [];
  let offset = null;

  do {
    const params = new URLSearchParams();
    params.set('filterByFormula', `IS_SAME({Date}, '2026-02-19', 'day')`);
    params.set('pageSize', '100');
    params.set('sort[0][field]', 'Name');
    params.set('sort[0][direction]', 'asc');
    if (offset) params.set('offset', offset);

    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}?${params}`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function main() {
  const records = await fetchAll();
  console.log(`Total records for 2/19/2026: ${records.length}\n`);
  
  records.forEach((r, i) => {
    const f = r.fields;
    console.log(`${String(i + 1).padStart(3)}. ${r.id} | ${(f.Name || '').padEnd(25)} | ${(f['Meal Type'] || '').padEnd(10)} | ${(f['Member Status'] || '').padEnd(12)} | $${f.Amount || 0} | ${f['Payment Method'] || ''} | Notes: ${f.Notes || ''} | Frozen: ${f['Frozen Friday'] ? 'YES' : 'no'}`);
  });

  // Find specific records
  console.log('\n--- Records to modify ---');
  
  const thomas = records.filter(r => r.fields.Name?.toLowerCase().includes('arendell'));
  console.log(`\nThomas Arendell: ${thomas.length} records`);
  thomas.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | Frozen: ${r.fields['Frozen Friday'] ? 'YES' : 'no'}`));

  const racheal = records.filter(r => r.fields.Name?.toLowerCase().includes('roque'));
  console.log(`\nRacheal Roque: ${racheal.length} records`);
  racheal.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | $${r.fields.Amount} | ${r.fields['Payment Method']}`));

  const shirley = records.filter(r => r.fields.Name?.toLowerCase().includes('pedrotti'));
  console.log(`\nShirley Pedrotti: ${shirley.length} records`);
  shirley.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | $${r.fields.Amount} | ${r.fields['Payment Method']}`));

  const linda = records.filter(r => r.fields.Name?.toLowerCase().includes('thompson'));
  console.log(`\nLinda Thompson: ${linda.length} records`);
  linda.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | Notes: "${r.fields.Notes || ''}"`));

  const gail = records.filter(r => r.fields.Name?.toLowerCase().includes('walker'));
  console.log(`\nGail Walker: ${gail.length} records`);
  gail.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | $${r.fields.Amount} | ${r.fields['Payment Method']}`));

  const pam = records.filter(r => r.fields.Name?.toLowerCase().includes('hopkins'));
  console.log(`\nPam Hopkins: ${pam.length} records`);
  pam.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | $${r.fields.Amount} | ${r.fields['Payment Method']}`));

  const carolAnn = records.filter(r => r.fields.Name?.toLowerCase().includes('hulsmann'));
  console.log(`\nCarol Ann Hulsmann: ${carolAnn.length} records`);
  carolAnn.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | Frozen: ${r.fields['Frozen Friday'] ? 'YES' : 'no'} | Notes: "${r.fields.Notes || ''}"`));

  const marcella = records.filter(r => r.fields.Name?.toLowerCase().includes('marcella'));
  console.log(`\nMarcella: ${marcella.length} records`);
  marcella.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | Frozen: ${r.fields['Frozen Friday'] ? 'YES' : 'no'} | Notes: "${r.fields.Notes || ''}"`));
}

main().catch(err => { console.error(err); process.exit(1); });
