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

export async function PriceView(ctx: Devvit.Context, symbol: Asset, interval: Interval): Promise<any> {
  const feed = await getFeed(symbol, interval, ctx);
  if (ctx.postId) await incRender(ctx, ctx.postId);
  const pct = ((feed.last - feed.prevClose) / feed.prevClose) * 100;
  const links = linkDefs((await ctx.settings.getAll?.()) ?? {});

  return {
    type: 'vstack',
    gap: 'small',
    padding: 'small',
    children: [
      {
        type: 'hstack',
        alignment: 'space-between',
        children: [
          {
            type: 'text',
            style: 'strong',
            size: 'large',
            text: `${symbol} ${feed.last.toFixed(2)}`,
          },
          {
            type: 'text',
            color: pct < 0 ? 'negative' : 'positive',
            text: `${pct.toFixed(2)}%`,
          },
        ],
      },
      {
        type: 'image',
        url: chartImageUrl(feed.candles),
        description: 'chart',
      },
      {
        type: 'hstack',
        gap: 'small',
        children: [
          ...TFS.map((tf) => ({
            type: 'button' as const,
            appearance: (tf === interval ? 'primary' : 'secondary') as any,
            text: tf,
            onPress: () => ctx.ui.navigateTo(`/a/${symbol}/${tf}`),
          })),
          { type: 'spacer' as const },
          ...links.map((l) => ({
            type: 'button' as const,
            icon: l.icon as any,
            onPress: () => ctx.ui.navigateTo(l.url),
          })),
        ],
      },
    ],
  };
}
