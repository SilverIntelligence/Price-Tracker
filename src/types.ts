/**
 * Time interval types for price data
 */
export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'D' | 'W';

/**
 * OHLC candlestick data point
 */
export interface Candle {
  t: number;  // timestamp (ms)
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
}

/**
 * Complete price feed with current data and historical candles
 */
export interface PriceFeed {
  symbol: string;
  interval: Interval;
  last: number;      // current/last price
  prevClose: number; // previous close for % change calculation
  candles: Candle[];
}

/**
 * Supported precious metal assets
 */
export type Asset = 'XAGUSD' | 'XAUUSD';

/**
 * Leaderboard entry for top users
 */
export interface LeaderboardRow {
  user: string;
  comments: number;
  karma: number;
}

/**
 * Navigation menu link configuration
 */
export interface MenuLink {
  icon: string;
  label: string;
  url: string;
}
