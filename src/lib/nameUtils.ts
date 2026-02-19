/**
 * Parse a full name (possibly joint like "Mary Snyder & Don Burgess") into firstName/lastName.
 * 
 * Simple:  "John Smith"              → { firstName: "John",        lastName: "Smith" }
 * Joint:   "Mary Snyder & Don Burgess" → { firstName: "Mary & Don", lastName: "Snyder & Burgess" }
 * Joint same last: "Mary & Don Smith" → { firstName: "Mary & Don", lastName: "Smith" }
 * Single:  "Prince"                  → { firstName: "Prince",      lastName: "" }
 */
export function parseJointName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.replace(/\s+/g, ' ').trim();
  if (!trimmed) return { firstName: '', lastName: '' };

  // Check for joint name with "&"
  if (trimmed.includes(' & ')) {
    const parts = trimmed.split(/\s*&\s*/);
    if (parts.length === 2) {
      const aParts = parts[0].trim().split(' ');
      const bParts = parts[1].trim().split(' ');

      const aFirst = aParts[0] || '';
      const aLast = aParts.slice(1).join(' ');
      const bFirst = bParts[0] || '';
      const bLast = bParts.slice(1).join(' ');

      // "Mary & Don Smith" — second person has last name, first doesn't
      if (!aLast && bLast) {
        return { firstName: `${aFirst} & ${bFirst}`, lastName: bLast };
      }
      // "Mary Snyder & Don Burgess" — both have last names
      if (aLast && bLast) {
        return { firstName: `${aFirst} & ${bFirst}`, lastName: `${aLast} & ${bLast}` };
      }
      // "Mary & Don" — neither has a last name
      if (!aLast && !bLast) {
        return { firstName: `${aFirst} & ${bFirst}`, lastName: '' };
      }
      // "Mary Snyder & Don" — first has last, second doesn't → share first's last
      if (aLast && !bLast) {
        return { firstName: `${aFirst} & ${bFirst}`, lastName: aLast };
      }
    }
  }

  // Simple name: first word = firstName, rest = lastName
  const words = trimmed.split(' ');
  return {
    firstName: words[0] || '',
    lastName: words.slice(1).join(' ') || '',
  };
}

/**
 * Smart title-case name normalization
 * 
 * Handles:
 * - All lowercase → Title Case (david vilner → David Vilner)
 * - ALL CAPS → Title Case (JOAN BRITNELL → Joan Britnell)
 * - Short all-caps ≤ 3 chars → kept (CJ, ISS, Sr, Jr, II, III, IV)
 * - Mixed case → left alone (McCallum, DesRoches, MacMillan)
 * - Mc prefix → McX (MCCALLUM → McCallum)
 * - Hyphens → each part normalized (bender-hooks → Bender-Hooks)
 * - Apostrophes → each part normalized (o'brien → O'Brien)
 * - & preserved
 * - Extra whitespace collapsed
 */
export function titleCaseName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().split(' ').map(word => {
    if (word === '&' || word === '') return word;
    // Split on hyphens and apostrophes, preserving delimiters
    return word.split(/([-'])/).map(part => {
      if (part === '-' || part === "'" || !part) return part;
      // Short all-caps: keep as-is (CJ, ISS, Sr, Jr, II, III, IV)
      if (part.length <= 3 && part === part.toUpperCase() && /[A-Z]/.test(part)) return part;
      // Mixed case: respect original (McCallum, DesRoches, MacMillan)
      if (/[A-Z]/.test(part) && /[a-z]/.test(part)) return part;
      // All lowercase or all uppercase → smart title case
      const lower = part.toLowerCase();
      // Mc prefix (McDonald, McCallum)
      if (lower.startsWith('mc') && lower.length > 2) {
        return 'Mc' + lower.charAt(2).toUpperCase() + lower.slice(3);
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }).join(' ');
}
