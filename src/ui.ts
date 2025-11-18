import { Devvit } from '@devvit/public-api';
import { Asset, Interval, PriceFeed, LeaderboardRow } from './types.js';
import { chartImageUrl } from './chart.js';
import { LINKS } from './menus.js';

/**
 * Render the main price tracker card using Devvit Blocks API
 */
export function renderPriceCard(
  context: Devvit.Context,
  feed: PriceFeed,
  symbol: Asset,
  interval: Interval
): any {
  const pct = ((feed.last - feed.prevClose) / feed.prevClose) * 100;
  const isPositive = pct >= 0;
  const symbolLabel = symbol === 'XAGUSD' ? 'Silver (XAGUSD)' : 'Gold (XAUUSD)';

  // Build timeframe buttons
  const timeframes: Interval[] = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];

  return {
    type: 'vstack',
    padding: 'medium',
    gap: 'medium',
    backgroundColor: '#1a1a1a',
    cornerRadius: 'medium',
    children: [
      // Header: Symbol and Price
      {
        type: 'hstack',
        alignment: 'space-between',
        gap: 'medium',
        children: [
          {
            type: 'vstack',
            gap: 'none',
            grow: true,
            children: [
              {
                type: 'text',
                text: symbolLabel,
                size: 'xlarge',
                weight: 'bold',
                color: '#ffffff',
              },
              {
                type: 'text',
                text: `$${feed.last.toFixed(2)}`,
                size: 'xxlarge',
                weight: 'bold',
                color: '#ffffff',
              },
            ],
          },
          {
            type: 'vstack',
            alignment: 'end',
            gap: 'none',
            children: [
              {
                type: 'text',
                text: `${isPositive ? '+' : ''}${pct.toFixed(2)}%`,
                size: 'large',
                weight: 'bold',
                color: isPositive ? '#26a69a' : '#ef5350',
              },
              {
                type: 'text',
                text: interval,
                size: 'small',
                color: '#888888',
              },
            ],
          },
        ],
      },

      // Chart Image
      {
        type: 'image',
        url: chartImageUrl(feed.candles, `${symbolLabel} (${interval})`, 1000, 600),
        description: `${symbolLabel} price chart`,
        imageHeight: 256,
        imageWidth: 512,
        resizeMode: 'fit',
      },

      // Timeframe Selector
      {
        type: 'hstack',
        gap: 'small',
        alignment: 'center',
        children: timeframes.map((tf) => ({
          type: 'button',
          text: tf,
          appearance: tf === interval ? 'primary' : 'secondary',
          size: 'small',
          onPress: async () => {
            context.ui.navigateTo(`/asset/${symbol}/${tf}`);
          },
        })),
      },

      // Asset Selector
      {
        type: 'hstack',
        gap: 'small',
        alignment: 'center',
        children: [
          {
            type: 'button',
            text: 'Silver',
            appearance: symbol === 'XAGUSD' ? 'primary' : 'secondary',
            grow: true,
            onPress: async () => {
              context.ui.navigateTo(`/asset/XAGUSD/${interval}`);
            },
          },
          {
            type: 'button',
            text: 'Gold',
            appearance: symbol === 'XAUUSD' ? 'primary' : 'secondary',
            grow: true,
            onPress: async () => {
              context.ui.navigateTo(`/asset/XAUUSD/${interval}`);
            },
          },
        ],
      },

      // Quick Links Section
      {
        type: 'vstack',
        gap: 'small',
        children: [
          {
            type: 'text',
            text: 'Quick Links',
            size: 'medium',
            weight: 'bold',
            color: '#ffffff',
          },
          {
            type: 'hstack',
            gap: 'small',
            alignment: 'start',
            children: [
              {
                type: 'button',
                text: 'Home',
                size: 'small',
                appearance: 'bordered',
                onPress: async () => {
                  context.ui.navigateTo('https://reddit.com/r/WallStreetSilver/');
                },
              },
              {
                type: 'button',
                text: 'Discord',
                size: 'small',
                appearance: 'bordered',
                onPress: async () => {
                  context.ui.navigateTo('https://discord.gg/wallstreetsilver');
                },
              },
              {
                type: 'button',
                text: 'X',
                size: 'small',
                appearance: 'bordered',
                onPress: async () => {
                  context.ui.navigateTo('https://x.com/wallstreetsilv');
                },
              },
              {
                type: 'button',
                text: 'YouTube',
                size: 'small',
                appearance: 'bordered',
                onPress: async () => {
                  context.ui.navigateTo('https://youtube.com/@wallstreetsilver');
                },
              },
            ],
          },
        ],
      },

      // Leaderboard Link
      {
        type: 'button',
        text: 'View Daily Leaderboard',
        appearance: 'bordered',
        grow: true,
        onPress: async () => {
          context.ui.navigateTo('/leaderboard');
        },
      },

      // Footer
      {
        type: 'text',
        text: `Updates every ${getUpdateFrequency(interval)} • Powered by WallStreetSilver`,
        size: 'xsmall',
        color: '#666666',
        alignment: 'center',
      },
    ],
  };
}

/**
 * Render the leaderboard view
 */
