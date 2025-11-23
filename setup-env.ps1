# PowerShell script to create .env file
# Run this with: .\setup-env.ps1

$envContent = @"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="/JXdvtlBnawNg+eO6gneFzoR3l/k7F9sUvogD8vayvA="
NEXTAUTH_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "DATABASE_URL Explanation:" -ForegroundColor Yellow
Write-Host "  - For SQLite, this is just a file path" -ForegroundColor Gray
Write-Host "  - 'file:./dev.db' means the database will be created as 'dev.db' in the project root" -ForegroundColor Gray
Write-Host "  - When you run 'npx prisma db push', Prisma will create this file automatically" -ForegroundColor Gray
Write-Host "  - No database server needed - SQLite is a file-based database!" -ForegroundColor Gray

