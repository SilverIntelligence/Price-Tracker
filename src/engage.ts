import { Devvit } from '@devvit/public-api';

const NS = 'engage';
type Counters = { renders: number };
type Snap = { ts: number; score: number; numComments: number; renders: number };

export async function incRender(ctx: Devvit.Context, postId: string) {
  const k = `r:${postId}`;
  // @ts-expect-error - runtime APIs ahead of types
  const cur = (await ctx.kv.get<Counters>(NS, k)) ?? { renders: 0 };
  cur.renders++;
  // @ts-expect-error - runtime APIs ahead of types
  await ctx.kv.set(NS, k, cur);
}

export async function snapshot(ctx: Devvit.Context, postId: string) {
  const post = await ctx.reddit.getPostById(postId);
  // @ts-expect-error - runtime APIs ahead of types
  const cur = (await ctx.kv.get<Counters>(NS, `r:${postId}`)) ?? { renders: 0 };
  const s: Snap = {
    ts: Date.now(),
    score: post.score ?? 0,
    numComments: post.numberOfComments ?? 0,
    renders: cur.renders,
  };
  const key = `s:${postId}`;
  // @ts-expect-error - runtime APIs ahead of types
  const list = (await ctx.kv.get<Snap[]>(NS, key)) ?? [];
  list.push(s);
  // @ts-expect-error - runtime APIs ahead of types
  await ctx.kv.set(NS, key, list.slice(-288));
}
