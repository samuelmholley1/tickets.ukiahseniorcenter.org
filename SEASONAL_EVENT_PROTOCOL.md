# Seasonal Event Management Protocol

**Last Updated:** January 21, 2026

## Purpose

This document establishes the protocol for managing seasonal events in the codebase to maintain an evergreen, reusable foundation.

---

## ⚠️ ONE-TIME OPERATIONS: Use Terminal Commands, NOT Scripts

**CRITICAL:** For one-time operations like manually adding a record to Airtable or sending an email, **use direct terminal commands** instead of creating scripts.

### Why?
- Scripts clutter the repository with single-use files
- Terminal commands are faster and leave no cleanup required  
- The operation is documented in conversation history anyway

### Examples of One-Time Operations:
- Adding a missed ticket sale to Airtable
- Sending a confirmation email for a failed submission
- Checking a specific record's data
- Quick data corrections

### How to Do It:
```powershell
# Add to Airtable via REST API
$headers = @{Authorization="Bearer $env:AIRTABLE_API_KEY"; "Content-Type"="application/json"}
$body = @{fields=@{Name="Customer Name";Email="email@example.com"}} | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "https://api.airtable.com/v0/BASE_ID/TABLE_ID" -Method POST -Headers $headers -Body $body

# Send email via running dev server's API
$body = @{firstName='Name';lastName='Last';email='email@example.com';valentinesNonMember=2} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/tickets/send-receipt" -Method POST -Body $body -ContentType "application/json"
```

**Only create scripts when:**
- The operation will be repeated multiple times
- Complex logic or loops are needed
- It's a bulk import with many records

## Core Principle: Comment, Don't Delete

**When an event concludes, COMMENT OUT the code instead of deleting it.**

This preserves the implementation for next year's event, allowing quick re-activation without rebuilding from scratch.

---

## Protocol for Disabling Seasonal Events

### 1. Mark the Section Clearly

Use structured comment markers to identify the event and status:

```typescript
/* ========== [EVENT NAME] SECTION - COMMENTED OUT FOR [NEXT YEAR] ==========
 * Event Period: [Start Date] - [End Date]
 * Disabled: [Disable Date]
 * Reason: Event concluded, preserved for next year
 * To Re-enable: Uncomment this entire section and restore any API call references
 * ========================================================================== */
```

**Example:**
```typescript
/* ========== CHRISTMAS DRIVE-THRU SECTION - COMMENTED OUT FOR 2026 ==========
 * Event Period: December 18-21, 2025
 * Disabled: December 30, 2025
 * Reason: Event concluded, preserved for Christmas 2026
 * To Re-enable: Uncomment this entire section and restore vegetarianMeals API call
 * ========================================================================== */
```

### 2. Comment Out State Variables

Preserve state declarations with inline comments:

```typescript
// const [vegetarianMeals, setVegetarianMeals] = useState<boolean[]>([]);
```

### 3. Remove/Disable API Call References

**CRITICAL:** Commented-out state variables cannot be referenced in active code.

**Option A - Set to Default Value (Recommended):**
```typescript
body: JSON.stringify({
  quantities,
  customer: formData,
  donation: wantsDonation ? parseFloat(donationAmount) : 0,
  vegetarianMeals: 0 // vegetarianMeals.filter(Boolean).length - Uncomment for next year's event
})
```

**Option B - Comment Out the Field:**
```typescript
body: JSON.stringify({
  quantities,
  customer: formData,
  donation: wantsDonation ? parseFloat(donationAmount) : 0,
  // vegetarianMeals: vegetarianMeals.filter(Boolean).length // Uncomment for next year's event
})
```

### 4. Comment Out UI Components

Keep the entire UI structure commented:

```typescript
{/* <div className="mb-6">
  <h3 className="text-xl font-semibold mb-3 text-gray-800">
    Christmas Drive-Thru Event
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    December 18-21, 2025 • Member: $15 | Non-member: $20
  </p>
  [... rest of component ...]
</div> */}
```

### 5. Update Event Selection Buttons

Comment out event buttons from navigation:

```typescript
{/* <Button
  onClick={() => router.push('/internal/christmas-drive-thru-2025')}
  variant="outline"
>
  Christmas Drive-Thru 2025 Tickets
</Button> */}
```

---

## Protocol for Re-enabling Seasonal Events

### 1. Locate the Section

Search for the comment markers (e.g., `CHRISTMAS SECTION - COMMENTED OUT FOR 2026`)

### 2. Uncomment All Code

- Remove `//` from state variables
- Remove `/* */` from UI components
- Remove comment markers

### 3. Restore API Call References

If using Option A (default value), replace:
```typescript
vegetarianMeals: 0 // vegetarianMeals.filter(Boolean).length
```

With:
```typescript
vegetarianMeals: vegetarianMeals.filter(Boolean).length
```

If using Option B (commented field), uncomment the line:
```typescript
// vegetarianMeals: vegetarianMeals.filter(Boolean).length
```

### 4. Update Dates and Text

