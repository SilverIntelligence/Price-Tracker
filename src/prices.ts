import { Devvit } from '@devvit/public-api';
import { Asset, Interval, PriceFeed, Candle } from './types.js';

const KV_PREFIX = 'wss-prices';

/**
 * Cache freshness thresholds per interval (in milliseconds)
 * Data older than these thresholds will trigger a new fetch
 */
const FRESH_MS: Record<Interval, number> = {
  '1m': 30_000,      // 30 seconds
  '5m': 60_000,      // 1 minute
  '15m': 2 * 60_000, // 2 minutes
  '30m': 5 * 60_000, // 5 minutes
  '1h': 10 * 60_000, // 10 minutes
  '4h': 30 * 60_000, // 30 minutes
  'D': 30 * 60_000,  // 30 minutes
  'W': 60 * 60_000,  // 1 hour
};

/**
 * Build API URL for fetching price data
 * This is a generic implementation - customize based on your API provider
 */
function buildApiUrl(
  symbol: Asset,
  interval: Interval,
  limit: number = 120,
  baseUrl: string = 'https://api.metals.dev/v1'
): string {
  // Example format - adjust based on your actual API
  // For a real implementation, you might use:
  // - TwelveData: https://api.twelvedata.com/time_series
  // - Metals.dev: https://api.metals.dev/v1/latest
  // - Your own proxy service

  const params = new URLSearchParams({
    symbol,
    interval,
    outputsize: limit.toString(),
  });

  return `${baseUrl}/timeseries?${params.toString()}`;
}

/**
 * Parse API response into PriceFeed format
 * Adjust this based on your actual API response structure
 */
function parseApiResponse(data: any, symbol: Asset, interval: Interval): PriceFeed {
  // Example parsing - customize for your API
  // This assumes a response like:
  // { values: [{datetime, open, high, low, close}], meta: {...} }

  try {
    const candles: Candle[] = (data.values || []).map((v: any) => ({
      t: new Date(v.datetime).getTime(),
      o: parseFloat(v.open),
      h: parseFloat(v.high),
      l: parseFloat(v.low),
      c: parseFloat(v.close),
    }));

    const last = candles.length > 0 ? candles[0].c : 0;
    const prevClose = candles.length > 1 ? candles[1].c : last;

    return {
      symbol,
      interval,
      last,
      prevClose,
      candles: candles.reverse(), // oldest to newest
    };
  } catch (error) {
    console.error('Error parsing API response:', error);
    // Return mock data on parse error
    return generateMockData(symbol, interval);
  }
}

/**
 * Generate mock data for development/testing
 */
function generateMockData(symbol: Asset, interval: Interval): PriceFeed {
  const basePrice = symbol === 'XAGUSD' ? 31.5 : 2650.0;
  const now = Date.now();
  const intervalMs = getIntervalMs(interval);
  const candles: Candle[] = [];

  for (let i = 120; i >= 0; i--) {
    const t = now - i * intervalMs;
    const volatility = basePrice * 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice + change;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({ t, o: open, h: high, l: low, c: close });
  }

  const last = candles[candles.length - 1].c;
  const prevClose = candles[candles.length - 2].c;

  return { symbol, interval, last, prevClose, candles };
}

/**
 * Convert interval string to milliseconds
 */
function getIntervalMs(interval: Interval): number {
  const map: Record<Interval, number> = {
    '1m': 60_000,
    '5m': 5 * 60_000,
    '15m': 15 * 60_000,
    '30m': 30 * 60_000,
    '1h': 60 * 60_000,
    '4h': 4 * 60 * 60_000,
    'D': 24 * 60 * 60_000,
    'W': 7 * 24 * 60 * 60_000,
  };
  return map[interval];
}

/**
 * Get price feed with KV caching
 * Checks cache first, fetches from API if stale or missing
 */
export async function getFeed(
  symbol: Asset,
  interval: Interval,
  context: Devvit.Context
): Promise<PriceFeed> {
  const key = `${KV_PREFIX}:${symbol}:${interval}`;
  const now = Date.now();

  try {
    // Check cache
    const cached = await context.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached) as PriceFeed & { ts: number };
      const age = now - data.ts;

      if (age < FRESH_MS[interval]) {
        console.log(`Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
        const { ts, ...feed } = data;
        return feed;
      }
    }

    console.log(`Cache miss or stale for ${key}, fetching...`);

    // Fetch from API
    const apiUrl = await context.settings.get<string>('price_api_url');
    const url = buildApiUrl(symbol, interval, 120, apiUrl || undefined);

    // For development, use mock data
    // In production, uncomment the fetch code below
    console.log(`Would fetch from: ${url}`);
    const feed = generateMockData(symbol, interval);

    /* Production code:
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${await context.settings.get('PRICE_API_KEY')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const feed = parseApiResponse(data, symbol, interval);
    */

    // Cache the result
    await context.redis.set(key, JSON.stringify({ ...feed, ts: now }), {
      expiration: new Date(now + FRESH_MS[interval] * 2),
    });

    return feed;
  } catch (error) {
    console.error(`Error fetching price feed for ${symbol}/${interval}:`, error);

    // Try to return cached data even if stale
    const cached = await context.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached) as PriceFeed & { ts: number };
      const { ts, ...feed } = data;
      console.log('Returning stale cached data due to error');
      return feed;
    }

    // Last resort: return mock data
    console.log('Returning mock data due to error and no cache');
    return generateMockData(symbol, interval);
  }
}

/**
 * Clear all cached price data
 * Useful for admin operations
 */
export async function clearCache(context: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];

  for (const symbol of symbols) {
    for (const interval of intervals) {
      const key = `${KV_PREFIX}:${symbol}:${interval}`;
      await context.redis.del(key);
    }
  }

  console.log('Cache cleared');
}
