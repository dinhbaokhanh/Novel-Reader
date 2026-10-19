# Reset database script for AI Novel Writer
# WARNING: This will delete all data!

$confirmation = Read-Host "⚠️  This will DELETE ALL DATA in your database. Are you sure? (type 'yes' to confirm)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔄 Resetting database..." -ForegroundColor Cyan

# Reset database
npx prisma migrate reset --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database reset completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Database reset failed!" -ForegroundColor Red
    exit 1
}
