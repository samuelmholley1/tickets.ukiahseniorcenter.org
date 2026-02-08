// Airtable Schema Sync Script
// Fetches full schema from Airtable Metadata API and writes AIRTABLE_SCHEMA.md
// in the EXACT format the codebase already uses (table-per-section, Notes column, full options).
//
// Usage:  npm run sync-airtable   (or)   node scripts/sync-airtable-schema.mjs
// Requires: AIRTABLE_API_KEY in .env with scope schema.bases:read

import fs from 'fs';
import path from 'path';

const BASE_ID = 'appZ6HE5luAFV0Ot2';

// Load .env / .env.local manually (avoids requiring dotenv under Yarn PnP)
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/\r/g, '').trim();
      }
    }
  }
}
loadEnv();

const API_KEY = process.env.AIRTABLE_API_KEY;

if (!API_KEY) {
  console.error('❌  AIRTABLE_API_KEY not found in .env / .env.local');
  console.error('   Create a PAT at https://airtable.com/create/tokens with scope schema.bases:read');
  process.exit(1);
}

// ── Table ordering & metadata that the API does NOT provide ───────────────────
// These are hand-curated descriptions and display hints.
// If a table isn't listed here, it still gets included — just without a purpose blurb.

const TABLE_META = {
  'CONTACTS': {
    purpose: 'Master contact table for all members, donors, and contacts. Links to MEMBERSHIPS_NEW, DONATIONS_NEW, Lunch Cards, and Lunch Reservations. **Use this table instead of Main Form for all queries.**',
    envVar: null,
    order: 1,
  },
  'MEMBERSHIPS_NEW': {
    purpose: 'Current membership records with payment dates, expiration, and status. Linked from CONTACTS.',
    order: 2,
  },
  'DONATIONS_NEW': {
    purpose: 'Current donation records. Linked from CONTACTS.',
    order: 3,
  },
  'Lunch Reservations': {
    purpose: 'Tracks daily lunch reservations and walk-ins for the dining room.',
    order: 4,
  },
  'Lunch Cards': {
    purpose: 'Prepaid meal cards. Tracks remaining meals and delivery preferences.',
    order: 5,
  },
  'Kitchen Data': {
    purpose: 'Tracks daily grocery donation weights by source (Safeway, Lucky) and kitchen temperatures.',
    order: 6,
  },
  'Volunteers': {
    purpose: 'Volunteer applications and management. Full intake form with emergency contacts.',
    order: 7,
  },
  'USC Utilization': {
    purpose: 'Monthly utilization statistics for all senior center programs. Used for MTA reports (Transportation category: Miles, Rides).',
    order: 8,
  },
  'QuickBooks Tokens': {
    purpose: 'Stores QBO OAuth tokens. Contains ONE record where `{Token Type}=\'Current\'`.',
    envVar: 'AIRTABLE_QB_TOKENS_TABLE_ID',
    order: 9,
  },
  'Scoop Checklist': {
    purpose: 'Newsletter (SCOOP) production task tracking.',
    order: 10,
  },
  'Thanksgiving Planning': {
    purpose: 'Task management for annual Thanksgiving meal event.',
    order: 11,
  },
  'Christmas Drive-Thru 2025': {
    purpose: 'Ticket sales for 2025 Christmas Drive-Thru dinner event.',
    order: 12,
  },
  'NYE Gala Dance 2025': {
    purpose: 'Ticket sales for 2025 New Year\'s Eve Gala Dance.',
    order: 13,
  },
  'Valentines Day Dance 2026': {
    purpose: 'Ticket sales for 2026 Valentine\'s Day Dance.',
    order: 14,
  },
  'Speakeasy Gala 2026': {
    purpose: 'Ticket sales for 2026 Speakeasy Gala fundraiser.',
    order: 15,
  },
  'Memberships': {
    purpose: 'Website membership intake form. NOT the canonical membership data — use MEMBERSHIPS_NEW for that.',
    suffix: '(LEGACY)',
    order: 16,
  },
  'Main Form': {
    purpose: 'Legacy data imported from original database. **DO NOT QUERY DIRECTLY.** Migrated to CONTACTS and MEMBERSHIPS_NEW. Kept for historical reference only.',
    suffix: '(LEGACY)',
    order: 17,
  },
  'FundRequest&Donations': {
    purpose: 'Legacy donation/fund request tracking. Use DONATIONS_NEW for current operations.',
    suffix: '(LEGACY)',
    order: 18,
  },
};

// ── Fetch schema from Airtable Metadata API ──────────────────────────────────

