import { Devvit } from '@devvit/public-api';
import { PriceView } from './ui.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addCustomPostType({
  name: 'Price Tracker',
  height: 'tall',
  render: async (ctx) => PriceView(ctx, 'XAGUSD', '15m'),
});

export default Devvit;
