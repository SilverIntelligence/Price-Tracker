import { Candle } from './types.js';

/**
 * Generate a candlestick chart image URL using QuickChart
 *
 * @param candles - Array of OHLC candle data
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param symbol - Asset symbol for chart title
 * @returns URL to chart image
 */
export function chartImageUrl(
  candles: Candle[],
  symbol: string = 'Price',
  width: number = 1000,
  height: number = 600
): string {
  if (!candles || candles.length === 0) {
    // Return a placeholder if no data
    return `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify({
        type: 'bar',
        data: { labels: ['No Data'], datasets: [{ data: [0] }] },
      })
    )}`;
  }

  // Format data for candlestick chart
  const ohlc = candles.map((c) => ({
    x: c.t,
    o: c.o,
    h: c.h,
    l: c.l,
    c: c.c,
  }));

  // Calculate colors based on open/close
  const colors = candles.map((c) =>
    c.c >= c.o ? 'rgba(38, 166, 154, 0.8)' : 'rgba(239, 83, 80, 0.8)'
  );

  const config = {
    type: 'candlestick',
    data: {
      datasets: [
        {
          label: symbol,
          data: ohlc,
          borderColor: colors,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: symbol,
          color: '#fff',
          font: {
            size: 16,
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'MMM D HH:mm',
            },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#fff',
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#fff',
          },
        },
      },
      layout: {
        padding: 10,
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(config));
  return `https://quickchart.io/chart?backgroundColor=%23282828&c=${encoded}&w=${width}&h=${height}&format=png`;
}

/**
 * Alternative: Generate a simple line chart for sparkline-style display
 */
export function sparklineUrl(
  candles: Candle[],
  width: number = 400,
  height: number = 100
): string {
  if (!candles || candles.length === 0) {
    return `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify({
        type: 'line',
        data: { labels: [''], datasets: [{ data: [0] }] },
      })
    )}`;
  }

  const closes = candles.map((c) => c.c);
  const labels = candles.map((c) => new Date(c.t).toISOString());

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: closes,
          borderColor: 'rgba(38, 166, 154, 1)',
          backgroundColor: 'rgba(38, 166, 154, 0.2)',
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      layout: {
        padding: 0,
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(config));
  return `https://quickchart.io/chart?c=${encoded}&w=${width}&h=${height}&format=png`;
}
