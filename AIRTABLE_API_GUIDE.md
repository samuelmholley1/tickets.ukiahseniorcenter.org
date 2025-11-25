# Airtable API Guide - Ukiah Senior Center Tickets

## Environment Variables

```bash
AIRTABLE_API_KEY=your_airtable_personal_access_token_here
AIRTABLE_BASE_ID=appZ6HE5luAFV0Ot2
AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=tblChristmasDriveThru2025
AIRTABLE_NYE_TICKETS_TABLE_ID=tblNYEGala2025
```

## Quick Setup

```bash
# Export variables for easy curl usage (get token from .env.local)
export AIRTABLE_TOKEN="your_airtable_personal_access_token_here"
export AIRTABLE_BASE="appZ6HE5luAFV0Ot2"
export CHRISTMAS_TABLE="tblChristmasDriveThru2025"
export NYE_TABLE="tblNYEGala2025"
```

## Create Tables in Airtable

### Christmas Drive-Thru Meal Table
Fields:
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Payment Method (Single select: Cash, Check)
- Check Number (Single line text)
- Amount Paid (Currency)
- Staff Initials (Single line text)
- Created Time (Created time)

### NYE Gala Dance Table
Fields:
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Payment Method (Single select: Cash, Check)
- Check Number (Single line text)
- Amount Paid (Currency)
- Staff Initials (Single line text)
- Created Time (Created time)

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
