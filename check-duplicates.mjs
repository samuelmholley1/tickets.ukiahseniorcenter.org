import XLSX from 'xlsx';

const workbook = XLSX.readFile('Holidays 2025_12-29-2025.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const names = ['Tammy Sams', 'Dona Mitchum', 'Frances Owen', 'Rocky Fiegi', 'Evelyn Vance', 'Charolette Jacobs', 'Tom DesRoches'];

console.log('=== EXCEL DATA FOR THE 7 IMPORTED PEOPLE ===\n');

names.forEach(name => {
  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ');
  
  const matches = data.filter(r => 
    r['First Name'] === firstName && r['Last Name'] === lastName
  );
  
  console.log(`\n${name}:`);
  matches.forEach((m, i) => {
    console.log(`  Entry ${i + 1}:`);
    console.log(`    Email: ${m.Email}`);
    console.log(`    Payment Date: ${m['Payment Date (America/Los_Angeles)']}`);
    console.log(`    Details: ${m.Details}`);
    console.log(`    Refund: ${m['Refund Amount'] || 'None'}`);
  });
});
