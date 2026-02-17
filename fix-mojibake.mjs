/**
 * Fix double-encoded UTF-8 mojibake in source files.
 * 
 * Chain: UTF-8 bytes → read as Windows-1252 → saved as UTF-8.
 * Result: each original byte became a Unicode char via cp1252 mapping,
 * then that char was UTF-8 encoded.
 * 
 * Fix: reverse the cp1252 mapping (char → original byte), then decode as UTF-8.
 */

import { readFileSync, writeFileSync } from 'fs';

// Windows-1252 reverse mapping: Unicode code point → original byte value
// For 0x80-0x9F range, cp1252 maps to various Unicode code points
const cp1252ReverseLookup = new Map();

// Bytes 0x00-0x7F: same as ASCII (won't appear in mojibake sequences)
// Bytes 0xA0-0xFF: same as Unicode code points U+00A0-U+00FF
for (let b = 0xA0; b <= 0xFF; b++) {
  cp1252ReverseLookup.set(b, b); // code point = byte value
}

// Bytes 0x80-0x9F: special cp1252 mappings
const cp1252Special = [
  [0x80, 0x20AC], // €
  // 0x81 undefined
  [0x82, 0x201A], // ‚
  [0x83, 0x0192], // ƒ
  [0x84, 0x201E], // „
  [0x85, 0x2026], // …
  [0x86, 0x2020], // †
  [0x87, 0x2021], // ‡
  [0x88, 0x02C6], // ˆ
  [0x89, 0x2030], // ‰
  [0x8A, 0x0160], // Š
  [0x8B, 0x2039], // ‹
  [0x8C, 0x0152], // Œ
  // 0x8D undefined
  [0x8E, 0x017D], // Ž
  // 0x8F undefined
  // 0x90 undefined
  [0x91, 0x2018], // '
  [0x92, 0x2019], // '
  [0x93, 0x201C], // "
  [0x94, 0x201D], // "
  [0x95, 0x2022], // •
  [0x96, 0x2013], // –
  [0x97, 0x2014], // —
  [0x98, 0x02DC], // ˜
  [0x99, 0x2122], // ™
  [0x9A, 0x0161], // š
  [0x9B, 0x203A], // ›
  [0x9C, 0x0153], // œ
  // 0x9D undefined
  [0x9E, 0x017E], // ž
  [0x9F, 0x0178], // Ÿ
];

// Build reverse map: Unicode code point → byte
const unicodeToByte = new Map();
for (let b = 0xA0; b <= 0xFF; b++) {
  unicodeToByte.set(b, b);
}
for (const [byte, codePoint] of cp1252Special) {
  unicodeToByte.set(codePoint, byte);
}
// CRITICAL: Undefined cp1252 byte positions (0x81, 0x8D, 0x8F, 0x90, 0x9D)
// are typically decoded as C1 control characters (same code point as byte value).
// Also add all C1 controls 0x80-0x9F as fallbacks for decoders that
// don't use cp1252 special mappings.
for (let b = 0x80; b <= 0x9F; b++) {
  if (!unicodeToByte.has(b)) {
    unicodeToByte.set(b, b); // C1 control U+00xx → byte 0xxx
  }
}

// Characters that can appear in mojibake sequences (cp1252 bytes 0x80-0xFF mapped to Unicode)
const mojibakeChars = new Set();
for (let b = 0xA0; b <= 0xFF; b++) {
  mojibakeChars.add(String.fromCodePoint(b));
}
for (const [, codePoint] of cp1252Special) {
  mojibakeChars.add(String.fromCodePoint(codePoint));
}
// Add C1 control characters (U+0080-U+009F) — these come from undefined cp1252 positions
for (let b = 0x80; b <= 0x9F; b++) {
  mojibakeChars.add(String.fromCodePoint(b));
}

function isMojibakeChar(ch) {
  return mojibakeChars.has(ch);
}

function charToByte(ch) {
  const cp = ch.codePointAt(0);
  return unicodeToByte.get(cp);
}

/**
 * Try to reverse-decode a sequence of mojibake chars back to original UTF-8.
 * Returns decoded string or null if not valid.
 */
