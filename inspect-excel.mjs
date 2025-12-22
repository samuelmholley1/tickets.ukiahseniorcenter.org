import XLSX from 'xlsx';

console.log('\n📖 INSPECTING: Holidays w dates2025_12-19-2025.xlsx\n');
console.log('==================================================\n');

const wb = XLSX.readFile('Holidays w dates2025_12-19-2025.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log(`Total rows: ${data.length}\n`);

console.log('📋 FIRST 5 ROWS:\n');
data.slice(0, 5).forEach((row, i) => {
  console.log(`Row ${i + 1}:`);
  Object.entries(row).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log('');
});

console.log('\n📊 UNIQUE TICKET TYPES:\n');
const ticketTypes = {};
data.forEach(row => {
  const type = row['Ticket type'];
  if (type) {
    ticketTypes[type] = (ticketTypes[type] || 0) + 1;
  }
});

Object.entries(ticketTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`   ${type}: ${count}`);
});

console.log('\n==================================================\n');
