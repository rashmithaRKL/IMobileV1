# Fix Cloudflare Pages Deployment

## The Problem

Your build is succeeding, but the deploy command is trying to use `wrangler deploy` which is for **Cloudflare Workers**, not **Cloudflare Pages**.

## The Solution

You need to configure this as a **Cloudflare Pages** project, not a Worker.

### Step 1: Go to Cloudflare Pages (Not Workers)

1. Go to: https://dash.cloudflare.com/
2. Click **"Workers & Pages"** in the sidebar
3. Click **"Create application"** → **"Pages"** (NOT Workers)
4. Click **"Connect to Git"**

### Step 2: Configure Build Settings

When setting up your Pages project:

**Build Settings:**
- **Framework preset**: `Vite` (or `None`)
- **Build command**: `npm run build`
- **Deploy command**: `npm run deploy` (or `wrangler pages deploy dist`)
- **Build output directory**: `dist`
- **Root directory**: `/` (leave as default)

**IMPORTANT:**
- Use `wrangler pages deploy dist` for Pages (NOT `wrangler deploy` which is for Workers)
- Or use the npm script: `npm run deploy` which runs `wrangler pages deploy dist`
- The difference: `wrangler deploy` = Workers, `wrangler pages deploy` = Pages

### Step 3: Environment Variables

Add these in **Settings → Environment variables**:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: If You Already Created a Worker Project

If you already created it as a Worker:

1. **Option A: Delete and Recreate as Pages**
   - Delete the current Worker project
   - Create a new Pages project
   - Connect the same GitHub repo

2. **Option B: Update Build Settings**
   - Go to your project → Settings → Build
   - **Change** the "Deploy command" from `npx wrangler deploy` to `npm run deploy` (or `wrangler pages deploy dist`)
   - Set "Build output directory" to `dist`
   - Save changes

### Step 5: Verify Configuration

Your build configuration should look like this:

```
Build command: npm run build
Deploy command: npm run deploy
Build output directory: dist
Root directory: /
```

**OR** if you prefer the direct command:

```
Build command: npm run build
Deploy command: wrangler pages deploy dist
Build output directory: dist
Root directory: /
```

## Why This Happens

- **Cloudflare Workers**: For serverless functions (needs `wrangler deploy`)
- **Cloudflare Pages**: For static sites (automatically deploys build output)

Your Vite app builds to a static `dist` folder, so it should use **Pages**, not Workers.

## After Fixing

Once you remove the deploy command and set the output directory to `dist`, your next deployment should:
1. ✅ Build successfully (already working)
2. ✅ Automatically deploy the `dist` folder to Pages
3. ✅ Give you a URL like: `https://imobile-v1.pages.dev`

