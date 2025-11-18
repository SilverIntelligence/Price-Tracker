# WSS Price Tracker - Reddit Devvit App

A comprehensive silver and gold price tracking application for r/WallStreetSilver, built on Reddit's Devvit platform.

## Features

### 🥈 Real-time Price Tracking
- Live XAGUSD (Silver) and XAUUSD (Gold) prices
- Percentage change from previous close
- Multiple timeframe views: 1m, 5m, 15m, 30m, 1h, 4h, Daily, Weekly

### 📊 Visual Charts
- Beautiful candlestick charts powered by QuickChart
- Historical price data visualization
- Responsive chart rendering

### 🏆 Community Leaderboard
- Daily top commenters by karma
- Automatic daily reset at midnight UTC
- Highlights top 3 contributors

### 🔗 Quick Navigation
- Direct links to community resources
- Discord, X (Twitter), YouTube integration
- "Call the Close" contest link
- Admin tools for moderators

### ⚙️ Smart Caching
- Redis-based caching for optimal performance
- Automatic cache warming every minute
- Configurable freshness thresholds per timeframe

## Installation

### Prerequisites

1. Install Devvit CLI globally:
```bash
npm install -g @devvit/cli
```

2. Login to Devvit:
```bash
devvit login
```

### Setup

1. Clone or create the project:
```bash
cd wss-price-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Configure your price API endpoint in `devvit.yaml` settings or use the mock data for testing.

### Development

Run the app locally in playtest mode:
```bash
devvit playtest
```

This will:
- Start a local development server
- Generate a QR code for mobile testing
- Show logs in real-time

### Deployment

1. Build the app:
```bash
npm run build
```

2. Upload to Reddit:
```bash
devvit upload
```

3. Deploy to your subreddit:
```bash
devvit deploy
```

Or visit the [Devvit Developer Portal](https://developers.reddit.com/) to manage deployments.

## Configuration

### App Settings

Configure these settings in the Reddit app settings panel:

- **default_asset**: Default asset to display (XAGUSD or XAUUSD)
- **links_discord**: Discord server invite URL
- **links_x**: X/Twitter profile URL
- **links_youtube**: YouTube channel URL
- **price_api_url**: Base URL for your price data API

### API Integration

The app currently uses mock data for development. To integrate with a real price API:

1. Choose a provider:
   - [Metals.dev](https://metals.dev/) - Precious metals API
   - [TwelveData](https://twelvedata.com/) - Financial data API
   - [Finnhub](https://finnhub.io/) - Stock market API
   - Custom proxy server

2. Update `src/prices.ts`:
   - Modify `buildApiUrl()` to match your API's format
   - Update `parseApiResponse()` to handle your API's response structure
   - Replace mock data calls with actual fetch calls (see commented code)

3. Add API key as a Devvit secret:
```bash
devvit secrets set PRICE_API_KEY your_api_key_here
```

## Project Structure

```
wss-price-tracker/
├── devvit.yaml           # App configuration and permissions
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── main.ts          # App entry point and routing
│   ├── types.ts         # TypeScript type definitions
│   ├── prices.ts        # Price fetching and caching logic
│   ├── chart.ts         # Chart image generation
│   ├── ui.ts            # UI components and rendering
│   ├── menus.ts         # Navigation menu configuration
│   ├── leaderboard.ts   # Leaderboard calculation
│   └── scheduler.ts     # Scheduled jobs and cache warming
└── README.md            # This file
```

## Usage

### For Subreddit Moderators

#### Create Daily Thread
1. Go to your subreddit
2. Click the mod menu (three dots)
3. Select "📊 Create Daily Metals Thread"
4. A new pinned discussion thread will be created

#### Clear Cache
1. Go to your subreddit
2. Click the mod menu
3. Select "🔄 Clear Price Cache"
4. All cached price data will be refreshed

### For Users

#### View Price Tracker
- The price tracker appears as a custom card in posts
- Click timeframe buttons (1m, 5m, etc.) to change the chart period
- Toggle between Silver (🥈) and Gold (🥇)
- Access quick links to community resources

#### View Leaderboard
- Click "📊 View Leaderboard" button
- See today's top contributors
- Resets daily at midnight UTC

## Caching Strategy

The app uses intelligent caching to balance freshness and performance:

| Timeframe | Cache Duration | Update Frequency |
|-----------|---------------|------------------|
| 1m        | 30 seconds    | 30s              |
| 5m        | 1 minute      | 1min             |
| 15m       | 2 minutes     | 2min             |
| 30m       | 5 minutes     | 5min             |
| 1h        | 10 minutes    | 10min            |
| 4h        | 30 minutes    | 30min            |
| Daily     | 30 minutes    | 30min            |
| Weekly    | 1 hour        | 1hr              |

A scheduled job runs every minute to warm the cache for popular views.

## Troubleshooting

### "Failed to load price data"
- Check your API configuration in settings
- Verify API key is set correctly
- Check console logs for specific error messages
- Try clearing the cache using the mod menu

### Charts not displaying
- Verify QuickChart is accessible (not blocked by firewall)
- Check chart URL generation in `src/chart.ts`
- Ensure candle data is being fetched correctly

### Leaderboard empty
- Leaderboard resets at midnight UTC
- Requires recent comment activity in the subreddit
- Check console logs for processing errors

## Development Notes

### Using Mock Data

The app currently uses generated mock data in `src/prices.ts`. This is perfect for:
- Local development and testing
- Demo purposes
- Understanding the data structure

To see mock data generation, check the `generateMockData()` function.

### Implementing Real API

When ready for production:

1. Uncomment the fetch code in `src/prices.ts` (lines marked "Production code")
2. Update `buildApiUrl()` for your API's endpoint format
3. Update `parseApiResponse()` to match your API's response structure
4. Set your API key using `devvit secrets set`

### Rate Limiting

If using a free API tier:
- The caching system minimizes API calls
- Cache warming fetches ~10 endpoints per minute
- Adjust `FRESH_MS` in `prices.ts` to increase cache duration
- Consider limiting warmed intervals in `scheduler.ts`

## Contributing

This is an open-source project. Contributions welcome!

### Roadmap Ideas
- [ ] Technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Price alerts and notifications
- [ ] Historical data export
- [ ] Multi-currency support (EUR, GBP, etc.)
- [ ] Integration with dealer prices
- [ ] Stack calculator (oz to $ conversion)

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: [Create an issue](https://github.com/yourusername/wss-price-tracker/issues)
- Reddit: r/WallStreetSilver
- Discord: [WSS Discord](https://discord.gg/wallstreetsilver)

## Acknowledgments

- Built with [Reddit Devvit](https://developers.reddit.com/)
- Charts powered by [QuickChart](https://quickchart.io/)
- Created for the [r/WallStreetSilver](https://reddit.com/r/WallStreetSilver) community

---

**Stack on!** 🦍🥈🥇
