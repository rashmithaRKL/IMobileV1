# 🚀 Quick Cloudflare Tunnel Setup

## ✅ Cloudflare Tunnel is Installed!

You have `cloudflared.exe` in `C:\cloudflared`. Use it with the full path.

## Option 1: Use Full Path (Quick Start)

Just use `C:\cloudflared\cloudflared.exe` instead of `cloudflared`:

```powershell
# Authenticate
C:\cloudflared\cloudflared.exe tunnel login

# Create tunnel
C:\cloudflared\cloudflared.exe tunnel create imobile-backend

# Run tunnel
C:\cloudflared\cloudflared.exe tunnel --config cloudflare-tunnel-config.yml run
```

## Option 2: Add to PATH (Recommended)

So you can use just `cloudflared`:

1. **Press `Win + R`** → type: `sysdm.cpl` → Press Enter
2. Click **"Advanced"** tab
3. Click **"Environment Variables"**
4. Under **"System variables"**, find **"Path"** → Click **"Edit"**
5. Click **"New"** → Type: `C:\cloudflared`
6. Click **"OK"** on all windows
7. **Close and reopen PowerShell**

Then you can use:
```powershell
cloudflared --version
cloudflared tunnel login
```

## 🎯 Next Steps

### Step 1: Authenticate

```powershell
C:\cloudflared\cloudflared.exe tunnel login
```

This will:
- Open your browser
- Ask you to select your Cloudflare account
- Authorize the tunnel

### Step 2: Create Tunnel

```powershell
C:\cloudflared\cloudflared.exe tunnel create imobile-backend
```

**Note the Tunnel ID** that appears (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 3: Create Config File

Create `cloudflare-tunnel-config.yml` in your project root:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: C:\Users\<YOUR_USERNAME>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: imobile-backend.kalhararashmitha.workers.dev
    service: http://localhost:4000
  - service: http_status:404
```

**Replace:**
- `<YOUR_TUNNEL_ID>` with the ID from Step 2
- `<YOUR_USERNAME>` with your Windows username

### Step 4: Start Backend and Tunnel

**Terminal 1 - Start Backend:**
```powershell
cd "F:\Client IMobile\IMobile\New folder\New folder\v0-e-commerce-website-build-main"
npm run dev:server
```

**Terminal 2 - Start Tunnel:**
```powershell
cd "F:\Client IMobile\IMobile\New folder\New folder\v0-e-commerce-website-build-main"
C:\cloudflared\cloudflared.exe tunnel --config cloudflare-tunnel-config.yml run
```

You'll see a URL like: `https://xxxxx-xxxx-xxxx.trycloudflare.com`

**Copy this URL** - this is your backend API URL!

### Step 5: Update Frontend

1. Go to Cloudflare Dashboard → Workers & Pages → imobile → Settings
2. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: Your tunnel URL (from Step 4)
3. Redeploy frontend

---

## 🎉 Done!

Your backend will be accessible at the tunnel URL!

