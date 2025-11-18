import { Devvit } from '@devvit/public-api';
import { Asset, Interval, Candle, PriceFeed } from './types.js';

const KV_NS = 'price-cache';
const FRESH_MS: Record<Interval, number> = {
  '1m': 30_000,
  '5m': 60_000,
  '15m': 120_000,
  '30m': 300_000,
  '1h': 600_000,
  '4h': 1_800_000,
  'D': 1_800_000,
  'W': 3_600_000,
};

const asFeed = (symbol: Asset, interval: Interval, series: Candle[]): PriceFeed => {
  const last = series.at(-1)?.c ?? 0;
  const prev = series.at(-2)?.c ?? last;
  return { symbol, interval, candles: series, last, prevClose: prev };
};

async function fetchMetalsDev(
  symbol: Asset,
  interval: Interval,
  ctx: Devvit.Context
): Promise<PriceFeed> {
  const key = await ctx.secrets.get('METALS_DEV_KEY');
  const base = ((await ctx.settings.get('price_api_url')) as string) ?? 'https://api.metals.dev/v1';
  const end = Math.floor(Date.now() / 1000);
  const lookback =
    interval === '1m' || interval === '5m' || interval === '15m' ? 120 * 15 * 60 : 365 * 24 * 60 * 60;
  const start = end - lookback;
  const url = `${base}/timeseries?symbol=${symbol}&interval=${interval}&start_date=${start}&end_date=${end}`;
  const res = await fetch(url, { headers: { 'x-api-key': key! } });
  if (!res.ok) throw new Error(`metals.dev ${res.status}`);
  const js = await res.json();
  const series: Candle[] = (js.data ?? []).map((r: any) => ({
    t: r.t * 1000,
    o: r.o,
    h: r.h,
    l: r.l,
    c: r.c,
  }));
  return asFeed(symbol, interval, series);
}

async function fetchMetalsAPI(
  symbol: Asset,
  interval: Interval,
  ctx: Devvit.Context
): Promise<PriceFeed> {
  const key = await ctx.secrets.get('METALS_API_KEY');
  const base = ((await ctx.settings.get('price_api_url')) as string) ?? 'https://metals-api.com';
  const now = Date.now();
  const start = new Date(now - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const end = new Date(now).toISOString().slice(0, 10);
  const metal = symbol === 'XAGUSD' ? 'XAG' : 'XAU';
  const url = `${base}/api/timeseries?base=USD&symbols=${metal}&start_date=${start}&end_date=${end}&apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metals-api ${res.status}`);
  const js = await res.json();
  const pts = Object.entries(js.rates ?? {})
    .map(([iso, obj]: any) => {
      const v = obj[metal];
      const t = Date.parse(String(iso));
      return { t, o: v, h: v, l: v, c: v };
    })
    .sort((a, b) => a.t - b.t);
  return asFeed(symbol, interval, pts as Candle[]);
}

export async function getFeed(
  symbol: Asset,
  interval: Interval,
  ctx: Devvit.Context
): Promise<PriceFeed> {
  const k = `${symbol}:${interval}`;
  const now = Date.now();
  const cached = await ctx.kv.get<{ ts: number; feed: PriceFeed }>(KV_NS, k);
  if (cached && now - cached.ts < FRESH_MS[interval]) return cached.feed;

  const provider = ((await ctx.settings.get('price_api')) as string) ?? 'METALS_DEV';
  const feed =
    provider === 'METALS_API'
      ? await fetchMetalsAPI(symbol, interval, ctx)
      : await fetchMetalsDev(symbol, interval, ctx);

  await ctx.kv.set(KV_NS, k, { ts: now, feed });
  return feed;
}

export async function clearCache(ctx: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];

  for (const symbol of symbols) {
    for (const interval of intervals) {
      const key = `${symbol}:${interval}`;
      await ctx.kv.del(KV_NS, key);
    }
  }

  console.log('Cache cleared');
}
