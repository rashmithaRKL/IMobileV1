# Fix: Supabase Environment Variables in Cloudflare

## ✅ Deployment Successful!

Your site is live at: **https://imobile.kalhararashmitha.workers.dev**

However, you're seeing: "Supabase environment variables are not configured"

## 🔧 Solution: Add Environment Variables

### Step 1: Go to Cloudflare Dashboard

1. Visit: https://dash.cloudflare.com/
2. Go to **Workers & Pages** → **imobile** (your project)
3. Click on **Settings** tab
4. Scroll down to **Variables and secrets** section

### Step 2: Add Environment Variables

Click **"Add variable"** and add these **one by one**:

#### Required Variables:

1. **VITE_SUPABASE_URL**
   - Value: `https://jzdsgqdwpmfrrspxpehi.supabase.co`
   - Type: Encrypted (or Plain text)

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHNncWR3cG1mcnJzcHhwZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzM5OTcsImV4cCI6MjA3NzY0OTk5N30.wPzTwdl7o9QY_EMNoJ6jwzUAiE3Rq136n98-yH1aBzc`
   - Type: Encrypted (recommended for security)

#### Optional (for backend if needed):

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHNncWR3cG1mcnJzcHhwZWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3Mzk5NywiZXhwIjoyMDc3NjQ5OTk3fQ.TSa97uPS2HurR_a6Rc2T1WAEqvD6eIOF_KvEx6ffVDs`
   - Type: Encrypted (keep this secret!)

### Step 3: Save and Redeploy

After adding the variables:

1. **Save** the settings
2. Go to **Deployments** tab
3. Click **"Retry deployment"** or trigger a new deployment
4. The environment variables will be available in the next build

### Step 4: Verify

After redeployment, visit your site:
- https://imobile.kalhararashmitha.workers.dev

The error should be gone!

## 📝 Important Notes

### For Vite Environment Variables:

- Variables starting with `VITE_` are exposed to the client-side code
- They need to be available at **build time** (during `npm run build`)
- In Cloudflare, add them as **Environment variables** in the project settings

### Alternative: Update wrangler.jsonc

You can also add variables to `wrangler.jsonc`:

```jsonc
{
  "name": "imobile",
  "compatibility_date": "2025-11-24",
  "assets": {
    "directory": "./dist"
  },
  "vars": {
    "VITE_SUPABASE_URL": "https://jzdsgqdwpmfrrspxpehi.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHNncWR3cG1mcnJzcHhwZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzM5OTcsImV4cCI6MjA3NzY0OTk5N30.wPzTwdl7o9QY_EMNoJ6jwzUAiE3Rq136n98-yH1aBzc"
  }
}
```

However, **adding them in the Cloudflare Dashboard is recommended** for security.

## 🔒 Security Best Practices

- ✅ Use **Encrypted** type for sensitive keys (anon key, service role key)
- ✅ Never commit `.env` files to git
- ✅ Use Cloudflare Dashboard for production secrets
- ✅ Rotate keys if they're exposed

## 🐛 Troubleshooting

### Still seeing the error after adding variables?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check variable names** - they must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **Redeploy** - environment variables are only available after a new deployment
4. **Check build logs** - verify variables are being used during build

### Variables not available at build time?

For Vite, environment variables are embedded at build time. You may need to:
- Add them in the **Build settings** → **Environment variables** section
- Or ensure they're in `wrangler.jsonc` before building

---

**Your deployment is successful! Just add the environment variables and you're all set! 🎉**

