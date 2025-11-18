import { Devvit } from '@devvit/public-api';
import { getFeed } from './prices.js';
import { snapshot } from './engage.js';
import { Asset, Interval } from './types.js';

async function warmCache(ctx: Devvit.Context): Promise<void> {
  const symbols: Asset[] = ['XAGUSD', 'XAUUSD'];
  const intervals: Interval[] = ['1m', '5m', '15m', '1h', 'D'];
  console.log('Warming cache...');
  for (const s of symbols) {
    for (const tf of intervals) {
      try {
        await getFeed(s, tf, ctx);
      } catch (err) {
        console.error(`Cache ${s}/${tf} failed:`, err);
      }
    }
  }
}

export function registerSchedulers(app: typeof Devvit) {
  app.scheduler.cron('* * * * *', async (_e, ctx) => {
    await warmCache(ctx as unknown as Devvit.Context);
  });
  app.scheduler.cron('*/5 * * * *', async (_e, ctx) => {
    const postId = await ctx.kv.get<string>('engage', 'last_daily_post_id');
    if (postId) await snapshot(ctx as unknown as Devvit.Context, postId);
  });
}
