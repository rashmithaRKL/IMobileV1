# 🚀 Deploy Backend to Cloudflare

Your frontend is working! Now let's deploy your Express backend to Cloudflare.

## 📋 Two Options

### Option 1: Cloudflare Tunnel (Easiest - Recommended)
- ✅ No code changes needed
- ✅ Works with your existing Express server
- ⚠️ Requires your server to stay running (or deploy to a VPS)

### Option 2: Cloudflare Workers (Serverless)
- ✅ Fully serverless, no server to manage
- ✅ Scales automatically
- ⚠️ Requires converting Express to Workers format

---

## 🎯 Option 1: Cloudflare Tunnel (Recommended)

This exposes your Express backend through Cloudflare's network.

### Step 1: Install Cloudflare Tunnel

**Windows:**
```powershell
# Using Chocolatey
choco install cloudflared

# Or download from:
# https://github.com/cloudflare/cloudflared/releases/latest
# Download cloudflared-windows-amd64.exe and rename to cloudflared.exe
```

**Verify installation:**
```powershell
cloudflared --version
```

### Step 2: Authenticate with Cloudflare

```powershell
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to select your Cloudflare account
3. Authorize the tunnel
4. Save credentials to `C:\Users\<YOUR_USERNAME>\.cloudflared\cert.pem`

### Step 3: Create a Tunnel

```powershell
cloudflared tunnel create imobile-backend
```

**Note the Tunnel ID** that's displayed (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 4: Create Tunnel Configuration

Create a file: `cloudflare-tunnel-config.yml`

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: C:\Users\<YOUR_USERNAME>\.cloudflared\<TUNNEL_ID>.json

ingress:
  # Backend API
  - hostname: imobile-backend.kalhararashmitha.workers.dev
    service: http://localhost:4000
  
  # Catch-all rule (must be last)
  - service: http_status:404
```

**Replace:**
- `<YOUR_TUNNEL_ID>` with the ID from Step 3
- `<YOUR_USERNAME>` with your Windows username

### Step 5: Route DNS (Optional - for custom domain)

If you have a domain managed by Cloudflare:

```powershell
cloudflared tunnel route dns imobile-backend api.yourdomain.com
```

**Or use Cloudflare's free subdomain:**

You can skip DNS routing and use Cloudflare's automatically generated URL.

### Step 6: Start Your Backend Server

**Terminal 1 - Start Express Backend:**
```powershell
npm run dev:server
```

Wait until you see: `✅ API server listening on port 4000`

### Step 7: Start the Tunnel

**Terminal 2 - Start Cloudflare Tunnel:**
```powershell
cloudflared tunnel --config cloudflare-tunnel-config.yml run
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://xxxxx-xxxx-xxxx.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**Copy this URL** - this is your backend API URL!

### Step 8: Update Frontend to Use Backend URL

1. **Go to Cloudflare Dashboard**
   - Workers & Pages → imobile → Settings
   - Environment variables

2. **Add Backend URL:**
   - Name: `VITE_API_URL`
   - Value: `https://xxxxx-xxxx-xxxx.trycloudflare.com` (from Step 7)
   - Or: `https://imobile-backend.kalhararashmitha.workers.dev` (if you set up DNS)

3. **Update CORS in Backend**

   Edit `src/server/index.ts` and add your frontend URL:

   ```typescript
   const allowedOrigins = process.env.NODE_ENV === 'production'
     ? [
         'https://imobile.kalhararashmitha.workers.dev', // Add your frontend URL
         process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
         process.env.CLOUDFLARE_PAGES_URL,
       ].filter(Boolean)
     : [
         // ... existing dev origins
       ]
   ```

4. **Redeploy Frontend** (to pick up the new `VITE_API_URL`)

### Step 9: Test the Setup

1. **Test Backend Health:**
   ```
   https://your-tunnel-url.trycloudflare.com/health
   ```

2. **Test from Frontend:**
   - Visit: https://imobile.kalhararashmitha.workers.dev
   - Try signing in
   - Check browser console for API calls

### Step 10: Keep It Running

**For Development:**
- Keep both terminals open
- Backend server must stay running
- Tunnel must stay running

**For Production:**
- Deploy backend to a VPS (DigitalOcean, Linode, etc.)
- Run tunnel as a service on the VPS
- Or use Option 2 (Workers) below

---

## 🎯 Option 2: Cloudflare Workers (Serverless)

Convert your Express backend to Cloudflare Workers for fully serverless deployment.

### Step 1: Install Dependencies

```powershell
npm install --save-dev @cloudflare/workers-types
npm install hono
```

### Step 2: Create Worker Entry Point

Create `src/worker/index.ts`:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleAuth } from './routes/auth'
import { handleApi } from './routes/api'

const app = new Hono()

// CORS
app.use('*', cors({
  origin: ['https://imobile.kalhararashmitha.workers.dev'],
  credentials: true,
}))

// Routes
app.route('/api/auth', handleAuth)
app.route('/api', handleApi)

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

export default app
```

### Step 3: Convert Express Routes

You'll need to convert each Express route handler to Hono format. This is more work but gives you:
- ✅ Fully serverless
- ✅ No server to manage
- ✅ Automatic scaling
- ✅ Global edge deployment

### Step 4: Create Wrangler Config for Worker

Create `wrangler.worker.jsonc`:

```jsonc
{
  "name": "imobile-backend",
  "main": "src/worker/index.ts",
  "compatibility_date": "2025-11-24",
  "vars": {
    "VITE_SUPABASE_URL": "https://jzdsgqdwpmfrrspxpehi.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "your_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
  }
}
```

### Step 5: Deploy Worker

```powershell
wrangler deploy --config wrangler.worker.jsonc
```

---

## 🎯 Quick Start Script (Tunnel)

Create `start-backend-tunnel.bat`:

```batch
@echo off
echo ========================================
echo Starting IMobile Backend with Tunnel
echo ========================================
echo.
echo Step 1: Starting Express backend...
start "Backend Server" cmd /k "npm run dev:server"
timeout /t 5 /nobreak >nul
echo.
echo Step 2: Starting Cloudflare Tunnel...
cloudflared tunnel --config cloudflare-tunnel-config.yml run
pause
```

---

## 🔧 Environment Variables

### For Backend (Local/Server):

Create `.env`:
```env
VITE_SUPABASE_URL=https://jzdsgqdwpmfrrspxpehi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
NODE_ENV=production
CLOUDFLARE_PAGES_URL=https://imobile.kalhararashmitha.workers.dev
```

### For Frontend (Cloudflare Pages):

Add in Cloudflare Dashboard:
- `VITE_API_URL` = Your tunnel URL or Worker URL
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### Tunnel Not Connecting?
- Check if backend is running: `curl http://localhost:4000/health`
- Verify tunnel config file path is correct
- Check Cloudflare dashboard for tunnel status

### CORS Errors?
- Update CORS in `src/server/index.ts` to include your frontend URL
- Make sure `credentials: true` is set

### API Calls Failing?
- Verify tunnel URL is correct
- Check backend logs
- Ensure environment variables are set
- Test backend directly: `https://your-tunnel-url/health`

### Tunnel URL Changes on Restart?
- Use DNS routing for a stable URL
- Or save the URL and update frontend env var

---

## 📚 Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/) (for Workers)

---

## 💡 Recommendation

**For now:** Use **Option 1 (Cloudflare Tunnel)** - it's the fastest way to get your backend online.

**Later:** Consider **Option 2 (Workers)** for a fully serverless solution, or deploy to a VPS for more control.

---

**Ready to start? Follow Option 1 steps above!** 🚀