async function fetchSchema() {
  console.log('🔄  Fetching Airtable schema…');
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.error('❌  Unauthorized — your PAT needs the schema.bases:read scope.');
      console.error('   https://airtable.com/create/tokens');
    }
    throw new Error(`Airtable API ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.tables;
}

// ── Build the Notes string for a single field ────────────────────────────────

function fieldNotes(field, allTables) {
  const parts = [];

  // First field in a table is always the primary field
  // (Airtable returns fields in order; primary is first)

  // Type-specific notes
  const opts = field.options || {};

  switch (field.type) {
    case 'singleSelect':
    case 'multipleSelects': {
      if (opts.choices?.length) {
        const names = opts.choices.map(c => c.name).join(', ');
        parts.push(`Options: ${names}`);
      }
      break;
    }
    case 'multipleRecordLinks': {
      if (opts.linkedTableId) {
        parts.push(`→ ${opts.linkedTableId}`);
      }
      break;
    }
    case 'number': {
      if (opts.precision === 0) parts.push('Integer');
      else if (opts.precision != null) parts.push(`Precision: ${opts.precision}`);
      break;
    }
    case 'currency': {
      const prec = opts.precision ?? 2;
      const sym = opts.symbol ?? '$';
      parts.push(`Precision: ${prec}, Symbol: ${sym}`);
      break;
    }
    case 'date': {
      if (opts.dateFormat) {
        const fmt = opts.dateFormat.format || opts.dateFormat.name || 'local date';
        if (fmt === 'l' || fmt === 'local') parts.push('Format: local date');
        else parts.push(`Format: ${fmt}`);
      }
      break;
    }
    case 'dateTime': {
      const df = opts.dateFormat?.format || opts.dateFormat?.name || '';
      const tf = opts.timeFormat?.name || opts.timeFormat?.format || '';
      const datePart = (df === 'l' || df === 'local') ? 'local' :
                       (df === 'M/D/YYYY' || df === 'us') ? 'M/D/YYYY' : df || 'local';
      const timePart = tf === '12hour' ? '12-hour' :
                       tf === '24hour' ? '24-hour' : tf || '';
      parts.push(`Format: ${datePart}${timePart ? ', ' + timePart : ''}`);
      break;
    }
    case 'checkbox': {
      if (opts.color) {
        // Map Airtable color names to human-friendly colors
        const colorMap = {
          'redBright': 'Red', 'greenBright': 'Green', 'blueBright': 'Blue',
          'yellowBright': 'Yellow', 'purpleBright': 'Purple', 'grayBright': 'Gray',
          'orangeBright': 'Orange', 'pinkBright': 'Pink', 'tealBright': 'Teal',
          'cyanBright': 'Cyan',
        };
        const colorName = colorMap[opts.color] || opts.color.replace('Bright', '');
        parts.push(`${colorName} check`);
      }
      break;
    }
    case 'formula': {
      if (opts.formula) parts.push(`Formula: \`${opts.formula}\``);
      break;
    }
    case 'rollup': {
      if (opts.function) parts.push(`Rollup: ${opts.function}`);
      break;
    }
    case 'singleCollaborator': {
      parts.push('Airtable user');
      break;
    }
    case 'aiText': {
      parts.push('AI-generated');
      break;
    }
    // singleLineText, multilineText, email, phoneNumber, multipleAttachments — no special notes
    default:
      break;
  }

  return parts.join(' — ');
}

// ── Generate anchor slug for TOC links ───────────────────────────────────────

