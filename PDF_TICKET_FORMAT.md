# PDF Ticket Format Documentation

## Current Implementation

The system generates PDF tickets in two contexts:

### 1. Customer/Internal Sales PDF (`/api/tickets/pdf`)
**Used for**: Email receipts and internal sales
**Guest Name Format**: `Guest: [Customer Name] #[Number]`
**Example**: `Guest: John Smith #1`, `Guest: John Smith #2`

### 2. Bookstore Bulk PDF (`/api/tickets/bookstore-pdf`)
**Used for**: Mendocino Book Company bulk orders
**Guest Name Format**: `[Store Name] #[Number]`
**Example**: `Mendocino Book Company #1`, `Mendocino Book Company #2`

## Ticket Layout (Both Types)
Both PDFs use identical senior-friendly design:

### Header Section (30% width - Left side)
- **Logo**: 30% of ticket width, vertically centered
- Color logo for visual appeal

### Title Section (70% width - Right side)
- **Event Title**: 14pt bold, center-aligned, uppercase
  - Christmas: "CHRISTMAS DRIVE-THRU"
  - NYE: "NEW YEAR'S EVE GALA"
- **Date**: 11pt bold
  - Christmas: "Tuesday • December 23, 2025"
  - NYE: "Wednesday • December 31, 2025"

### Event Details (Center-aligned)
- **Christmas**:
  - "Prime Rib, Fixings, & Dessert" (10pt)
  - "Pick Up: 12:00-12:30 PM" (10pt)
- **NYE**:
  - "Music by _Beatz Werkin_" (10pt, band name italicized)
  - "Appetizers & Dessert" (10pt)
  - "Ball Drops at 9 PM" (9pt)

### Guest Name (Bottom-anchored)
- **Font**: 11pt bold, accent color (#2e7d32 green for Christmas, #6a1b9a purple for NYE)
- **Position**: 0.45-0.5 inches from bottom
- **Format**: 
  - Customer PDF: `Guest: [Name] #[Ticket Number]`
  - Bookstore PDF: `[Store Name] #[Ticket Number]`

### Footer (Bottom)
- **Location**: 8pt gray text, center-aligned
- Line 1: "Bartlett Event Center"
- Line 2: "495 Leslie St • (707) 462-4343 ext 209"

## Grid Layout
- **Page Size**: 8.5" × 11" (Letter)
- **Grid**: 2 columns × 4 rows = 8 tickets per page
- **Ticket Size**: 3.5" × 2"
- **Gaps**: 0.25" horizontal, 0.2" vertical
- **Margins**: 0.75" left/right, 0.5" top

## Key Differences

| Feature | Customer PDF | Bookstore PDF |
|---------|-------------|---------------|
| Guest Name | `Guest: [Name] #1` | `Mendocino Book Company #1` |
| Filename | `tickets-[timestamp].pdf` | `Mendocino-Book-Company-Tickets-[timestamp].pdf` |
| Use Case | Email receipts, individual sales | Bulk orders for retail |
| Guest Anchor | 0.45" from bottom | 0.5" from bottom |

## Implementation Notes

✅ **ALREADY IMPLEMENTED**: Customer PDFs already show `Guest: [CustomerName] #1` format
✅ **ALREADY IMPLEMENTED**: Both PDFs use identical senior-friendly layout with 30% logo, 70% text
✅ **ALREADY IMPLEMENTED**: Bottom-anchored guest names prevent overflow issues
✅ **ALREADY IMPLEMENTED**: Large, clear fonts optimized for seniors

No changes needed - the system is working as requested!
