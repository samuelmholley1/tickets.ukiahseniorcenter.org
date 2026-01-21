# 2026 Events Setup Guide

**Created:** January 13, 2026  
**Status:** ✅ COMPLETE - All code and Airtable tables ready

**Events:**
1. **Valentine's Day Dance** - February 14, 2026
2. **An Affair to Remember: A Night at the Speakeasy** - April 11, 2026

---

## ⚠️ IMPORTANT: Airtable Must Be Configured First!

**Before enabling any new event in code, you MUST:**
1. Create the Airtable table with ALL required fields
2. Configure Single Select field options to match what the code sends
3. Test a submission before going live

**See `SEASONAL_EVENT_PROTOCOL.md` → "Airtable Configuration for New Events" section for full checklist.**

Common failure: 500 error on ticket submission = Airtable table/field missing or misconfigured.

---

## Event Pricing Summary

### Valentine's Day Dance (Feb 14, 2026)

| Ticket Type | Early Bird (Until Feb 9) | Regular (Feb 10+) |
|------------|--------------------------|-------------------|
| Member | $30 | $35 |
| Non-Member | $45 | $45 |

**Price Change Date:** February 10, 2026 (member price increases from $30 → $35)

### An Affair to Remember: A Night at the Speakeasy (Apr 11, 2026)

| Ticket Type | Early Bird (Until Mar 28) | Regular (Mar 29+) |
|------------|---------------------------|-------------------|
| All Tickets | $100 | $110 |

**Price Change Date:** March 29, 2026 (price increases from $100 → $110)

**Note:** Speakeasy is single-price (no member/non-member distinction)

---

## ✅ Airtable Tables Created

**The AI assistant (GitHub Copilot) manages all Airtable operations including creating tables, fields, and schema changes via the Airtable API.**

| Table | Table ID | Status |
|-------|----------|--------|
| Valentine's Day Dance 2026 | `tblgQA8BawIrlk2kh` | ✅ Created |
| Speakeasy Gala 2026 | `tblMmwD5JEE5iCfLl` | ✅ Created |

Environment variables added to `.env.local`:
```
AIRTABLE_VALENTINES_TABLE_ID=tblgQA8BawIrlk2kh
AIRTABLE_SPEAKEASY_TABLE_ID=tblMmwD5JEE5iCfLl
```

---

## ✅ Code Changes Completed

### 1. Internal Sales Page (`/src/app/internal/page.tsx`)
- ✅ Added Valentine's Day Dance section with pink/red theme
- ✅ Added Speakeasy Gala section with dark speakeasy theme
- ✅ **Dynamic pricing** automatically switches after deadline dates
- ✅ Early bird badges show when applicable
- ✅ NYE 2025 section commented out (preserved for future)
- ✅ Zeffy links added

### 2. API Route (`/src/app/api/tickets/submit/route.ts`)
- ✅ Updated to handle Valentine's and Speakeasy quantities
- ✅ Dynamic pricing functions for both events
- ✅ Submits to new Airtable tables
- ✅ Christmas/NYE code preserved in comments

### 3. PDF Tickets (`/src/app/api/tickets/pdf/route.ts`)
- ✅ Pink theme for Valentine's tickets
- ✅ Gold/dark art deco theme for Speakeasy tickets

### 4. Email Templates (`/src/lib/email.ts`)
- ✅ Separate emails for each event
- ✅ Pink theme for Valentine's
- ✅ Gold/dark theme for Speakeasy
- ✅ Donation only attached to first event email

---

## Valentine's Day Dance 2026 Table Schema

| Field Name | Type | Notes |
|------------|------|-------|
| First Name | Single line text | |
| Last Name | Single line text | |
| Email | Email | |
| Phone | Phone number | |
| Ticket Quantity | Number (integer) | Total tickets |
| Member Tickets | Number (integer) | Member-priced tickets |
| Non-Member Tickets | Number (integer) | Non-member tickets |
| Payment Method | Single select | Cash, Check, Zeffy, Comp, Other |
| Check Number | Single line text | |
| Payment Notes | Long text | Split payment details |
| Amount Paid | Currency | Ticket price only |
| Donation Amount | Currency | Separate field |
| Purchase Date | Date & Time | Pacific time |
| Transaction ID | Single line text | |
| Staff Initials | Single line text | |
| Refunded | Checkbox | |

---

## Speakeasy Gala 2026 Table Schema

| Field Name | Type | Notes |
|------------|------|-------|
| First Name | Single line text | |
| Last Name | Single line text | |
| Email | Email | |
| Phone | Phone number | |
| Ticket Quantity | Number (integer) | Single ticket type |
| Payment Method | Single select | Cash, Check, Zeffy, Comp, Other |
| Check Number | Single line text | |
| Payment Notes | Long text | |
| Amount Paid | Currency | Ticket price only |
| Donation Amount | Currency | Separate field |
| Purchase Date | Date & Time | Pacific time |
| Transaction ID | Single line text | |
| Staff Initials | Single line text | |
| Refunded | Checkbox | |

