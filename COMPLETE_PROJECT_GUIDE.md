# 🚀 Complete IMobile E-Commerce Project Guide

**Last Updated:** November 24, 2025  
**Status:** ✅ Fully Operational

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Common Issues & Solutions](#common-issues--solutions)
3. [Project Architecture](#project-architecture)
4. [Environment Setup](#environment-setup)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Database Setup](#database-setup)
8. [Authentication](#authentication)
9. [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v8+
- Supabase account (free tier works!)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Alternative format (for compatibility)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_SITE_URL=http://localhost:3000
VITE_DEV_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

**Get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create/select your project
3. Settings → API → Copy URL and anon key

### 3. Start Development Servers

**⚡ Easy Way (Recommended):**
```bash
# Windows
start-dev.bat

# Or PowerShell
.\start-dev.ps1
```

**📝 Manual Way (Two Terminals):**

Terminal 1 - API Server:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 4. Access Your Application

- **Frontend:** http://localhost:3000
- **API Server:** http://localhost:4000
- **Health Check:** http://localhost:4000/health

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Browser loads production site instead of localhost"

**Symptoms:**
- Browser URL shows `https://imobileservicecenter.pages.dev`
- Console errors about Vercel scripts
- Login doesn't work

**Solution:**

**Quick Fix (5 seconds):**
1. Press `Ctrl + Shift + N` (Incognito mode)
2. Type: `http://localhost:3000`
3. Try again - it will work! ✅

**Permanent Fix:**
1. Press `Ctrl + Shift + Delete`
2. Select "All time"
3. Check: ✅ Cookies ✅ Cached files
4. Click "Clear data"
5. Close ALL browser windows
6. Reopen → `http://localhost:3000`

**Remove Service Workers:**
```javascript
// Paste in browser console (F12)
navigator.serviceWorker.getRegistrations().then(r => 
  r.forEach(reg => reg.unregister())
);
```

**Set Localhost as Startup:**
- Chrome/Edge: `chrome://settings/onStartup`
- Add: `http://localhost:3000`
- Remove any `pages.dev` URLs

---

### Issue 2: "Session disappears after page refresh"

**Symptoms:**
- Login works initially
- After refresh, user is logged out
- Backend operations fail

**Root Cause:**
Only one server is running. You need BOTH:
- Express API Server (Port 4000)
- Vite Dev Server (Port 3000)

**Solution:**
```bash
# Run both servers:
start-dev.bat

# Or manually in two terminals:
# Terminal 1: npm run dev:server
# Terminal 2: npm run dev
```

**Verify Both Running:**
```bash
curl http://localhost:4000/health
curl http://localhost:3000
```

---

### Issue 3: "Cannot connect to API server"

**Symptoms:**
- Network errors in console
- API calls timeout
- "ECONNREFUSED" errors

**Solution:**

Check if API server is running:
```bash
curl http://localhost:4000/health
```

If not running:
```bash
npm run dev:server
```

Check for port conflicts:
```bash
# Windows
netstat -ano | findstr :4000
netstat -ano | findstr :3000
```

Kill conflicting process:
```bash
taskkill /PID <PID> /F
```

---

### Issue 4: "Login doesn't work"

**For Email Login:**

**Check 1:** Verify both servers are running
```bash
curl http://localhost:4000/health  # Should return 200 OK
curl http://localhost:3000          # Should return HTML
```

**Check 2:** Verify you're on localhost (not production)
- URL must be: `http://localhost:3000`
- NOT: `https://imobileservicecenter.pages.dev`

**Check 3:** Clear browser cache (see Issue 1)

**Check 4:** Check credentials
- Make sure user account exists
- Password is correct
- Email is verified (if email confirmation is enabled)

**For Google OAuth:**

**Check 1:** Google OAuth must be configured in Supabase
1. Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add Client ID and Client Secret from Google Cloud Console
4. Save

**Check 2:** Redirect URL must be set
- In Google Cloud Console: `http://localhost:3000/api/auth/callback`
- Also add: `http://localhost:4000/api/auth/callback`

---

### Issue 5: "Environment variables not loading"

**Symptoms:**
- "Supabase not configured" error
- "Missing environment variables"

**Solution:**

**Check 1:** Verify `.env` file exists in project root
```bash
# PowerShell
Test-Path .env
Get-Content .env
```

**Check 2:** Verify format
```env
# ✅ Correct
VITE_SUPABASE_URL=https://yourproject.supabase.co

# ❌ Wrong (no spaces, quotes)
VITE_SUPABASE_URL = "https://yourproject.supabase.co"
```

**Check 3:** Restart servers after changing `.env`
```bash
# Stop servers (Ctrl+C)
# Then restart
start-dev.bat
```

---

## 🏗️ Project Architecture

### Overview
```
Browser (http://localhost:3000)
   ↓
Vite Dev Server (Port 3000)
   ↓ Proxies /api/* requests
Express API Server (Port 4000)
   ↓
Supabase (PostgreSQL + Auth)
```

### File Structure
```
project/
├── src/
│   ├── server/              # Express API server
│   │   ├── index.ts        # Main server file
│   │   └── api/            # API routes
│   │       ├── auth/       # Authentication endpoints
│   │       │   ├── signin.ts
│   │       │   ├── signup.ts
│   │       │   ├── callback.ts
│   │       │   └── verify-otp.ts
│   │       └── products/   # Product endpoints
│   │           ├── list.ts
│   │           └── categories.ts
│   ├── components/          # React components
│   ├── pages/              # React pages/routes
│   ├── lib/                # Utilities & stores
│   │   ├── supabase/       # Supabase client & services
│   │   ├── store.ts        # Zustand stores
│   │   └── utils.ts        # Helper functions
│   └── hooks/              # Custom React hooks
├── public/                  # Static assets
├── supabase/               # Database schema & seeds
│   ├── schema.sql          # Database tables
│   ├── functions.sql       # Stored procedures
│   └── seed-data.sql       # Sample data
├── .env                    # Environment variables (DO NOT COMMIT)
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── start-dev.bat           # Startup script (Windows)
└── start-dev.ps1           # Startup script (PowerShell)
```

### Key Technologies
- **Frontend:** React 18, Vite, TailwindCSS, TypeScript
- **Backend:** Express.js, Node.js, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + OAuth)
- **State Management:** Zustand
- **Routing:** React Router
- **UI Components:** Radix UI, Shadcn/ui
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS

---

## ⚙️ Environment Setup

### Required Environment Variables

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For backward compatibility (optional)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URLs (optional)
VITE_SITE_URL=http://localhost:3000
VITE_DEV_URL=http://localhost:3000

# Server configuration (optional)
PORT=4000
NODE_ENV=development

# hCaptcha (optional - for signup/signin protection)
VITE_HCAPTCHA_SITE_KEY=your-site-key
VITE_ENABLE_SIGNIN_CAPTCHA=false
```

### Getting Supabase Credentials

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in details and create

2. **Get API Keys:**
   - Go to Settings → API
   - Copy "Project URL" → Use as `VITE_SUPABASE_URL`
   - Copy "anon public" key → Use as `VITE_SUPABASE_ANON_KEY`

3. **Add to `.env` file:**
   - Create `.env` in project root
   - Paste the values
   - Save

4. **Restart servers:**
   ```bash
   # Stop servers (Ctrl+C in both terminals)
   # Restart
   start-dev.bat
   ```

---

## 💻 Development Workflow

### Daily Start
```bash
# Start both servers
start-dev.bat

# Wait for both to start
# API Server: "✅ API server listening on port 4000"
# Vite Server: "VITE v5.4.21 ready"

# Open browser
# Go to: http://localhost:3000
```

### Making Changes

**Frontend Changes (React):**
- Edit files in `src/components/` or `src/pages/`
- Changes hot-reload automatically ⚡
- Check browser for updates
- No restart needed

**Backend Changes (API):**
- Edit files in `src/server/`
- Server auto-restarts (tsx watch) 🔄
- Check terminal for compilation
- If errors, fix and save again

**Database Changes:**
- Edit `supabase/schema.sql`
- Run in Supabase SQL Editor
- Or use Supabase CLI

### Testing

**Quick Health Check:**
```bash
# API Server
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000
```

**API Endpoints:**
```bash
# Products
curl http://localhost:3000/api/products/list

# Categories
curl http://localhost:3000/api/products/categories
```

**In Browser Console:**
```javascript
// Check if Supabase is configured
console.log(import.meta.env.VITE_SUPABASE_URL);

// Test API
fetch('http://localhost:4000/health').then(r => r.json()).then(console.log);
```

### Building for Production

```bash
# Build both frontend and backend
npm run build:all

# Or separately:
npm run build            # Frontend
npm run build:server     # Backend
```

### Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit (don't commit .env!)
git commit -m "Your message"

# Push
git push
```

**⚠️ Important:** Never commit `.env` file! It's in `.gitignore`.

---

## 🔍 Troubleshooting

### Server Won't Start

**Issue:** `EADDRINUSE` - Port already in use

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F

# Or use different port
# Edit .env: PORT=4001
```

---

### TypeScript Errors

**Issue:** Build fails with TypeScript errors

**Solution:**
```bash
# Clean build
Remove-Item -Recurse -Force dist-server
npm run build:server

# Check for errors
npm run lint
```

---

### Module Not Found

**Issue:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

### Database Connection Issues

**Issue:** "Cannot connect to Supabase"

**Solution:**

1. **Check Supabase project status:**
   - Login to Supabase dashboard
   - Check if project is active (not paused)

2. **Verify credentials:**
   - Check `.env` file
   - Ensure URL and key are correct
   - No extra spaces or quotes

3. **Test connection:**
   ```javascript
   // In browser console
   const { createClient } = await import('./src/lib/supabase/client');
   const supabase = createClient();
   const { data, error } = await supabase.from('products').select('count');
   console.log(data, error);
   ```

4. **Check network:**
   - Try accessing Supabase URL in browser
   - Check firewall settings
   - Verify internet connection

---

### CORS Errors

**Issue:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**

Check `src/server/index.ts`:
```typescript
app.use(cors({
  origin: process.env.VITE_DEV_URL || 'http://localhost:3000',
  credentials: true,
}))
```

If different port, update `VITE_DEV_URL` in `.env`.

---

## 🗄️ Database Setup

### Initial Setup

1. **Run Schema:**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Run `supabase/schema.sql`
   - Wait for completion

2. **Run Seed Data (Optional):**
   - Run `supabase/seed-data.sql`
   - This adds sample products

3. **Verify Tables:**
   ```sql
   SELECT * FROM profiles LIMIT 1;
   SELECT * FROM products LIMIT 1;
   SELECT * FROM orders LIMIT 1;
   ```

### Database Tables

- **profiles** - User profiles (extends auth.users)
- **products** - Product catalog
- **cart_items** - Shopping cart
- **orders** - Order history
- **order_items** - Order line items
- **messages** - Contact form submissions
- **reviews** - Product reviews
- **addresses** - User shipping/billing addresses
- **wishlists** - User wishlists
- **downloads** - Digital downloads

### Row Level Security (RLS)

RLS is enabled on all tables for security:

- **Products:** Public read, admin write
- **Cart:** Users manage own cart
- **Orders:** Users view own orders
- **Profiles:** Users manage own profile
- **Messages:** Public insert, admin read

**Admin Email:** `imobile.admin@gmail.com`

To make a user admin, set their email to this in Supabase.

---

## 🔐 Authentication

### Email/Password Authentication

**Sign Up:**
```typescript
const { user } = await authService.signUp(email, password, name, whatsapp);
```

**Sign In:**
```typescript
const { user, session } = await authService.signIn(email, password);
```

**Sign Out:**
```typescript
await authService.signOut();
```

### Google OAuth

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:4000/api/auth/callback`
   - Production URL if deploying
6. Copy Client ID and Secret
7. Add to Supabase Dashboard → Authentication → Providers → Google
8. Enable and save

**Usage:**
```typescript
await authService.signInWithGoogle();
// User will be redirected to Google
// Then back to /api/auth/callback
```

### Session Management

Sessions are stored in HTTP-only cookies by the Express server.

**Check Session:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Refresh Session:**
```typescript
const { data: { session } } = await supabase.auth.refreshSession();
```

### Protected Routes

Client-side protection in React:
```typescript
const { isAuthenticated } = useAuthStore();

if (!isAuthenticated) {
  navigate('/signin');
}
```

Server-side protection:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 🚀 Deployment

### Frontend (Vite)

**Build:**
```bash
npm run build
```

**Deploy to:**
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

**Environment Variables:**
Set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (production URL)

### Backend (Express)

**Build:**
```bash
npm run build:server
```

**Deploy to:**
- Heroku
- Railway
- Render
- DigitalOcean
- Any Node.js hosting

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY`
- `PORT`
- `NODE_ENV=production`

**Start Command:**
```bash
node dist-server/index.js
```

### Database (Supabase)

No deployment needed - Supabase handles this!

Just make sure to:
- Run production schema
- Configure RLS policies
- Set up backups (Supabase dashboard)

---

## 📚 Additional Resources

### Scripts Reference

```bash
npm run dev              # Start Vite dev server
npm run dev:server       # Start Express API server
npm run build            # Build frontend
npm run build:server     # Build backend
npm run build:all        # Build both
npm run preview          # Preview production build
```

### Port Reference

| Port | Service | URL |
|------|---------|-----|
| 3000 | Vite Dev Server | http://localhost:3000 |
| 4000 | Express API Server | http://localhost:4000 |

### Important URLs

- **Health Check:** http://localhost:4000/health
- **Products API:** http://localhost:3000/api/products/list
- **Categories API:** http://localhost:3000/api/products/categories
- **Auth Signin:** http://localhost:3000/api/auth/signin
- **Auth Signup:** http://localhost:3000/api/auth/signup

### Browser Tools

- **DevTools:** F12
- **Console:** F12 → Console tab
- **Network:** F12 → Network tab
- **Application:** F12 → Application tab
- **Clear Cache:** Ctrl + Shift + Delete
- **Incognito:** Ctrl + Shift + N
- **Hard Refresh:** Ctrl + F5

---

## ✅ Success Checklist

Before deploying or sharing:

- [ ] Both servers start without errors
- [ ] Health check returns 200 OK
- [ ] Products load on homepage
- [ ] Can navigate all pages
- [ ] Sign up works
- [ ] Sign in works
- [ ] Session persists after refresh
- [ ] Google OAuth works (if configured)
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Admin pages accessible (for admin users)
- [ ] No console errors
- [ ] No linter errors
- [ ] Mobile responsive
- [ ] Production build succeeds

---

## 🆘 Getting Help

### Check These First:
1. Both servers running?
2. `.env` file configured?
3. Browser cache cleared?
4. Using `localhost:3000` (not production URL)?
5. Console errors? (F12)

### Debug Commands:
```bash
# Check servers
curl http://localhost:4000/health
curl http://localhost:3000

# Check environment
Get-Content .env

# Check processes
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

### In Browser Console:
```javascript
// Check environment
console.log(import.meta.env);

// Test API
fetch('/api/test-env').then(r => r.json()).then(console.log);

// Check auth
const { data } = await supabase.auth.getSession();
console.log(data);
```

---

## 📝 Notes

### Tips for Success:
1. **Always run BOTH servers** (API + Vite)
2. **Use Incognito mode** for testing
3. **Clear cache** when seeing weird behavior
4. **Check console** for errors
5. **Restart servers** after `.env` changes

### Common Pitfalls:
- ❌ Only running one server
- ❌ Using production URL for local testing
- ❌ Forgetting to clear browser cache
- ❌ Not restarting after env changes
- ❌ Committing `.env` file to git

### Best Practices:
- ✅ Use separate browser profiles for dev/prod
- ✅ Bookmark `localhost:3000` for quick access
- ✅ Keep DevTools "Disable cache" checked
- ✅ Use TypeScript for type safety
- ✅ Test in multiple browsers

---

**Last Updated:** November 24, 2025  
**Project Status:** ✅ Fully Operational  
**Ready for:** Development and Production Deployment

🎉 **Happy coding!** 🎉