- Update event dates in copy
- Update pricing if changed
- Update page titles and headers

### 5. Test Thoroughly

- Test form submission
- Test API endpoints
- Verify Airtable integration
- Check attendance list pages

---

## Benefits of This Approach

✅ **Preservation:** All event-specific logic and UI is preserved  
✅ **Reusability:** Next year's event can be activated in minutes  
✅ **History:** Clear documentation of when/why events were disabled  
✅ **Code Quality:** No need to rebuild from scratch each year  
✅ **Evergreen Base:** Core ticketing system remains active year-round

---

## Example: Christmas Drive-Thru 2025 → 2026

**Disabled: December 30, 2025**
- Christmas section in `/internal/page.tsx` commented out (lines 170-269)
- State variable `vegetarianMeals` commented with inline comment
- API call updated to `vegetarianMeals: 0` with re-enable comment
- Event button commented out in navigation

**To Re-enable for Christmas 2026:**
1. Uncomment lines 170-269 in `/internal/page.tsx`
2. Uncomment `vegetarianMeals` state variable
3. Change API call to `vegetarianMeals: vegetarianMeals.filter(Boolean).length`
4. Update dates: "December 18-21, 2025" → "December 17-20, 2026" (or actual dates)
5. Verify pricing is still $15/member, $20/non-member (or update if needed)
6. Uncomment event button in navigation
7. Test entire flow from form to Airtable

---

## ⚠️ CRITICAL: Airtable Configuration for New Events

**When adding or re-enabling any event, you MUST configure Airtable first!**

The ticket submission will fail with a 500 error if Airtable is not properly configured.

### Required Airtable Setup for Each Event

1. **Create/Verify the Event Table Exists**
   - Table name must match what the code expects (e.g., "Valentine's Day 2026", "Speakeasy 2026")
   - Check `src/app/api/tickets/submit/route.ts` for exact table names

2. **Configure Required Fields**
   Based on previous events, each event table needs these fields:
   
   | Field Name | Field Type | Notes |
   |------------|------------|-------|
   | Name | Single line text | Customer name |
   | Email | Email | Customer email |
   | Phone | Phone number | Customer phone |
   | Ticket Type | Single select | "Member", "Non-Member", etc. |
   | Quantity | Number | Number of tickets |
   | Amount | Currency | Total paid |
   | Payment Method | Single select | "Cash", "Check", "Cash & Check", "Credit Card", "Comp", "Other" |
   | Check Number | Single line text | If check payment |
   | Cash Amount | Currency | For split payments |
   | Check Amount | Currency | For split payments |
   | Staff Initials | Single line text | Who processed the sale |
   | Purchase Date | Date | When purchased |
   | Notes | Long text | Any additional notes |
   | Source | Single select | "Internal", "Zeffy", etc. |

3. **Copy Field Configuration from Previous Event**
   - Open the most recent similar event table in Airtable
   - Use "Duplicate table" or manually recreate the field structure
   - Ensure Single Select options match what the code sends

4. **Update API Route if Needed**
   - Check `src/app/api/tickets/submit/route.ts`
   - Verify event name matches Airtable table name exactly
   - Add any new event-specific field mappings

5. **Test Before Going Live**
   - Submit a test ticket through the internal page
   - Verify it appears in Airtable correctly
   - Check that email receipt sends properly

### Common Failure Causes

| Error | Cause | Fix |
|-------|-------|-----|
| 500 on submit | Table doesn't exist | Create table in Airtable |
| 500 on submit | Field doesn't exist | Add missing field to table |
| 500 on submit | Field type mismatch | Change field type or update code |
| 422 validation error | Single select value not in options | Add option to single select field |

### Checklist for New Event Airtable Setup

- [ ] Table created with correct name (must match code exactly)
- [ ] All required fields created with correct types
- [ ] Single select fields have all necessary options
- [ ] API route updated to reference new table
- [ ] Test submission works from internal page
- [ ] Email receipt sends successfully
- [ ] Ticket list page shows new records

---

## When to Use This Protocol

**DO use this protocol for:**
- Seasonal/annual events (Christmas Drive-Thru, New Year's Eve Gala, etc.)
- Limited-time ticket sales
- Event-specific features (vegetarian meal options, specific pricing tiers)

**DO NOT use this protocol for:**
- Core ticketing functionality (always keep active)
- Bug fixes (delete broken code)
- Deprecated features being replaced (delete and migrate)

---

## Checklist for Disabling an Event

- [ ] Add structured comment markers with event details
- [ ] Comment out all state variables
- [ ] Set API call references to default values OR comment them out
- [ ] Comment out all UI components
- [ ] Comment out navigation buttons
- [ ] Test that build succeeds (no TypeScript errors)
- [ ] Test that active events still work correctly
- [ ] Commit with clear message: "Comment out [EVENT] for [NEXT YEAR] reuse"
- [ ] Update this protocol if needed with event-specific notes

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2025-12-30 | Initial protocol created, Christmas Drive-Thru 2025 disabled | Assistant |
