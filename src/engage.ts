import { Devvit } from '@devvit/public-api';

type Counters = { renders: number };

export async function incRender(ctx: Devvit.Context, postId: string) {
  const k = `r:${postId}`;
  const raw = await ctx.redis.get(k);
  const cur: Counters = raw ? JSON.parse(raw) : { renders: 0 };
  cur.renders++;
  await ctx.redis.set(k, JSON.stringify(cur));
}

export async function snapshot(ctx: Devvit.Context, postId: string) {
  const post = await ctx.reddit.getPostById(postId);
  const raw = await ctx.redis.get(`r:${postId}`);
  const renders = raw ? (JSON.parse(raw) as Counters).renders : 0;
  const s = {
    ts: Date.now(),
    score: post.score ?? 0,
    numComments: post.numberOfComments ?? 0,
    renders,
  };
  const key = `s:${postId}`;
  const listRaw = await ctx.redis.get(key);
  const list = listRaw ? JSON.parse(listRaw) : [];
  list.push(s);
  await ctx.redis.set(key, JSON.stringify(list.slice(-288)));
}
