import XLSX from 'xlsx';

const wb = XLSX.readFile("Valentine's Day Dance 2026_2-14-2026.xlsx");
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

// Get unique ticket types
const types = [...new Set(data.map(r => r['Ticket type']))];
console.log('Ticket types:', types);

// Group by buyer email
const byBuyer = {};
data.forEach(r => {
  const email = r['Buyer email'];
  if (!byBuyer[email]) {
    byBuyer[email] = { name: r['Buyer name'], email, member: 0, nonMember: 0, guests: new Set() };
  }
  if (r['Ticket type'].includes('Member') && !r['Ticket type'].includes('Nonmember')) {
    byBuyer[email].member++;
  } else {
    byBuyer[email].nonMember++;
  }
  byBuyer[email].guests.add(r['Guest name']);
});

console.log('\nBuyer count:', Object.keys(byBuyer).length);
console.log('Total tickets:', data.length);
Object.values(byBuyer).forEach(b => {
  console.log(`${b.name}: ${b.member} member, ${b.nonMember} non-member = ${b.member + b.nonMember} total`);
});
