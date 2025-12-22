# Attendance List & Dessert Preferences - Implementation Guide

**Created:** December 22, 2025  
**Status:** Ready for Airtable Field Setup

## Overview

A new attendance list page has been created at `/xmas2025-attendance-list` that provides a print-friendly view of all Christmas Drive-Thru attendees with their meal preferences and special requests.

## What's New

### 1. Attendance List Page
- **URL:** [http://localhost:3000/xmas2025-attendance-list](http://localhost:3000/xmas2025-attendance-list)
- **Features:**
  - Sorted by last name, then first name
  - Shows ticket count per attendee
  - Displays vegetarian meal count
  - Shows dessert preferences (e.g., Pumpkin Pie instead of Cheesecake)
  - Shows any special requests (allergies, accessibility needs, etc.)
  - Print-friendly format with summary statistics
  - Real-time totals: Total attendees, Total meals, Prime Rib count, Vegetarian count

### 2. New Fields on Sales Form
The internal sales form at `/internal` now includes:
- **Special Requests** (optional) - Free text field for allergies, accessibility needs, etc.
- **Dessert Preference** (optional) - Dropdown with options:
  - Cheesecake (default)
  - Pumpkin Pie
  - Other (with instructions to specify in Special Requests)

These fields only appear when Christmas tickets are selected.

## Required Airtable Setup

### Step 1: Add Fields to Christmas Drive-Thru 2025 Table

You must manually add these fields in Airtable:

1. **Go to the Christmas Drive-Thru 2025 table:**
   - URL: https://airtable.com/appZ6HE5luAFV0Ot2/tbljtMTsXvSP3MDt4

2. **Add these new Long Text fields:**
   
   **Field Name:** Special Requests  
   **Type:** Long text  
   **Description:** Any special requests or notes from the customer (allergies, accessibility needs, etc.)  
   
   **Field Name:** Dessert Preference  
   **Type:** Long text  
   **Description:** Dessert preference (e.g., "Pumpkin Pie" instead of default cheesecake)

### Step 2: Add Field to NYE Gala Dance 2025 Table (Optional)

If you want to track special requests for NYE events:

1. **Go to the NYE Gala Dance 2025 table:**
   - URL: https://airtable.com/appZ6HE5luAFV0Ot2/tbl5OyCybJCfrebOb

2. **Add this new Long Text field:**
   
   **Field Name:** Special Requests  
   **Type:** Long text  
   **Description:** Any special requests or notes from the customer (allergies, accessibility needs, etc.)

Note: NYE table does not need "Dessert Preference" field.

### Step 3: Verify Field Names Match Exactly

**CRITICAL:** The field names in Airtable must match exactly (including spaces and capitalization):
- ✅ `Special Requests` (correct)
- ❌ `SpecialRequests` (incorrect)
- ❌ `special requests` (incorrect)
- ✅ `Dessert Preference` (correct)
- ❌ `Dessert preference` (incorrect)

## How to Use

### For Staff Processing Sales

1. **Access the internal sales form:** `/internal`
2. **Select Christmas tickets** - The meal preferences section will appear automatically
3. **Optional: Enter special requests** - For allergies, dietary restrictions, accessibility needs
4. **Optional: Select dessert preference** - Choose from:
   - Cheesecake (default - leave blank or select)
   - Pumpkin Pie
   - Other (specify in Special Requests)
5. **Complete the sale as normal**

The data will be saved to Airtable automatically.

### For Kitchen/Event Planning

1. **Access the attendance list:** `/xmas2025-attendance-list`
2. **Review the list:**
   - Attendees are sorted alphabetically by last name
   - Vegetarian meal count is clearly displayed
   - Dessert preferences are shown in the Special Requests column
   - All special requests are visible
3. **Click "Print Attendance List"** to print a clean, formatted version

### Example Use Cases

#### Mary Snyder wants Pumpkin Pie
When processing Mary's ticket sale:
1. Select her Christmas tickets
2. In the "Dessert Preference" dropdown, select "Pumpkin Pie"
3. Complete the sale

On the attendance list, her row will show: "Dessert: Pumpkin Pie"

#### Customer has gluten allergy
When processing the sale:
1. In "Special Requests" field, type: "Gluten allergy - please ensure gluten-free meal"
2. Complete the sale

On the attendance list, this will appear in the Special Requests column.

#### Vegetarian meal with pumpkin pie
When processing the sale:
1. Check the vegetarian checkbox for their meal(s)
2. In "Dessert Preference" dropdown, select "Pumpkin Pie"
3. Complete the sale

On the attendance list, their row will show:
- Vegetarian count: 1 (or however many)
- Special Requests: "1 Vegetarian meal | Dessert: Pumpkin Pie"

## Technical Details

### API Endpoints

**GET /api/christmas-attendance**
- Returns all Christmas ticket records with attendance-relevant fields
- Fields returned: First Name, Last Name, Ticket Quantity, Vegetarian Meals, Special Requests, Dessert Preference
- Includes rate limiting (30 requests per minute)

### Files Modified

1. **New Files:**
   - `src/app/xmas2025-attendance-list/page.tsx` - Attendance list page
   - `src/app/api/christmas-attendance/route.ts` - API endpoint

2. **Modified Files:**
   - `src/app/internal/page.tsx` - Added special requests and dessert preference fields
   - `src/app/api/tickets/submit/route.ts` - Updated to save new fields to Airtable
   - `AIRTABLE_SCHEMA.md` - Documentation updated with new fields

### Data Storage

All data is stored in Airtable:
- **Special Requests** - Long text field (up to 1000 characters)
- **Dessert Preference** - Long text field (up to 100 characters)
- Both fields are optional and can be blank

### Print Styling

The attendance list page includes special print styles:
- Clean, professional format
- Removes navigation and buttons when printing
- Optimized table layout for paper
- Includes generation timestamp
- Shows summary statistics at the top

## Future Enhancements

Possible future improvements:
1. Add ability to edit records directly from attendance list
2. Export to Excel/CSV
3. Filter by dietary restrictions
4. Add meal planning calculator (total of each meal type)
5. Email attendance list to kitchen staff

## Troubleshooting

### "Failed to fetch attendance data" error
- Verify Airtable fields are created and named exactly as specified
- Check that `.env.local` has correct Airtable credentials
- Ensure Christmas table ID is correct in environment variables

### Dessert preference not showing on attendance list
- Verify the "Dessert Preference" field exists in Airtable
- Check field name matches exactly (case-sensitive)
- Make sure data was entered and saved properly

### Print layout issues
- Use Chrome or Edge for best print results
- Try Print Preview before printing
- Adjust margins in print dialog if needed

## Summary

**What you need to do:**
1. ✅ Add "Special Requests" field to Christmas table in Airtable
2. ✅ Add "Dessert Preference" field to Christmas table in Airtable
3. ✅ (Optional) Add "Special Requests" field to NYE table in Airtable
4. ✅ Test by creating a sample sale at `/internal`
5. ✅ View the attendance list at `/xmas2025-attendance-list`
6. ✅ Print and verify formatting

**Recommended approach for Mary Snyder's pumpkin pie request:**
- Use the "Dessert Preference" dropdown in the sales form
- This keeps data structured and easy to report on
- Alternative: Could add to "Special Requests" but dropdown is cleaner

The system is ready to use as soon as you add the fields to Airtable!
