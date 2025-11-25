# 📥 Install Cloudflare Tunnel on Windows

## Option 1: Direct Download (Easiest - Recommended)

### Step 1: Download Cloudflare Tunnel

1. **Visit the releases page:**
   - https://github.com/cloudflare/cloudflared/releases/latest

2. **Download for Windows:**
   - Look for: `cloudflared-windows-amd64.exe` (or `cloudflared-windows-386.exe` for 32-bit)
   - Click to download

### Step 2: Install

**Option A: Add to PATH (Recommended)**

1. **Create a folder for cloudflared:**
   ```powershell
   mkdir C:\cloudflared
   ```

2. **Move the downloaded file:**
   - Move `cloudflared-windows-amd64.exe` to `C:\cloudflared\`
   - Rename it to `cloudflared.exe`

3. **Add to PATH:**
   - Press `Win + X` → **System** → **Advanced system settings**
   - Click **Environment Variables**
   - Under **System variables**, find **Path** → Click **Edit**
   - Click **New** → Add: `C:\cloudflared`
   - Click **OK** on all windows

4. **Verify installation:**
   ```powershell
   # Close and reopen PowerShell, then:
   cloudflared --version
   ```

**Option B: Use from Downloads folder**

1. **Move to a permanent location:**
   ```powershell
   # Create folder
   mkdir C:\cloudflared
   
   # Move the downloaded file (adjust path if needed)
   move $env:USERPROFILE\Downloads\cloudflared-windows-amd64.exe C:\cloudflared\cloudflared.exe
   ```

2. **Use full path when running:**
   ```powershell
   C:\cloudflared\cloudflared.exe --version
   ```

---

## Option 2: Using Chocolatey (If you want to install it)

### Install Chocolatey First

1. **Open PowerShell as Administrator:**
   - Right-click **PowerShell** → **Run as Administrator**

2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

3. **Verify Chocolatey:**
   ```powershell
   choco --version
   ```

4. **Install Cloudflare Tunnel:**
   ```powershell
   choco install cloudflared
   ```

---

## Option 3: Using Winget (Windows Package Manager)

If you have Windows 10/11 with winget:

```powershell
winget install --id Cloudflare.cloudflared
```

---

## ✅ Verify Installation

After installation, verify it works:

```powershell
cloudflared --version
```

You should see something like:
```
cloudflared version 2024.x.x (built YYYY-MM-DD)
```

---

## 🚀 Next Steps

Once installed, continue with the backend deployment:

1. **Authenticate:**
   ```powershell
   cloudflared tunnel login
   ```

2. **Create tunnel:**
   ```powershell
   cloudflared tunnel create imobile-backend
   ```

3. **Follow the guide:** `CLOUDFLARE_BACKEND_DEPLOY.md`

---

## 🐛 Troubleshooting

### "cloudflared is not recognized"

- Make sure you added it to PATH and restarted PowerShell
- Or use the full path: `C:\cloudflared\cloudflared.exe`

### "Access denied" or permission errors

- Run PowerShell as Administrator
- Check file permissions on the cloudflared.exe file

### Download issues

- Try downloading from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
- Or use the direct GitHub releases page

---

**Recommended: Use Option 1 (Direct Download) - it's the simplest!** 📥

