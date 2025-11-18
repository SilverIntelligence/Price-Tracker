import { Devvit } from '@devvit/public-api';
import { getFeed } from './prices.js';
import { Asset, Interval } from './types.js';

/**
 * Register scheduled jobs for cache warming and maintenance
 *
 * This scheduler pre-fetches commonly used price data to keep the cache warm
 * and ensure fast response times for users
 */
export function registerScheduler(devvit: typeof Devvit): void {
  /**
   * Cache warming job - runs every minute
   * Pre-fetches popular timeframes for both silver and gold
   */
  devvit.addSchedulerJob({
    name: 'warmPriceCache',
    cron: '* * * * *', // Every minute
  });

  devvit.addTrigger({
    event: 'AppInstall',
    onEvent: async (event, context) => {
      console.log('App installed, scheduling cache warming job');
      await context.scheduler.runJob({
        name: 'warmPriceCache',
        cron: '* * * * *',
      });
    },
  });

  /**
   * Cache cleanup job - runs daily at midnight UTC
   * Clears old cache entries to prevent stale data buildup
   */
  devvit.addSchedulerJob({
    name: 'cleanupOldCache',
    cron: '0 0 * * *', // Daily at midnight UTC
  });

  devvit.addTrigger({
    event: 'AppInstall',
    onEvent: async (event, context) => {
      console.log('Scheduling cache cleanup job');
      await context.scheduler.runJob({
        name: 'cleanupOldCache',
        cron: '0 0 * * *',
      });
    },
  });
}

/**
 * Handle scheduled job events
 */
export function setupSchedulerHandlers(devvit: typeof Devvit): void {
  /**
   * Warm cache handler
   * Fetches data for common views to keep cache fresh
   */
  devvit.addTrigger({
    event: 'ScheduledJobEvent',
    onEvent: async (event, context) => {
      if (event.name === 'warmPriceCache') {
        console.log('Running cache warming job');
        await warmCache(context);
      } else if (event.name === 'cleanupOldCache') {
        console.log('Running cache cleanup job');
        await cleanupCache(context);
      }
    },
  });
}

/**
 * Warm the cache by fetching commonly accessed data
 */
async function warmCache(context: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '1h', 'D'];

  console.log(`Warming cache for ${symbols.length} symbols x ${intervals.length} intervals`);

  for (const symbol of symbols) {
    for (const interval of intervals) {
      try {
        await getFeed(symbol, interval, context);
        console.log(`✓ Cached ${symbol}/${interval}`);
      } catch (error) {
        console.error(`✗ Failed to cache ${symbol}/${interval}:`, error);
      }
    }
  }

  console.log('Cache warming complete');
}

/**
 * Clean up old cache entries
 * This is a placeholder - Redis TTL handles most cleanup automatically
 */
async function cleanupCache(context: Devvit.Context): Promise<void> {
  console.log('Cache cleanup running (Redis TTL handles most cleanup)');

  // Additional cleanup logic can be added here if needed
  // For example, clearing specific keys or patterns

  console.log('Cache cleanup complete');
}

/**
 * Create daily discussion thread
 * This can be triggered manually or scheduled
 */
export async function createDailyThread(
  context: Devvit.Context,
  subredditName: string
): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const title = `Daily Metals Discussion — ${today} 🥈🥇`;

    const bodyLines = [
      '# Welcome to the Daily Metals Discussion Thread!',
      '',
      '## Today\'s Focus',
      '- Share your silver and gold market insights',
      '- Discuss latest price movements',
      '- Post your latest additions to the stack',
      '',
      '## Quick Links',
      '- [Call the Close Contest](https://reddit.com/r/WallStreetSilver/search?q=call+the+close&restrict_sr=1)',
      '- [Want More Silver?](https://wallstreetsilver.com)',
      '',
      '## Rules',
      '1. Be respectful to all members',
      '2. No spam or promotional content',
      '3. Stay on topic',
      '',
      '---',
      '',
      '*Price tracker updates automatically above this post*',
    ];

    const post = await context.reddit.submitPost({
      subredditName,
      title,
      text: bodyLines.join('\n'),
      preview: {
        // This makes the post show the custom app card
        customWidget: {
          height: 'tall',
        },
      },
    });

    console.log(`Created daily thread: ${post.id}`);

    // Try to sticky the post (requires mod permissions)
    try {
      await context.reddit.setPostNsfw(post.id, false);
      // Note: Sticky functionality may require additional permissions
      console.log(`Successfully created daily thread at /r/${subredditName}`);
    } catch (error) {
      console.error('Could not sticky post (may need mod permissions):', error);
    }
  } catch (error) {
    console.error('Error creating daily thread:', error);
    throw error;
  }
}
