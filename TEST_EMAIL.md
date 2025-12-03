# Test Email Receipt API

## Quick Test via PowerShell

Run this command to send a test email to sam@samuelholley.com:

```powershell
$testData = @{
    transactionId = "TXN-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
    firstName = "Sam"
    lastName = "Holley"
    email = "sam@samuelholley.com"
    phone = "(707) 555-1234"
    christmasMember = 2
    christmasNonMember = 1
    nyeMember = 2
    nyeNonMember = 1
    ticketSubtotal = 165
    donationAmount = 25
    grandTotal = 190
    paymentMethod = "Cash"
    staffInitials = "TEST"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tickets/send-receipt" -Method POST -Body $testData -ContentType "application/json"
```

## Test via Airtable Entry

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/internal

3. Fill out form:
   - First Name: Sam
   - Last Name: Holley
   - Email: sam@samuelholley.com
   - Phone: (707) 555-1234
   - Christmas Member: 2
   - Christmas Non-Member: 1
   - NYE Member: 2
   - NYE Non-Member: 1
   - Donation: $25

4. Submit and click "Email Receipt to Customer" on success page

5. Check sam@samuelholley.com inbox for email with PDF attachment

## Expected Result

Email will include:
- Professional HTML receipt
- Transaction breakdown showing:
  - 2 Christmas Member tickets: $30
  - 1 Christmas Non-Member: $20
  - 2 NYE Member tickets: $70
  - 1 NYE Non-Member: $45
  - Donation: $25
  - Total: $190
- PDF attachment with 6 tickets (3 Christmas + 3 NYE)
