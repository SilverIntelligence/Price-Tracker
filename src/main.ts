import { Devvit } from '@devvit/public-api';
import { getFeed, clearCache } from './prices.js';
import { getCachedLeaderboard } from './leaderboard.js';
import { renderPriceCard, renderLeaderboard, renderError, renderLoading } from './ui.js';
import { registerScheduler, setupSchedulerHandlers, createDailyThread } from './scheduler.js';
import { Asset, Interval } from './types.js';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

// Register scheduler jobs
registerScheduler(Devvit);
setupSchedulerHandlers(Devvit);

/**
 * Menu Items for Moderators
 */

// Create Daily Price Thread
Devvit.addMenuItem({
  label: 'Create Daily Metals Thread',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();

    try {
      await context.ui.showToast('Creating daily thread...');
      await createDailyThread(context, subreddit.name);
      await context.ui.showToast({
        text: 'Daily thread created successfully!',
        appearance: 'success',
      });
    } catch (error) {
      console.error('Error creating daily thread:', error);
      await context.ui.showToast('Failed to create daily thread. Check logs.');
    }
  },
});

// Clear Cache (Admin Tool)
Devvit.addMenuItem({
  label: 'Clear Price Cache',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      await context.ui.showToast('Clearing cache...');
      await clearCache(context);
      await context.ui.showToast({
        text: 'Cache cleared successfully!',
        appearance: 'success',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      await context.ui.showToast('Failed to clear cache. Check logs.');
    }
  },
});

/**
 * Custom Post Type: Price Tracker Card
 */
Devvit.addCustomPostType({
  name: 'Price Tracker',
  description: 'Live silver and gold price tracker with charts',
  height: 'tall',
  render: async (context) => {
    try {
      const defaultAsset = (await context.settings.get<string>('default_asset')) || 'XAGUSD';
      const symbol = defaultAsset as Asset;
      const interval: Interval = '15m';

      const feed = await getFeed(symbol, interval, context);

      return renderPriceCard(context, feed, symbol, interval);
    } catch (error) {
      console.error('Error loading price data:', error);
      return renderError(context, 'Failed to load price data. Please try again.');
    }
  },
});

/**
 * Installation Handler
 */
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    console.log('WSS Price Tracker installed!');
    console.log(`Subreddit: ${event.subreddit?.name || 'unknown'}`);

    // Welcome message
    if (event.subreddit) {
      try {
        const post = await context.reddit.submitPost({
          subredditName: event.subreddit.name,
          title: 'WSS Price Tracker Installed!',
          text: [
            '# Welcome to the WSS Price Tracker!',
            '',
            'This app provides live silver and gold price tracking with:',
            '- Real-time XAGUSD and XAUUSD prices',
            '- Multiple timeframe views (1m to 1W)',
            '- Beautiful candlestick charts',
            '- Daily leaderboard',
            '- Quick links to community resources',
            '',
            '## Getting Started',
            '',
            'Moderators can use the mod menu to:',
            '- Create daily discussion threads',
            '- Clear the price cache if needed',
            '',
            '## Configuration',
            '',
            'Visit the app settings to configure:',
            '- Default asset (XAGUSD or XAUUSD)',
            '- Custom Discord, X, and YouTube links',
            '- Price API endpoint',
            '',
            '---',
            '',
            'Stack on!',
          ].join('\n'),
        });

        console.log(`Welcome post created: ${post.id}`);
      } catch (error) {
        console.error('Error creating welcome post:', error);
      }
    }
  },
});

/**
 * Export default app
 */
export default Devvit;
