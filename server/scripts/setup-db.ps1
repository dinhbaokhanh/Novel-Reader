# Setup database script for AI Novel Writer

Write-Host "🔧 Setting up AI Novel Writer database..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env file found" -ForegroundColor Green

# Run Prisma DB push
Write-Host "`n📦 Creating database and pushing schema..." -ForegroundColor Cyan
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "`n🎉 You can now start the server with: npm run start:dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    exit 1
}
