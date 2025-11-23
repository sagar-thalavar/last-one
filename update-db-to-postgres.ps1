# PowerShell script to update .env file with PostgreSQL connection string
# Run this with: .\update-db-to-postgres.ps1

$postgresUrl = 'postgresql://neondb_owner:npg_iM81KJQorYeR@ep-shy-hat-a4v0ptwq-fooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Read existing .env file if it exists
$envContent = @"
DATABASE_URL="$postgresUrl"
NEXTAUTH_SECRET="/JXdvtlBnawNg+eO6gneFzoR3l/k7F9sUvogD8vayvA="
NEXTAUTH_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ".env file updated with PostgreSQL connection!" -ForegroundColor Green
Write-Host ""
Write-Host "Database: Neon PostgreSQL (cloud-hosted)" -ForegroundColor Yellow
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npx prisma generate" -ForegroundColor Gray
Write-Host "  2. Run: npx prisma db push" -ForegroundColor Gray
Write-Host "  3. Run: npm run dev" -ForegroundColor Gray

