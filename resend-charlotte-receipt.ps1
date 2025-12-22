$body = @{
    transactionId = "ZEFFY-IMPORT-1766184481036-BAR5WE9"
    firstName = "Charlotte"
    lastName = "Jacobs"
    email = "charjacobswood@gmail.com"
    phone = "No phone provided"
    christmasMember = 2
    christmasNonMember = 2
    nyeMember = 0
    nyeNonMember = 0
    ticketSubtotal = 70
    donationAmount = 0
    grandTotal = 70
    paymentMethod = "Card (Zeffy)"
    staffInitials = "ZEFFY"
    subjectPrefix = "Resent:"
    additionalCC = @("sam@samuelholley.com")
} | ConvertTo-Json

Write-Host ""
Write-Host "RESENDING CHARLOTTE JACOBS RECEIPT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Transaction Details:" -ForegroundColor Yellow
Write-Host "   Name: Charlotte Jacobs"
Write-Host "   Email: charjacobswood@gmail.com"
Write-Host "   Christmas Member Tickets: 2"
Write-Host "   Christmas Non-Member Tickets: 2"
Write-Host "   Total: $70"
Write-Host "   BCC: sam@samuelholley.com" -ForegroundColor Green
Write-Host ""
Write-Host "Sending email via API..." -ForegroundColor Yellow

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/tickets/send-receipt" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host ""
if ($response.StatusCode -eq 200) {
    Write-Host "Email sent successfully!" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} else {
    Write-Host "Failed to send email" -ForegroundColor Red
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Red
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
