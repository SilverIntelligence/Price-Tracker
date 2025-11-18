import { Devvit } from '@devvit/public-api';
import { PriceView } from './ui.js';
import { registerSchedulers } from './scheduler.js';
import { createDailyThread } from './post.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

registerSchedulers(Devvit);

Devvit.addMenuItem({
  label: 'Create Daily Metals Thread',
  location: 'subreddit',
  onPress: async (_e, ctx) => {
    const id = await createDailyThread(ctx);
    await ctx.ui.showToast({ text: `Created + pinned: ${id}` });
  },
});

Devvit.addView({
  name: 'reddit.posts.list',
  render: async (ctx) => {
    const sym = ((await ctx.settings.get('default_asset')) as string) ?? 'XAGUSD';
    return PriceView(ctx, sym as any, '15m');
  },
});

export default Devvit;
