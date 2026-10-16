# Deploying to Cloudflare Pages

## The Problem

Your Cloudflare Pages build is failing because:
1. No build command is configured (it's trying to run `npx wrangler deploy` which is for Workers, not Pages)
2. No dependencies are being installed
3. No build output is being generated

## The Fix

### Option 1: Configure in Cloudflare Pages Dashboard (Recommended)

1. Go to your Cloudflare Pages project settings
2. Under **Builds & deployments**, update these settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)
   - **Node.js version**: `20`
3. **Remove** any custom deploy command (like `npx wrangler deploy`)
4. Trigger a new deployment

### Option 2: Using Wrangler CLI (for local deploys)

If you want to deploy from your terminal:

```bash
# Install wrangler globally (one time)
npm install -g wrangler

# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### Option 3: Using GitHub/GitLab Integration

1. Push this code to GitHub/GitLab
2. In Cloudflare Pages, connect your repository
3. Cloudflare should auto-detect Vite, but if not:
   - Framework preset: **Vite** (or None)
   - Build command: `npm run build`
   - Build output directory: `dist`

## Verification

After deployment, your site should be live at:
- `https://your-project.pages.dev`

## Troubleshooting

### "No build output detected"
- Make sure build command is `npm run build`
- Make sure output directory is `dist`

### "No dependencies detected"
- Make sure `package.json` exists in your repo root
- Cloudflare should auto-detect and run `npm install`

### Build succeeds but site shows blank page
- Check browser console for errors
- Verify `dist/index.html` exists after build
- The `_redirects` file in `public/` handles SPA routing

## What's Included

This project includes:
- ✅ `public/_redirects` - SPA routing for Cloudflare Pages
- ✅ `.node-version` - Specifies Node.js 20
- ✅ Proper Vite build configuration
- ✅ Material Design 3 compliant UI

## Quick Deploy Checklist

- [ ] Build command set to `npm run build`
- [ ] Output directory set to `dist`
- [ ] No custom deploy command (remove `npx wrangler deploy`)
- [ ] Node.js version set to 20
- [ ] Trigger new deployment
