import { Devvit } from '@devvit/public-api';
import { Asset, Interval } from './types.js';
import { getFeed } from './prices.js';
import { chartImageUrl } from './chart.js';
import { incRender } from './engage.js';

const TFS: Interval[] = ['1m', '5m', '15m', '30m', '1h', '4h', 'D', 'W'];

const linkDefs = (s: any) => [
  { icon: 'home', url: 'https://reddit.com/r/WallStreetSilver' },
  { icon: 'clock', url: 'https://reddit.com/r/WallStreetSilver/search?q=call+the+close&restrict_sr=1' },
  { icon: 'chat', url: s.links_discord },
  { icon: 'bird', url: s.links_x },
  { icon: 'play', url: s.links_youtube },
];

export async function PriceView(ctx: Devvit.Context, symbol: Asset, interval: Interval) {
  const feed = await getFeed(symbol, interval, ctx);
  if (ctx.postId) await incRender(ctx, ctx.postId);
  const pct = ((feed.last - feed.prevClose) / feed.prevClose) * 100;
  const links = linkDefs((await ctx.settings.getAll?.()) ?? {});

  return (
    <vstack gap="small" padding="small">
      <hstack alignment="space-between">
        <text style="strong" size="large">
          {symbol} {feed.last.toFixed(2)}
        </text>
        <text color={pct < 0 ? 'negative' : 'positive'}>
          {pct.toFixed(2)}%
        </text>
      </hstack>
      <image url={chartImageUrl(feed.candles)} description="chart" />
      <hstack gap="small">
        {TFS.map((tf) => (
          <button
            appearance={tf === interval ? 'primary' : 'secondary'}
            onPress={() => ctx.ui.navigateTo(`/a/${symbol}/${tf}`)}
          >
            {tf}
          </button>
        ))}
        <spacer />
        {links.map((l) => (
          <button icon={l.icon as any} linkUrl={l.url} />
        ))}
      </hstack>
    </vstack>
  );
}