#### Table 2: Speakeasy Gala 2026

**Recommended Table Name:** `Speakeasy Gala 2026` or `An Affair to Remember 2026`

**Fields to Create:**

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| **First Name** | Single line text | Required |
| **Last Name** | Single line text | Required |
| **Email** | Email | Required |
| **Phone** | Phone number | Required |
| **Ticket Quantity** | Number (integer) | Total tickets purchased |
| **Payment Method** | Single select | Options: `Cash`, `Check`, `Zeffy`, `Comp`, `Other` |
| **Check Number** | Single line text | For check payments |
| **Payment Notes** | Long text | Split payment details, other notes |
| **Amount Paid** | Number (currency) | Ticket price only |
| **Donation Amount** | Number (currency) | Separate donation field |
| **Purchase Date** | Date & Time | With timestamp |
| **Transaction ID** | Single line text | Unique identifier |
| **Staff Initials** | Single line text | Who processed the sale |
| **Refunded** | Checkbox | For tracking refunds |

**Note:** No Member/Non-Member distinction for Speakeasy - just single ticket type with time-based pricing.

### Environment Variables Needed

After creating the tables, add these to `.env.local`:

```env
# Valentine's Day Dance 2026
AIRTABLE_VALENTINES_TABLE_ID=tblXXXXXXXXXXXXXX

# Speakeasy Gala 2026
AIRTABLE_SPEAKEASY_TABLE_ID=tblXXXXXXXXXXXXXX
```

**To get the Table ID:**
1. Open the table in Airtable
2. Look at the URL: `https://airtable.com/appZ6HE5luAFV0Ot2/tblXXXXXXXXXX/...`
3. The `tblXXXXXXXXXX` part is the Table ID

---

## Part 2: Internal Sales Page Updates

### Changes Required in `/src/app/internal/page.tsx`

#### 1. Update TypeScript Interface

```typescript
interface TicketQuantities {
  // Comment out old events
  // christmasMember: number;
  // christmasNonMember: number;
  // nyeMember: number;
  // nyeNonMember: number;
  
  // New events
  valentinesMember: number;
  valentinesNonMember: number;
  speakeasy: number;  // No member/non-member distinction
}
```

#### 2. Update Pricing Constants

```typescript
// Valentine's Day Dance - PRICES CHANGE FEB 10
const VALENTINES_MEMBER_EARLY = 30;      // Until Feb 9
const VALENTINES_MEMBER_REGULAR = 35;    // Feb 10+
const VALENTINES_NON_MEMBER = 45;        // Always $45

// Speakeasy Gala - PRICES CHANGE MAR 29
const SPEAKEASY_EARLY = 100;    // Until Mar 28
const SPEAKEASY_REGULAR = 110;  // Mar 29+

// Dynamic pricing based on current date
const today = new Date();
const valentinesPriceChangeDate = new Date('2026-02-10');
const speakeasyPriceChangeDate = new Date('2026-03-29');

const VALENTINES_MEMBER = today < valentinesPriceChangeDate 
  ? VALENTINES_MEMBER_EARLY 
  : VALENTINES_MEMBER_REGULAR;

const SPEAKEASY_PRICE = today < speakeasyPriceChangeDate 
  ? SPEAKEASY_EARLY 
  : SPEAKEASY_REGULAR;
```

#### 3. Update Zeffy Link

Change the card payment button to link to new Zeffy campaigns (once created).

#### 4. Comment Out NYE Section

Follow the `SEASONAL_EVENT_PROTOCOL.md` - comment out the NYE section:

```typescript
/* ========== NYE GALA 2025 SECTION - COMMENTED OUT FOR 2026 ==========
 * Event Period: December 31, 2025
 * Disabled: January 13, 2026
 * Reason: Event concluded, preserved for next year
 * ========================================================================== */
```

#### 5. Add Valentine's Day Section

```typescript
{/* Valentine's Day Dance */}
<div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: '#fff0f5', borderRadius: '8px' }}>
  <h3 className="font-['Jost',sans-serif] font-bold text-gray-800 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
    💕 Valentine's Day Dance
  </h3>
  <p className="font-['Bitter',serif] text-gray-600 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
    February 14, 2026 • Member: ${VALENTINES_MEMBER} | Non-Member: $45
    {today < valentinesPriceChangeDate && (
      <span className="text-green-600 font-semibold"> (Early Bird until Feb 9!)</span>
    )}
  </p>
  {/* Member/Non-member ticket inputs */}
</div>
```

#### 6. Add Speakeasy Section

```typescript
{/* Speakeasy Gala */}
<div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: '#1a1a2e', borderRadius: '8px' }}>
  <h3 className="font-['Jost',sans-serif] font-bold text-amber-400 text-lg" style={{ marginBottom: 'var(--space-2)' }}>
    🎭 An Affair to Remember: A Night at the Speakeasy
  </h3>
  <p className="font-['Bitter',serif] text-gray-300 text-sm" style={{ marginBottom: 'var(--space-3)' }}>
    April 11, 2026 • ${SPEAKEASY_PRICE} per ticket
    {today < speakeasyPriceChangeDate && (
      <span className="text-green-400 font-semibold"> (Early Bird until Mar 28!)</span>
    )}
  </p>
  {/* Single ticket quantity input */}
</div>
```

