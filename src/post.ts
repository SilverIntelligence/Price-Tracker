import { Devvit } from '@devvit/public-api';

export async function createDailyThread(ctx: Devvit.Context): Promise<string> {
  const sub = ctx.subredditName!;
  const d = new Date().toISOString().slice(0, 10);
  const post = await ctx.reddit.submitPost({
    subredditName: sub,
    title: `Daily Metals Discussion — ${d}`,
    text: 'Discuss silver & gold markets here. Track live prices with the card above.',
  });
  await ctx.reddit.stickyPost({ id: post.id, num: 1 });
  // @ts-expect-error - runtime APIs ahead of types
  await ctx.kv.set('engage', 'last_daily_post_id', post.id);
  console.log(`Created daily thread: ${post.id}`);
  return post.id;
}
