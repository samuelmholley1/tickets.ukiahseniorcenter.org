// Check 2/20 records for Carol Ann Hulsmann and Marcella ISS (frozen meals)
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const AIRTABLE_API_KEY = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/)?.[1];
const AIRTABLE_BASE_ID = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/)?.[1];
const TABLE_ID = 'tblF83nL5KPuPUDqx';

const params = new URLSearchParams();
params.set('filterByFormula', `IS_SAME({Date}, '2026-02-20', 'day')`);
params.set('pageSize', '100');

const res = await fetch(
  `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}?${params}`,
  { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
);
const data = await res.json();

const hulsmann = data.records.filter(r => r.fields.Name?.toLowerCase().includes('hulsmann'));
const marcella = data.records.filter(r => r.fields.Name?.toLowerCase().includes('marcella'));

console.log(`Total 2/20 records: ${data.records.length}\n`);

console.log(`Carol Ann Hulsmann on 2/20: ${hulsmann.length} records`);
hulsmann.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | FF: ${r.fields['Frozen Friday'] ? 'YES' : 'no'} | Notes: "${r.fields.Notes || ''}"`));

console.log(`\nMarcella on 2/20: ${marcella.length} records`);
marcella.forEach(r => console.log(`  ${r.id} | ${r.fields.Name} | ${r.fields['Meal Type']} | FF: ${r.fields['Frozen Friday'] ? 'YES' : 'no'} | Notes: "${r.fields.Notes || ''}"`));
