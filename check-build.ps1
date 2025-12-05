#!/usr/bin/env pwsh
# Pre-push build check script

Write-Host "🔍 Running build checks..." -ForegroundColor Cyan

# Run Next.js build with linting
Write-Host "`n📦 Building Next.js..." -ForegroundColor Yellow
$buildOutput = & yarn build 2>&1
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -ne 0) {
    Write-Host "`n❌ Build failed! Fix errors before pushing:" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build passed! Safe to push." -ForegroundColor Green
exit 0
