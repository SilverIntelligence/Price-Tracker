# Deployment Guide - WSS Price Tracker

This guide will walk you through deploying the WSS Price Tracker Devvit app to Reddit.

## Prerequisites

1. **Node.js & npm** installed (v18+ recommended)
2. **Devvit CLI** installed globally:
   ```bash
   npm install -g devvit
   ```
3. **Reddit Developer Account** with access to the Devvit platform

## Step 1: Install Dependencies

```bash
cd /path/to/wss-price-tracker
npm install
```

## Step 2: Login to Devvit

```bash
devvit login
```

This will open a browser window to authenticate with your Reddit account.

## Step 3: Test Locally (Optional)

Run the app in playtest mode to test locally:

```bash
npm run dev
# or
devvit playtest
```

This will:
- Start a local development server
- Generate a QR code for mobile testing
- Show real-time logs

## Step 4: Build the App

```bash
npm run build
# or
devvit build
```

This compiles the TypeScript code and prepares the app for deployment.

## Step 5: Upload to Devvit

```bash
npm run upload
# or
devvit upload
```

This uploads your app to Reddit's Devvit platform. You'll receive a confirmation with your app ID.

## Step 6: Install on Your Subreddit

### Option A: Via Devvit Dashboard

1. Visit [Reddit Devvit Apps](https://developers.reddit.com/apps)
2. Find "WSS Price Tracker" in your apps list
3. Click "Install"
4. Select `r/WallStreetSilver` (or your target subreddit)
5. Confirm installation

### Option B: Via CLI

```bash
devvit install <app-name> <subreddit-name>
```

## Step 7: Configure App Settings

1. Go to your subreddit's **Mod Tools**
2. Navigate to **Apps**
3. Find **WSS Price Tracker**
4. Click **Settings**
5. Configure:
   - **default_asset**: `XAGUSD` or `XAUUSD`
   - **links_discord**: Your Discord invite URL
   - **links_x**: Your X/Twitter profile URL
   - **links_youtube**: Your YouTube channel URL
   - **price_api_url**: Your price API endpoint (optional)

## Step 8: Create a Price Tracker Post

### Option A: Use Mod Menu

1. Open your subreddit
2. Click the mod menu (three dots)
3. Select "Create Daily Metals Thread"
4. The app will create and pin a new post

### Option B: Manual Custom Post

1. Create a new post on your subreddit
2. Select "Price Tracker" as the post type
3. Submit the post
4. The price card will appear automatically

## Step 9: API Integration (Production)

The app currently uses mock data. To integrate with a real price API:

### Choose a Price Data Provider

- **[Metals.dev](https://metals.dev/)** - Precious metals API
- **[TwelveData](https://twelvedata.com/)** - Financial data API
- **[Finnhub](https://finnhub.io/)** - Stock market API
- **Custom proxy** - Your own API server

### Update Code

1. Edit `src/prices.ts`:
   - Line 63: Update `buildApiUrl()` to match your API format
   - Line 78: Update `parseApiResponse()` to handle your API's response
   - Line 143: Uncomment the production fetch code
   - Line 143: Comment out `generateMockData()` call

Example for TwelveData:

```typescript
function buildApiUrl(symbol: Asset, interval: Interval, limit: number = 120): string {
  return `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${limit}&apikey=YOUR_API_KEY`;
}
```

### Set API Key as Secret

```bash
devvit secrets set PRICE_API_KEY your_actual_api_key_here
```

Then update `src/prices.ts` to read the secret:

```typescript
const apiKey = await context.settings.get('PRICE_API_KEY');
```

### Redeploy

```bash
npm run build
devvit upload
```

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript compilation errors

```bash
npx tsc --noEmit
```

Fix any reported errors before uploading.

### "Failed to load price data"

- Check API configuration in app settings
- Verify API key is set correctly
- Check console logs: `devvit logs <app-id>`
- Try clearing the cache via mod menu

### Charts not displaying

- Verify QuickChart.io is accessible
- Check chart URL generation in browser dev tools
- Ensure candle data format is correct

### App not showing in mod menu

- Refresh the page
- Clear browser cache
- Reinstall the app
- Check app permissions in devvit.yaml

## Updating the App

When you make changes to the code:

1. Test locally: `devvit playtest`
2. Build: `npm run build`
3. Upload: `devvit upload`
4. The app will auto-update on your subreddit

## Monitoring

View app logs:

```bash
devvit logs <your-app-id>
```

View real-time logs during playtest:

```bash
devvit playtest
```

## Uninstalling

To remove the app from your subreddit:

1. Go to Mod Tools → Apps
2. Find WSS Price Tracker
3. Click "Uninstall"
4. Confirm removal

Or via CLI:

```bash
devvit uninstall <app-name> <subreddit-name>
```

## Support

- **Documentation**: [Devvit Docs](https://developers.reddit.com/docs)
- **Community**: [r/Devvit](https://reddit.com/r/Devvit)
- **Issues**: [GitHub Issues](https://github.com/yourusername/wss-price-tracker/issues)

## Production Checklist

Before going live:

- [ ] Real API integrated and tested
- [ ] API keys stored as secrets
- [ ] Error handling tested
- [ ] Rate limiting configured
- [ ] Cache settings optimized
- [ ] Links and URLs verified
- [ ] Tested on mobile and desktop
- [ ] Mod tools tested
- [ ] Daily thread creation tested
- [ ] Leaderboard functionality verified

---

**Need help?** Ask in r/WallStreetSilver or r/Devvit!