---

## Part 3: API Route Updates

### File: `/src/app/api/tickets/submit/route.ts`

#### 1. Add New Environment Variable Checks

```typescript
if (!process.env.AIRTABLE_VALENTINES_TABLE_ID) {
  throw new Error('AIRTABLE_VALENTINES_TABLE_ID is not configured');
}
if (!process.env.AIRTABLE_SPEAKEASY_TABLE_ID) {
  throw new Error('AIRTABLE_SPEAKEASY_TABLE_ID is not configured');
}
```

#### 2. Add Valentine's Day Submission Logic

Similar to existing NYE logic but with dynamic pricing and Valentine's field names.

#### 3. Add Speakeasy Submission Logic

Simpler than Valentine's - no member/non-member distinction.

---

## Part 4: Zeffy Import Script Template

### File: `import-valentines-2026.mjs` (create when needed)

**Key differences from Christmas/NYE imports:**

1. **Ticket type patterns to match:**
   ```javascript
   // Valentine's Day patterns
   const valentinesMemberMatch = details.match(/(\d+)x Valentine.*\(Member\)/i);
   const valentinesNonMemberMatch = details.match(/(\d+)x Valentine.*\(Nonmember\)/i);
   
   // Speakeasy patterns (single ticket type)
   const speakeasyMatch = details.match(/(\d+)x Speakeasy/i) || 
                          details.match(/(\d+)x Affair to Remember/i);
   ```

2. **Price calculations:**
   ```javascript
   // Valentine's Day - need to determine if early bird based on purchase date
   const purchaseDate = new Date(row['Payment Date (America/Los_Angeles)']);
   const priceChangeDate = new Date('2026-02-10');
   const memberPrice = purchaseDate < priceChangeDate ? 30 : 35;
   const nonMemberPrice = 45;
   
   const valentinesTotal = (tickets.valentinesMember * memberPrice) + 
                           (tickets.valentinesNonMember * nonMemberPrice);
   
   // Speakeasy - check purchase date for pricing
   const speakeasyPriceChange = new Date('2026-03-29');
   const speakeasyPrice = purchaseDate < speakeasyPriceChange ? 100 : 110;
   const speakeasyTotal = tickets.speakeasy * speakeasyPrice;
   ```

---

## Part 5: Landing Page Updates

When Zeffy campaigns are ready:

1. Update the internal page card payment button with new Zeffy link(s)
2. For the public landing page with two buttons (like memberships), you'll provide:
   - Valentine's Day Dance Zeffy embed URL
   - Speakeasy Gala Zeffy embed URL

---

## Checklist Before Going Live

### Airtable
- [ ] Create `Valentine's Day Dance 2026` table with all fields
- [ ] Create `Speakeasy Gala 2026` table with all fields
- [ ] Copy Table IDs to `.env.local`
- [ ] Test API connection with a test record

### Internal Page
- [ ] Comment out NYE section (per SEASONAL_EVENT_PROTOCOL.md)
- [ ] Add Valentine's Day ticket section
- [ ] Add Speakeasy ticket section
- [ ] Update pricing logic with dynamic dates
- [ ] Update Zeffy link button

### API Route
- [ ] Add new table environment variables
- [ ] Add Valentine's submission logic
- [ ] Add Speakeasy submission logic
- [ ] Test form submission

### Email Receipts (if used)
- [ ] Update email templates for new events
- [ ] Test email sending

### Zeffy
- [ ] Create Valentine's Day campaign
- [ ] Create Speakeasy campaign
- [ ] Get embed URLs for landing page
- [ ] Prepare import script for when sales come in

---

## Quick Reference: Comparing to Previous Events

| Aspect | Christmas 2025 | NYE 2025 | Valentine's 2026 | Speakeasy 2026 |
|--------|---------------|----------|------------------|----------------|
| Member Price | $15 | $35 | $30→$35 | N/A |
| Non-Member Price | $20 | $45 | $45 | N/A |
| Single Price | N/A | N/A | N/A | $100→$110 |
| Price Change Date | None | None | Feb 10 | Mar 29 |
| Vegetarian Option | Yes | No | TBD | TBD |
| Airtable Table ID | `tbljtMTsXvSP3MDt4` | `tbl5OyCybJCfrebOb` | TBD | TBD |

---

## Questions to Clarify

1. **Valentine's Day Dance** - Any special meal options (like vegetarian for Christmas)?
2. **Speakeasy** - Confirm no member/non-member distinction, just single ticket type?
3. **Attendance Lists** - Need to create new attendance list pages for these events?
4. **PDF Tickets** - Same format as previous events, or new design?
