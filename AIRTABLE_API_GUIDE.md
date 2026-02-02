# Airtable API Guide - Ukiah Senior Center Tickets

**Last Updated:** January 13, 2026

> ⚠️ **AI CRITICAL - PATH VERIFICATION REQUIRED:**
> When user specifies a route (e.g., "/internal" vs "/internal/lunch"), **STOP and VERIFY the exact file path** before editing:
> - `/internal` → `src/app/internal/page.tsx` (Ticket Sales: Valentine's, Speakeasy)
> - `/internal/lunch` → `src/app/internal/lunch/page.tsx` (Lunch Reservations)
> **DO NOT ASSUME** based on recent context. The user's explicit route is the source of truth.

> **IMPORTANT:** The AI assistant (GitHub Copilot) has full Airtable API access and is responsible for creating, editing, and managing all tables and fields. Do NOT manually create tables in Airtable - ask the AI to do it via API.

## Environment Variables

```bash
AIRTABLE_API_KEY=your_airtable_personal_access_token_here
AIRTABLE_BASE_ID=appZ6HE5luAFV0Ot2

# 2026 Events
AIRTABLE_VALENTINES_TABLE_ID=tblgQA8BawIrlk2kh
AIRTABLE_SPEAKEASY_TABLE_ID=tblMmwD5JEE5iCfLl

# 2025 Events (archived)
AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=tbljtMTsXvSP3MDt4
AIRTABLE_NYE_TICKETS_TABLE_ID=tbl5OyCybJCfrebOb
```

## Database IDs

- **Base ID:** `appZ6HE5luAFV0Ot2`
- **Valentine's 2026 Table ID:** `tblgQA8BawIrlk2kh`
- **Speakeasy 2026 Table ID:** `tblMmwD5JEE5iCfLl`
- **Christmas 2025 Table ID:** `tbljtMTsXvSP3MDt4`
- **NYE 2025 Table ID:** `tbl5OyCybJCfrebOb`

## Complete Field Schema

### Christmas Drive-Thru 2025
| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| First Name | Single line text | Yes | Customer first name |
| Last Name | Single line text | Yes | Customer last name |
| Email | Email | No | Customer email |
| Phone | Phone number | No | Customer phone |
| Ticket Quantity | Number (integer) | Yes | Total tickets/meals |
| Vegetarian Meals | Number (integer) | No | Eggplant meal count |
| Payment Method | Single select | Yes | Cash, Check, Zeffy, TicketSpice, Comp |
| Amount Paid | Number (currency) | Yes | **Ticket price only** |
| Donation Amount | Number (currency) | No | **Separate donation field** |
| Purchase Date | Date & Time | No | Transaction timestamp |
| Transaction ID | Single line text | No | Unique transaction ID |
| Refunded | Checkbox | No | Checked if refunded |

### NYE Gala 2025
| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| First Name | Single line text | Yes | Customer first name |
| Last Name | Single line text | Yes | Customer last name |
| Email | Email | No | Customer email |
| Phone | Phone number | No | Customer phone |
| Ticket Quantity | Number (integer) | Yes | Total dance tickets |
| Payment Method | Single select | Yes | Cash, Check, Zeffy, TicketSpice, Comp |
| Amount Paid | Number (currency) | Yes | **Ticket price only** |
| Donation Amount | Number (currency) | No | **Separate donation field** |
| Purchase Date | Date & Time | No | Transaction timestamp |
| Transaction ID | Single line text | No | Unique transaction ID |
| Refunded | Checkbox | No | Checked if refunded |

## Common cURL Commands

### Create Christmas Ticket Record
```bash
curl -X POST \
  "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "First Name": "John",
      "Last Name": "Doe",
      "Email": "john@example.com",
      "Phone": "(707) 555-1234",
      "Payment Method": "Cash",
      "Amount Paid": 15.00,
      "Staff Initials": "SH"
    }
  }' | jq '.'
```

### Create NYE Ticket Record
```bash
curl -X POST \
  "https://api.airtable.com/v0/${AIRTABLE_BASE}/${NYE_TABLE}" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "First Name": "Jane",
      "Last Name": "Smith",
      "Email": "jane@example.com",
      "Phone": "(707) 555-5678",
      "Payment Method": "Check",
      "Check Number": "1234",
      "Amount Paid": 25.00,
      "Staff Initials": "ML"
    }
  }' | jq '.'
```

### List All Christmas Tickets
```bash
curl "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  | jq '.records[] | {name: (.fields["First Name"] + " " + .fields["Last Name"]), email: .fields.Email, amount: .fields["Amount Paid"]}'
```

### Find Ticket by Email
```bash
curl "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}?filterByFormula=\{Email\}='john@example.com'" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  | jq '.'
```

### Get Total Sales
```bash
curl "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  | jq '[.records[].fields["Amount Paid"] // 0] | add'
```

## Testing Connection

```bash
#!/bin/bash
# Test Airtable connection

AIRTABLE_TOKEN="$(grep AIRTABLE_API_KEY .env.local | cut -d '=' -f2)"
AIRTABLE_BASE="appZ6HE5luAFV0Ot2"
CHRISTMAS_TABLE="tblChristmasDriveThru2025"

echo "Testing Airtable connection..."
RESPONSE=$(curl -s "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}?maxRecords=1" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}")

if echo "$RESPONSE" | jq -e '.records' > /dev/null 2>&1; then
  echo "✓ Connection successful!"
  echo "  Base: ${AIRTABLE_BASE}"
  echo "  Table: ${CHRISTMAS_TABLE}"
else
  echo "✗ Connection failed"
  echo "$RESPONSE" | jq '.'
fi
```

## Notes

- Always use table IDs (starting with `tbl`), not table names
- Field names are case-sensitive and must match exactly
- Personal Access Token starts with `pat` and has specific scopes
- Use filterByFormula to query specific records
- Created Time field is automatically populated by Airtable
