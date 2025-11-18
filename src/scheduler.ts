import { Devvit } from '@devvit/public-api';
import { getFeed } from './prices.js';
import { snapshot } from './engage.js';
import { Asset, Interval } from './types.js';

export function registerSchedulers(app: typeof Devvit) {
  app.scheduler.cron({
    name: 'warmCache',
    cron: '*/5 * * * *',
    job: async (ctx) => {
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
    },
  });

  app.scheduler.cron({
    name: 'pollEngagement',
    cron: '*/5 * * * *',
    job: async (ctx) => {
      const postId = await ctx.kv.get<string>('state', 'last_daily_post_id');
      if (postId) {
        try {
          await snapshot(ctx, postId);
        } catch (err) {
          console.error('Engagement poll failed:', err);
        }
      }
    },
  });
}
