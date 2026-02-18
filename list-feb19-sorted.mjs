// Show 2/19 reservations sorted by last name (matching PDF attendance list order)
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const AIRTABLE_API_KEY = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/)?.[1];
const AIRTABLE_BASE_ID = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/)?.[1];
const TABLE_ID = 'tblF83nL5KPuPUDqx';

async function fetchAll() {
  const allRecords = [];
  let offset = null;
  do {
    const params = new URLSearchParams();
    params.set('filterByFormula', `IS_SAME({Date}, '2026-02-19', 'day')`);
    params.set('pageSize', '100');
    if (offset) params.set('offset', offset);
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}?${params}`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const data = await res.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);
  return allRecords;
}

const records = await fetchAll();

// Sort by last name exactly like the PDF export-list code
const getLastName = (name) => {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
};

records.sort((a, b) => getLastName(a.fields.Name || '').localeCompare(getLastName(b.fields.Name || '')));

console.log(`Total: ${records.length} records for 2/19/2026 (sorted by last name)\n`);
records.forEach((r, i) => {
  const f = r.fields;
  const ln = getLastName(f.Name || '');
  console.log(`${String(i + 1).padStart(3)}. [${ln.padEnd(16)}] ${r.id} | ${(f.Name || '').padEnd(25)} | ${(f['Meal Type'] || '').padEnd(10)} | ${f['Member Status'] || ''} | $${f.Amount || 0} | ${f['Payment Method'] || ''} | Notes: ${f.Notes || ''} | FF: ${f['Frozen Friday'] ? 'Y' : 'n'}`);
});
