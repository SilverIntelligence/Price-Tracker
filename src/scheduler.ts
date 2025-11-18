import { Devvit } from '@devvit/public-api';
import { getFeed } from './prices.js';
import { Asset, Interval } from './types.js';

/**
 * Register scheduled jobs for cache warming and maintenance
 */
export function registerScheduler(devvit: typeof Devvit): void {
  // Note: Devvit scheduler API may vary by version
  // This is a simplified implementation
  console.log('Scheduler registration placeholder - configure via Devvit dashboard');
}

/**
 * Setup scheduler event handlers
 */
export function setupSchedulerHandlers(devvit: typeof Devvit): void {
  // Handlers would be configured here if supported
  console.log('Scheduler handlers placeholder');
}

/**
 * Warm the cache by fetching commonly accessed data
 * This function can be called manually or via a scheduler
 */
export async function warmCache(context: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '1h', 'D'];

  console.log(`Warming cache for ${symbols.length} symbols x ${intervals.length} intervals`);

  for (const symbol of symbols) {
    for (const interval of intervals) {
      try {
        await getFeed(symbol, interval, context);
        console.log(`Cached ${symbol}/${interval}`);
      } catch (error) {
        console.error(`Failed to cache ${symbol}/${interval}:`, error);
      }
    }
  }

  console.log('Cache warming complete');
}

/**
 * Create daily discussion thread
 */
export async function createDailyThread(
  context: Devvit.Context,
  subredditName: string
): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const title = `Daily Metals Discussion - ${today}`;

    const bodyLines = [
      '# Welcome to the Daily Metals Discussion Thread!',
      '',
      '## Today\'s Focus',
      '- Share your silver and gold market insights',
      '- Discuss latest price movements',
      '- Post your latest additions to the stack',
      '',
      '## Quick Links',
      '- [WallStreetSilver](https://reddit.com/r/WallStreetSilver)',
      '- [Discord](https://discord.gg/wallstreetsilver)',
      '',
      '## Rules',
      '1. Be respectful to all members',
      '2. No spam or promotional content',
      '3. Stay on topic',
      '',
      '---',
      '',
      '*Price tracker data updates automatically*',
    ];

    const post = await context.reddit.submitPost({
      subredditName,
      title,
      text: bodyLines.join('\n'),
    });

    console.log(`Created daily thread: ${post.id}`);
  } catch (error) {
    console.error('Error creating daily thread:', error);
    throw error;
  }
}
