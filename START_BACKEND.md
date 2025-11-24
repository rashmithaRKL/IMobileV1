# 🚨 CRITICAL: Start Backend Server

## The Problem
You're seeing `ECONNREFUSED` errors because **the backend server is not running**.

## The Solution

You need to run **TWO servers** at the same time:

### Option 1: Use the Startup Script (Easiest)
```powershell
.\start-dev.ps1
```

This will start both servers automatically in separate windows.

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend Server (Port 4000):**
```powershell
npm run dev:server
```

**Terminal 2 - Frontend Server (Port 3000):**
```powershell
npm run dev
```

### Option 3: Quick PowerShell Command
Open a NEW PowerShell window and run:
```powershell
cd "F:\Client IMobile\IMobile\New folder\New folder\v0-e-commerce-website-build-main"
npm run dev:server
```

## How to Verify It's Working

1. **Backend Server Running:**
   - You should see: `✅ API server listening on port 4000`
   - Test: Open http://localhost:4000/health in browser

2. **Frontend Server Running:**
   - You should see: `Local: http://localhost:3000/`
   - Test: Open http://localhost:3000 in browser

3. **Both Working:**
   - Visit http://localhost:3000/problem
   - All API checks should show green ✓

## Common Issues

**"Port 4000 already in use"**
- Another process is using port 4000
- Solution: Close that process or change PORT in .env

**"Cannot find module 'tsx'"**
- Solution: Run `npm install`

**"Environment variables not found"**
- Solution: Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