export function renderLeaderboard(
  context: Devvit.Context,
  rows: LeaderboardRow[]
): any {
  return {
    type: 'vstack',
    padding: 'medium',
    gap: 'medium',
    backgroundColor: '#1a1a1a',
    cornerRadius: 'medium',
    children: [
      // Header
      {
        type: 'hstack',
        alignment: 'space-between',
        children: [
          {
            type: 'text',
            text: 'Today\'s Leaderboard',
            size: 'xlarge',
            weight: 'bold',
            color: '#ffffff',
          },
          {
            type: 'button',
            text: 'Back',
            size: 'small',
            onPress: async () => {
              context.ui.navigateTo('/');
            },
          },
        ],
      },

      {
        type: 'text',
        text: 'Top commenters by karma (UTC day)',
        size: 'small',
        color: '#888888',
      },

      // Leaderboard entries
      ...(rows.length === 0
        ? [
            {
              type: 'vstack' as const,
              padding: 'large' as const,
              alignment: 'center middle' as const,
              children: [
                {
                  type: 'text' as const,
                  text: 'No activity yet today. Be the first to comment!',
                  size: 'medium' as const,
                  color: '#888888',
                },
              ],
            },
          ]
        : rows.map((row, index) => ({
            type: 'hstack' as const,
            padding: 'small' as const,
            gap: 'medium' as const,
            alignment: 'space-between' as const,
            backgroundColor: index < 3 ? '#2a2a2a' : '#1f1f1f',
            cornerRadius: 'small' as const,
            children: [
              {
                type: 'hstack' as const,
                gap: 'medium' as const,
                alignment: 'start middle' as const,
                grow: true,
                children: [
                  {
                    type: 'text' as const,
                    text: `#${index + 1}`,
                    size: 'large' as const,
                    weight: 'bold' as const,
                    color:
                      index === 0
                        ? '#ffd700'
                        : index === 1
                        ? '#c0c0c0'
                        : index === 2
                        ? '#cd7f32'
                        : '#ffffff',
                  },
                  {
                    type: 'text' as const,
                    text: `u/${row.user}`,
                    size: 'medium' as const,
                    weight: 'bold' as const,
                    color: '#ffffff',
                  },
                ],
              },
              {
                type: 'hstack' as const,
                gap: 'large' as const,
                alignment: 'end middle' as const,
                children: [
                  {
                    type: 'vstack' as const,
                    alignment: 'end' as const,
                    gap: 'none' as const,
                    children: [
                      {
                        type: 'text' as const,
                        text: 'Comments',
                        size: 'small' as const,
                        color: '#888888',
                      },
                      {
                        type: 'text' as const,
                        text: row.comments.toString(),
                        size: 'medium' as const,
                        weight: 'bold' as const,
                        color: '#26a69a',
                      },
                    ],
                  },
                  {
                    type: 'vstack' as const,
                    alignment: 'end' as const,
                    gap: 'none' as const,
                    children: [
                      {
                        type: 'text' as const,
                        text: 'Karma',
                        size: 'small' as const,
                        color: '#888888',
                      },
                      {
                        type: 'text' as const,
                        text: row.karma.toString(),
                        size: 'medium' as const,
                        weight: 'bold' as const,
                        color: '#ffd700',
                      },
                    ],
                  },
                ],
              },
            ],
          }))),

      // Footer
      {
        type: 'text',
        text: 'Leaderboard updates every 5 minutes • Daily reset at midnight UTC',
        size: 'xsmall',
        color: '#666666',
        alignment: 'center',
      },
    ],
  };
}

/**
 * Render error state
 */
export function renderError(context: Devvit.Context, error: string): any {
  return {
    type: 'vstack',
    padding: 'large',
    gap: 'medium',
    alignment: 'center middle',
    backgroundColor: '#1a1a1a',
    children: [
      {
        type: 'text',
        text: 'Error',
        size: 'xlarge',
        color: '#ef5350',
      },
      {
        type: 'text',
        text: error,
        size: 'medium',
        color: '#ffffff',
        alignment: 'center',
      },
      {
        type: 'button',
        text: 'Go Home',
        onPress: async () => {
          context.ui.navigateTo('/');
        },
      },
    ],
  };
}

/**
 * Render loading state
 */
export function renderLoading(): any {
  return {
    type: 'vstack',
    padding: 'large',
    gap: 'medium',
    alignment: 'center middle',
    backgroundColor: '#1a1a1a',
    children: [
      {
        type: 'text',
        text: 'Loading...',
        size: 'xlarge',
        color: '#26a69a',
      },
      {
        type: 'text',
        text: 'Fetching latest price data',
        size: 'medium',
        color: '#888888',
      },
    ],
  };
}

/**
 * Get human-readable update frequency for interval
 */
function getUpdateFrequency(interval: Interval): string {
  const map: Record<Interval, string> = {
    '1m': '30s',
    '5m': '1min',
    '15m': '2min',
    '30m': '5min',
    '1h': '10min',
    '4h': '30min',
    'D': '30min',
    'W': '1hr',
  };
  return map[interval] || '5min';
}