function anchorSlug(name, suffix) {
  const full = suffix ? `${name} ${suffix}` : name;
  return full.toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Table display name for headers ───────────────────────────────────────────

function tableHeading(name) {
  const meta = TABLE_META[name];
  const suffix = meta?.suffix || 'Table';
  return `${name} ${suffix}`;
}

// ── Table display name for TOC ───────────────────────────────────────────────

function tocLine(name, tableId, idx) {
  const meta = TABLE_META[name];
  const suffix = meta?.suffix || 'Table';
  const anchor = anchorSlug(name, suffix);
  const desc = meta?.purpose ? ` — ${meta.purpose.split('.')[0]}` : '';
  return `${idx}. [${name}](#${anchor})${desc}`;
}

// ── Main markdown generator ──────────────────────────────────────────────────

function generateMarkdown(tables) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Sort tables by our preferred order (unknown tables go last, alphabetically)
  const sorted = [...tables].sort((a, b) => {
    const oa = TABLE_META[a.name]?.order ?? 900;
    const ob = TABLE_META[b.name]?.order ?? 900;
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name);
  });

  // Build lookup map for linked table resolution
  const tableMap = Object.fromEntries(tables.map(t => [t.id, t.name]));

  let md = '';

  // Header
  md += `# Airtable Schema Documentation\n\n`;
  md += `**Last Updated:** ${today}  \n`;
  md += `**Verified Against Live API:** ${today}  \n`;
  md += `**Base:** Ukiah Senior Center \`${BASE_ID}\`  \n`;
  md += `**Total Tables:** ${sorted.length}\n`;
  md += `\n---\n\n`;

  // Table of Contents
  md += `## Table of Contents\n\n`;
  sorted.forEach((t, i) => {
    md += tocLine(t.name, t.id, i + 1) + '\n';
  });
  md += `\n---\n\n`;

  // Per-table sections
  sorted.forEach(table => {
    const meta = TABLE_META[table.name] || {};
    const heading = tableHeading(table.name);

    md += `## ${heading}\n\n`;
    md += `**Table ID:** \`${table.id}\`  \n`;
    if (meta.envVar) {
      md += `**Env Var:** \`${meta.envVar}\`  \n`;
    }
    if (meta.purpose) {
      md += `**Purpose:** ${meta.purpose}\n`;
    }
    md += `\n`;

    // Field table
    md += `| Field | Type | Field ID | Notes |\n`;
    md += `|-------|------|----------|-------|\n`;

    table.fields.forEach((f, fi) => {
      // Bold the type if it's multipleSelects (easy to mistake for singleSelect)
      const typeStr = f.type === 'multipleSelects' ? `**${f.type}**` : f.type;
      let notes = fieldNotes(f, tables);

      // For the very first field, append "Primary field" hint
      if (fi === 0 && !notes) notes = 'Primary field';
      else if (fi === 0) notes = 'Primary field — ' + notes;

      md += `| ${f.name} | ${typeStr} | \`${f.id}\` | ${notes} |\n`;
    });

    md += `\n---\n\n`;
  });

  // Append static reference sections that the API doesn't generate

  md += `## Schema Change Log\n\n`;
  md += `| Date | Change |\n`;
  md += `|------|--------|\n`;
  md += `| ${today} | Auto-synced from Airtable Metadata API via \`scripts/sync-airtable-schema.mjs\`. |\n`;
  md += `\n---\n\n`;

  md += `## Data Import/Export Notes\n\n`;
  md += `### CSV Import Format\n`;
  md += `- Date fields: \`YYYY-MM-DD\` (e.g., \`2025-12-31\`)\n`;
  md += `- Currency fields: Numeric only (e.g., \`70.00\` not \`$70.00\`)\n`;
  md += `- Phone numbers: Any format works, but \`(707) 555-1234\` is preferred\n`;
  md += `- Email: Must be valid email format\n\n`;

  md += `### Exporting for Reports\n`;
  md += `- Use Grid View → Download CSV\n`;
  md += `- Or use API to fetch filtered records\n`;
  md += `- Birthday labels: Export First Name, Last Name, Birthday, Address fields\n`;
  md += `\n---\n\n`;

  md += `## API Access Patterns\n\n`;
  md += `### Common Queries\n\n`;
  md += `**Get all active members:**\n`;
  md += '```\n';
  md += `filterByFormula={Membership Status}='Active'\n`;
  md += '```\n\n';
  md += `**Get members with birthdays this month:**\n`;
  md += '```\n';
  md += `filterByFormula=MONTH({Birthday})=MONTH(TODAY())\n`;
  md += '```\n\n';
  md += `**Get Transportation data for MTA reports:**\n`;
  md += '```\n';
  md += `filterByFormula=AND({Category}='Transportation',{Fiscal Year}='2024-2025',{Month}='November')\n`;
  md += '```\n\n';

  md += `### Rate Limits\n`;
  md += `- 5 requests per second per base\n`;
  md += `- Batch operations when possible (up to 10 records per request)\n`;
  md += `\n---\n\n`;

  md += `## Security & Access\n\n`;
  md += `- **API Key:** Personal Access Token in \`.env.local\` (never commit!)\n`;
  md += `- **Scopes Required:** \n`;
  md += `  - \`data.records:read\` - Read records\n`;
  md += `  - \`data.records:write\` - Create/update records\n`;
  md += `  - \`schema.bases:read\` - Read base structure (needed for this sync script)\n`;
  md += `\n`;

  return md;
}

// ── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const tables = await fetchSchema();
    const markdown = generateMarkdown(tables);

    const outputPath = path.join(process.cwd(), 'AIRTABLE_SCHEMA.md');
    fs.writeFileSync(outputPath, markdown);

    console.log(`✅  Written to ${outputPath}`);
    console.log(`   ${tables.length} tables, ${tables.reduce((n, t) => n + t.fields.length, 0)} total fields.`);
  } catch (err) {
    console.error('❌  Sync failed:', err.message);
    process.exit(1);
  }
}

main();
