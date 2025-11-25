# Creating Airtable Tables for Ticket Events

## Step 1: Access Airtable Base

1. Go to https://airtable.com
2. Open the **Ukiah Senior Center** base (Base ID: `appZ6HE5luAFV0Ot2`)

## Step 2: Create Christmas Drive-Thru Meal Table

1. Click **"Add or import"** → **"Create empty table"**
2. Name the table: **Christmas Drive-Thru 2025**
3. Once created, note the table ID from the URL (it will start with `tbl`)
4. Update `.env.local` with: `AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=tbl...`

### Add these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| First Name | Single line text | - |
| Last Name | Single line text | - |
| Email | Email | - |
| Phone | Phone number | - |
| Payment Method | Single select | Options: Cash, Check |
| Check Number | Single line text | - |
| Amount Paid | Currency | Format: US Dollar ($) |
| Staff Initials | Single line text | - |
| Created Time | Created time | - |

## Step 3: Create NYE Gala Dance Table

1. Click **"Add or import"** → **"Create empty table"**
2. Name the table: **NYE Gala 2025**
3. Once created, note the table ID from the URL
4. Update `.env.local` with: `AIRTABLE_NYE_TICKETS_TABLE_ID=tbl...`

### Add these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| First Name | Single line text | - |
| Last Name | Single line text | - |
| Email | Email | - |
| Phone | Phone number | - |
| Payment Method | Single select | Options: Cash, Check |
| Check Number | Single line text | - |
| Amount Paid | Currency | Format: US Dollar ($) |
| Staff Initials | Single line text | - |
| Created Time | Created time | - |

## Step 4: Get Table IDs

After creating both tables:

1. Click on the table name in Airtable
2. Look at the URL: `https://airtable.com/appZ6HE5luAFV0Ot2/tblXXXXXXXXXXXXXX/...`
3. The part after the base ID (starting with `tbl`) is your table ID
4. Update your `.env.local` file with both table IDs

## Step 5: Test Connection

Run this command to test your Airtable connection:

```bash
export AIRTABLE_TOKEN="$(grep AIRTABLE_API_KEY .env.local | cut -d '=' -f2)"
export AIRTABLE_BASE="appZ6HE5luAFV0Ot2"
export CHRISTMAS_TABLE="YOUR_CHRISTMAS_TABLE_ID"

curl "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}?maxRecords=1" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" | jq '.'
```

If successful, you should see a JSON response with your table structure.

## Step 6: Create a Test Record

```bash
curl -X POST \
  "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "First Name": "Test",
      "Last Name": "User",
      "Email": "test@example.com",
      "Phone": "(707) 555-1234",
      "Payment Method": "Cash",
      "Amount Paid": 15.00,
      "Staff Initials": "TEST"
    }
  }' | jq '.'
```

## Views to Create (Optional but Recommended)

### For each table, create these views:

1. **All Tickets** (Grid view) - Default view showing all records
2. **Cash Payments** - Filter: Payment Method = "Cash"
3. **Check Payments** - Filter: Payment Method = "Check"
4. **Today's Sales** - Filter: Created Time is today
5. **By Staff** - Group by: Staff Initials

## Summary Report Formula Field (Optional)

Add a formula field called **"Full Name"**:
```
{First Name} & " " & {Last Name}
```

Add a formula field called **"Payment Info"**:
```
IF(
  {Payment Method} = "Check",
  "Check #" & {Check Number},
  "Cash"
)
```

## Done!

Once both tables are created and the table IDs are added to `.env.local`, the ticket system will automatically save all sales to Airtable.
