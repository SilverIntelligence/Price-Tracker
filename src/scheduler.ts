import { Devvit } from '@devvit/public-api';
import { getFeed } from './prices.js';
import { snapshot } from './engage.js';
import { Asset, Interval } from './types.js';

export function registerSchedulers(app: typeof Devvit) {
  // Note: Scheduler API may vary by Devvit version
  // For now, cache warming can be triggered manually via menu
  console.log('Schedulers registered (manual trigger mode)');
}

export async function warmCache(ctx: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '1h', 'D'];

  console.log('Warming cache for price data...');
  for (const s of symbols) {
    for (const tf of intervals) {
      try {
        await getFeed(s, tf, ctx);
        console.log(`Cached ${s}/${tf}`);
      } catch (err) {
        console.error(`Failed to cache ${s}/${tf}:`, err);
      }
    }
  }
  console.log('Cache warming complete');
}

export async function snapshotEngagement(ctx: Devvit.Context): Promise<void> {
  const postId = (await ctx.settings.get('last_daily_post_id')) as string | undefined;
  if (postId) {
    try {
      await snapshot(ctx, postId);
      console.log(`Engagement snapshot created for post ${postId}`);
    } catch (err) {
      console.error('Failed to snapshot engagement:', err);
    }
  } else {
    console.log('No daily post ID set, skipping engagement snapshot');
  }
}
