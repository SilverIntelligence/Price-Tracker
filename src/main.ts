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

Devvit.addCustomPostType({
  name: 'Price Tracker',
  height: 'tall',
  render: async (ctx) => PriceView(ctx, 'XAGUSD', '15m'),
});

export default Devvit;
