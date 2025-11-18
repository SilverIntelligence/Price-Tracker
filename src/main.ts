import { Devvit } from '@devvit/public-api';
import { PriceView } from './ui.js';
import { registerSchedulers } from './scheduler.js';
import { createDailyThread } from './post.js';
import { Asset, Interval } from './types.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
  // @ts-expect-error - runtime APIs ahead of types
  reddit: { posts: { list: [{ trigger: 'any', path: '/' }] } },
});

registerSchedulers(Devvit);

Devvit.addView('/', async (ctx) => PriceView(ctx, 'XAGUSD', '15m'));

Devvit.addView('/a/:symbol/:interval', async (ctx, p) =>
  PriceView(ctx, p!.symbol!.toUpperCase() as Asset, p!.interval! as Interval)
);

Devvit.addMenuItem({
  label: 'Create Daily Metals Thread',
  location: 'subreddit',
  onPress: async (_e, ctx) => {
    const id = await createDailyThread(ctx);
    await ctx.ui.showToast({ text: `Created + pinned: ${id}` });
  },
});

export default Devvit;
