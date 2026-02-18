// Add meal numbers to Carol Ann Hulsmann and Marcella ISS
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const AIRTABLE_API_KEY = envContent.match(/AIRTABLE_API_KEY=([^\s\r\n]+)/)?.[1];
const AIRTABLE_BASE_ID = envContent.match(/AIRTABLE_BASE_ID=([^\s\r\n]+)/)?.[1];
const TABLE_ID = 'tblF83nL5KPuPUDqx';

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

const updates = [
  // 2/19 hot meals - add #1
  { id: 'recj87XOdorEsdHqI', fields: { 'Notes': '#1' }, label: 'Carol Ann Hulsmann 2/19 hot meal → #1' },
  { id: 'rec2euN5oZB237vEF', fields: { 'Notes': '#1' }, label: 'Marcella ISS 2/19 hot meal → #1' },
  // 2/20 frozen meals - add #2
  { id: 'rec05oyFYpQ40uY7W', fields: { 'Notes': '🧊 FROZEN FRIDAY | #2' }, label: 'Carol Ann Hulsmann 2/20 frozen → #2' },
  { id: 'recGAZ4P1QoSItTQm', fields: { 'Notes': '🧊 FROZEN FRIDAY | #2' }, label: 'Marcella ISS 2/20 frozen → #2' },
];

for (const u of updates) {
  console.log(`Updating: ${u.label}`);
  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}/${u.id}`,
    { method: 'PATCH', headers, body: JSON.stringify({ fields: u.fields }) }
  );
  if (!res.ok) {
    console.error(`  FAILED: ${res.status} ${await res.text()}`);
  } else {
    const data = await res.json();
    console.log(`  OK: ${data.fields.Name} - Notes: "${data.fields.Notes}"`);
  }
  await new Promise(r => setTimeout(r, 250));
}

console.log('\nDone!');
