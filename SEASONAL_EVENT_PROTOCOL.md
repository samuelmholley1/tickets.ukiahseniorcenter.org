# Seasonal Event Management Protocol

**Last Updated:** December 30, 2025

## Purpose

This document establishes the protocol for managing seasonal events in the codebase to maintain an evergreen, reusable foundation.

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
