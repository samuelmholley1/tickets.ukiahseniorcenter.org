# Session Notes - January 21-22, 2026

## Overview
Lunch reservation system development and UX improvements for Ukiah Senior Center.

---

## Key Changes Completed

### 1. Lunch Sales Page (`/internal/lunch`)
- **Date Selection**: Click dates to add/remove (no more multi-day mode toggle)
- **Timezone Fix**: Uses local time instead of UTC for 2pm deadline calculation
- **Customer Info**: Added "Clear All" button + "Copy" buttons under each field
- **Payment Options**: Added "Cash & Check" split payment (like ticket sales page)
- **Email/Phone**: Now required, email defaults to `cashier@seniorctr.org`
- **Lunch Card Lookup**: Yellow search box at top to check customer balances

### 2. Ticket Sales Page (`/internal`)
- **Lunch Card Lookup**: Added same yellow search box for balance checking

### 3. API Improvements
- Better error messages for missing Vercel environment variables
- Fixed lunch card search API to use local variables consistently

---

## Lunch Pricing Reference

### Individual Meals
| Type | Member | Non-Member |
|------|--------|------------|
| Dine In | $8 | $10 |
| To Go | $9 | $11 |
| Delivery | $12 | $14 |

### Lunch Cards (Prepaid)
| Meals | Member Dine In | Member Pickup | Member Delivery |
|-------|----------------|---------------|-----------------|
| 5 | $40 | $45 | $60 |
| 10 | $80 | $90 | $120 |
| 15 | $120 | $135 | $180 |
| 20 | $160 | $180 | $240 |

Non-member cards: Add $10 per tier (5-meal = +$10, etc.)

---

## Airtable Tables

| Table | ID | Purpose |
|-------|-----|---------|
| Lunch Cards | `tblOBnt2ZatrSugbj` | Prepaid meal cards |
| Lunch Reservations | `tblF83nL5KPuPUDqx` | Daily meal orders |
| Valentines 2026 | `tblgQA8BawIrlk2kh` | Feb 14 dance tickets |
| Speakeasy 2026 | `tblMmwD5JEE5iCfLl` | Apr 11 gala tickets |

---

## Vercel Environment Variables Added
```
AIRTABLE_LUNCH_CARDS_TABLE_ID=tblOBnt2ZatrSugbj
AIRTABLE_LUNCH_RESERVATIONS_TABLE_ID=tblF83nL5KPuPUDqx
AIRTABLE_VALENTINES_TABLE_ID=tblgQA8BawIrlk2kh
AIRTABLE_SPEAKEASY_TABLE_ID=tblMmwD5JEE5iCfLl
```

---

## Sample Lunch Cards (for testing)
| Name | Phone | Card | Remaining |
|------|-------|------|-----------|
| John Smith | 707-555-1234 | 10 Meals (Member) | 7 |
| Mary Johnson | 707-555-5678 | 20 Meals (Member) | 15 |
| Bob Wilson | 707-555-9999 | 5 Meals (Non-Member) | 3 |
| Test User | 707-123-4567 | 10 Meals (Member) | 10 |

---

## Reservation Deadline Logic
- Must reserve by **2pm the business day before**
- Closed Friday, Saturday, Sunday
- Thursday 2pm = deadline for Monday lunch
- Wednesday before 2pm → Thursday available
- Wednesday after 2pm → Monday available

---

## Key Files Modified
- `src/app/internal/lunch/page.tsx` - Main lunch sales form
- `src/app/internal/page.tsx` - Ticket sales (added lunch card lookup)
- `src/app/api/lunch/card/route.ts` - Lunch card API
- `src/app/api/lunch/reservation/route.ts` - Reservation API

---

## Production URLs
- Tickets: `tickets.ukiahseniorcenter.org`
- Lunch: `tickets.ukiahseniorcenter.org/internal/lunch`
- Internal Sales: `tickets.ukiahseniorcenter.org/internal`

---

## Confirmed Working (Jan 22, 2026)
✅ Lunch card lookup on production
✅ Vercel environment variables configured
✅ Date selection defaults to correct day based on 2pm deadline
