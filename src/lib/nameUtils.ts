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
