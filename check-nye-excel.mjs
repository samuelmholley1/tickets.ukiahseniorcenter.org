import XLSX from 'xlsx';

const wb = XLSX.readFile('Holidays 2025_12-29-2025.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('=== NYE ENTRIES IN EXCEL FILE ===\n');

const nyeEntries = data.filter(r => {
  const details = r.Details || '';
  return details.includes('NYE Dance');
});

console.log('Total NYE transactions in Excel:', nyeEntries.length);

let totalNYETickets = 0;

nyeEntries.forEach((r, i) => {
  const details = r.Details || '';
  const memberMatch = details.match(/(\d+)x NYE Dance \(Member\)/);
  const nonMemberMatch = details.match(/(\d+)x NYE Dance \(Nonmember\)/);
  const member = memberMatch ? parseInt(memberMatch[1]) : 0;
  const nonMember = nonMemberMatch ? parseInt(nonMemberMatch[1]) : 0;
  const total = member + nonMember;
  totalNYETickets += total;
  
  console.log(`${i+1}. ${r['First Name']} ${r['Last Name']} | ${total} tickets | ${r['Payment Date (America/Los_Angeles)']?.substring(0, 10)}`);
});

console.log('\nTotal NYE tickets in Excel (from Zeffy):', totalNYETickets);
console.log('\nNote: This only includes Zeffy transactions. Manual Cash/Check/Comp entries are NOT in this Excel file.');
