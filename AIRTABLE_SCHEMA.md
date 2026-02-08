# Airtable Schema Documentation

**Last Updated:** February 8, 2026  
**Verified Against Live API:** February 8, 2026  
**Base:** Ukiah Senior Center `appZ6HE5luAFV0Ot2`  
**Total Tables:** 18

---

## Table of Contents

1. [CONTACTS](#contacts-table) — Master contact table for all members, donors, and contacts
2. [MEMBERSHIPS_NEW](#memberships-new-table) — Current membership records with payment dates, expiration, and status
3. [DONATIONS_NEW](#donations-new-table) — Current donation records
4. [Lunch Reservations](#lunch-reservations-table) — Tracks daily lunch reservations and walk-ins for the dining room
5. [Lunch Cards](#lunch-cards-table) — Prepaid meal cards
6. [Kitchen Data](#kitchen-data-table) — Tracks daily grocery donation weights by source (Safeway, Lucky) and kitchen temperatures
7. [Volunteers](#volunteers-table) — Volunteer applications and management
8. [USC Utilization](#usc-utilization-table) — Monthly utilization statistics for all senior center programs
9. [QuickBooks Tokens](#quickbooks-tokens-table) — Stores QBO OAuth tokens
10. [Scoop Checklist](#scoop-checklist-table) — Newsletter (SCOOP) production task tracking
11. [Thanksgiving Planning](#thanksgiving-planning-table) — Task management for annual Thanksgiving meal event
12. [Christmas Drive-Thru 2025](#christmas-drive-thru-2025-table) — Ticket sales for 2025 Christmas Drive-Thru dinner event
13. [NYE Gala Dance 2025](#nye-gala-dance-2025-table) — Ticket sales for 2025 New Year's Eve Gala Dance
14. [Valentines Day Dance 2026](#valentines-day-dance-2026-table) — Ticket sales for 2026 Valentine's Day Dance
15. [Speakeasy Gala 2026](#speakeasy-gala-2026-table) — Ticket sales for 2026 Speakeasy Gala fundraiser
16. [Memberships](#memberships-legacy) — Website membership intake form
17. [Main Form](#main-form-legacy) — Legacy data imported from original database
18. [FundRequest&Donations](#fundrequestdonations-legacy) — Legacy donation/fund request tracking

---

## CONTACTS Table

**Table ID:** `tbl3PQZzXGpT991dH`  
**Purpose:** Master contact table for all members, donors, and contacts. Links to MEMBERSHIPS_NEW, DONATIONS_NEW, Lunch Cards, and Lunch Reservations. **Use this table instead of Main Form for all queries.**

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Name | singleLineText | `fldvxFnxGenLwgjNh` | Primary field |
| First Name | singleLineText | `fld4ZA2CZaGk4iIsh` |  |
| Last Name | singleLineText | `fldkyJjefdpfzVcPr` |  |
| Address | singleLineText | `fldk40JKirlGtCvUs` |  |
| City | singleLineText | `fldbmeJgByIk4LyG2` |  |
| State | singleLineText | `fldfu3DIaNNKvVbkT` |  |
| Zip Code | singleLineText | `fldsb6qk53kFMP47d` |  |
| Phone Home | phoneNumber | `fldqIhmZNptLbYN5a` |  |
| Phone Cell | phoneNumber | `fldqGWQ8MYuJ2mnIg` |  |
| Email | email | `fldtuLs5DUfo4A13V` |  |
| Birth Date | date | `fldnwe1rXdcZuzk51` | Format: local date |
| DOB Month | number | `fld1N5d0XZIxBS4rK` | Integer |
| DOB Day | number | `fldnfn1YloIPPmSBG` | Integer |
| Contact Type | **multipleSelects** | `fldpZErkilkDcXkzu` | Options: Member, Donor, Business, Agency, Other |
| SCOOP Status | singleSelect | `fldSZee25evirTDyX` | Options: Active, Hold, Removed, None |
| Source | singleSelect | `fldkuM3MFCx2x9tIt` | Options: Legacy, Website, Internal, Paper Form, Donation Import |
| Notes | multilineText | `fld2cFX5bKVSeZ8Hk` |  |
| Legacy Main Form ID | number | `fldhEs9nQzBTW50XZ` | Integer |
| MEMBERSHIPS_NEW | multipleRecordLinks | `fldFOgf1KkePYOwoe` | → tbl7iQniH30UcD3dY |
| DONATIONS_NEW | multipleRecordLinks | `fldqt2FdodYagoQMt` | → tblRuOB2vjyoWVwJK |
| Membership Type | singleSelect | `fldQvAmlPeBfMWIIl` | Options: Individual, Household |
| DONATIONS_NEW 2 | multipleRecordLinks | `fldGwMhR9KcBdv7UI` | → tblRuOB2vjyoWVwJK |
| Lunch Cards | multipleRecordLinks | `fldcfmG9tM56gFp8j` | → tblOBnt2ZatrSugbj |
| Lunch Reservations | multipleRecordLinks | `fldDlx90EZYdeKaM6` | → tblF83nL5KPuPUDqx |
| Deceased | checkbox | `fldSUY1rZbfDwH9tc` | Red check |
| Deceased Date | date | `fldJlKv1wwN8ifqdC` | Format: M/D/YYYY |

---

## MEMBERSHIPS_NEW Table

**Table ID:** `tbl7iQniH30UcD3dY`  
**Purpose:** Current membership records with payment dates, expiration, and status. Linked from CONTACTS.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Member Name | singleLineText | `fldCuXOSl9OPVeNfZ` | Primary field |
| Contact | multipleRecordLinks | `fldw56j5DFtLOrSPs` | → tbl3PQZzXGpT991dH |
| Membership Type | singleSelect | `fld6ktSsZ9eTAl0zR` | Options: Individual, Household, Lifetime, 90+ Complimentary |
| Status | **multipleSelects** | `fldFcxYoZlivW4dDh` | Options: Active, Expired, Pending, Active but Expired, Inactive, Deceased, Converted to Individual |
| Dues Amount | currency | `fldNTOzdCKAgfl4Th` | Precision: 2, Symbol: $ |
| Dues Paid Date | date | `fldoCDt1mMk9S7boE` | Format: local date |
| Dues FY | singleLineText | `fldEMfXlwNZlE4akk` |  |
| Expiration | date | `fldEodC4XRhM4CXtH` | Format: local date |
| Lifetime Member | checkbox | `fldRV5xqrxZBvIwZS` | Purple check |
| Over 90 | checkbox | `fld2j9zmxbqctqrEF` | Yellow check |
| Card Mailed FY25-26 | checkbox | `fldLR0mrSwQFQymGm` | Green check |
| Notes | multilineText | `fld5CEvUloMTbWKPR` |  |
| Legacy Main Form ID | number | `fldC1dsdROYp6MPiL` | Integer |

---

## DONATIONS_NEW Table

**Table ID:** `tblRuOB2vjyoWVwJK`  
**Purpose:** Current donation records. Linked from CONTACTS.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Donor Name | singleLineText | `fld7PQQyb94aLREGe` | Primary field |
| Contact | multipleRecordLinks | `fldLd05lPH3n2G4Ik` | → tbl3PQZzXGpT991dH |
| Donation Amount | currency | `fldzwEk390fD3pulT` | Precision: 2, Symbol: $ |
| Donation Date | date | `flddVETgzyEIMaxIm` | Format: local date |
| Donation Type | singleSelect | `fldxhrr1uQC6UwPOU` | Options: Cash, Check, Credit Card, Online, In-Kind, Other, Money Order, Bill Pay, Zeffy, Payroll Deduction |
| Fund | singleSelect | `fldixBV9lUDun1UMx` | Options: General, Building, Kitchen, Transportation, Memorial, Other, AATR, Thanksgiving, Grants, Lunch Bunch, Annual Pledge, Sustaining |
| Notes | multilineText | `fld6XaOYWmhgM0XLr` |  |
| Legacy Main Form ID | number | `fldZZ4Ag53LEwZfSj` | Integer |
| Thank You Sent | date | `fldRoWyil6j2uWcbp` | Format: local date |
| Annual Pledge | checkbox | `fldNjpLCdz7D1505B` | Green check |
| SCOOP Month | singleLineText | `fld0lNe888Zxu3nlx` |  |
| Thank You In Process | checkbox | `fld4Wxu1XPUgrCK8c` | Green check |
| Thank You Status | singleLineText | `fld8pR2zcaw1Avn4T` |  |
| Second Donor | singleLineText | `fldNseSreNw5bzyrJ` |  |
| Second Contact | multipleRecordLinks | `fldqjioaSVFl61pP7` | → tbl3PQZzXGpT991dH |

---

## Lunch Reservations Table

**Table ID:** `tblF83nL5KPuPUDqx`  
**Purpose:** Tracks daily lunch reservations and walk-ins for the dining room.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Name | singleLineText | `fldqFta59TB6TJzZL` | Primary field |
| Date | date | `fldbvRMzl9TwFx4Fd` | Format: local date |
| Meal Type | singleSelect | `fldzecVd4frivHpmH` | Options: Dine In, To Go, Delivery |
| Member Status | singleSelect | `fldATOzjeLVG9GPJb` | Options: Member, Non-Member |
| Amount | currency | `fldKYeUtZSYqVm4e7` | Precision: 2, Symbol: $ |
| Payment Method | singleSelect | `fldWpJr7qNTNHWOjA` | Options: Cash, Check, Card (Zeffy), Lunch Card |
| Notes | multilineText | `fldx3XxP8B2ntgkaF` |  |
| Staff | singleLineText | `fld6ZwzViB6JkH3t4` |  |
| Status | singleSelect | `fldPnM2BmRVtBqGFt` | Options: Reserved, Picked Up, No Show |
| Lunch Card | multipleRecordLinks | `fldiRNVsq4QqEegcl` | → tblOBnt2ZatrSugbj |
| Frozen Friday | checkbox | `fldrsjUPo2F2lw6iE` | Blue check |
| Contact | multipleRecordLinks | `fldkvInhOIVlZQPIc` | → tbl3PQZzXGpT991dH |

---

## Lunch Cards Table

**Table ID:** `tblOBnt2ZatrSugbj`  
**Purpose:** Prepaid meal cards. Tracks remaining meals and delivery preferences.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Name | singleLineText | `fldWRjDjKxfiLCrgO` | Primary field |
| Phone | phoneNumber | `fldHLWpmwl1WWQ2Bk` |  |
| Card Type | singleSelect | `fldB9eGNWBFzAGOQY` | Options: 5 Meals, 10 Meals, 15 Meals, 20 Meals, 25 Meals |
| Member Status | singleSelect | `fldgQsh8qisnZQH9w` | Options: Member, Non-Member |
| Total Meals | number | `fld6KG8tUilL4kK7R` | Integer |
| Remaining Meals | number | `fldGORkkcsuks2p7r` | Integer |
| Amount Paid | currency | `fldrUUtMVVUJ4dgvZ` | Precision: 2, Symbol: $ |
| Payment Method | singleSelect | `fldglSQb9N5g6DcT4` | Options: Cash, Check, Card (Zeffy) |
| Purchase Date | date | `fldSP4yFOHvXdXlB0` | Format: local date |
| Staff | singleLineText | `fldl4gMfEJzfIOfEV` |  |
| Lunch Reservations | multipleRecordLinks | `fldwIDDsgWFqsqomj` | → tblF83nL5KPuPUDqx |
| Weekly Delivery | checkbox | `fldCoqaAke9AZCrPj` | Green check |
| Delivery Address | multilineText | `fldGUodp1yqLG4DKi` |  |
| Include Frozen Friday | checkbox | `fldUSO6r9iyXCVb1f` | Blue check |
| Contact | multipleRecordLinks | `fld7KPOaKxDUjO6jl` | → tbl3PQZzXGpT991dH |
| Lunch Card ID | singleLineText | `fldZ1gMEGiAVOELly` |  |

---

## Kitchen Data Table

**Table ID:** `tblICSEEG5ODlMXIz`  
**Purpose:** Tracks daily grocery donation weights by source (Safeway, Lucky) and kitchen temperatures.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Date | date | `fldjEFYtyw5Gl1bpA` | Primary field — Format: M/D/YYYY |
| Donation Source | singleLineText | `fldgeWocQQtOJcicj` |  |
| Produce Weight | number | `fldR7bS8W1INnTeOR` | Precision: 1 |
| Other Items Weight | number | `fldGLwuXfMi97JF5x` | Precision: 1 |
| Waste Weight | number | `fldtNnTCbTDIFbOU2` | Precision: 1 |
| Notes | multilineText | `fldIx5ejAnTkJ4H1W` |  |
| Logged By | singleLineText | `fldUPUZzwf7elz2IU` |  |
| Safeway Produce | number | `fld8JUAFtlnAwsX91` | Precision: 1 |
| Safeway Other | number | `fldaHhT52Jy0uDTG3` | Precision: 1 |
| Safeway Waste | number | `fldQ1O2yZImX62wGV` | Precision: 1 |
| Lucky Produce | number | `fldzXiHJAwz5TRbcW` | Precision: 1 |
| Lucky Other | number | `fld3J6qaY7jWatiIQ` | Precision: 1 |
| Lucky Waste | number | `fldNOpHVjwYW8hptZ` | Precision: 1 |
| Walk-In Fridge Temp | number | `fldlyFHK0wF2fMxef` | Precision: 1 |
| Walk-In Freezer Temp | number | `fldZjNL6p4DPG29Fz` | Precision: 1 |

---

## Volunteers Table

**Table ID:** `tblBfH8TqiQzSQjsV`  
**Purpose:** Volunteer applications and management. Full intake form with emergency contacts.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| First Name | singleLineText | `fldUEY1g7Ibg47mW2` | Primary field |
| Last Name | singleLineText | `fldN9x8MmAiYAa3TD` |  |
| Email | email | `fld3pLUHujnNlYX9s` |  |
| Phone | phoneNumber | `fldgur5uJzxamqHv7` |  |
| Date of Birth | date | `fldchsk8PtYrhP2iI` | Format: M/D/YYYY |
| Address Street | singleLineText | `fldfUtDscBWUrhHid` |  |
| Apt | singleLineText | `fldqJSiXO8izcKT4k` |  |
| City | singleLineText | `fldOjEKpcRe4wb8gS` |  |
| ZIP | singleLineText | `fldh1nZF0YD1wFgtK` |  |
| Physical Limitations | multilineText | `fldFYn7jvtw7X77D5` |  |
| Ethnicity | singleLineText | `fldt0Ipd7rGFvDx4q` |  |
| Sex | singleSelect | `fldNiqz9DuEPIwbJi` | Options: Female, Male |
| Pronouns | singleSelect | `fldOoiNGQMngMT102` | Options: She/Her, He/Him, They/Them |
| Military Status | singleSelect | `fldPKQmCuz2YuAEaa` | Options: Veteran, Spouse, Family, No |
| Shirt Size | singleSelect | `fldPZ9UnK8xaqU8tD` | Options: XS, S, M, L, XL, 2XL, 3XL, 4XL |
| Referral Source | multilineText | `fld8cE1Xb5XMGhLPN` |  |
| Skills and Interests | multilineText | `fldPnhmNslxg5YYo0` |  |
| Languages Spoken | singleLineText | `fld14j7vQ5nDyWzvy` |  |
| Beneficiary Name | singleLineText | `fldMo37UPgPoEpQhG` |  |
| Beneficiary Relationship | singleLineText | `fldzw2pMCjlk2qkvK` |  |
| Beneficiary Phone | phoneNumber | `fldaxWo11Q8tO3jpS` |  |
| Beneficiary Email | email | `fldsDFe6c7FXCYPdi` |  |
| Emergency Contact Name | singleLineText | `fldS1c44MQ2GA405K` |  |
| Emergency Contact Relationship | singleLineText | `fld11P90QabiKHXcj` |  |
| Emergency Contact Phone | phoneNumber | `fldBHlK6l5ldq6otU` |  |
| Emergency Contact Email | email | `fldUriZIZi7OaCKC3` |  |
| Willing to Drive | checkbox | `fldE4XkbRdikEUd1L` | Green check |
| Submission Date | dateTime | `fldaCKLzZXw6bLePE` | Format: M/D/YYYY, 12-hour |
| Status | singleSelect | `fldxE66Om2slciDTk` | Options: New Application, In Review, Approved, Active, Inactive |
| Notes | multilineText | `fldaadym6ijWUiHXH` |  |
| Driver License Number | singleLineText | `fldDKm2KwHKdwG4Os` |  |
| Sent to NCO | checkbox | `fldpJPsafjvclCQrp` | Green check |
| Active | checkbox | `fldnyZp0Ra1H3Rr1v` | Green check |

---

## USC Utilization Table

**Table ID:** `tbl0r8f6YkD31vUPf`  
**Purpose:** Monthly utilization statistics for all senior center programs. Used for MTA reports (Transportation category: Miles, Rides).

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Record ID | singleLineText | `fldfpjm0hpiyGqDuc` | Primary field |
| Fiscal Year | singleSelect | `fldREs1E997Do7EGv` | Options: 2024-2025, 2025-2026, 2026-2027 |
| Month | singleSelect | `fldHSIki1XVbqQDhF` | Options: July, August, September, October, November, December, January, February, March, April, May, June |
| Category | singleSelect | `fldCBJRKwf6YpLhp8` | Options: Activities, Rentals, USC Events, Thrift Store, Transportation, Dining Room, Information & Referral |
| Metric Name | singleLineText | `fldM6FrkMrBiwS3gR` |  |
| Value | number | `fldcnaaI2EzoS8rb8` | Precision: 2 |
| Is Currency | checkbox | `fldVR2XoblHHCFweT` | Green check |
| Is Subtotal | checkbox | `fld5mLuGWzR4dV3vy` | Blue check |
| Notes | multilineText | `fldIFOBpg9C5cPY8d` |  |

---

## QuickBooks Tokens Table

**Table ID:** `tblf3s4pHSOzRgw5X`  
**Env Var:** `AIRTABLE_QB_TOKENS_TABLE_ID`  
**Purpose:** Stores QBO OAuth tokens. Contains ONE record where `{Token Type}='Current'`.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Token Type | singleLineText | `fldsunw1W3hXiZyOu` | Primary field |
| Refresh Token | singleLineText | `fldetkUumfS5SqWGz` |  |
| Realm ID | singleLineText | `fldCAYZHYGw5jbrc1` |  |
| Access Token | singleLineText | `fldGqPUwPBhYuFDeT` |  |
| Token Expires At | dateTime | `fld1bFKUr7aHGzTrT` | Format: M/D/YYYY, 24-hour |
| Updated By | singleLineText | `fldytMjRPnIlKyXZb` |  |

---

## Scoop Checklist Table

**Table ID:** `tblVlDN9ntGzf9Wce`  
**Purpose:** Newsletter (SCOOP) production task tracking.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Name | singleLineText | `fldfIaXuhapAClxLB` | Primary field |
| Notes | multilineText | `fldnfyOeIc0COPjG1` |  |
| Assignee | singleCollaborator | `fldLyl3Ej3AWWq5sB` | Airtable user |
| Status | singleSelect | `fldeqMEJ7a1jzusna` | Options: Todo, In progress, Done |
| Attachments | multipleAttachments | `fldFE4rml8d3poIsK` |  |
| Attachment Summary | aiText | `fldYjOTbGh1MrWf9h` | AI-generated |

---

## Thanksgiving Planning Table

**Table ID:** `tblpcWqVTjUsObypW`  
**Purpose:** Task management for annual Thanksgiving meal event.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Task | singleLineText | `fldiwJTlS8E7z552J` | Primary field |
| Day | singleSelect | `fldCVcI2eIzAeWgi7` | Options: Wednesday, Thursday |
| Time | singleLineText | `fldnG9ndCFmbUjgVP` |  |
| Section | singleSelect | `fldCVplL8QQ4wzYCA` | Options: Setup, Decorating, To-Go Line, Buffet Service, Coffee/Beverages, Dessert Service, Cleanup, See's Candy Sales, Kitchen Prep, Other |
| Lead | singleLineText | `fld2PwIlskAoE9Wn6` |  |
| Volunteers | multilineText | `fldWo7SWSFak2OHjk` |  |
| Slots Needed | number | `fldUOOuwNfSdlNtle` | Integer |
| Notes | multilineText | `fldD9luzuRVj0VH7s` |  |
| Updated At | dateTime | `fldD8b6DV0jjSbSxH` | Format: YYYY-MM-DD, 24-hour |
| Updated By | singleLineText | `fldz0sdm7vowR3hGn` |  |

---

## Christmas Drive-Thru 2025 Table

**Table ID:** `tbljtMTsXvSP3MDt4`  
**Purpose:** Ticket sales for 2025 Christmas Drive-Thru dinner event.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| First Name | singleLineText | `fldfoPoLht62q0Qfu` | Primary field |
| Last Name | singleLineText | `fldc4lIR6no26jhqh` |  |
| Email | email | `fld33ouVNyuk38I2O` |  |
| Phone | phoneNumber | `fldrDYr8PV1yRxb7v` |  |
| Payment Method | singleLineText | `fldwYfYOgs7l9rwhq` |  |
| Check Number | singleLineText | `flddfkNNQvwTlIBFl` |  |
| Amount Paid | currency | `fldx6VjNTjysEzHij` | Precision: 2, Symbol: $ |
| Staff Initials | singleLineText | `fldt2k1UaJhUT3D4I` |  |
| Ticket Quantity | number | `fldbt14bmTbioxzYn` | Integer |
| Christmas Member Tickets | number | `fldUlyPpqPJNCm43C` | Integer |
| Christmas Non-Member Tickets | number | `fldKLacqUzhTEKQMw` | Integer |
| Transaction ID | singleLineText | `fldpQBlr2tpjOr4E2` |  |
| Donation Amount | currency | `fld5eJhvcRpBOthl0` | Precision: 2, Symbol: $ |
| Ticket Subtotal | currency | `fldD2DX1T1bYFrp4D` | Precision: 2, Symbol: $ |
| Vegetarian Meals | number | `fldw68yMUw35z7h4c` | Integer |
| Payment Notes | multilineText | `fldX9kYLcC5FbTPVi` |  |
| Purchase Date | dateTime | `fldsBsq393iaLtj52` | Format: local, 12-hour |
| Refunded | checkbox | `fld0QTxCqIoMNgj65` | Red check |

---

## NYE Gala Dance 2025 Table

**Table ID:** `tbl5OyCybJCfrebOb`  
**Purpose:** Ticket sales for 2025 New Year's Eve Gala Dance.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| First Name | singleLineText | `fldU5QVmo9xra5t32` | Primary field |
| Last Name | singleLineText | `fldau9CNccF7uSrgu` |  |
| Email | email | `fldaM022FrHmk9woO` |  |
| Phone | phoneNumber | `fldbvUrsczH7MsWYy` |  |
| Payment Method | singleLineText | `fldHPhg69J3sV4DQL` |  |
| Check Number | singleLineText | `fldvNTaw1bCcbgp5E` |  |
| Amount Paid | currency | `fldfHJ9AfWykTcu4U` | Precision: 2, Symbol: $ |
| Staff Initials | singleLineText | `fldvQgLq55R5H1aNL` |  |
| Ticket Quantity | number | `fldU5A4kXolRu3KJq` | Integer |
| NYE Member Tickets | number | `fldTi2T5UdNxk1nXh` | Integer |
| NYE Non-Member Tickets | number | `fldcHr6kSCcz1dUL7` | Integer |
| Transaction ID | singleLineText | `fld4gQucjpZqoDdir` |  |
| Donation Amount | currency | `fld3S9Om3lTlhdFQM` | Precision: 2, Symbol: $ |
| Ticket Subtotal | currency | `fldvml4Nr0bHihGDX` | Precision: 2, Symbol: $ |
| Payment Notes | multilineText | `fldYF6tQAmJ1XhYTw` |  |
| Purchase Date | dateTime | `fldjuHT6INNDSBxwe` | Format: local, 12-hour |
| Refunded | checkbox | `fldLZIFiJHi7kOwml` | Red check |

---

## Valentines Day Dance 2026 Table

**Table ID:** `tblgQA8BawIrlk2kh`  
**Purpose:** Ticket sales for 2026 Valentine's Day Dance.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| First Name | singleLineText | `fldmrFEyFchpFaVdA` | Primary field |
| Last Name | singleLineText | `fldyuv1C6U64gVjSy` |  |
| Email | email | `flda0N1UDmRMAoBq3` |  |
| Phone | phoneNumber | `fldIP8oqiqbczrVbE` |  |
| Ticket Quantity | number | `flda2u7BnJXeQpRVP` | Integer |
| Member Tickets | number | `fldxMMKWemGIc64jo` | Integer |
| Non-Member Tickets | number | `fld47jW8STMJRYIVt` | Integer |
| Payment Method | singleSelect | `fldgDIKUlu5rmmaIX` | Options: Cash, Check, Zeffy, Comp, Other, Cash & Check |
| Check Number | singleLineText | `fldjvzN0wWDcvOcMM` |  |
| Payment Notes | multilineText | `fldNhxeztf1TEPVWH` |  |
| Amount Paid | currency | `fldqw47voPJL0Itol` | Precision: 2, Symbol: $ |
| Donation Amount | currency | `fldPpdz8ZpmeqEMty` | Precision: 2, Symbol: $ |
| Purchase Date | dateTime | `fldVSY1JeEAMtmOmf` | Format: local, 12-hour |
| Transaction ID | singleLineText | `fldOm3LJkKeqs4QsT` |  |
| Staff Initials | singleLineText | `fld7hrA6KzLdLxdIy` |  |
| Refunded | checkbox | `fldnJCFRLXhOpN55p` | Red check |

---

## Speakeasy Gala 2026 Table

**Table ID:** `tblMmwD5JEE5iCfLl`  
**Purpose:** Ticket sales for 2026 Speakeasy Gala fundraiser.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| First Name | singleLineText | `fldzDMIxqI9h7rLhm` | Primary field |
| Last Name | singleLineText | `fld3xSLAV0RETokGf` |  |
| Email | email | `fldyEwHBRf9PjuLtR` |  |
| Phone | phoneNumber | `fldG3x1525c61ozLl` |  |
| Ticket Quantity | number | `flduz2XJqoZMbwPfo` | Integer |
| Payment Method | singleSelect | `fldwjbXfapt2hCvG3` | Options: Cash, Check, Zeffy, Comp, Other |
| Check Number | singleLineText | `fld1AirO7h4ZC95HN` |  |
| Payment Notes | multilineText | `fldVg8VuG0mvdb623` |  |
| Amount Paid | currency | `fldKzUzvgYSnlNOtT` | Precision: 2, Symbol: $ |
| Donation Amount | currency | `fldIFTzGfgJnxa3VO` | Precision: 2, Symbol: $ |
| Purchase Date | dateTime | `fldzWn9kJkAP5GXAp` | Format: local, 12-hour |
| Transaction ID | singleLineText | `fld08tnB3w6UNMMgA` |  |
| Staff Initials | singleLineText | `fldxh8LTPzsVPbx2M` |  |
| Refunded | checkbox | `fldnKb4UNQfpwGM7w` | Red check |

---

## Memberships (LEGACY)

**Table ID:** `tblkyPNkAqzo5IEq7`  
**Purpose:** Website membership intake form. NOT the canonical membership data — use MEMBERSHIPS_NEW for that.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| Name | singleLineText | `fldhCkrBORMLmyVOe` | Primary field |
| Notes | multilineText | `fld2dwMqIn2C7qAz0` |  |
| Assignee | singleCollaborator | `fldkA34VdyMWEotUb` | Airtable user |
| Status | singleSelect | `fldx2YxeeSF7Bsozf` | Options: Todo, In progress, Done |
| Attachments | multipleAttachments | `fldKIc1y7sNgghuxf` |  |
| Attachment Summary | aiText | `fldydtdcENIbPcH0i` | AI-generated |
| Membership Status | singleSelect | `fldFMtTndcboYIp7D` | Options: New, Renewal |
| Email | email | `fldPvZpRN7NKXnHlp` |  |
| Membership Tier | singleSelect | `fldJil4cmlJWXjIl0` | Options: Single, Dual |
| Member 1 Name | singleLineText | `fldzLZWfxpO98R8dC` |  |
| Member 1 Birthdate | date | `fldsWzegc8n34RsRG` | Format: M/D/YYYY |
| Member 2 Name | singleLineText | `fldzM9CffZ920rg5g` |  |
| Member 2 Birthdate | date | `fldptqX7DiBdHy4EW` | Format: M/D/YYYY |
| Address Street | singleLineText | `fldHUBrbx4lX1mqiK` |  |
| Address City | singleLineText | `fldMzvhHs6jABsD79` |  |
| Address State | singleLineText | `fldN4swINXg3dh1U5` |  |
| Address ZIP | singleLineText | `fldJnbUVaWfMA2Ki5` |  |
| Phone Home | phoneNumber | `fldUSbOg7ej8rbO3K` |  |
| Phone Cell | phoneNumber | `fldu1Lug84vNsidYN` |  |
| Newsletter Preference | singleSelect | `fld1IPzod0wnMFrYG` | Options: Email, Mail |
| Areas of Interest | multilineText | `fldV1wMWVw4z8ubEi` |  |
| Payment Method | singleSelect | `fldO8RhCEgCQw4EZ5` | Options: Check, Cash, Credit Card |
| Payment Reference | singleLineText | `fld4vjBnKoa9nZvOQ` |  |
| Payment Amount | number | `fld0KNzBkSnq6UKvH` | Precision: 2 |
| Entered By Staff | singleLineText | `fldplCojbvGSucSda` |  |
| Submission Date | dateTime | `fldZAxqCgeoQ8oOty` | Format: M/D/YYYY, 12-hour |
| Member 1 First Name | singleLineText | `fldAuiMLWNBOTnbZU` |  |
| Member 1 Last Name | singleLineText | `fldYeAcNQCFQXyy25` |  |
| Member 2 First Name | singleLineText | `fld7kIgh6MsJD4eG2` |  |
| Member 2 Last Name | singleLineText | `fldEj7ikO6HF3YtE9` |  |

---

## Main Form (LEGACY)

**Table ID:** `tblPZzete1EWekBTv`  
**Purpose:** Legacy data imported from original database. **DO NOT QUERY DIRECTLY.** Migrated to CONTACTS and MEMBERSHIPS_NEW. Kept for historical reference only.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| ID | number | `fldU2rRIBMm1evhfQ` | Primary field — Integer |
| Find by Name | multilineText | `fldSsgZISeaSSbFNp` |  |
| First Name | multilineText | `fldYvumGJC8UeFLNf` |  |
| &Last Name | multilineText | `fldWf9cG3umNfLsGw` |  |
| Source | singleSelect | `fldbW9srTNW3EU1pm` | Options: , Member, Donor, ADHC, 2014List, Donors, Thrift Donor, thrift store, Bingo Volunteer, Fundraising, Chamber, Senior Agency, Soroptomist, Church, Non Profit, New Thrift, Vendor Contact, Rotary, Vendor, Volunteer Brunch Donors, Donation, Republican Women Federated, Newsletter, Endowment Board, Thrift Donor, Republican Women, chamber, Agency Contact, Complimentary, ADHC Holiday Gift, Volunteer, Lavonna's Personal contacts, Realtor's Breakfast, test dd, UVMC - Holiday Gifts, Friday Group Meetings, Community Action Team, 2021 Annual, 2021EOY, 2021 EOY, 2021 Annual Letter, Carol, 2016List, Member, Republican Women, member, m, Members |
| Type | singleSelect | `fldB2ufHUxdVnXLcS` | Options: , M, m, D, V, T, d, L, 1, ,, `, v |
| Business | multilineText | `fldvFv1P4rvpRUzb9` |  |
| Name for Label Printing | multilineText | `fldok70BtLatWE8fT` |  |
| Label  Designation | singleSelect | `fld9ndyVSOURmjKur` | Options: l, L, , NO, no, BNO,  L, M, No, NNO, n, N, LH,     L, lh, NNNNNNNNO, NOL |
| Newsletter Y/N | checkbox | `fldu66XVnMDjNdFOO` | Green check |
| Complimentary Y/N | checkbox | `fld8cwEovTrn3Wenb` | Green check |
| Complimentary Type | multilineText | `fldJ3fTrHGQ2j3q0O` |  |
| Email Y/N | checkbox | `flde2bFbEX2FPDPps` | Green check |
| Temp on Hold | checkbox | `fldPdQEU3klzQ6kum` | Green check |
| News Release Date | singleLineText | `fldXHYPe4as3v0O1B` |  |
| Address | multilineText | `fldLTVmH42rg2CpKx` |  |
| City | singleSelect | `fldlhpWd0zy6PVI0e` | Options: San Francisco, Redwood Valley, Ukiah, Covelo, Ukaih, Fort Bragg, , Browns Valley, Fairfax, Willits, Eugene, Ozark, Alexandria Bay, Placerville, Kelseyville, Hopland, Goodyear, Turlock, Reno, Springdale, Santa Rosa, Martinez, Corning, Cloverdale, Healdsburg, Cloverdale,, Central Point, Vancouver, Dover, Talmage, Potter Valley,, Sunnyvale, Ukiah,, Renton, Willits,, Cathedral City, Gardnerville, Eureka, Castro Valley, Calpella, Potter Valley, Bend, ukiah, Redwood valley, Lakeport, PotterValley, philo, Berkeley, Redwood Valley,, Suisun City, Petaluma, Weiser, Mendocino, 1, Los Altos, Missouri City, Nacogdoches, Corvallis, Oroville, Loomis, San Jose, Reed City, Gig Harbor, Paonia, San Luis Obispo, Post Falls, Crescent City, Ramona, New Plymouth, Cave Junction, Napa, Fresno, El Dorado, Santa Maria, Redding, Grover Beach, San Bruno, Saint Helena, San Diego, Clearlake Oaks, Lawrence, Saginaw, Roseville, Mandeville, Colfax, Boonville, Santa Rosa , Talmage , Gualala, Albion, West Hills, Mendocino CA, Philo, Potter Valley C, Upper Lake, Arcata, Sacromento, Windsor, Lucerne, Lake Havasue, Clearlake, Navarro, Palm Springs, Ft. Bragg, Philo CA, Yuba City, Santa Maria CA, Austin, Chico, Monroe, Oakland, Garberville, Geyserville, Redwood City CA, Nice, Ukiaqh, Pleasant Hill C, Volcano CA, Chico CA, Navarro CA, Orleans CA, Rohnert Park, Uk,iah, Gilman, Floyd Knobs, Seattle, Encinitas, Chatsworth, Camano Island, San Mateo, Borrego Springs, Addison, San Deigo, Surprise, Modesto, Calpella,, Sacramento, Vista, Plano, Rhonert Park, Navato, New Orleans, Marble Hill, Rewood Valley, Laytonville, redwood valley, Magalia, San Anselmo, potter valley, reddwood valley, Kelsey ville, Manchester, Grangeville, Waukesha, Pasadena, Nampa, Pottervalley, Roseburg, McKinleyville, Palermo, Milwaukie, Mckinleyville, Paradise, Cobb, Nevada City, Hidden Valley Lake, Redwood Vallely, Beverly Hills, UK, Birds Landing, Lodi, Ashland, Tulsa, Frederick, Oregon City, Los Angeles, Salida, Belleview, Coeur D Alene, Shingletown, McMinnville, Guerneville, Deer Park, Bremerton, Brentwood, Reston, College Station, santa rosa, Stockton, St. Petersburg, Potter Valley, CA, Holtville, Wellesley, Winters, Venice, Columbia, Little River, Upper Lake,, New York, UKIAH, Ukah, SanFrancisco, Nipomo, Thornton, Atascadero, Mill Valley, Penngrove, Sebastopol, Long Beach, Abbott Park, Palm Desert, Pinole, Craig, Monmouth, Fort Bragg,, Port Townsend, Stanford, Riverside, Sutter Creek, Vallejo, Hull, Ravenna, Loleta, Manassas, Los Banos, Milbrae, Danville, Auburn, Mendon, Carroll, Arlington, Cottonwood, Cedar Park, La Mirada, Prescott, Glenoma, Grass Valley, Highlands Ranch, Palm City, Atlanta, Madera, Lathrop, Independence, Kingsburg, Onalaska, Bakersfield, Carson City, Ukiash, Dalton, Mesquite, Lagunitas, Cape Coral, Happy Valley, Woodland, New Harmony, Boise, Walnut Creek, Novato, Tacoma, Newberg, Washougal, Elk, Elko, Hermiston, Lomis, Pacific Grove, Suvlimity, Brandon, Albuquerque, Carmichael, Ferndale, Sonoma, St. Helena, San Leandro, Westlake Vill, Brookings, Watsonville, Shoreline, Elk Grove, Sequim, Santa Cruz, Point Arena, Medford, Yoakum, Brigham, Witter Springs, Pacifica, Greenville, Henderson, Fortuna, Aptos, Kennewick, Smithtown, Kenniwick, San Antonio, Las Vegas, Granite Bay, Ukiah , Canby, Rocklin, Payson, Carmel, Timnath, Redwood Vally, Visalia, Fernley, Booneville, Garden City, Applegate, Yerington, Belmont, Sparks, Covina, North Las Vegas, Harrisburg, Vale, McAlester, Ukiah`, Hopland, |
| State | singleSelect | `fld1yLk0isC98cxvc` | Options: CA, , OR, AR, NY, AZ, NV, WA, NH, Ca, ca, Or, ID, TX, MI, CO, KS, LA, CA , OH,  CA, IL, IN, AC, CA95482, C, MO, WI, DE, OK, MD, FL, VA, 95469, MA, SC, 95482, IA, GA, UT, NM, CA., WII, `CA, A, NC, ID` |
| Zip Code | singleSelect | `fld9b3BtamxNl0pYu` | Options: 94122, 95470, 95482, 95428, 95437, 95482-3819, , 95918, 95482-8813, 95470-6143, 95470-9566, 95470-6421, 95470-6403, 95470-9578, 95470-9682, 95470-9421, 95470-6104, 95470-6161, 94978-0512, 95470-9680, 95470-9731, 95470-6123, 95470-9709, 95470-6155, 95470-9559, 95470-6319, 95470-6425, 95470-9417, 95470-6301, 95470-9787, 95470-9694, 95470-9622, 95470-9793, 95470-8701, 95470-6117, 95470-9644, 95470-9773, 95470-9727, 95470-6132, 95482-1063, 95490-3507, 95470-9764, 95470-9759, 95470-9786, 95470-9558, 95470-9683, 95470-6269, 95490-9432, 95470-6318, 95470-9679, 95470-9548, 95470-6107, 95470-9601, 95470-6112, 95470-6166, 95470-9427, 95470-0431, 95470-9703, 95470-6231, 95470-9526, 95470-9722, 95470-9507, 95470-6414, 95470-9415, 97408-5943, 95470-9643, 95470-9789, 95470-6285, 95470-6284, 95470-9556, 95470-9776, 95470-9771, 95470-0907, 95470-9521, 95470-6328, 95470-6288, 95470-6178, 95470-9557, 95470-6400, 95470-9437, 95470-0406, 95470-9688, 95470-9672, 72949-3421, 95470-9717, 95470-6327, 95470-9525, 95470-9500, 95470-6432, 95470-6103, 95470-9615, 95470-0036, 95470-9544, 95470-9444, 95470-6176, 95470-9760, 95470-9767, 95470-9604, 95470-6245, 95470-9519, 95470-9747, 13607-0758, 95470-6307, 95470-9639, 95470-9617, 95470-9524, 95470-9775, 95470-6177, 95470-9648, 95470-9594, 95470-9718, 95470-9661, 95470-9426, 95470-6429, 95470-9666, 95470-6225, 95470-9684, 95470-6208, 95470-6278, 95470-6206, 95470-9547, 95470-6186, 95470-6302, 95482-6232, 95470-6416, 95470-9468, 95470-6260, 95470-9409, 95437-8723, 95482-5632, 95470-6217, 95470-9541, 95470-6114, 95667-5329, 95470-6426, 95470-9554, 95470-9697, 95470-6264, 95470-0366, 95451-0773, 95470-0958, 95470-9414, 95470-9695, 95470-6224, 95470-6237, 95470-9627, 95470-6296, 95470-9419, 95470-6315, 95470-9696, 95482-3120, 95470-6286, 95482-8771, 95470-6115, 95470-9434, 95470-9637, 95470-6153, 95470-9600, 95470-9770, 95470-9518, 95470-6322, 95470-9746, 95470-6204, 95470-6332, 95470-6252, 95470-6127, 95482-3923, 95470-9400, 95470-9509, 95470-9555, 95470-0801, 95482-4006, 95470-9651, 95470-9783, 95470-9476, 95470-6147, 95470-9749, 95470-6310, 95470-9517, 95470-9790, 95470-9401, 95470-9602, 95470-6267, 95470-9583, 95449-9659, 85395-3179, 95470-9623, 95470-6164, 95470-9532, 95470-9652, 95470-6171, 95470-9750, 95470-9685, 95470-9780, 95470-9698, 95470-6191, 95470-9402, 95470-9700, 95470-6216, 95482-9411, 95470-6313, 95470-6424, 95470-9765, 95470-9758, 95470-6244, 95470-6218, 95470-9593, 95470-9777, 95470-6187, 95470-6428, 95470-9423, 95470-6241, 95470-9633, 95470-6239, 95470-9741, 95470-9710, 95382-0487, 95470-9713, 95470-6294, 95470-6220, 95470-9438, 95470-9704, 95470-9753, 95470-9553, 95470-6263, 95470-6209, 95470-6336, 95470-9772, 95470-9766, 95470-6118, 95470-9646, 95470-9728, 95470-9408, 95470-6212, 95470-6110, 95470-6163, 95470-9480, 95470-9621, 95470-0383, 95470-8632, 95470-9528, 95470-6157, 95470-6259, 95470-6213, 95470-6223, 89510-0771, 95470-6183, 95470-6275, 95482-0119, 95470-6148, 95470-6291, 95470-9742, 95470-9595, 95470-6230, 95470-6273, 95470-9568, 95470-9428, 95470-9530, 95470-6133, 99173-0513, 95470-9405, 95470-9794, 95470-9687, 95470-6342, 95470-9407, 95470-9626, 95470-0113, 95470-9422, 95470-9668, 95470-9540, 95470-9788, 95470-9442, 95470-9485, 95470-9608, 95470-6265, 95470-6251, 95470-9730, 95470-6304, 95470-6420, 95470-6270, 95470-9406, 95470-6256, 95470-6144, 95470-6169, 95482-6535, 95470-6345, 95470-6210, 95470-0475, 95470-9574, 95470-6242, 95409-6211, 94553-4234, 95470-9510, 95470-9761, 95470-9603, 95470-9488, 95470-9565, 95470-9483, 95470-6122, 95470-9531, 95470-9729, 95470-9538, 95437-6104, 95470-9720, 95470-6262, 95470-6423, 95470-6236, 95470-6353, 95470-9797, 95470-0372, 95482-5971, 95482-3358, 95405-8346, 95470-6305, 95437-5203, 95470-9436, 95470-6348, 95470-9512, 95470-9634, 95490-4208, 95470-9585, 95470-9527, 96021-3631, 95470-9520, 95470-6309, 95470-9404, 95470-9689, 95470-9628, 95470-6229, 95425-9566, 95470-6344, 95470-6287, 95470-6422, 95482-5232, 95470-9769, 95470-9508, 95470-9681, 95470-6116, 95470-9543, 95470-9724, 95470-6125, 95470-9620, 95448-4326, 95470-9690, 95425, 95482-9670, 95470-6179, 95470-9458, 95451, 95482-0323, 97502, 95470-9459, 95470-9605, 95470-9424, 95470-9726, 95470-6299, 95470-6341, 98686, 95470-9751, 95470-6146, 95490, 03820, 95481, 95470-9805, 95469, 94087, 98058, 95403 8104, 95470-0503, 95470-9606, 92234-7106, 95470-6170, 95470-0596, 95470-9664, 95470-6142, 89410-6019, 95470-9662, 95470-6159, 95470-9638, 95449-9775, 95449-9636, 95449-9611, 95448-1732, 95503-5456, 94552-5083, 95918-9754, 95470-6325, 95470-9431, 95470-0683, 95418-0393, 95470-6248, 95470-9799, 95470-6101, 95470-6128, 95470-9677, 95470-9467, 95470-6323, 95470-0534, 95470-6402, 95470-0303, 95470-6419, 95470-9514, 95482`, 97702, 95418, 95453, 95449, 95482-5619, 95482-7905, 95466, 95470-6238, 94706, 94585-1200, 94954, 95482-0241, 95470-9612, 95470-9491, 95470-9570, 95470-9714, 95482-7440, 95470-6181, 95470-9732, 95470-0420, 95470-6413, 95470-6193, 95470-9778, 95470-9469, 95470-9781, 95470-6261, 95470-9663, 95470-6335, 95470-9640, 95470-9738, 95470-6415, 95470-9752, 83672-1460, 95460-0289, 95470-6140, 95470-9452, 95470-6205, 95470-9723, 95470-6189, 95470-9632, 95470-6407, 95470-6258, 95470-6312, 95470-6306, 95470-6226, 95470-6320, 95470-6130, 95470-6249, 95470-0691, 95470-9716, 95470-9487, 95470-6131, 95470-0053, 95470-6293, 95470-6333, 95482-3247, 95470-6277, 95470-6135, 95470-6300, 95470-6324, 95470-9655, 95470-6102, 95470-6215, 95482-8316, 95470-6211, 95482-1368, 94024-5707, 95470-6311, 95470-9410, 95470-9435, 95470-9635, 95470-6268, 95470-9571, 95470-6409, 95470-6167, 95470-6111, 95470-9619, 95470-9706, 95470-9768, 95470-6182, 95470-0182, 95470-9636, 77459-4281, 75965-8139, 95470-9715, 95470-6149, 95470-9693, 95470-9649, 95470-9659, 95470-9412, 95470-6280, 95470-9420, 95470-9743, 95470-6156, 95470-6129, 97333-1919, 95470-9457, 95470-6219, 95470-9569, 95470-6192, 95470-6405, 95470-6173, 95470-9523, 95470-6180, 95966, 95482-6152, 95482-3727, 95482-3255, 95482-8850, 95482-3641, 95482-8845, 95482-1571, 95482-3686, 95482-5824, 95482-6521, 95482-6821, 95482-4635, 95482-3505, 95482-7229, 95482-9310, 95482-9676, 95482-9376, 95482-1143, 95482-8118, 95482-5269, 95482-5007, 95482-5211, 95482-5617, 95482-3805, 95482-1528, 95482-4197, 95482-7224, 95482-9449, 95650-9504, 95482-8828, 95482-3820, 95482-9360, 95482-3839, 95482-9650, 95482-7275, 95482-9093, 95482-3728, 95482-8807, 95482-3633, 95482-4131, 95482-8765, 95482-6917, 95482-9303, 95482-3326, 95482-3516, 95482-9006, 95482-9323, 95118-2626, 95482-5345, 95482-9228, 95482-6128, 95482-4111, 95482-9313, 95482-4800, 95482-9669, 95482-3524, 95482-4108, 95482-4226, 95482-1327, 95482-3836, 95482-5709, 95482-3726, 95482-3779, 95482-3219, 95482-4656, 95482-5242, 95482-5207, 95482-4236, 95482-3926, 49677-8034, 95482-5919, 95482-9533, 95482-3253, 95482-6932, 95482-4264, 95482-3407, 95482-5428, 95482-7251, 95482-5601, 95482-8340, 95482-7260, 95482-5947, 95482-3111, 95482-5218, 95482-7918, 95482-5611, 95482-4243, 95482-5602, 95482-8835, 95482-4929, 95482-6323, 95482-8803, 95482-5410, 95482-6307, 95482-6849, 95482-0901, 95482-0711, 95482-6002, 95482-4818, 95482-5664, 95482-4328, 95482-3241, 95482-0468, 98332-6769, 95482-4231, 95470-0464, 95482-5623, 95482-6014, 95482-4948, 95482-3310, 95482-9560, 95482-9362, 95482-6311, 95482-3733, 95482-5700, 95482-9496, 95482-1291, 95482-5732, 95482-9629, 95482-3837, 95482-9013, 95482-8749, 95482-5412, 95482-4207, 95482-8768, 95482-3248, 95482-8844, 81428-0751, 95482-6207, 95482-9213, 95482-6339, 95482-9401, 95482-3541, 95482-6528, 95482-3949, 95482-7262, 95482-5249, 95482-9472, 95482-3387, 95482-3821, 95482-2003, 95482-9337, 95482-4015, 95482-6877, 95482-4649, 95482-4206, 95482-6102, 95482-3667, 95482-9607, 95482-8120, 95482-6123, 95482-3392, 95482-3950, 95482-8820, 95482-1339, 95482-3022, 95482-5970, 95482-9466, 95482-9106, 95482-4618, 95482-3915, 95482-9506, 95482-3916, 93401-1542, 95482-3934, 95482-1091, 95482-7271, 95482-5435, 95482-4663, 95482-5136, 95482-8608, 95482-3906, 95482-3636, 95482-4603, 95482-6006, 95482-9381, 95482-5573, 95482-1376, 83854-5472, 95482-6912, 95482-6834, 95482-6031, 95482-7439, 95482-5756, 95482-4812, 95482-5008, 95482-6133, 95482-3244, 95482-6519, 95482-3627, 95482-7265, 95482-6524, 95482-7248, 95482-3607, 95482-4255, 95482-6522, 95482-4129, 95482-5417, 95482-9469, 95482-5640, 95482-9002, 95482-0518, 95482-5319, 95482-7228, 95531-3731, 95482-5306, 95482-6533, 95482-0305, 95482-9312, 95482-6909, 95482-6930, 95482-5648, 95482-3233, 95482-4329, 95482-0666, 95482-9587, 95482-6664, 95482-7556, 95482-4327, 95482-3240, 95482-5829, 95482-3391, 95482-5228, 95482-9399, 95482-5638, 95482-3823, 95482-3842, 95482-3225, 95482-5411, 95482-8899, 95482-4021, 95482-6011, 95482-4665, 95482-3215, 95482-9326, 95482-0426, 95482-4230, 95482-4241, 95482-3373, 95482-9460, 95482-6437, 95482-9418, 95482-3682, 95482-9425, 95482-3914, 95482-4523, 95482-0016, 95482-5662, 95482-9662, 95482-3628, 95482-4708, 95482-3205, 95482-7557, 95482-4646, 95482-6534, 95482-4742, 95482-5241, 95482-3709, 95482-5202, 95482-3013, 95482-3357, 95482-9416, 95482-3236, 95482-6865, 94952-2655, 95482-3327, 95482-6557, 95482-9414, 95482-9245, 95482-5225, 95482-3238, 95482-4648, 95482-5150, 95482-8743, 95482-8836, 95482-9608, 95482-3930, 95482-3913, 95482-8857, 95425-5457, 95482-9471, 95482-5920, 95482-3670, 95482-5613, 95482-6861, 92065-4532, 95482-7553, 95482-7640, 95482-3568, 95482-6301, 95482-4263, 95482-9252, 95482-9623, 95482-3817, 83655-5457, 95482-9437, 95482-3729, 95470-6240, 95482-3631, 95482-6035, 95482-5169, 95482-8805, 95482-8128, 95482-1839, 95482-8621, 95482-9660, 95482-7206, 95482-6538, 95482-3942, 95482-6320, 95482-8800, 95482-4122, 95482-3907, 95482-4714, 95482-4238, 95482-8332, 97523-9626, 95482-9225, 95482-2104, 95482-3508, 95482-3645, 95482-8006, 95482-4326, 95482-3917, 95482-5656, 95482-4018, 95482-3822, 95482-6304, 95482-7270, 95482-9091, 95482-1153, 95482-4927, 95482-8766, 95482-9231, 95482-8769, 95482-0742, 95482-3856, 95482-3909, 95482-5325, 95482-4617, 95482-3208, 95482-6048, 95482-4183, 95482-7555, 95482-9413, 95482-6850, 95482-0325, 95482-3101, 95482-4661, 95482-3388, 95482-3924, 95482-3944, 95482-9661, 95482-5125, 95482-3608, 95482-5436, 95482-5966, 95482-6142, 95482-9486, 95482-3706, 95482-9409, 95482-3394, 95482-8759, 95482-4117, 95482-3904, 95482-9214, 95482-3946, 95125-6368, 95482-6802, 95482-3630, 95482-5141, 95482-0932, 95482-3045, 95482-5230, 95482-3612, 95482-4658, 95482-3230, 95482-9664, 95482-9478, 95482-8711, 95482-5645, 95482-0654, 95482-9604, 95482-6543, 95482-6309, 95482-9358, 95482-3012, 95482-7227, 95482-3714, 94558-6481, 95482-0437, 95482-0248, 95482-7909, 95482-3846, 93720-5435, 95482-6511, 95482-5151, 95482-5123, 95482-6129, 95482-3395, 95482-9671, 95481-0107, 95482-8748, 95482-3379, 95482-7249, 95482-5210, 95482-4623, 95449-9662, 95482-4022, 95482-3510, 95482-6905, 95482-6833, 95482-6435, 95623-4861, 95482-7250, 95482-5209, 95490-4555, 95482-7554, 95482-9458, 95482-9594, 95482-4632, 95482-7293, 95482-0328, 95482-1317, 95482-9210, 95482-3715, 95482-9643, 95482-4733, 95482-9554, 95403-9422, 95482-6842, 95482-9620, 95482-9200, 95482-9201, 95482-6310, 95482-5610, 95482-7259, 93455-2179, 95482-3940, 95482-5630, 95482-4524, 95482-3672, 95482-9202, 95482-5253, 95482-5641, 95482-4007, 95482-8822, 95482-5627, 95482-4016, 95482-5311, 95482-4257, 95482-4019, 95482-8812, 95482-9461, 95482-5119, 95482-3323, 95482-5406, 95482-8129, 95482-4184, 95482-3218, 95482-5308, 95482-3313, 95482-6327, 95482-4194, 95482-0643, 95482-6610, 95482-4340, 95482-1053, 95482-4130, 95482-5153, 95482-1658, 95482-3304, 95482-8605, 95482-4629, 95482-5633, 95482-1905, 95482-5233, 95482-5952, 95482-3001, 95482-8823, 95482-0935, 95482-8778, 95482-4142, 95482-9317, 95482-5711, 95482-3351, 95482-6028, 95482-8701, 95482-6915, 95482-5231, 95482-3742, 95482-9019, 95482-4324, 95482-9616, 95482-4100, 95482-4126, 95482-6530, 95482-9645, 95482-5415, 95482-9622, 95482-3953, 95482-6945, 95482-3710, 95482-3245, 95482-1205, 95482-9205, 95482-5133, 95482-8827, 95482-4642, 95482-4125, 95482-8809, 89511-8546, 95482-9635, 95482-3123, 95482-6503, 95482-8746, 95482-4817, 95482-5217, 95482-0888, 95482-8903, 95482-4208, 95482-3258, 95482-3905, 95482-8824, 95482-9566, 95482-4613, 95482-3031, 95482-5328, 96099-1659, 95482-4822, 95482-9606, 95482-4229, 95482-3246, 95482-5753, 95482-9365, 95482-6542, 95482-9316, 95482-8707, 95482-5950, 95482-4288, 95482-9626, 95482-7438, 93433-1111, 95470-9432, 95482-6822, 95470-6136, 95470-6435, 95470-0577, 95481-0481, 95481-0415, 95481-0309, 95481-0388, 94066-1769, 95470-9529, 95470-0308, 95470-6203, 95470-9597, 95470-0334, 95470-9586, 95470-6214, 95481-0502, 95470-6195, 95470-9667, 95470-6337, 95470-9505, 95482-5254, 95482-4256, 95482-7552, 95482-8808, 95481-0515, 95482-5219, 95482-1401, 95482-9667, 95481-0073, 95481-0484, 95482-7435, 95482-2002, 95482-4128, 95482-8409, 95482-5544, 95482-3702, 95482-6858, 95482-5612, 95482-3318, 95482-6962, 95482-4607, 95481-0224, 95482-3223, 95481-0163, 95481-0395, 95481-0652, 95481-0051, 95481-0446, 95481-0371, 95481-0613, 95481-0494, 95481-0138, 95481-0387, 95481-0338, 95481-0190, 95481-0521, 95481-0095, 95481-0231, 95481-0720, 95481-0518, 95481-0563, 95481-0154, 95481-0549, 95481-0581, 95481-0262, 95481-0251, 95481-0457, 95481-0431, 95481-0019, 95481-0612, 95481-0441, 95481-0719, 95481-0628, 95481-0416, 95482-3398, 95482-1490, 95482-6369, 94574-9755, 95482-9055, 95482-9345, 95482-6624, 95482-6807, 95482-3900, 95482-1416, 95482-4621, 95482-8900, 95482-3226, 95482-6352, 95482-9595, 95482-8811, 95482-3224, 95482-4204, 95482-6302, 95482-1395, 95482-3816, 95482-3957, 95482-9405, 95482-7208, 95482-9307, 95482-0423, 95482-4725, 95482-6195, 95482-7541, 95482-5126, 95482-6010, 95482-8785, 95482-8606, 95482-3719, 95482-3650, 95482-6316, 95482-3678, 95482-6831, 92150-2252, 95482-5117, 95482-7269, 95482-9647, 95482-9338, 95482-5636, 95482-5628, 95482-5750, 95482-3621, 95482-4239, 95482-4309, 95482-3936, 95482-9475, 95482-9588, 95482-4641, 95482-5626, 95482-4214, 95482-3328, 95482-0925, 95423-9681, 95482-3723, 95482-7910, 95482-9359, 95482-4634, 95482-3134, 95482-6322, 95482-4210, 95482-5132, 95482-4838, 95482-4001, 95482-6992, 95482-5618, 95482-5237, 95482-1432, 95482-1534, 95482-8804, 95482-9558, 95482-3938, 95482-9464, 66044-3306, 95482-8831, 95482-5324, 95482-9453, 95482-4240, 95482-4601, 95482-9556, 95482-7917, 95482-3721, 48638-4745, 95482-6835, 95482-4625, 95482-3626, 95482-4654, 95482-9035, 95482-8063, 95482-9433, 95482-6508, 95482-6819, 95482-6529, 95482-9005, 95482-3956, 95661-5627, 95482-5625, 95482-0927, 95482-6620, 95482-6532, 95482-8832, 95482-8884, 95482-8842, 95482-1178, 95482-5334, 95482-3306, 95482-5129, 95482-9562, 95482-0094, 95482-0146, 95482-2126, 95482-8806, 95482-4212, 95409-4110, 95482-8122, 95482-4651, 95482-3743, 95482-8767, 95482-5651, 95482-6815, 95482-9364, 95482-3216, 95482-3707, 95482-3382, 95482-4057, 70470-1133, 95482-3526, 95482-0443, 95482-8856, 95713-9269, 95482-9032, 95482-3530, 95482-3653, 95482-7210, 95482-8843, 95482-4521, 95482-9665, 95482-9546, 95482-6134, 95482-9007, 95482-8119, 95482-4624, 95482-8035, 95453-3052, 95482-5240, 95482-4221, 95482-9044, 95482-4608, 95482-3206, 95482-4249, 95482-1917, 95490-3625, 95482-6036, 95482-5663, 95482-7441, 95482-3701, 95482-3835, 95482-4228, 95482-6440, 95482-3680, 95482-3213, 95482-7264, 95482-4653, 95482-5614, 95482-4186, 95482-4335, 95482-6444, 95482-3830, 95415, 95403, 95401, 95445, 95410, 91307, 95460, 95485, 95521, 95831, 95492, 95458, 94117, 94109, 86404, 95422, 95463, 92262, 95407, 95485-0112, 95482-7486, 95991, 93455, 78704, 95929, 45050, 94607, 95542, 95405, 95449-0611, 95501, 95448, 94063, 95464, 94523, 95402-6038, 95689, 95973, 95482-4105, 95556, 95404, 89512, 94928, 95409, 60938, 47119, 98103, 92024, 96003, 95470-0245, 91311, 95482-1263, 98282, 94403, 92004, 60101-5630, 93705-1331, 92106, 85374, 94131, 94188, 95482-6203, 95482-9663, 95352 4664, 95481-0218, 95418-0217, 95827-2506, 92084, 89521, 94552, 95482-4113, 75093, 95482-1521, 94945, 70123, 63764, 95454, 95954, 94960, 94610, 95459, 94975, 83530, 53186, 95503, 95425-3887, 91107, 83686, 89521-4512, 95469-0396, 95928, 19904, 97470, 95519, 95470-9691, 95968, 97267, 97707, 95969, 95518, 95480, 95426, 95959, 95467, 95402, 94515, 94086, 90211, 94066, 94512, 95240-4602, 95482-8056, 95482-6130, 95482-6149, 95482-4110, 95482-0263, 95482-5139, 95482-0302, 95482-9561, 95482-4339, 95482-0276, 95482-5622, 95482-7209, 95482-8901, 95482-8779, 95482-5644, 95482-4650, 95482-6340, 95482-8875, 95482-6838, 95482-3708, 95482-4237, 95482-9563, 95482-6315, 95482-0216, 95482-0264, 95482-6846, 95482-7510, 95482-9236, 95482-3640, 97520-3048, 95482-4313, 95482-7641, 95482-9209, 95482-5203, 95482-4124, 95482-4677, 74129-2230, 95482-6144, 95482-1489, 95482-3243, 95482-7906, 95482-8051, 95482-3360, 95482-9675, 95482-2200, 95482-5305, 95482-7258, 95482-3802, 95482-6165, 95482-4017, 95482-9462, 95482-1256, 95482-4338, 95482-9403, 95482-4101, 95482-5479, 95482-4659, 95482-9050, 95482-6531, 95482-6008, 95482-5321, 95482-4087, 95482-4061, 95482-6210, 95482-7257, 95482-3699, 95469-8807, 95482-5609, 95482-9107, 95482-6033, 95482-5247, 95482-5801, 95482-4259, 95482-5208, 95482-3642, 95482-6900, 95482-8904, 95482-6013, 95482-3980, 21703-5837, 95482-9559, 95482-3112, 95482-0062, 95482-4109, 95482-5130, 95482-5631, 95482-9361, 95482-1941, 95482-3722, 95482-3605, 95482-6904, 95482-3165, 95482-3677, 95482-3769, 95482-3211, 95482-4136, 95482-6312, 95482-6520, 95482-7561, 95482-6856, 95482-5121, 95482-6303, 95482-8774, 95482-4031, 95482-3725, 95482-0013, 95482-9636, 95482-5332, 95482-8883, 95482-5629, 97045-7976, 95482-5414, 95482-4287, 95482-6804, 95482-4254, 95482-5315, 95482-6847, 95482-4216, 95482-0307, 95482-4189, 95482-6806, 95482-4747, 95482-3251, 95482-0412, 95482-0463, 95482-5318, 95482-4647, 95482-5668, 95482-3535, 90043-3629, 95482-5657, 95482-3009, 95482-5413, 95482-4154, 81201-9482, 95482-3901, 95482-6314, 95482-4937, 95482-5642, 95482-6857, 95482-9448, 95482-7226, 95482-9666, 95482-6106, 95482-3514, 95482-9473, 95482-8837, 95482-5122, 95482-5243, 95482-7205, 95482-3935, 95482-6605, 95482-9389, 95482-3250, 95482-3618, 95482-4193, 95482-6859, 95482-4633, 95482-6931, 95482-3700, 95482-6518, 95482-9015, 95482-4137, 95482-9467, 95482-5344, 95482-9340, 95482-4310, 95482-7225, 95482-8628, 95482-0697, 95482-6547, 95482-0846, 95482-8526, 95482-3646, 95482-3239, 95482-6839, 95482-4638, 95482-1100, 95482-3811, 95482-9034, 95482-9056, 95482-4928, 95482-4303, 95482-8814, 95482-7402, 95482-5676, 95482-9001, 95482-6823, 95482-8810, 95482-4745, 95482-3841, 95482-1386, 95482-0047, 95482-4513, 95482-3834, 95490-3530, 95482-3506, 95482-5647, 95482-4302, 95482-4252, 95482-6431, 95482-4640, 95482-6911, 95482-5009, 95482-4705, 95482-9683, 95482-6005, 95482-8764, 95482-6525, 95482-1802, 95482-8816, 95482-8633, 95482-4528, 95482-6513, 95482-8758, 95482-1444, 95482-9304, 95482-7255, 95482-8745, 95482-3809, 95482-6355, 95482-6504, 95482-9037, 95482-4227, 95482-6112, 95482-9407, 95482-4823, 95482-0106, 95482-3603, 95482-6621, 95482-5909, 95482-1469, 95469-0412, 95482-4058, 95482-9094, 95482-3587, 95482-9257, 95482-9246, 95482-0872, 95482-9644, 95482-1808, 95482-7908, 95482-4526, 95482-6514, 95482-0381, 95482-6308, 95482-7204, 95482-3833, 34420, 95482-5423, 95482-4636, 95482-0445, 95482-6516, 95482-1240, 95482-6860, 95482-5110, 95482-3638, 95482-5433, 95482-9000, 95482-5918, 95482-0767, 95482-5309, 95482-6526, 95482-6506, 95482-5946, 95482-1392, 95482-4199, 95482-4002, 83815-9311, 95482-4139, 95482-3317, 95482-5830, 95482-6137, 95482-3855, 95482-6119, 95482-4337, 95482-4223, 95482-5429, 95482-9355, 95482-9319, 95482-8872, 95482-7562, 95482-4120, 95482-3397, 95482-3500, 95482-6884, 95482-3656, 95482-5115, 95482-9089, 95482-5227, 95482-1473, 95482-4820, 95418-0179, 95482-9256, 95482-9244, 95482-3384, 95482-3405, 95482-9659, 95482-9632, 95482-3383, 95482-6141, 95482-4086, 95482-4314, 95482-9021, 95482-6824, 95482-9026, 95482-3105, 95482-4245, 95482-7800, 95482-3471, 95482-0101, 95482-6825, 95482-6549, 95482-6866, 95482-3160, 95482-3525, 96088-9404, 95482-0457, 95482-3657, 95482-5964, 95482-4242, 97128-9512, 95482-3664, 95482-0068, 95482-3789, 95482-5212, 95482-9251, 95482-5258, 95482-3698, 95482-6976, 95482-4628, 95482-9233, 95482-9041, 95482-9682, 95482-1262, 95482-4103, 95482-4604, 95482-6016, 95482-1944, 95482-3057, 95482-6501, 95482-4730, 95482-4323, 95482-3033, 95446-9052, 95482-5677, 95482-8609, 95482-9531, 95482-3334, 95482-9117, 95482-5215, 95482-4246, 95482-5137, 95482-6939, 95482-6843, 95482-6319, 95482-6527, 95482-3814, 95482-3623, 95482-3234, 95482-9207, 95482-1242, 95482-4070, 95482-3969, 95482-6103, 95482-3006, 95482-3615, 95482-6136, 95482-6746, 95482-3655, 89521-8230, 95482-6546, 95482-3203, 95482-7434, 95482-9586, 95482-7539, `95481, 95482-6828, 95482-4522, 95482-9031, 95482-6208, 94576-9709, 95482-5291, 95482-4727, 95482-1025, 95482-0176, 95482-3843, 95482-0545, 95482-6154, 95482-5313, 95482-6202, 95482-9468, 95482-3826, 95482-4609, 95482-6317, 95482-6509, 95482-3527, 95482-1450, 95482-9482, 95482-3002, 95482-6830, 95969-5553, 95482-8838, 95482-7276, 95482-6820, 95482-5106, 95482-9641, 95482-0321, 95482-9573, 95482-6808, 95482-5323, 95482-6901, 95482-8866, 95485-8732, 95482-0886, 95482-4932, 95482-9375, 95482-9400, 95482-3242, 95482-3933, 95482-1827, 95482-5104, 95482-1164, 95482-6826, 95482-9320, 95482-5108, 95482-3620, 95482-4102, 95482-4351, 95482-6434, 95482-4991, 95482-9085, 95482-6810, 95482-6140, 95482-8902, 95482-5138, 95482-3518, 95482-0089, 98312-9544, 95482-1568, 95482-3222, 95482-7605, 95482-5307, 95482-3307, 95482-7274, 95482-3929, 95482-3663, 95482-3673, 95482-8030, 95482-5665, 95482-6025, 95482-8879, 95482-1437, 95482-1615, 95482-9203, 95482-5330, 95482-5755, 94513-5547, 95482-3629, 95482-5605, 95482-7256, 95482-9095, 94569, 95482-4305, 20191-1575, 94110-2157, 88840, 95469-8701, 954820, 95490-0022, 95482-8773, 95401-5322, 95209, 33716, 95482-1811, 95482-4188, 95449-9770, 95482-0161, 95469-0174, 98108, 92250, 02481, 97128, 95694, 90291, 29212, 95456, 95816, 95418-0074, `95482, 95482-5576, 10106-0001, 94109-3213, 93444, 80233, 93422-3030, 94941, 95464-0595, 92104, 94951, 95472, 94104-0300, 90815, 60064 3500, 94952-2003, 92260, 94708, 94564-1374, 95469-8756, 81626-1168, 95482-3305, 95747-9560, 95482-0968, 97363-9102, 95425-5440, 95482-5606, 95451-9287, 95482-8846, 03820-4493, 95403-8104, 95482-6211, 95482-7272, 95482-5643, 95482-8834, 95482-4112, 95482-6811, 95482-9239, 95482-4134, 95482-3409, 95482-6127, 95482-9557, 95482-5016, 95482-3671, 98686-2266, 98368, 94305, 92513-0225, 95685-1326, 94592, 95470-6253, 95481-0271, 95482-4319, 95482-4203, 95482-0858, 95490-3336, 02045, 95425-3667, 95482-1740, 95482-9512, 95470-9807, 95482-0728, 44266, 95482-4008, 95551-9666, 95409-5802, 95482-9510, 95354, 20111, 93635, 95470-0070, 95470-6221, 97520, 95819-3233, 78720, 95482-6805, 95481-0178, 95469-9744, 95482-3624, 95469-0306, 95124-1704, 94030-3031, 94526, 95603, 95485-1056, 95482-9339, 01756-1248, 95482-6658, 95449-0526, 98311-3702, 95469-9701, 51401, 95437-6100, 95482-9646, 95482-6157, 95482-4182, 95482-8783, 95482-5639, 95482-9642, 95482-3329, 95482-9346, 95425-5418, 95482-5235, 95482-0478, 95482-3713, 95482-9366, 95482-1003, 95482-9253, 22207-2850, 95482-6832, 95482-4657, 95482-3359, 95482-3201, 95482-3091, 95482-9694, 95482-0921, 95482-3945, 95482-8885, 95482-3634, 95482-3731, 95482-0138, 95482-5434, 95482-4138, 95470-0181, 95482-4315, 95482-5608, 95482-8888, 95482-5244, 95482-3014, 95482-5675, 95482-4004, 95482-6545, 95482-1409, 954582, 95482-5624, 95482-3812, 95482-3511, 95482-5635, 95482-5978, 95482-1952, 95482-6611, 95482-8750, 95482-6602, 95482-9377, 95482-4143, 95482-3540, 95482-6844, 95482-8747, 95482-0817, 95482-4013, 95482-4133, 95482-6603, 95482-5131, 95482-9655, 95482-0186, 95482-9254, 95482-9426, 95482-0201, 95482-4622, 95482-5604, 95482-9016, 95482-1276, 95482-1463, 95482-2128, 95482-5274, 95482-1435, 95482-6661, 95482-6436, 95482-4123, 95482-5204, 95482-7538, 95482-9500, 95482-3047, 95482-6539, 95482-3941, 95482-4320, 95482-9306, 95482-1032, 95482-5304, 95482-9668, 96022-2080, 95482-9267, 95482-4777, 95482-8055, 95482-5666, 95482-3257, 95482-6544, 95482-5931, 95482-3684, 95482-6020, 89521-4340, 95482-3501, 95482-6623, 95482-3711, 95482-5418, 95482-1901, 95482-5607, 95482-8109, 95482-9305, 95482-6908, 95482-3378, 95482-5621, 95482-0851, 95482-7646, 95482-3521, 95482-6618, 95482-5579, 95482-9435, 95482-4600, 95482-5320, 95482-6845, 95482-4610, 95482-9408, 78613-1718, 95482-9217, 95482-4510, 95482-4514, 95482-1958, 95482-5322, 95482-3052, 95482-4660, 95482-9268, 95482-6024, 95482-0868, 95482-8863, 95482-3703, 95482-3918, 95482-3077, 95482-7901, 95482-8817, 95482-4005, 95453-5001, 95482-4141, 95482-5951, 95482-6616, 95482-3539, 95482-6827, 95482-4746, 95482-3513, 95482-3115, 95482-1725, 95482-4752, 95482-6916, 95482-4915, 95482-9579, 90638-3837, 95482-4518, 95482-8036, 95482-9541, 95482-6115, 86305-5574, 95482-9605, 95482-1403, 95482-7603, 95482-4195, 95482-0389, 95482-0999, 95482-0898, 95482-4738, 98336-0081, 95482-5655, 95482-4605, 95482-1072, 95482-3232, 95482-3939, 95482-4140, 95482-0092, 95482-3207, 95482-6868, 95482-8763, 95482-5251, 95482-4104, 95482-3931, 95482-3221, 95482-3375, 95482-3705, 95482-0842, 95482-1365, 95482-1173, 95949-9507, 95482-0353, 95482-4145, 95482-1746, 95482-5140, 95482-6104, 95482-4723, 95482-4331, 80130-6622, 34990-8503, 95482-7614, 95482-1114, 95482-5802, 30317-3027, 95482-0997, 95482-3228, 95482-5634, 95482-3362, 95482-8826, 95519-3523, 95482-1724, 95482-1525, 95482-3784, 95482-0916, 95482-6841, 95482-9086, 93637-4662, 95482-3528, 95423-9683, 95482-4721, 95482-3827, 95482-3716, 95482-9555, 95482-9111, 95482-9591, 95482-9631, 95482-1840, 95482-4637, 95482-3097, 95482-5989, 95482-6829, 95425-3944, 95482-9248, 95482-9104, 95482-4712, 64465-9311, 94558-3736, 95482-4211, 95482-5430, 95482-8706, 95482-6742, 95482-4643, 95482-1406, 95482-3922, 95482-3611, 95482-5145, 95482-0084, 95482-4731, 95482-9308, 95482-7564, 95482-0785, 95482-9617, 95482-3523, 95482-3088, 95482-7644, 95482-1238, 95482-3910, 95482-7207, 95482-0272, 95482-3377, 95482-5271, 95482-1451, 97351-9773, 95482-3619, 95482-5238, 95482-5911, 95482-3838, 95482-3808, 93631-9436, 95482-2111, 95482-4202, 95482-9211, 95482-1255, 95482-6601, 95482-9342, 95482-8880, 95482-8890, 95482-9204, 95482-3604, 95482-3804, 95482-3668, 95482-6907, 95482-9545, 95482-3730, 95482-3643, 95482-0333, 95482-5234, 95482-3824, 95482-2110, 95482-9584, 95482-3649, 95482-0812, 95482-9014, 95482-3502, 95482-3609, 95482-5731, 95482-4247, 95482-2108, 95482-3739, 95482-3744, 95482-9415, 95482-8854, 95482-9417, 95482-5806, 95482-3089, 95482-4116, 93710-4525, 95482-9269, 95482-4224, 54650-8249, 95482-5902, 95482-9353, 95482-6918, 95482-9398, 95482-0805, 95482-5725, 95482-4678, 95482-5777, 95482-8876, 95482-5535, 95482-0332, 95482-3614, 95482-0938, 95482-4344, 95482-2109, 95482-5815, 95482-5650, 95482-1366, 95482-6943, 95482-9259, 95482-3340, 95482-9580, 95482-5246, 95482-8889, 95405-5255, 95482-5226, 95415-0328, 95482-9009, 95482-3813, 95482-4144, 95482-4225, 95482-7261, 95482-8855, 95482-4527, 95482-3229, 95482-9347, 95482-7803, 95482-1475, 95482-6818, 95482-0236, 95482-3625, 95482-9700, 95482-3209, 93308-3280, 95482-8871, 95482-9679, 95482-1716, 95482-3794, 95482-1653, 95482-1358, 95482-6200, 95482-5901, 95482-8702, 95482-5907, 95482-9223, 95482-5994, 95482-3249, 95482-4350, 95482-6812, 94123-1541, 95482-3651, 95482-1290, 95482-6027, 95482-9567, 95482-4739, 95482-4516, 95482-3654, 89701-7668, 95482-7911, 95482-8851, 95482-5716, 95482-6107, 95482-8841, 95482-3652, 95482-9391, 95482-4253, 95482-5302, 95482-6541, 95482-1308, 95482-3806, 95482-9534, 95482-1027, 95482-1487, 95482-4000, 95482-6007, 95482-9332, 95482-6745, 95482-3669, 95482-3704, 95482-9621, 95453-3533, 95482-3732, 95482-4616, 95482-6336, 95482-3921, 95482-6109, 95482-3818, 95482-4713, 95482-4198, 95482-5236, 95482-3676, 95482-5142, 95482-9314, 95482-9065, 95482-5134, 95482-6707, 95482-9273, 95482-8600, 95482-1022, 95482-3955, 95482-7203, 95482-0807, 95482-3018, 95482-9463, 95482-9392, 95482-4728, 95482-6512, 95482-5520, 95482-5221, 95482-8818, 93401-2822, 30721-2901, 95482-1548, 95482-7542, 95482-5500, 95482-3227, 95482-5409, 95482-3301, 95482-7035, 95482-8616, 95482-2020, 95482-4409, 95482-3102, 95482-9368, 97707-2216, 95482-8897, 95482-9476, 95482-5316, 95482-3659, 95482-3214, 95482-8839, 95482-3374, 95482-5333, 95482-8046, 95482-4244, 95482-7125, 95482-9208, 89024-0387, 94928-7819, 95482-3660, 95482-8772, 93422-6513, 95490-9487, 95482-3675, 94938-0141, 95482-5214, 95482-3639, 33914-6712, 97086-4295, 95482-6012, 95482-6803, 95482-3954, 95482-0605, 95482-5780, 95482-3220, 95482-3648, 95776-6245, 95482-3844, 95482-0809, 95482-3254, 95482-6604, 95482-3810, 95482-4218, 84757-5082, 95482-6131, 95482-5239, 95482-6120, 83709-8561, 95482-3902, 95482-8700, 94597-2041, 95482-4190, 95482-9270, 95482-4602, 95482-5124, 95454-2019, 95482-9249, 95482-0926, 95482-1217, 94949-6294, 95482-4127, 95482-1348, 95482-5143, 95482-4936, 95482-3693, 95482-9261, 98443-1444, 95482-4529, 95482-9272, 95482-3353, 95482-6837, 95482-4652, 95482-1211, 95482-4606, 95482-0065, 95482-3606, 95482-9625, 95490-8762, 95482-3011, 95482-3337, 95482-3046, 95482-8127, 95482-4837, 95482-5127, 95482-3927, 97132-1173, 95482-4115, 95482-6000, 95503-7045, 95482-7266, 95482-9327, 95482-6902, 95482-1387, 95694-1607, 95482-6914, 91307-2926, 95482-1370, 95425-4480, 95482-5155, 95482-9589, 95482-4754, 95482-0218, 95482-9012, 95482-8873, 95482-4511, 95482-0908, 95470-6427, 95482-9516, 95482-7118, 95482-3661, 95482-3602, 95482-7648, 95482-8905, 95482-5941, 95482-1206, 95482-3718, 95482-0532, 95482-9333, 95482-3519, 95482-9483, 95482-9549, 95482-2114, 95482-3928, 95482-6138, 95482-9224, 95482-4611, 95482-0626, 95482-0975, 95482-6927, 95482-8887, 95482-5317, 95482-8906, 95482-9088, 95482-3613, 95482-1119, 95482-4317, 95482-3644, 95482-6903, 95482-7454, 95482-4085, 95482-9215, 95482-3712, 95482-8833, 95482-5335, 95482-2829, 95482-9436, 95482-5708, 94589-3331, 95482-9677, 95482-4114, 95482-9687, 95482-6653, 95482-6122, 95482-6870, 95482-3339, 95482-0415, 95407-5495, 95482-9638, 95482-4354, 95482-9063, 95482-5615, 95482-9598, 95482-4345, 95482-3533, 95482-9038, 95482-8825, 95482-1737, 98671-7007, 95482-9033, 95482-5653, 95482-0569, 95481-0397, 95482-5229, 95432, 89801, 97838, 95650, 93950, 97385, 97411-8890, 87108, 94112, 95608-5722, 95470-0828, 95536, 95476, 94526-4303, 94574-1226, 95470-0333, 94577-3663, 91362, 97415-0282, 95076, 95482-8300, 98002, 95451-9009, 95470-9466, 98133, 95758, 95469-8767, 84757, 95409-7134, 95482-3217, 94558-3275, 95928-3993, 95481-0250, 95482-6555, 98382, 95065-1548, 95482-4011, 94513-2098, 95482-3320, 95470-0840, 95468, 97504-8569, 77995-1831, 84302, 95468-8800, 95493, 89521-5298, 94044-3612, 95022, 95482-4213, 94952-9569, 95460-0440, 89509, 95695, 54942-9772, 95409-5952, 95482-5109, 89011, 95482-4429, 95472-3204, 95482-5331, 98056-1461, 95481-0024, 95540-3540, 99336-9549, 11787, 78251-2011, 95757-5157, 87701, 95482-5529, 95746-8843, 95482-5707, 96015-0303, 95482-3874, 95470-9504, 95677-2637, 95822-2926, 85541, 95481-0188, 95482-8322, 95482-9656, 95449-9810, 97132-1732, 95482-6510, 95470-0660, 93923-9568, 95469-010, 80547-4622, 94612-4413, 94598-5220, 95482-3303, 95482-5654, 95482-4106, 95747, 95482-3903, 95112-2469, 95470-6434, 95482-4258, 95482-5252, 95470-6232, 95482-3932, 93292, 89408, 95482-0102, 83714-2673, 95482-8886, 95703-9788, 95482-8021, 95482-6817, 95482-4715, 95482-4098, 89447-9742, 95482-4056, 28012-8868, 95482-9481, 97222-8138, 95490-4574, 80241, 954821, 89436-7081, 95482-9090, 91722, 95489-5918, 95470-0540, 95482-5518, 9548, 95482-3871, 83530-1645, 95470-6283, 95481-0429, 95470-9573, 89031-3833, 90046, 95482-4059, 95482-6030, 97361-9102, 28075-6674, 95482-1095, 97918-1174, 95482-5517, 95482-4743, 95482-0585, 954482, `95470, 74501-7047, 92109-2012, 95482-2195, 95404-5107, 95449-0516, `955422, 95842-4126 |
| B phone | multilineText | `fldifavc0sB4SejZH` |  |
| H phone | multilineText | `flddriewiM6CgtOTl` |  |
| C phone | multilineText | `fldgSfVOmTnnuuBfW` |  |
| Fax | multilineText | `fld0UKX0TCPJf2PJ2` |  |
| Web Site | multilineText | `fldp8mWduRBMy2aUw` |  |
| Email | multilineText | `fldhlDwv1RwLp8wN6` |  |
| Sex | singleSelect | `fldsTe8RITQVLMHwF` | Options: F, M, , f, m,    F, mn, ,, v |
| Birth Date | dateTime | `fldSH7NajmFLd3Tvn` | Format: YYYY-MM-DD, 24-hour |
| Age | number | `fldJiQZgccUepUym7` | Integer |
| DOB-Month | singleSelect | `fldYLjtUSpAgaVBFA` | Options: November, May, March, June, January, February, August, April, 9, 8, 7, 6, 5, 3, 12, 11, 10, 1, 09, 08, , September, October, December, July, January , september, 4, 2, june, 04, 02, 03, 06, 07, 01 |
| DOB-Day | number | `fldaBBVrdFIV3Cw5X` | Integer |
| DOB-Year | singleSelect | `fldWPiGhQL4mltgDM` | Options: , 1925, 1950, 1952, 1954, 2024, 1951, 1960, 1961, 1962, 1999, 1964, 1948, deceased, 1944, 1900, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 2018, 1919, 1920, 1921, 1922, 1923, 1924, 25, 1926, 2026, 1927, 1928, 2028, 1929, 2029, 1930, 1931, 1932, 1933, 1934, 1935, 1958, 1936, 1937, 1938, 2038, 1939, 1940, 2040, 1941, 2041, 1942, 1943, 1945, 1946, 1947, 2048, 1949, 2049, 2000, 50, 51, 1953, 2019, 1955, 1956, 1957, 1967, 1959, 1963, 1965, 1966, 1968, 1969, 1971, 1972, 1973, 1975, 1976, 1978, 1979, 1981, 1982, 1983, 1984, 1985, 2025, 1988, 1990, 1992, 1994, 1997, 2016, 2021, 2022, 2023, 2047, 2954 |
| Relationship Code | multilineText | `fld0IuckE4EZbPyRG` |  |
| Last Thrift Donation Date | dateTime | `fldTm6ywS3pOlRPCg` | Format: YYYY-MM-DD, 24-hour |
| Joined Date | dateTime | `fldJl1HfqQKNiD6H7` | Format: YYYY-MM-DD, 24-hour |
| Join Reason | multilineText | `fldF6zDkIzAfRTVwG` |  |
| Date Dues Paid:  | dateTime | `fldJEoYPpyqyPKfoY` | Format: YYYY-MM-DD, 24-hour |
| Paid Amount | number | `fldkVYiVuvx06JeXk` | Precision: 2 |
| Dues Expiration Date | dateTime | `fldL04k7V7GRtOJjA` | Format: YYYY-MM-DD, 24-hour |
| LifeMember Y/N | checkbox | `fldxwOnHhmMRMEd77` | Green check |
| Status, Inactive Y/N | checkbox | `fldqBSMQjZp3KHFVm` | Green check |
| Cancelled Date: | dateTime | `fldZCzTtqLOzwGiIZ` | Format: YYYY-MM-DD, 24-hour |
| Cancelled Reason | multilineText | `fld7O3TaPJ522KZtz` |  |
| Email 2 | multilineText | `fldAoCcFs3hUXtV1b` |  |
| Temp on Hold 2 | checkbox | `fldSIX0FlmTAmLAyt` | Green check |
| MsgText3 | multilineText | `flduryDqaLRHS4N68` |  |
| Text118 | multilineText | `fldwr6HoKzo0Brx4d` |  |
| Text120 | multilineText | `fldk2eSW2OB2GmNtv` |  |
| MsgtxtTYLtr | multilineText | `fldyflDXLlhzVKpIT` |  |
| $ Donation | checkbox | `fldupZKFdboO0iiF2` | Green check |
| Start Donation Date | multilineText | `fldUaUQ904YPihCEI` |  |
| End Donation Date | multilineText | `fld2zkwZkPNNdJvfG` |  |
| Letter Date | multilineText | `flddazGk6mIxqLXPD` |  |
| Request Code | multilineText | `fldA8KJhECgKTAbGA` |  |
| Volunteer Area | singleSelect | `fldtVsS2EAFF6Ur53` | Options: , Thrift, Board, Attorney, ADHC, cook, Dining Room, Tax help, Music, outreach, Thrift Store, Kitchen, Bingo, Dance, Front Desk, Special Dinner, Blood Pressure, Thrift store, Everything, Computer Lab |
| MsgText4 | multilineText | `fldBkCB0kp8jJu4ya` |  |
| MsgText1 | multilineText | `fldRz1w8vdgDeaAq4` |  |
| MsgText2 | multilineText | `fldE9HeN7cTVvV40N` |  |
| Volunteer | checkbox | `fld7n04lx0pGNy7Qw` | Green check |
| TextMember | singleSelect | `fldAGuBIAf2YwY5Zz` | Options: Member |
| TextDonor | multilineText | `fldzBrb1kjn9ptyKi` |  |
| Status, Inactive Y/N 2 | checkbox | `fldy7fXwk0cv9cozI` | Green check |
| Birth Month Num | number | `fldrLzVORM5CdyiHD` | Integer |

---

## FundRequest&Donations (LEGACY)

**Table ID:** `tblhqaa7t1AxZnGbj`  
**Purpose:** Legacy donation/fund request tracking. Use DONATIONS_NEW for current operations.

| Field | Type | Field ID | Notes |
|-------|------|----------|-------|
| ID | number | `fld4bgEmzw0o2avn5` | Primary field — Integer |
| RequestCode | singleSelect | `fldWF7HDEvdDGRIuk` | Options: 08Realtor, , 1/31/23, 13Request, 08Sum, mem hol 10, Support, 08Holiday, Scoop, 10 don hol, 2009 Year , 11Holiday, 10 mem hol, Memorial, 13Fund, S, fi, f, Fin, Fundraiser, ` |
| MailDate | dateTime | `fldynDUPC4hOlxMC9` | Format: YYYY-MM-DD, 24-hour |
| DonationDescription | multilineText | `fldM2fUMnCiLrJUAQ` |  |
| DonationAmount | number | `fldyu7WcJVmYE5NiQ` | Precision: 3 |
| DonationDate | date | `fldQeP5jjRLHEAv02` | Format: local date |
| Miscellaneous | multilineText | `fldH6tb4cEuzz3A4a` |  |
| DonationTo | singleSelect | `fld7gDTWA17eSZ4XS` | Options: G&A, Activities, , Admin, Thrift, ADHC, Trans, Angel, Split, Dining Room, 5163, Split Lun & Tra, Outreach, Lunch Bunch, Lunch, Ovens, lunchbunch, 22584, Memorial, Minivan, Capital Project, Capital Fund, Capital, Ukiah Senior ce, Endowment, capital project, lunch bunch, admin, Oct 15 Dinner, lunch Bunch, 8 Meals, Pledge, Senior Rides, Lunch bunch, 40 Bus Rides, Convection Oven, Van Program, Transport Meals, Split/ADHC Feed, Book Club, 0, G & A, Volunteer Lunch, Birthday Lunch, Donation, General, Meals, Hot Box, Ride, ICS, transportation, Sponsor Meals, Dinning, Lunchbunch, Meal-Ride, Split Adhc T T, Boutique, Generator, Adsm, Bunko, Split ADHC/feed, Anonynou, Anonynous, Oven, Split AdHC Tran, Lunch Bundh, dm, LUNCH BUNCH, Lunch B, Bartlett Hall, Sct, Bus Rides, Rides-Meals, LB half-ICS hal, breakfast, Fathers, Transportation, Capial Project, Trips-Meals, split/ADHC feed, Trans-meals, 2 Meals-2 rides, meal & ride, dinning, Meals-Rides, 2Meals-2Rides, Sr. Van, 2 Meals-2Rides, Sr Van, 2Rides-2Meals, Meals and Rides, Van/Meals/Rides, Rides & Meals, Oven-Meals-ride, 2rides-2meals, Van Rides, 2Meals-2Bus, Van Ride, Health Van, 2rides2meals, $36Van$14Meals, 2 Meals/2 rides, Trans, DR, Outr, $100ride-$14mea, Amin, Memorial Olson, misc, 1 meal&1ride, Ice Cream Socia, Bingo Food, Meal & Ride, Meal/ride, Memoria, Lunch Bunvh, Admim, lunch  Bunch, Lujch Bunch, Lunc Bunch, lu, asm, unch Bunch, Steam Table, 20 Bus Rides, Meal Ride, acmin, Dale Davis, Rides, asdm, ck 13600, 2meals2rides, meals-rides, Capital Campain, 2meals-2rides, LuncBunch, 1Ride-1Meal, July 2015 Dinne, Meals & Rides, Ukiah Senior Ce, Admn, Ask, Truck Damage, Mem-Larry Brown, Truck Repair, T Desroches BD, Trans-Meals, 2 Meals, 4 meals, Thanksgiving, Oven Fund, IC Social, 4meals-4rides, 4 meals-4 rides, 4 Meals-4rides, 4 Meals-4 Rides, 4rides-4meals, 4Meals-4Rides, 4Meals-4rides, 4Rides4Meals, Mem Borecky, $25 oven $6ride, 3 Meals, 1Meal-1Ride, Senior Health, Aug 12 Raffle, memory Chuck Da, 50-50 LB & Van, Marion Ward Mem, Rosemarie Nelso, Meal & 2 rides, Van, Meal Ride, Rides & Meal, 2Meals-Health 6, Meal and Rides, 2rides1meal, 2Rides1Meal, Meal & 2 Rides, Raffle, ICS Raffle, Betty Loobey, Mendo-C-Notes, Senior health, Meal Cards, Food, Pantry, Blankets, Act, Admin, Cap, Dining Covid-19, Adfm, adfm, Capital Campaig, 2021 Annual, aqdm, PayPal, Qadmin, `ac, Amd, cc, Outreach/Dining |
| ThankYouLtrDate | dateTime | `fldRGfpccQeGBe7xG` | Format: YYYY-MM-DD, 24-hour |
| Type | singleSelect | `fldSevGhvpUEowG5l` | Options: Financial, , In-Kind, Thrift, In Kind, inkind, InKind, finacial, ncial, frinancial, Finacial, inancial, Special, Membership, n |
| Letter Stop | checkbox | `fldvyLxgO68idytPX` | Green check |

---

## Schema Change Log

| Date | Change |
|------|--------|
| February 8, 2026 | Auto-synced from Airtable Metadata API via `scripts/sync-airtable-schema.mjs`. |

---

## Data Import/Export Notes

### CSV Import Format
- Date fields: `YYYY-MM-DD` (e.g., `2025-12-31`)
- Currency fields: Numeric only (e.g., `70.00` not `$70.00`)
- Phone numbers: Any format works, but `(707) 555-1234` is preferred
- Email: Must be valid email format

### Exporting for Reports
- Use Grid View → Download CSV
- Or use API to fetch filtered records
- Birthday labels: Export First Name, Last Name, Birthday, Address fields

---

## API Access Patterns

### Common Queries

**Get all active members:**
```
filterByFormula={Membership Status}='Active'
```

**Get members with birthdays this month:**
```
filterByFormula=MONTH({Birthday})=MONTH(TODAY())
```

**Get Transportation data for MTA reports:**
```
filterByFormula=AND({Category}='Transportation',{Fiscal Year}='2024-2025',{Month}='November')
```

### Rate Limits
- 5 requests per second per base
- Batch operations when possible (up to 10 records per request)

---

## Security & Access

- **API Key:** Personal Access Token in `.env.local` (never commit!)
- **Scopes Required:** 
  - `data.records:read` - Read records
  - `data.records:write` - Create/update records
  - `schema.bases:read` - Read base structure (needed for this sync script)

