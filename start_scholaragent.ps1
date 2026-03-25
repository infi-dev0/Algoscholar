# ============================================================
#  ScholarAgent — Main Launch Script (Windows)
#  Purpose: Start all 4 components in separate windows
# ============================================================

$Root = $PSScriptRoot

Write-Host "🚀 Starting ScholarAgent System..." -ForegroundColor Cyan

# 1. Start Portal Server
Write-Host "🌐 Starting Mock Portal Server (Port 5500)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root'; python serve_portal.py"

# 2. Start AI Engine
Write-Host "🧠 Starting AI Engine (Port 5001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\ai-engine'; python main.py"

# 3. Start Backend
Write-Host "⚙️ Starting Backend (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; node index.js"

# 4. Start Frontend
Write-Host "💻 Starting Frontend (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm start"

Write-Host "`n✅ All services initiated. Check the new windows for status." -ForegroundColor Green
Write-Host "Once ready, open: http://localhost:3000" -ForegroundColor Yellow
