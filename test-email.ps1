# Test Email Receipt - Send to sam@samuelholley.com
# Make sure dev server is running: npm run dev

Write-Host "🧪 Testing Email Receipt Feature" -ForegroundColor Cyan
Write-Host ""

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
    ticketSubtotal = 165.00
    donationAmount = 25.00
    grandTotal = 190.00
    paymentMethod = "Cash"
    staffInitials = "TEST"
}

Write-Host "📧 Sending test email to: $($testData.email)" -ForegroundColor Yellow
Write-Host "💰 Transaction Total: `$$($testData.grandTotal)" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/tickets/send-receipt" `
        -Method POST `
        -Body ($testData | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCESS! Email sent!" -ForegroundColor Green
    Write-Host "📬 Message ID: $($response.messageId)" -ForegroundColor Green
    Write-Host ""
    Write-Host "👀 Check your inbox at sam@samuelholley.com" -ForegroundColor Cyan
    Write-Host "📎 Look for PDF attachment: tickets_$($testData.transactionId).pdf" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ ERROR: Failed to send email" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Dev server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  2. .env.local has EMAIL_USER and EMAIL_PASSWORD" -ForegroundColor Yellow
    Write-Host "  3. Server is accessible at http://localhost:3000" -ForegroundColor Yellow
}
