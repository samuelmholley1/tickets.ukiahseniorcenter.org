# MANUAL AIRTABLE UPDATE REQUIRED

## Before running the update script, you must add the new payment options to Airtable:

### Steps to Update Airtable Payment Method Field:

1. **Open Airtable Base:**
   - Go to: https://airtable.com/appZ6HE5luAFV0Ot2

2. **Update Christmas Drive-Thru 2025 Table:**
   - Click on the "Christmas Drive-Thru 2025" table
   - Click on the "Payment Method" column header
   - Click "Customize field type"
   - You'll see the Single Select options: Cash, Check, Cash & Check
   - Add two new options:
     - **Comp** (for complimentary tickets)
     - **Other** (for other payment methods)
   - Click "Save"

3. **Update NYE Gala Dance 2025 Table:**
   - Click on the "NYE Gala Dance 2025" table
   - Click on the "Payment Method" column header
   - Click "Customize field type"
   - Add the same two new options:
     - **Comp** (for complimentary tickets)
     - **Other** (for other payment methods)
   - Click "Save"

4. **Add "Other Payment Details" Field (Optional but Recommended):**
   - In both tables, add a new field:
     - Field name: **Other Payment Details**
     - Field type: **Single line text**
   - This will store details when payment method is "Other" (e.g., "Venmo", "Gift Certificate")

### After updating Airtable, run the update script:

```powershell
node find-and-update-comp.mjs
```

This will search both tables for any records with "(COMP)" or "COMP" or "COMPLIMENTARY" in:
- Last Name
- First Name
- Email
- Payment Notes
- Check Number

And update their Payment Method to "Comp".
