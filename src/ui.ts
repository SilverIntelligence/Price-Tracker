import { Devvit } from '@devvit/public-api';
import { Asset, Interval, PriceFeed, LeaderboardRow } from './types.js';
import { chartImageUrl } from './chart.js';
import { getMenuLinks } from './menus.js';

/**
 * Render the main price tracker card
 */
export function renderPriceCard(
  context: Devvit.Context,
  feed: PriceFeed,
  symbol: Asset,
  interval: Interval
): JSX.Element {
  const pct = ((feed.last - feed.prevClose) / feed.prevClose) * 100;
  const isPositive = pct >= 0;
  const symbolLabel = symbol === 'XAGUSD' ? '🥈 Silver' : '🥇 Gold';

  // Get menu links with settings
  const discord = context.settings.get<string>('links_discord');
  const x = context.settings.get<string>('links_x');
  const youtube = context.settings.get<string>('links_youtube');
  const menuLinks = getMenuLinks({ discord, x, youtube });

  return (
    <vstack padding="medium" gap="medium" backgroundColor="#1a1a1a" cornerRadius="medium">
      {/* Header: Symbol and Current Price */}
      <hstack alignment="space-between middle" gap="medium">
        <vstack gap="none" grow>
          <text size="xlarge" weight="bold" color="#ffffff">
            {symbolLabel}
          </text>
          <text size="xxlarge" weight="bold" color="#ffffff">
            ${feed.last.toFixed(2)}
          </text>
        </vstack>

        <vstack alignment="end" gap="none">
          <text
            size="large"
            weight="bold"
            color={isPositive ? '#26a69a' : '#ef5350'}
          >
            {isPositive ? '+' : ''}
            {pct.toFixed(2)}%
          </text>
          <text size="small" color="#888888">
            {interval}
          </text>
        </vstack>
      </hstack>

      {/* Chart Image */}
      <image
        url={chartImageUrl(feed.candles, `${symbolLabel} (${interval})`, 1000, 600)}
        description={`${symbolLabel} price chart`}
        imageHeight={300}
        imageWidth={500}
        resizeMode="fit"
      />

      {/* Timeframe Selector */}
      <hstack gap="small" alignment="center">
        {(['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'] as Interval[]).map(
          (tf) => (
            <button
              key={tf}
              appearance={tf === interval ? 'primary' : 'secondary'}
              size="small"
              onPress={() => {
                context.ui.navigateTo(`/asset/${symbol}/${tf}`);
              }}
            >
              {tf}
            </button>
          )
        )}
      </hstack>

      {/* Asset Selector */}
      <hstack gap="small" alignment="center">
        <button
          appearance={symbol === 'XAGUSD' ? 'primary' : 'secondary'}
          onPress={() => {
            context.ui.navigateTo(`/asset/XAGUSD/${interval}`);
          }}
          grow
        >
          🥈 Silver
        </button>
        <button
          appearance={symbol === 'XAUUSD' ? 'primary' : 'secondary'}
          onPress={() => {
            context.ui.navigateTo(`/asset/XAUUSD/${interval}`);
          }}
          grow
        >
          🥇 Gold
        </button>
      </hstack>

      {/* Navigation Menu */}
      <vstack gap="small">
        <text size="medium" weight="bold" color="#ffffff">
          Quick Links
        </text>
        <hstack gap="small" alignment="center" wrap>
          {menuLinks.map((link, index) => (
            <button
              key={`${link.label}-${index}`}
              icon={link.icon as Devvit.Blocks.IconName}
              size="small"
              onPress={() => {
                context.ui.navigateTo(link.url);
              }}
            >
              {link.label}
            </button>
          ))}
        </hstack>
      </vstack>

      {/* Leaderboard Link */}
      <hstack gap="small" alignment="center">
        <button
          appearance="bordered"
          onPress={() => {
            context.ui.navigateTo('/leaderboard');
          }}
          grow
        >
          📊 View Leaderboard
        </button>
      </hstack>

      {/* Footer */}
      <text size="xsmall" color="#666666" alignment="center">
        Updates every {getUpdateFrequency(interval)} • Powered by WallStreetSilver
      </text>
    </vstack>
  );
}

/**
 * Render the leaderboard view
 */
export function renderLeaderboard(
  context: Devvit.Context,
  rows: LeaderboardRow[]
): JSX.Element {
  return (
    <vstack padding="medium" gap="medium" backgroundColor="#1a1a1a" cornerRadius="medium">
      {/* Header */}
      <hstack alignment="space-between middle">
        <text size="xlarge" weight="bold" color="#ffffff">
          📊 Today's Leaderboard
        </text>
        <button
          size="small"
          onPress={() => {
            context.ui.navigateTo('/');
          }}
        >
          ← Back
        </button>
      </hstack>

      <text size="small" color="#888888">
        Top commenters by karma (UTC day)
      </text>

      {/* Leaderboard Table */}
      {rows.length === 0 ? (
        <vstack padding="large" alignment="center middle">
          <text size="medium" color="#888888">
            No activity yet today. Be the first to comment!
          </text>
        </vstack>
      ) : (
        <vstack gap="small">
          {rows.map((row, index) => (
            <hstack
              key={`${row.user}-${index}`}
              padding="small"
              gap="medium"
              alignment="space-between middle"
              backgroundColor={index < 3 ? '#2a2a2a' : '#1f1f1f'}
              cornerRadius="small"
            >
              <hstack gap="medium" alignment="start middle" grow>
                <text
                  size="large"
                  weight="bold"
                  color={
                    index === 0
                      ? '#ffd700'
                      : index === 1
                      ? '#c0c0c0'
                      : index === 2
                      ? '#cd7f32'
                      : '#ffffff'
                  }
                  minWidth="32px"
                >
                  #{index + 1}
                </text>
                <text size="medium" weight="bold" color="#ffffff">
                  u/{row.user}
                </text>
              </hstack>

              <hstack gap="large" alignment="end middle">
                <vstack alignment="end" gap="none">
                  <text size="small" color="#888888">
                    Comments
                  </text>
                  <text size="medium" weight="bold" color="#26a69a">
                    {row.comments}
                  </text>
                </vstack>
                <vstack alignment="end" gap="none">
                  <text size="small" color="#888888">
                    Karma
                  </text>
                  <text size="medium" weight="bold" color="#ffd700">
                    {row.karma}
                  </text>
                </vstack>
              </hstack>
            </hstack>
          ))}
        </vstack>
      )}

      {/* Footer */}
      <text size="xsmall" color="#666666" alignment="center">
        Leaderboard updates every 5 minutes • Daily reset at midnight UTC
      </text>
    </vstack>
  );
}

/**
 * Render error state
 */
export function renderError(context: Devvit.Context, error: string): JSX.Element {
  return (
    <vstack padding="large" gap="medium" alignment="center middle" backgroundColor="#1a1a1a">
      <text size="xlarge" color="#ef5350">
        ⚠️ Error
      </text>
      <text size="medium" color="#ffffff" alignment="center">
        {error}
      </text>
      <button
        onPress={() => {
          context.ui.navigateTo('/');
        }}
      >
        Go Home
      </button>
    </vstack>
  );
}

/**
 * Render loading state
 */
export function renderLoading(): JSX.Element {
  return (
    <vstack padding="large" gap="medium" alignment="center middle" backgroundColor="#1a1a1a">
      <text size="xlarge" color="#26a69a">
        Loading...
      </text>
      <text size="medium" color="#888888">
        Fetching latest price data
      </text>
    </vstack>
  );
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
