# Airtable Schema - Current Fields

**Last Updated:** December 9, 2025

## Christmas Drive-Thru 2025 Table

**Table ID:** `tbljtMTsXvSP3MDt4`  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tbljtMTsXvSP3MDt4

### Fields to Create Manually in Airtable:

#### Text Fields (Single line text)
- **Transaction ID** - Unique ID for each sale (e.g., TXN-1733789432-ABC123)
- **First Name** - Customer first name
- **Last Name** - Customer last name
- **Email** - Customer email address (use Email field type)
- **Phone** - Customer phone number (use Phone number field type)
- **Check Number** - Check number if payment by check
- **Staff Initials** - Who processed the sale

#### Text Fields (Long text)
- **Payment Notes** - For split payments, stores: "Cash: $50.00, Check: $30.00"

#### Single Select Field
- **Payment Method** - Options: `Cash`, `Check`, `Cash & Check`

#### Number Fields (Currency $)
- **Ticket Subtotal** - Total cost of tickets only (before donation)
- **Donation Amount** - Additional donation amount
- **Amount Paid** - Grand total (Ticket Subtotal + Donation)

#### Number Fields (Integer)
- **Ticket Quantity** - Total number of tickets
- **Christmas Member Tickets** - Count of member tickets
- **Christmas Non-Member Tickets** - Count of non-member tickets
- **Vegetarian Meals** - Number of eggplant meals instead of prime rib

---

## NYE Gala Dance 2025 Table

**Table ID:** `tbl5OyCybJCfrebOb`  
**URL:** https://airtable.com/appZ6HE5luAFV0Ot2/tbl5OyCybJCfrebOb

### Fields to Create Manually in Airtable:

#### Text Fields (Single line text)
- **Transaction ID** - Unique ID for each sale
- **First Name** - Customer first name
- **Last Name** - Customer last name
- **Email** - Customer email address (use Email field type)
- **Phone** - Customer phone number (use Phone number field type)
- **Check Number** - Check number if payment by check
- **Staff Initials** - Who processed the sale

#### Text Fields (Long text)
- **Payment Notes** - For split payments, stores: "Cash: $50.00, Check: $30.00"

#### Single Select Field
- **Payment Method** - Options: `Cash`, `Check`, `Cash & Check`

#### Number Fields (Currency $)
- **Ticket Subtotal** - Total cost of tickets only (before donation)
- **Donation Amount** - Additional donation amount
- **Amount Paid** - Grand total (Ticket Subtotal + Donation)

#### Number Fields (Integer)
- **Ticket Quantity** - Total number of tickets
- **NYE Member Tickets** - Count of member tickets
- **NYE Non-Member Tickets** - Count of non-member tickets

---

## Quick Summary Reports in Airtable

Once fields are created, you can create views:

### Christmas Meal Planning View
- **Filter:** Show all records
- **Group by:** Vegetarian Meals
- **Summary Fields:**
  - SUM of Ticket Quantity = Total meals needed
  - SUM of Vegetarian Meals = Total eggplant meals
  - Regular meals = Total meals - Vegetarian meals

### Financial Reconciliation View
- **Group by:** Payment Method
- **Summary Fields:**
  - SUM of Amount Paid
  - COUNT of records
  - SUM of Donation Amount

### Daily Sales View
- **Group by:** Created Time (by day)
- **Sort:** Created Time (newest first)
- **Summary:** SUM of Amount Paid, COUNT of records

---

## API Integration Notes

### Current Features
- ✅ Automatic email sending with PDF tickets
- ✅ Split payment tracking (Cash & Check)
- ✅ Vegetarian meal option for Christmas
- ✅ Donation tracking per event
- ✅ Staff initials for accountability

### Future: Zeffy API Integration
When connecting Zeffy purchases:
- Zeffy transactions will create records in same tables
- Staff Initials can be "ZEFFY" for online purchases
- Payment Method will be "Credit Card" or "Zeffy"
- Can filter by staff initials to see online vs in-person sales
