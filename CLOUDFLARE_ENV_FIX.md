# 🔧 Fix: Supabase Environment Variables Error

## The Problem

You're seeing: **"Supabase environment variables are not configured"**

This happens because **Vite embeds environment variables at BUILD TIME**, not runtime. The variables need to be available when Cloudflare runs `npm run build`.

## ✅ Solution: Add Environment Variables in Build Settings

### Step 1: Go to Cloudflare Dashboard

1. Visit: https://dash.cloudflare.com/
2. Go to **Workers & Pages** → **imobile** (your project)
3. Click on **Settings** tab

### Step 2: Add Build Environment Variables

**IMPORTANT:** You need to add these in **TWO places**:

#### A. Build Settings → Environment Variables

1. Scroll to **"Build settings"** section
2. Click **"Add variable"** under **"Environment variables"**
3. Add these variables **one by one**:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://jzdsgqdwpmfrrspxpehi.supabase.co`
   - Environment: Select **"Production"** (or "All environments")
   - Click **"Save"**

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHNncWR3cG1mcnJzcHhwZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzM5OTcsImV4cCI6MjA3NzY0OTk5N30.wPzTwdl7o9QY_EMNoJ6jwzUAiE3Rq136n98-yH1aBzc`
   - Environment: Select **"Production"** (or "All environments")
   - Click **"Save"**

#### B. Variables and Secrets (Optional - for runtime)

If you also want them available at runtime (for Workers), add them in:
- **Settings** → **Variables and secrets** section

### Step 3: Trigger a New Build

After adding the variables:

1. Go to **Deployments** tab
2. Click **"Retry deployment"** or **"Create deployment"**
3. Wait for the build to complete (it will use the new environment variables)

### Step 4: Verify

After the new deployment:

1. Visit: https://imobile.kalhararashmitha.workers.dev
2. The error should be gone! ✅

## 📸 Visual Guide

### Where to Find Build Settings:

```
Cloudflare Dashboard
  └── Workers & Pages
      └── imobile (your project)
          └── Settings
              ├── Build settings
              │   └── Environment variables  ← ADD HERE
              └── Variables and secrets      ← Optional
```

## 🔍 How to Verify Variables Are Set

After adding variables, check the build logs:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the build log - you should see the build succeed
4. The variables will be embedded in the built JavaScript files

## ⚠️ Important Notes

1. **Build Time vs Runtime:**
   - `VITE_*` variables are embedded at **build time** (when `npm run build` runs)
   - They become part of the JavaScript bundle
   - They're visible in the client-side code (that's why they're safe to expose)

2. **Variable Names:**
   - Must be exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Case-sensitive!

3. **After Adding Variables:**
   - You **MUST** trigger a new build
   - Old builds don't have the variables
   - Just saving variables isn't enough - rebuild is required

## 🐛 Still Not Working?

### Check 1: Variable Names
- Ensure they're exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- No typos, no extra spaces

### Check 2: Build Environment
- Make sure variables are set for **"Production"** environment
- Or set them for **"All environments"**

### Check 3: New Build
- Did you trigger a new build after adding variables?
- Old deployments won't have the variables

### Check 4: Build Logs
- Check the build logs to see if variables are being used
- Look for any errors during the build process

### Check 5: Browser Cache
- Clear browser cache (Ctrl+Shift+R)
- Try incognito/private mode

## 🎯 Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` in Build settings → Environment variables
- [ ] Added `VITE_SUPABASE_ANON_KEY` in Build settings → Environment variables
- [ ] Set environment to "Production" or "All environments"
- [ ] Triggered a new build/deployment
- [ ] Waited for build to complete
- [ ] Cleared browser cache
- [ ] Verified site works

---

**Once you add the variables and trigger a new build, the error will be resolved!** 🎉

