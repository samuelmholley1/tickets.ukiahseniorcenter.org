import fs from 'fs';

let c = fs.readFileSync('src/app/internal/lunch/page.tsx', 'utf8');

// Replace px-6 py-3 only in toggle button classNames (backtick pattern)
// The toggle buttons use: className={`px-6 py-3 rounded-lg
// The Zeffy link uses: className="inline-flex items-center gap-2 px-6 py-3 (different pattern)
const pattern = /className=\{`px-6 py-3/g;
const count1 = (c.match(pattern) || []).length;
c = c.replace(pattern, 'className={`px-5 py-2 text-[15px]');

// Check remaining px-6 py-3 instances (should be 1 - the Zeffy link)
const remaining = (c.match(/px-6 py-3/g) || []).length;

// Fix Override button unselected color
const oldOverride = "bg-red-100 text-red-700 hover:bg-red-200";
const newOverride = "bg-gray-200 text-gray-700 hover:bg-gray-300";
const count3 = (c.match(new RegExp(oldOverride.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
c = c.replace(oldOverride, newOverride);

fs.writeFileSync('src/app/internal/lunch/page.tsx', c, 'utf8');
console.log(`Toggle buttons replaced: ${count1}`);
console.log(`Remaining px-6 py-3: ${remaining} (should be 1 - Zeffy link)`);
console.log(`Override color replacements: ${count3}`);

// Verify emojis survived
const emoji_check = c.includes('💵📝 Cash & Check');
console.log(`Emoji check (💵📝): ${emoji_check}`);
