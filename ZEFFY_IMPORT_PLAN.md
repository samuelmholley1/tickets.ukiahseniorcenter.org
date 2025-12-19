# Zeffy Data Import Plan

**Date:** December 19, 2025  
**Source File:** `Holidays 2025_12-19-2025.xlsx`  
**Total Records:** 100 tickets

## File Audit Summary

### Zeffy Excel Structure
- **Sheet Name:** Export
- **Columns:**
  - Guest name
  - Buyer name
  - Buyer email
  - Ticket number
  - Ticket type
  - Ticket notes
  - Status

### Ticket Breakdown
- **Christmas Drive-Thru (Member):** 48 tickets
- **Christmas Drive-Thru (Nonmember):** 33 tickets
- **NYE Dance (Member):** 11 tickets
- **NYE Dance (Nonmember):** 5 tickets
- **Holiday Tamales (x6):** 2 tickets ⚠️ *Not in our events*
- **Set of 6 Raffle Tickets:** 1 ticket ⚠️ *Not in our events*

**Total Event Tickets:** 97 (Christmas: 81, NYE: 16)  
**Unique Buyers:** 33 people

### Key Observations
1. All Guest names = Buyer names (no group purchases with different attendees)
2. Multiple tickets per buyer are common (e.g., Megan Bradford has 2 Christmas tickets)
3. Zeffy data has NO phone numbers - this is a required field in Airtable
4. Zeffy data has NO pricing information - we need to calculate from ticket types
5. Two non-event items (Tamales, Raffle) need to be excluded or handled separately

## Current Airtable Schema Review

### Required Fields in Airtable
✅ **Available from Zeffy:**
- First Name (parse from "Buyer name")
- Last Name (parse from "Buyer name")
- Email ("Buyer email")

❌ **NOT in Zeffy (need defaults):**
- Phone - **REQUIRED** - will use placeholder "(000) 000-0000" or "No phone provided"
- Transaction ID - will generate "ZEFFY-[ticket number]" or group by buyer
- Staff Initials - will use "ZEFFY" to indicate online purchase
- Check Number - N/A for card payments
- Other Payment Details - N/A

✅ **Can Calculate:**
- Payment Method - "Card (Zeffy)"
- Christmas Member Tickets - count from ticket types
- Christmas Non-Member Tickets - count from ticket types
- NYE Member Tickets - count from ticket types
- NYE Non-Member Tickets - count from ticket types
- Ticket Quantity - count per buyer
- Ticket Subtotal - calculate: Member=$15, NonMember=$20 (Christmas), Member=$35, NonMember=$45 (NYE)
- Amount Paid - same as subtotal (no donations in Zeffy export)
- Donation Amount - 0

❌ **Not Available:**
- Vegetarian Meals - will default to 0 (customer would need to contact us)

## Import Strategy

### Option A: One Record Per Buyer (RECOMMENDED)
**Pros:**
- Matches our internal sales page behavior
- One email receipt per buyer
- Easier to reconcile with Zeffy
- Cleaner for financial reporting

**Cons:**
- Loses individual ticket numbers from Zeffy

**Implementation:**
- Group all tickets by "Buyer email"
- Create ONE Airtable record per buyer
- Aggregate ticket counts by type
- Store original Zeffy ticket numbers in Payment Notes

### Option B: One Record Per Ticket
**Pros:**
- Preserves Zeffy ticket numbers
- Exact 1:1 mapping

**Cons:**
- Creates duplicate buyer records
- 100 separate records vs 33
- Doesn't match our typical transaction structure

## Recommended Import Plan

### Step 1: Data Transformation
Convert Zeffy Excel to our Airtable format:

```javascript
{
  buyers: {
    "email@example.com": {
      name: "First Last",
      email: "email@example.com",
      christmasMember: 2,
      christmasNonMember: 1,
      nyeMember: 0,
      nyeNonMember: 0,
      zeffyTicketNumbers: ["53", "54", "55"]
    }
  }
}
```

### Step 2: Calculate Pricing
- Christmas Member: $15 each
- Christmas Non-Member: $20 each
- NYE Member: $35 each
- NYE Non-Member: $45 each

### Step 3: Generate Airtable Records
For each buyer, create records in appropriate tables:

**Christmas Table** (if has Christmas tickets):
- Transaction ID: `ZEFFY-IMPORT-[timestamp]-[hash]`
- First Name: [parsed]
- Last Name: [parsed]
- Email: [from Zeffy]
- Phone: "No phone provided"
- Payment Method: "Card (Zeffy)"
- Payment Notes: "Zeffy ticket numbers: 53, 54, 55"
- Ticket Subtotal: [calculated]
- Donation Amount: 0
- Amount Paid: [same as subtotal]
- Ticket Quantity: [sum of member + nonmember]
- Christmas Member Tickets: [count]
- Christmas Non-Member Tickets: [count]
- Vegetarian Meals: 0
- Staff Initials: "ZEFFY"

**NYE Table** (if has NYE tickets):
- Same structure, but with NYE fields

### Step 4: Handle Edge Cases
- **Tamales & Raffle tickets:** Skip or log separately
- **Missing phone:** Use "No phone provided"
- **Name parsing:** Handle single names, multiple spaces

### Step 5: Validation
Before import:
- Verify 33 buyer groups
- Verify totals: 81 Christmas, 16 NYE
- Check no duplicates with existing Airtable records by email
- Verify calculated amounts match Zeffy's expected revenue

### Step 6: Import Execution
1. Create import script (Node.js)
2. Dry-run with console output
3. Get user confirmation
4. Execute import to Airtable
5. Generate import report

## Post-Import Actions
1. Check for duplicate emails between Zeffy and internal sales
2. Verify financial totals
3. Update schema documentation
4. Consider sending email receipts to Zeffy customers (optional)

## Questions to Resolve
1. Should we send email receipts to Zeffy buyers? (They already got Zeffy confirmation)
2. Should we merge if same email exists in internal sales?
3. What to do with Tamales and Raffle ticket records?
4. Should Payment Method be "Card (Zeffy)" or just "Card"?
