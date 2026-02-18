// Test the titleCaseName function with actual data
function titleCaseName(name) {
  return name.replace(/\s+/g, ' ').trim().split(' ').map(word => {
    if (word === '&' || word === '') return word;
    return word.split(/([-'])/).map(part => {
      if (part === '-' || part === "'" || !part) return part;
      if (part.length <= 3 && part === part.toUpperCase() && /[A-Z]/.test(part)) return part;
      if (/[A-Z]/.test(part) && /[a-z]/.test(part)) return part;
      const lower = part.toLowerCase();
      if (lower.startsWith('mc') && lower.length > 2) {
        return 'Mc' + lower.charAt(2).toUpperCase() + lower.slice(3);
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }).join(' ');
}

const tests = [
  // Actual names from 2/19 data
  ['david vilner', 'David Vilner'],
  ['dick hooper', 'Dick Hooper'],
  ['JOAN BRITNELL', 'Joan Britnell'],
  ['Carol Ann  Hulsmann', 'Carol Ann Hulsmann'],
  ['Tom DesRoches', 'Tom DesRoches'],
  ['Liz MacMillan', 'Liz MacMillan'],
  ['Linda  McCallum', 'Linda McCallum'],
  ['Marcella ISS', 'Marcella ISS'],
  ['Sara Bender-Hooks', 'Sara Bender-Hooks'],
  ['Harry & Evelyn Vance', 'Harry & Evelyn Vance'],
  ['Jim  Denham', 'Jim Denham'],
  ['Racheal  Roque', 'Racheal Roque'],
  ['Thomas  Arendell', 'Thomas Arendell'],
  ['Maureen  Troller', 'Maureen Troller'],
  // Edge cases
  ['CJ SMITH', 'CJ Smith'],
  ['MCCALLUM', 'McCallum'],
  ['mccallum', 'McCallum'],
  ["o'brien", "O'Brien"],
  ["O'BRIEN", "O'Brien"],
  ['ronald hoel sr.', 'Ronald Hoel Sr.'],
  ['RONALD HOEL SR.', 'Ronald Hoel SR.'],  // SR. is 3 chars all caps → kept
  ['john feliz sr.', 'John Feliz Sr.'],
  ['Container Charge', 'Container Charge'],
  ['', ''],
];

let pass = 0, fail = 0;
for (const [input, expected] of tests) {
  const result = titleCaseName(input);
  const ok = result === expected;
  if (!ok) {
    console.log(`FAIL: "${input}" → "${result}" (expected "${expected}")`);
    fail++;
  } else {
    console.log(`  OK: "${input}" → "${result}"`);
    pass++;
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
