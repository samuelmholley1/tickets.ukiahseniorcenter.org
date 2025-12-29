# Airtable Schema - Complete Field Reference

**Last Updated:** December 30, 2025

> **CRITICAL:** `Amount Paid` = ticket price ONLY. `Donation Amount` is a SEPARATE field for additional donations.  
> Example: $35 ticket + $65 donation = `Amount Paid: 35`, `Donation Amount: 65` (NOT Amount Paid: 100)

---

## Christmas Drive-Thru 2025 Table

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


## API Integration Notes

### Current Features
- ✅ Automatic email receipts (NYE Gala only)
- ✅ Zeffy import via Excel exports with payment timestamps
- ✅ Vegetarian meal option for Christmas
- ✅ Separate donation tracking
- ✅ Duplicate detection on import
- ✅ Refund tracking

### Import History
- **12/30/2025:** Imported from `Holidays 2025_12-29-2025.xlsx`
  - Christmas: 7 new records
  - NYE: 6 new records
  - Skipped: 46 duplicates/refunds