function tryDecode(chars) {
  const bytes = [];
  for (const ch of chars) {
    const b = charToByte(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  
  const buf = Buffer.from(bytes);
  const decoded = buf.toString('utf-8');
  
  // Check for replacement characters (invalid UTF-8)
  if (decoded.includes('\ufffd')) return null;
  
  // Must produce shorter output (real decoding happened)
  if (decoded.length >= chars.length) return null;
  
  // Result should be "normal" characters - printable, not in the mojibake range
  // (prevents false positive cascading)
  for (const ch of decoded) {
    const cp = ch.codePointAt(0);
    // Should be ASCII, or proper Unicode like emoji (> 0xFF)
    // Skip check for variation selectors (U+FE0E, U+FE0F) which are fine
    if (cp >= 0x80 && cp <= 0xFF) {
      // This looks like it might still be mojibake - could be a partial decode
      // But some legit chars are in this range (e.g., accented letters)
      // Allow it if the overall decode looks good
    }
  }
  
  return decoded;
}

const filesToFix = [
  'src/app/internal/lunch/page.tsx',
  'src/app/internal/page.tsx',
  'src/app/ticket/page.tsx',
];

function fixFile(filePath) {
  const text = readFileSync(filePath, 'utf-8');
  let result = '';
  let i = 0;
  let fixCount = 0;
  
  while (i < text.length) {
    const ch = text[i];
    
    if (isMojibakeChar(ch)) {
      // Collect consecutive mojibake-eligible characters
      let end = i;
      while (end < text.length && isMojibakeChar(text[end])) {
        end++;
      }
      
      const mojibakeSeq = text.slice(i, end);
      
      // Try to decode the full sequence
      const decoded = tryDecode(Array.from(mojibakeSeq));
      
      if (decoded !== null) {
        result += decoded;
        fixCount++;
        i = end;
        continue;
      }
      
      // Try to find valid sub-sequences (greedy from left)
      let found = false;
      for (let tryEnd = end; tryEnd > i + 1; tryEnd--) {
        const subSeq = text.slice(i, tryEnd);
        const subDecoded = tryDecode(Array.from(subSeq));
        if (subDecoded !== null) {
          result += subDecoded;
          fixCount++;
          i = tryEnd;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Not mojibake, keep original char
        result += ch;
        i++;
      }
    } else {
      result += ch;
      i++;
    }
  }
  
  if (text !== result) {
    writeFileSync(filePath, result, 'utf-8');
    console.log('Fixed ' + filePath + ': ' + fixCount + ' mojibake sequences decoded');
    
    const origLines = text.split('\n');
    const fixedLines = result.split('\n');
    let shown = 0;
    for (let li = 0; li < fixedLines.length && shown < 12; li++) {
      if (origLines[li] !== fixedLines[li]) {
        console.log('  L' + (li+1) + ': ' + fixedLines[li].trim().substring(0, 100));
        shown++;
      }
    }
    if (shown >= 12) console.log('  ...(more)');
  } else {
    console.log('No changes: ' + filePath);
  }
  
  return fixCount;
}

let total = 0;
for (const f of filesToFix) {
  try {
    total += fixFile(f);
  } catch (err) {
    console.error('Error fixing ' + f + ': ' + err.message);
  }
}
console.log('\nTotal: ' + total + ' sequences fixed');

// Verify: search for remaining mojibake signatures
console.log('\nVerification (searching for remaining mojibake):');
for (const f of filesToFix) {
  try {
    const content = readFileSync(f, 'utf-8');
    // ð followed by Ÿ is the telltale sign of double-encoded emoji (F0 9F)
    const emojiMojibake = (content.match(/\u00f0\u0178/g) || []).length;
    // â followed by a cp1252-0x80 char is the telltale sign of double-encoded 3-byte UTF-8
    const threeByteMojibake = (content.match(/\u00e2[\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178\u00A0-\u00FF]/g) || []).length;
    if (emojiMojibake > 0 || threeByteMojibake > 0) {
      console.log('  WARNING: ' + f + ': ' + emojiMojibake + ' emoji mojibake, ' + threeByteMojibake + ' 3-byte mojibake remaining');
    } else {
      console.log('  CLEAN: ' + f);
    }
  } catch (err) {
    console.error('  Error verifying ' + f + ': ' + err.message);
  }
}
