# Airtable Schema - Complete Field Reference

**Last Updated:** February 3, 2026

> ⚠️ **AI CRITICAL - PATH VERIFICATION REQUIRED:**
> When user specifies a route (e.g., "/internal" vs "/internal/lunch"), **STOP and VERIFY the exact file path** before editing:
> - `/internal` → `src/app/internal/page.tsx` (Ticket Sales: Valentine's, Speakeasy)
> - `/internal/lunch` → `src/app/internal/lunch/page.tsx` (Lunch Reservations)
> **DO NOT ASSUME** based on recent context. The user's explicit route is the source of truth.

> **AIRTABLE MANAGEMENT:** The AI assistant (GitHub Copilot) has full API access to create, edit, and manage all Airtable tables and fields. Do NOT manually create tables - ask the AI to do it.

> **CRITICAL:** `Amount Paid` = ticket price ONLY. `Donation Amount` is a SEPARATE field for additional donations.  
> Example: $35 ticket + $65 donation = `Amount Paid: 35`, `Donation Amount: 65` (NOT Amount Paid: 100)

---

## 2026 Events

### Valentine's Day Dance 2026 Table

**Table ID:** `tblgQA8BawIrlk2kh` ✅ Created via API  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tblgQA8BawIrlk2kh

#### Pricing
- **Member:** $30 until Feb 9, 2026, then $35
- **Non-Member:** $45 (always)

#### Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **First Name** | Single line text | Customer first name | `Mary` |
| **Last Name** | Single line text | Customer last name | `Smith` |
| **Email** | Email | Customer email address | `mary@example.com` |
| **Phone** | Phone number | Customer phone number | `17074623456` |
| **Ticket Quantity** | Number (integer) | Total number of tickets | `2` |
| **Member Tickets** | Number (integer) | Count of member-priced tickets | `1` |
| **Non-Member Tickets** | Number (integer) | Count of non-member tickets | `1` |
| **Payment Method** | Single select | Options: `Cash`, `Check`, `Zeffy`, `Comp`, `Other`, `Cash & Check` | `Cash` |
| **Check Number** | Single line text | For check payments | `1234` |
| **Payment Notes** | Long text | Split payment details, other notes | `Cash: $30, Check: $45` |
| **Amount Paid** | Currency | **TICKET PRICE ONLY** | `75.00` |
| **Donation Amount** | Currency | **SEPARATE DONATION FIELD** | `25.00` |
| **Purchase Date** | Date & Time | When purchase was made (Pacific time) | `1/15/2026 2:30 PM` |
| **Transaction ID** | Single line text | Unique transaction identifier | `TXN-1234567890-ABC123` |
| **Staff Initials** | Single line text | Who processed the sale | `JD` |
| **Refunded** | Checkbox | Checked if transaction was refunded | ☐ |

---

### Speakeasy Gala 2026 Table

**Table ID:** `tblMmwD5JEE5iCfLl` ✅ Created via API  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tblMmwD5JEE5iCfLl

#### Pricing
- **All Tickets:** $100 until Mar 28, 2026, then $110

#### Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **First Name** | Single line text | Customer first name | `John` |
| **Last Name** | Single line text | Customer last name | `Doe` |
| **Email** | Email | Customer email address | `john@example.com` |
| **Phone** | Phone number | Customer phone number | `17074623456` |
| **Ticket Quantity** | Number (integer) | Total number of tickets | `2` |
| **Payment Method** | Single select | Options: `Cash`, `Check`, `Zeffy`, `Comp`, `Other` | `Zeffy` |
| **Check Number** | Single line text | For check payments | `5678` |
| **Payment Notes** | Long text | Split payment details, other notes | `` |
| **Amount Paid** | Currency | **TICKET PRICE ONLY** | `200.00` |
| **Donation Amount** | Currency | **SEPARATE DONATION FIELD** | `50.00` |
| **Purchase Date** | Date & Time | When purchase was made (Pacific time) | `3/15/2026 10:00 AM` |
| **Transaction ID** | Single line text | Unique transaction identifier | `zeffy-3/15/2026, 10:00 AM-John-Doe` |
| **Staff Initials** | Single line text | Who processed the sale | `ZEFFY` |
| **Refunded** | Checkbox | Checked if transaction was refunded | ☐ |

---

## 2025 Events (Archived)

### Christmas Drive-Thru 2025 Table

**Table ID:** `tbljtMTsXvSP3MDt4`  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tbljtMTsXvSP3MDt4

### Complete Field List

#### Core Customer Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **First Name** | Single line text | Customer first name | `Mary` |
| **Last Name** | Single line text | Customer last name | `Smith` |
| **Email** | Email | Customer email address | `mary@example.com` |
| **Phone** | Phone number | Customer phone number | `17074623456` |

#### Ticket Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **Ticket Quantity** | Number (integer) | Total number of tickets/meals | `2` |
| **Vegetarian Meals** | Number (integer) | Number of eggplant meals instead of prime rib | `1` |

#### Payment Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **Payment Method** | Single select | Options: `Cash`, `Check`, `Zeffy`, `TicketSpice`, `Comp` | `Zeffy` |
| **Amount Paid** | Number (currency) | **TICKET PRICE ONLY** (Member: $15, Non-member: $20) | `35.00` |
| **Donation Amount** | Number (currency) | **SEPARATE DONATION FIELD** | `65.00` |
| **Purchase Date** | Date & Time | When purchase was made (with timestamp) | `12/26/2025 4:01 PM` |
| **Transaction ID** | Single line text | Unique transaction identifier | `zeffy-12/26/2025, 4:01 PM-Linda-Pardini` |
| **Refunded** | Checkbox | Checked if transaction was refunded | ☑ |

---

## NYE Gala Dance 2025 Table

**Table ID:** `tbl5OyCybJCfrebOb`  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tbl5OyCybJCfrebOb

### Complete Field List

#### Core Customer Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **First Name** | Single line text | Customer first name | `Elizabeth` |
| **Last Name** | Single line text | Customer last name | `MacFarland` |
| **Email** | Email | Customer email address | `liz@example.com` |
| **Phone** | Phone number | Customer phone number | `17074623456` |

#### Ticket Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **Ticket Quantity** | Number (integer) | Total number of dance tickets | `1` |

#### Payment Information
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| **Payment Method** | Single select | Options: `Cash`, `Check`, `Zeffy`, `TicketSpice`, `Comp` | `Zeffy` |
| **Amount Paid** | Number (currency) | **TICKET PRICE ONLY** (Member: $35, Non-member: $45) | `35.00` |
| **Donation Amount** | Number (currency) | **SEPARATE DONATION FIELD** | `65.00` |
| **Purchase Date** | Date & Time | When purchase was made (with timestamp) | `12/15/2025 5:52 AM` |
| **Transaction ID** | Single line text | Unique transaction identifier | `zeffy-12/15/2025, 5:52 AM-Terry-Phillips` |
| **Refunded** | Checkbox | Checked if transaction was refunded | ☑ |


---

## Zeffy Import Instructions

### From Excel Export
1. Export from Zeffy to Excel (`.xlsx`)
2. Use `import-holidays-12-29.mjs` script (or similar)
3. Script automatically:
   - Parses "Details" column for ticket types (e.g., "2x NYE Dance (Member)")
   - Extracts payment date with timestamp from "Payment Date (America/Los_Angeles)"
   - Calculates `Amount Paid` from ticket prices (Member/Non-member rates)
   - Extracts `Donation Amount` from "Extra Donation" column
   - Skips refunded entries
   - Checks for duplicates using First Name + Last Name + Email
   - Creates Transaction ID: `zeffy-[date/time]-[FirstName]-[LastName]`

### Important Data Mapping
| Zeffy Field | Airtable Field | Notes |
|-------------|----------------|-------|
| First Name | First Name | Direct mapping |
| Last Name | Last Name | Direct mapping |
| Email | Email | Direct mapping |
| Phone Number | Phone | Direct mapping |
| Details | → parsed | Extract ticket counts by type |
| Total Amount | → calculated | Split into Amount Paid + Donation |
| Extra Donation | Donation Amount | Separate field, NOT included in Amount Paid |
| Payment Date (America/Los_Angeles) | Purchase Date | Parsed to ISO 8601 format |
| Refund Amount | Refunded | Checkbox if > 0 |

### Pricing Reference

#### 2026 Events
- **Valentine's Day Dance:** Member $30 (early bird until Feb 9) / $35 (Feb 10+), Non-member $45
- **Speakeasy Gala:** $100 (early bird until Mar 28) / $110 (Mar 29+)

#### 2025 Events (Archived)
- **Christmas:** Member $15, Non-member $20
- **NYE Gala:** Member $35, Non-member $45

### Example
Zeffy row: `Linda Pardini, Total: $80, Details: "1x NYE Dance (Nonmember), 1x NYE Dance (Member)"`  
→ Airtable: `Amount Paid: 80` (45 + 35), `Donation Amount: 0`, `Ticket Quantity: 2`

Zeffy row: `Elizabeth MacFarland, Total: $100, Extra Donation: $65, Details: "1x NYE Dance (Member)"`  
→ Airtable: `Amount Paid: 35`, `Donation Amount: 65`, `Ticket Quantity: 1`

---

## Quick Summary Reports in Airtable

Once fields are created, you can create views:

### Christmas Meal Planning View
- **Filter:** Show all records where Refunded is not checked
- **Group by:** Vegetarian Meals
- **Summary Fields:**
  - SUM of Ticket Quantity = Total meals needed
  - SUM of Vegetarian Meals = Total eggplant meals
  - Regular meals = Total meals - Vegetarian meals

### Financial Reconciliation View
- **Group by:** Payment Method
- **Summary Fields:**
  - SUM of Amount Paid = Total ticket revenue
  - SUM of Donation Amount = Total donations
  - COUNT of records = Transaction count

### Daily Sales View
- **Group by:** Purchase Date (by day)
- **Sort:** Purchase Date (newest first)
- **Summary:** SUM of Amount Paid, SUM of Donation Amount, COUNT of records

---

## Field Validation Rules

### Amount Paid
- Must equal ticket quantity × ticket price
- Christmas: (Member tickets × $15) + (Non-member tickets × $20)
- NYE: (Member tickets × $35) + (Non-member tickets × $45)
- **Does NOT include donations**

### Donation Amount
- Separate field for additional contributions
- Can be $0 if no donation
- Added to Amount Paid for total transaction value

### Total Transaction Value
- Formula: `Amount Paid + Donation Amount`
- This matches Zeffy's "Total Amount" field


---

## Lunch Program Tables

### Lunch Reservations Table

**Table ID:** `tblF83nL5KPuPUDqx` ✅ Created via API  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tblF83nL5KPuPUDqx

#### Pricing
| Meal Type | Member | Non-Member |
|-----------|--------|------------|
| Dine In | $8 | $9 |
| To Go | $9 | $10 |
| Delivery | $10 | $11 |

#### Fields

| Field Name | Type | Options | Description |
|------------|------|---------|-------------|
| **Name** | Single line text | | Customer name |
| **Date** | Date | local format | Date of the meal |
| **Meal Type** | Single select | `Dine In`, `To Go`, `Delivery` | How they receive the meal |
| **Member Status** | Single select | `Member`, `Non-Member` | Pricing tier |
| **Amount** | Currency | $ | Amount paid for this meal |
| **Payment Method** | Single select | `Cash`, `Check`, `Card (Zeffy)`, `Lunch Card` | How they paid |
| **Lunch Card** | Linked record | → Lunch Cards | Link to prepaid card (if applicable) |
| **Notes** | Long text | | Special requests, delivery address, check number |
| **Staff** | Single line text | | Staff initials who took the order |
| **Status** | Single select | `Reserved`, `Picked Up`, `No Show` | Reservation status |
| **Frozen Friday** | Checkbox | | Is this a frozen Friday meal (picked up Thursday)? |
| **Contact** | Linked record | → Contacts | Link to master contact record |

---

### Lunch Cards Table

**Table ID:** `tblOBnt2ZatrSugbj` ✅ Created via API  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tblOBnt2ZatrSugbj

#### Pricing
| Card Type | Member | Non-Member |
|-----------|--------|------------|
| 5 Meals (Dine In) | $40 | $45 |
| 10 Meals (Dine In) | $80 | $90 |
| 15 Meals (Dine In) | $120 | $135 |
| 20 Meals (Dine In) | $160 | $180 |
| 5 Meals (Pickup) | $45 | $50 |
| 10 Meals (Pickup) | $90 | $100 |
| 15 Meals (Pickup) | $135 | $150 |
| 20 Meals (Pickup) | $180 | $200 |
| 5 Meals (Delivery) | $50 | $55 |
| 10 Meals (Delivery) | $100 | $110 |
| 15 Meals (Delivery) | $150 | $165 |
| 20 Meals (Delivery) | $200 | $220 |

#### Fields

| Field Name | Type | Options | Description |
|------------|------|---------|-------------|
| **Name** | Single line text | | Cardholder name |
| **Phone** | Phone number | | Contact phone |
| **Card Type** | Single select | `5 Meals`, `10 Meals`, `15 Meals`, `20 Meals`, `25 Meals` | Number of meals |
| **Member Status** | Single select | `Member`, `Non-Member` | Pricing tier |
| **Total Meals** | Number | integer | Total meals on card (5/10/15/20) |
| **Remaining Meals** | Number | integer | Meals left on card |
| **Amount Paid** | Currency | $ | Total amount paid |
| **Payment Method** | Single select | `Cash`, `Check`, `Card (Zeffy)` | How they paid |
| **Purchase Date** | Date | local format | When card was purchased |
| **Staff** | Single line text | | Staff initials who sold card |
| **Lunch Reservations** | Linked record | ← Lunch Reservations | Auto-created inverse link |
| **Weekly Delivery** | Checkbox | | Auto-include on daily delivery list (Mon-Thu) |
| **Delivery Address** | Long text | | Delivery address for weekly customers |
| **Include Frozen Friday** | Checkbox | | Also get frozen Friday meal (picked up Thursday) |
| **Contact** | Linked record | → Contacts | Link to master contact record |
| **Lunch Card ID** | Single line text | | Unique ID for physical card |

---

## Core CRM Tables (New)

### Contacts Table
**Table ID:** `tbl3PQZzXGpT991dH`
**URL:** [Record Link]

#### Fields
| Field Name | Type | Description |
|------------|------|-------------|
| **Name** | Single line text | Full Name (Primary Key) |
| **First Name** | Single line text | |
| **Last Name** | Single line text | |
| **Contact Type** | Single select | `Member`, `Donor`, `Business`, `Agency`, `Other` |
| **Email** | Email | |
| **Phone Cell** | Phone number | |
| **Phone Home** | Phone number | |
| **Address** | Single line text | Street Address |
| **City** | Single line text | |
| **State** | Single line text | |
| **Zip Code** | Single line text | |
| **Birth Date** | Date | |
| **Source** | Single select | `Legacy`, `Website`, `Internal`, `Paper Form`, `Donation Import` |
| **Lunch Cards** | Linked record | → Lunch Cards (inverse) |
| **Lunch Reservations** | Linked record | → Lunch Reservations (inverse) |
| **MEMBERSHIPS_NEW** | Linked record | → MEMBERSHIPS_NEW |
| **DONATIONS_NEW** | Linked record | → DONATIONS_NEW |

---

### Memberships Table (New)
**Table ID:** `tbl7iQniH30UcD3dY`

#### Fields
| Field Name | Type | Options |
|------------|------|---------|
| **Member Name** | Single line text | Primary Key |
| **Contact** | Linked record | → Contacts |
| **Membership Type** | Single select | `Individual`, `Household`, `Lifetime`, `90+ Complimentary` |
| **Status** | Single select | `Active`, `Expired`, `Pending` |
| **Dues Amount** | Currency | |
| **Expiration** | Date | |
| **Lifetime Member** | Checkbox | |

---

### Donations Table (New)
**Table ID:** `tblRuOB2vjyoWVwJK`

#### Fields
| Field Name | Type | Options |
|------------|------|---------|
| **Donor Name** | Single line text | Primary Key |
| **Contact** | Linked record | → Contacts |
| **Donation Amount** | Currency | |
| **Donation Date** | Date | |
| **Donation Type** | Single select | `Cash`, `Check`, `Credit Card`, `Zeffy`, `In-Kind`, etc. |
| **Fund** | Single select | `General`, `Building`, `Kitchen`, `Transportation`, `Memorial`, `Lunch Bunch`, etc. |
| **Annual Pledge** | Checkbox | |

---

## Internal & Metrics Tables

### USC Utilization
**Table ID:** `tbl0r8f6YkD31vUPf`
**Purpose:** Monthly reporting metrics for board/grants.

#### Fields
| Field Name | Type | Options/Description |
|------------|------|---------------------|
| **Record ID** | Single line text | Primary Key |
| **Fiscal Year** | Single select | `2024-2025`, `2025-2026`, `2026-2027` |
| **Month** | Single select | Full month names |
| **Category** | Single select | `Activities`, `Rentals`, `USC Events`, `Thrift Store`, `Transportation`, `Dining Room`, `Information & Referral` |
| **Metric Name** | Single line text | Specific metric (e.g. "Meals Served") |
| **Value** | Number | The count or amount |
| **Is Currency** | Checkbox | True if Value is dollars |
| **Is Subtotal** | Checkbox | True if a calculated roll-up |

### Kitchen Data
**Table ID:** `tblICSEEG5ODlMXIz`
**Purpose:** Daily kitchen logs (produce weight, waste, temps).

#### Fields
| Field Name | Type | Description |
|------------|------|-------------|
| **Date** | Date | Log date |
| **Produce Weight** | Number | |
| **Waste Weight** | Number | |
| **Walk-In Fridge Temp** | Number | |
| **Walk-In Freezer Temp** | Number | |
| **Logged By** | Single line text | Staff name/initials |

### QuickBooks Tokens
**Table ID:** `tblf3s4pHSOzRgw5X`
**Purpose:** Stores OAuth tokens for persistent QBO connection. Be careful editing.

#### Fields
| Field Name | Type | Description |
|------------|------|-------------|
| **Token Type** | Single line text | e.g., "access_token" |
| **Access Token** | Single line text | |
| **Refresh Token** | Single line text | |
| **Realm ID** | Single line text | Company ID |
| **Token Expires At** | Date & Time | |

---

## API Integration Notes

### Creating Linked Record Fields via API

**IMPORTANT:** When creating linked record fields, use MINIMAL options. The API is picky.

✅ **CORRECT - This works:**
```javascript
{
  name: 'Lunch Card',
  type: 'multipleRecordLinks',
  options: {
    linkedTableId: 'tblOBnt2ZatrSugbj'  // Just the table ID, nothing else!
  }
}
```

❌ **WRONG - These cause errors:**
```javascript
// Don't add prefersSingleRecordLink
options: { linkedTableId: '...', prefersSingleRecordLink: true }

// Don't add isReversed
options: { linkedTableId: '...', isReversed: false }

// Don't add description with linked fields
{ name: '...', type: 'multipleRecordLinks', description: '...', options: {...} }
```

**Key rules:**
1. Only include `linkedTableId` in options
2. Don't add `prefersSingleRecordLink` or `isReversed` - Airtable sets these automatically
3. Create linked fields AFTER both tables exist
4. The inverse link field is auto-created in the target table

### Current Features
- ✅ Automatic email receipts (NYE Gala only)
- ✅ Zeffy import via Excel exports with payment timestamps
- ✅ Vegetarian meal option for Christmas
- ✅ Separate donation tracking
- ✅ Duplicate detection on import
- ✅ Refund tracking
- ✅ Lunch reservations system
- ✅ Prepaid lunch cards with balance tracking

### Import History
- **12/30/2025:** Imported from `Holidays 2025_12-29-2025.xlsx`
  - Christmas: 7 new records
  - NYE: 6 new records
  - Skipped: 46 duplicates/refunds
