export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'D' | 'W';
export type Asset = 'XAGUSD' | 'XAUUSD';

export interface Candle {
  t: number; // timestamp (ms)
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
}

export interface PriceFeed {
  symbol: Asset;
  interval: Interval;
  candles: Candle[];
  last: number;
  prevClose: number;
}
