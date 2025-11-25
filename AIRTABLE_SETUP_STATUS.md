# Airtable Setup Complete - Next Steps

## ✅ What's Been Done

1. **Environment Configuration**
   - Created `.env.local` with Airtable credentials (not committed to git)
   - Created `.env.example` as template for deployment

2. **Documentation Created**
   - `AIRTABLE_API_GUIDE.md` - Complete API reference with curl examples
   - `SETUP_AIRTABLE_TABLES.md` - Step-by-step guide for creating tables

3. **Code Integration**
   - `src/lib/airtable.ts` - Helper functions for ticket management
   - Functions: createTicketRecord, getTicketRecords, findTicketByEmail, getTotalSales, getTicketCount

## 🔧 What You Need to Do

### Step 1: Create Airtable Tables

Go to Airtable and create two new tables in the **Ukiah Senior Center** base:

#### Table 1: Christmas Drive-Thru 2025
Fields to add:
- First Name (Single line text)
- Last Name (Single line text)  
- Email (Email)
- Phone (Phone number)
- Payment Method (Single select: Cash, Check)
- Check Number (Single line text)
- Amount Paid (Currency - US Dollar)
- Staff Initials (Single line text)
- Created Time (Created time)

#### Table 2: NYE Gala 2025
Same fields as above

### Step 2: Get Table IDs

1. After creating each table, click on it in Airtable
2. Look at the URL: `https://airtable.com/appZ6HE5luAFV0Ot2/tblXXXXXXXXXXXXXX/...`
3. Copy the table ID (starts with `tbl`)
4. Update your local `.env.local` file:
   ```
   AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID=tblYourActualTableId
   AIRTABLE_NYE_TICKETS_TABLE_ID=tblYourActualTableId
   ```

### Step 3: Test Connection

Run this command (replacing with your actual table ID):

```bash
cd /Users/samuelholley/Projects/tickets.ukiahseniorcenter.org

export AIRTABLE_TOKEN="$(grep AIRTABLE_API_KEY .env.local | cut -d '=' -f2)"
export AIRTABLE_BASE="appZ6HE5luAFV0Ot2"
export CHRISTMAS_TABLE="your_actual_table_id_here"

curl "https://api.airtable.com/v0/${AIRTABLE_BASE}/${CHRISTMAS_TABLE}?maxRecords=1" \
  -H "Authorization: Bearer ${AIRTABLE_TOKEN}" | jq '.'
```

You should see a JSON response with your table structure.

### Step 4: Add to Vercel

When deploying to Vercel, add these environment variables:
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_CHRISTMAS_TICKETS_TABLE_ID`
- `AIRTABLE_NYE_TICKETS_TABLE_ID`

## 📊 What Airtable Will Track

Each ticket sale (from `/internal` forms) will create a record with:
- Customer name, email, phone
- Payment method (Cash or Check)
- Check number (if applicable)
- Amount paid
- Staff member who processed the sale
- Automatic timestamp

## 🔄 Next Development Steps

After tables are created, we need to:

1. Create API routes in `/src/app/api/tickets/` for:
   - POST /api/tickets/christmas
   - POST /api/tickets/nye
   
2. Update internal forms to call these APIs

3. Add success/error handling and email notifications

See the full API guide in `AIRTABLE_API_GUIDE.md` for implementation details.

## 📝 Important Files

- `.env.local` - Local environment variables (DO NOT COMMIT)
- `.env.example` - Template for environment variables  
- `AIRTABLE_API_GUIDE.md` - Complete API documentation
- `SETUP_AIRTABLE_TABLES.md` - Table creation guide
- `src/lib/airtable.ts` - Helper functions for ticket management

## 🔐 Security Note

The `.env.local` file contains sensitive API keys and is automatically excluded from git commits via `.gitignore`. Never commit this file to version control.
