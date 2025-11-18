import { Devvit } from '@devvit/public-api';
import { PriceView } from './ui.js';
import { registerSchedulers } from './scheduler.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

registerSchedulers(Devvit);

Devvit.addCustomPostType({
  name: 'Price Tracker',
  height: 'tall',
  render: async (ctx) => PriceView(ctx, 'XAGUSD', '15m'),
});

export default Devvit;
