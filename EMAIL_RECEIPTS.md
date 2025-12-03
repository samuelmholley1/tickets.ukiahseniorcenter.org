# Email Receipt Feature

## Overview
Automated email receipts with PDF ticket attachments sent from `cashier@seniorctr.org` when processing cash/check payments.

## Features
- ✅ Professional HTML email receipt with itemized breakdown
- ✅ PDF attachment with all tickets (2x5 grid, ready to print)
- ✅ Sent from Ukiah Senior Center's Microsoft 365 account
- ✅ Includes transaction details, event info, and contact information

## Email Configuration

### Microsoft 365 SMTP Settings
```
Host: smtp.office365.com
Port: 587
Security: STARTTLS
From: "Ukiah Senior Center Tickets" <cashier@seniorctr.org>
Reply-To: cashier@seniorctr.org
```

### Required Environment Variables
Add these to Vercel:
```
EMAIL_USER=cashier@seniorctr.org
EMAIL_PASSWORD=Summertime_24$
NEXT_PUBLIC_BASE_URL=https://tickets.ukiahseniorcenter.org
```

## How It Works

1. **Staff processes sale** at `/internal`
2. **Success page shows** "Email Receipt to Customer" button
3. **Button triggers**:
   - Generates PDF via `/api/tickets/pdf` endpoint
   - Creates HTML receipt email
   - Sends email with PDF attachment via nodemailer
4. **Customer receives**:
   - Professional HTML email with full receipt
   - PDF attachment: `tickets_TXN-123456.pdf`
   - All tickets on one page (matches print format)

## Email Template Structure

```
┌─────────────────────────────────────┐
│ 🎟️ Ticket Purchase Receipt          │
│                                     │
│ Ukiah Senior Center                 │
│ Transaction: TXN-123456789          │
│                                     │
│ Customer: John & Jane Doe           │
│ Email: john@example.com             │
│ Phone: (707) 555-1234               │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ ITEMS PURCHASED                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ 🎄 Christmas Drive-Thru             │
│    2 Member Tickets        $30.00   │
│    1 Non-Member Ticket     $20.00   │
│    Subtotal:               $50.00   │
│                                     │
│ 🎉 New Year's Eve Gala              │
│    2 Member Tickets        $70.00   │
│    Subtotal:               $70.00   │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Ticket Subtotal:          $120.00   │
│ Donation (Thank you! ❤️):  $25.00   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ TOTAL PAID:               $145.00   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ Payment: Cash                       │
│ Processed: Dec 3, 2025 2:30 PM     │
│ Staff: JD                           │
│                                     │
│ 📎 Your tickets are attached        │
│    as a PDF (ready to print!)      │
│                                     │
│ Questions? (707) 462-4343 x209      │
└─────────────────────────────────────┘

Attachment: tickets_TXN-123456789.pdf
```

## Testing Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add to `.env.local`:**
   ```
   EMAIL_USER=cashier@seniorctr.org
   EMAIL_PASSWORD=Summertime_24$
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **Test flow:**
   - Go to `/internal`
   - Fill out form with valid email
   - Submit sale
   - Click "Email Receipt to Customer" on success page
   - Check customer's inbox for email with PDF attachment

## Production Deployment

### Vercel Environment Variables
Add via Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `EMAIL_USER` | `cashier@seniorctr.org` |
| `EMAIL_PASSWORD` | `Summertime_24$` |
| `NEXT_PUBLIC_BASE_URL` | `https://tickets.ukiahseniorcenter.org` |

### Puppeteer on Vercel
Vercel automatically handles Puppeteer in serverless functions. No additional configuration needed.

## Troubleshooting

### Email not sending
- ✅ Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set in Vercel
- ✅ Check Microsoft 365 account is active
- ✅ Test SMTP credentials at https://www.smtper.net/

### PDF not generating
- ✅ Check `NEXT_PUBLIC_BASE_URL` is correct
- ✅ Verify Puppeteer is installed: `npm list puppeteer`
- ✅ Check Vercel function logs for timeout errors

### Email goes to spam
- ✅ Microsoft 365 from @seniorctr.org should have good deliverability
- ✅ Ask customers to add `cashier@seniorctr.org` to contacts
- ✅ Avoid spam trigger words in subject/body

## Security Notes

- ✅ Password stored securely in Vercel environment variables (encrypted at rest)
- ✅ Email sent server-side only (API route)
- ✅ No credentials exposed to client-side code
- ✅ SMTP uses STARTTLS encryption
- ✅ Consider rotating password periodically

## Future Enhancements

- [ ] Add BCC to cashier@seniorctr.org for record-keeping
- [ ] Queue emails for retry if SMTP fails
- [ ] Track email delivery status
- [ ] Add "View in Browser" link for HTML email
- [ ] Support multiple recipient emails
