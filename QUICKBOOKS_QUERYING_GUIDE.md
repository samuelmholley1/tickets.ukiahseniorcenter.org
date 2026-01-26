# QuickBooks Querying Guide

**Last Updated:** January 24, 2026

## ⚠️ CRITICAL: Token Management

QuickBooks refresh tokens **ROTATE on every use**. If you use a token and don't save the new one, the old token is **PERMANENTLY INVALIDATED**.

**ALWAYS run the unified refresh script before querying QuickBooks:**

```powershell
cd C:\Users\Owner\Desktop\admin.ukiahseniorcenter.org
node refresh-all-subdomain-tokens.mjs
```

This will refresh the token AND distribute it to all subdomain repos:
- admin.ukiahseniorcenter.org
- memberships.ukiahseniorcenter.org
- donate.ukiahseniorcenter.org
- affairtoremember.ukiahseniorcenter.org
- tickets.ukiahseniorcenter.org

## Quick Start

### 1. Refresh Tokens (ALWAYS DO THIS FIRST)
```powershell
cd C:\Users\Owner\Desktop\admin.ukiahseniorcenter.org
node refresh-all-subdomain-tokens.mjs
```

### 2. Search for Donations/Funds
```powershell
cd C:\Users\Owner\Desktop\admin.ukiahseniorcenter.org
node query-qb-fund.mjs "search term" --date-range 2025-10-01 2025-12-31
```

### 3. Query Monthly Donations (for SCOOP)
```powershell
cd C:\Users\Owner\Desktop\admin.ukiahseniorcenter.org
node query-jan2026-donations.js
```

## Environment Variables

All repos now have these QuickBooks variables in `.env.local`:

| Variable | Description |
|----------|-------------|
| `QUICKBOOKS_CLIENT_ID` | OAuth client ID |
| `QUICKBOOKS_CLIENT_SECRET` | OAuth client secret |
| `QUICKBOOKS_REDIRECT_URI` | OAuth callback URL |
| `QUICKBOOKS_REALM_ID` | Company ID (9130356669091866) |
| `QUICKBOOKS_ACCESS_TOKEN` | Current access token (1 hour TTL) |
| `QUICKBOOKS_REFRESH_TOKEN` | Refresh token (rotates on use!) |
| `QUICKBOOKS_TOKEN_EXPIRES_AT` | Token expiry timestamp |

## GL Code Reference

| GL Code | Account Name | Use Case |
|---------|--------------|----------|
| 4001.2 (ID: 279) | Annual Pledge Drive | Annual Pledge Donors |
| 4001.20 (ID: 402) | Asking Letter Donations | Angel Donors |
| 4001.1 (ID: 273) | Board Fundraisers | Angel Donors |
| 1150040015 | Mabel Albertson Fund Grant | Foundation Grants |

## Common Queries

### Search by Donor Name
```powershell
node query-qb-fund.mjs "Smith"
```

### Search by Fund Name
```powershell
node query-qb-fund.mjs "Albertson"
```

### Search Date Range
```powershell
node query-qb-fund.mjs --date-range 2025-11-01 2025-11-30
```

### All October-December Donations
```powershell
node query-qb-fund.mjs "" --date-range 2025-10-01 2025-12-31
```

## Troubleshooting

### "Token expired" or "401 Unauthorized"
Run the token refresh script:
```powershell
cd C:\Users\Owner\Desktop\admin.ukiahseniorcenter.org
node refresh-all-subdomain-tokens.mjs
```

### "Missing credentials"
Ensure `.env.local` exists and has all QUICKBOOKS_* variables.
Run the refresh script to populate them.

### Tokens Not Syncing to Other Repos
Check that all repos exist at the expected paths in `refresh-all-subdomain-tokens.mjs`.

## Script Locations

| Script | Location | Purpose |
|--------|----------|---------|
| `refresh-all-subdomain-tokens.mjs` | admin repo | Refresh & distribute tokens |
| `query-qb-fund.mjs` | admin repo | Search donations/funds |
| `query-jan2026-donations.js` | admin repo | Monthly SCOOP queries |
| `query-qb-donations.js` | admin repo | Generic donation query |

