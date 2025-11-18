import { Candle } from './types.js';

export function chartImageUrl(candles: Candle[], w = 1000, h = 600): string {
  const labels = candles.map((c) => c.t);
  const ohlc = candles.map((c) => [c.o, c.h, c.l, c.c]);
  const cfg = {
    type: 'candlestick',
    data: { labels, datasets: [{ data: ohlc }] },
    options: { plugins: { legend: { display: false } } },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(cfg))}&w=${w}&h=${h}&format=png`;
}
