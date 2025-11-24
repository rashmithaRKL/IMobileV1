# Deploying IMobile V1 to Cloudflare (Without Domain)

This guide will help you deploy your Vite + Express application to Cloudflare using **Cloudflare Pages** (frontend) and **Cloudflare Tunnel** (backend).

## 📋 Prerequisites

1. **Cloudflare Account** (free tier works)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **Cloudflare Tunnel (cloudflared)**
   - Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   - Or install via package manager:
     ```bash
     # Windows (using Chocolatey)
     choco install cloudflared
     
     # Or download from GitHub releases
     # https://github.com/cloudflare/cloudflared/releases
     ```

## 🚀 Deployment Steps

### Step 1: Build Your Frontend

First, build your Vite application:

```bash
npm run build
```

This creates a `dist/` folder with your static files.

### Step 2: Deploy Frontend to Cloudflare Pages

#### Option A: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Click on **"Workers & Pages"** in the sidebar
   - Click **"Create application"** → **"Pages"** → **"Connect to Git"**

2. **Connect Your GitHub Repository**
   - Select your GitHub account
   - Choose repository: `rashmithaRKL/IMobileV1`
   - Click **"Begin setup"**

3. **Configure Build Settings**
   - **Project name**: `imobile-v1` (or any name you prefer)
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave as default)

4. **Environment Variables**
   Add these in the **"Environment variables"** section:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**
   - Click **"Save and Deploy"**
   - Your site will be available at: `https://imobile-v1.pages.dev` (or similar)

#### Option B: Using Wrangler CLI (Alternative)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=imobile-v1
   ```

### Step 3: Deploy Backend Using Cloudflare Tunnel

Since Cloudflare Pages only hosts static files, you need to run your Express backend separately. Use Cloudflare Tunnel to expose it.

#### Setup Cloudflare Tunnel

1. **Authenticate Cloudflared**
   ```bash
   cloudflared tunnel login
   ```
   - This will open a browser window
   - Select your Cloudflare account
   - Authorize the tunnel

2. **Create a Tunnel**
   ```bash
   cloudflared tunnel create imobile-backend
   ```
   - Note the Tunnel ID that's displayed

3. **Create a Configuration File**

   Create a file: `cloudflare-tunnel-config.yml`
   
   ```yaml
   tunnel: <YOUR_TUNNEL_ID>
   credentials-file: C:\Users\<YOUR_USERNAME>\.cloudflared\<TUNNEL_ID>.json
   
   ingress:
     # Backend API
     - hostname: imobile-backend.your-account.workers.dev
       service: http://localhost:4000
     
     # Catch-all rule (must be last)
     - service: http_status:404
   ```

   **Note**: Replace `<YOUR_TUNNEL_ID>` with the ID from step 2.

4. **Route the Tunnel to Cloudflare**

   ```bash
   cloudflared tunnel route dns imobile-backend imobile-backend.your-account.workers.dev
   ```

   **Alternative**: If you don't have a domain, you can use Cloudflare's free subdomain:
   ```bash
   cloudflared tunnel route dns imobile-backend <random-name>.trycloudflare.com
   ```

5. **Run the Tunnel**

   ```bash
   cloudflared tunnel --config cloudflare-tunnel-config.yml run
   ```

   Or run it as a service (Windows):
   ```bash
   cloudflared service install
   cloudflared tunnel run
   ```

### Step 4: Update Frontend API URLs

After deploying, update your frontend to use the tunnel URL for API calls.

1. **Update Vite Config** (if needed)
   
   In `vite.config.ts`, update the proxy target:
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'https://imobile-backend.your-account.workers.dev',
         changeOrigin: true,
       }
     }
   }
   ```

2. **Or Update Environment Variables**

   In Cloudflare Pages dashboard, add:
   ```
   VITE_API_URL=https://imobile-backend.your-account.workers.dev
   ```

### Step 5: Keep Backend Running

Your backend needs to stay running. Options:

#### Option A: Run Locally (Development)
- Keep your computer on
- Run: `npm run dev:server`
- Keep the Cloudflare Tunnel running

#### Option B: Deploy to a VPS/Server
- Deploy backend to a VPS (DigitalOcean, Linode, etc.)
- Run Cloudflare Tunnel on the VPS
- Backend stays online 24/7

#### Option C: Use Cloudflare Workers (Advanced)
- Convert Express routes to Cloudflare Workers
- More complex but fully serverless

## 🔧 Alternative: Full Serverless with Cloudflare Workers

If you want everything on Cloudflare without managing servers:

1. **Convert Express API to Cloudflare Workers**
   - Workers have limitations (no file system, different runtime)
   - Requires refactoring your Express code

2. **Use Cloudflare D1 Database** (instead of Supabase)
   - Or keep Supabase and call it from Workers

3. **Deploy Workers**
   ```bash
   wrangler deploy
   ```

## 📝 Quick Start Script

Create a file `start-cloudflare-tunnel.bat` (Windows):

```batch
@echo off
echo Starting Cloudflare Tunnel for IMobile Backend...
echo Make sure your backend is running on port 4000
echo.
cloudflared tunnel --config cloudflare-tunnel-config.yml run
pause
```

## 🌐 Accessing Your Application

After deployment:

- **Frontend**: `https://imobile-v1.pages.dev` (or your custom subdomain)
- **Backend API**: `https://imobile-backend.your-account.workers.dev` (or tunnel URL)

## 🔐 Environment Variables Setup

### In Cloudflare Pages Dashboard:

1. Go to your Pages project
2. Settings → Environment variables
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend tunnel URL)

### For Backend (Local/Server):

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
NODE_ENV=production
```

## 🐛 Troubleshooting

### Tunnel Not Connecting?
- Check if backend is running: `curl http://localhost:4000/health`
- Verify tunnel config file path
- Check Cloudflare dashboard for tunnel status

### CORS Errors?
- Update CORS in `src/server/index.ts` to allow your Pages domain
- Add: `origin: 'https://imobile-v1.pages.dev'`

### API Calls Failing?
- Verify tunnel URL is correct
- Check backend logs
- Ensure environment variables are set

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## 💡 Pro Tips

1. **Free Tier Limits**:
   - Pages: Unlimited requests
   - Tunnel: Free, but requires your server to be running
   - Workers: 100,000 requests/day free

2. **Custom Domain Later**:
   - You can add a custom domain anytime in Cloudflare dashboard
   - Just point DNS to your Pages project

3. **Monitoring**:
   - Use Cloudflare Analytics to monitor traffic
   - Check tunnel logs: `cloudflared tunnel info`

---

**Note**: Cloudflare Tunnel is perfect for development and small projects. For production, consider deploying your backend to a VPS or converting to Cloudflare Workers for full serverless architecture.

