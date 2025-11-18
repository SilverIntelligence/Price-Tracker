import { Devvit } from '@devvit/public-api';
import { LeaderboardRow } from './types.js';

/**
 * Get daily leaderboard of top commenters by karma
 *
 * @param context - Devvit context with Reddit API access
 * @param subreddit - Subreddit name to analyze
 * @param limit - Number of top users to return
 * @returns Array of leaderboard rows sorted by karma
 */
export async function getDailyLeaderboard(
  context: Devvit.Context,
  subreddit: string,
  limit: number = 10
): Promise<LeaderboardRow[]> {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startTime = startOfDay.getTime();

    // Track user activity
    const userMap = new Map<string, LeaderboardRow>();

    // Get recent posts from the subreddit
    const posts = await context.reddit
      .getNewPosts({
        subredditName: subreddit,
        limit: 100,
        pageSize: 100,
      })
      .all();

    console.log(`Analyzing ${posts.length} posts for leaderboard`);

    // Process each post's comments
    for (const post of posts) {
      try {
        // Only process posts from today
        if (post.createdAt.getTime() < startTime) {
          continue;
        }

        const comments = await context.reddit
          .getComments({
            postId: post.id,
            limit: 200,
            pageSize: 50,
          })
          .all();

        for (const comment of comments) {
          // Skip if no author or from AutoModerator
          if (
            !comment.authorName ||
            comment.authorName === 'AutoModerator' ||
            comment.authorName === '[deleted]'
          ) {
            continue;
          }

          // Skip if comment is from before today
          if (comment.createdAt.getTime() < startTime) {
            continue;
          }

          const username = comment.authorName;
          const karma = comment.score || 0;

          if (!userMap.has(username)) {
            userMap.set(username, {
              user: username,
              comments: 0,
              karma: 0,
            });
          }

          const row = userMap.get(username)!;
          row.comments += 1;
          row.karma += karma;
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
      }
    }

    // Convert to array and sort by karma
    const rows = Array.from(userMap.values())
      .sort((a, b) => b.karma - a.karma)
      .slice(0, limit);

    console.log(`Leaderboard: ${rows.length} users`);
    return rows;
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    return [];
  }
}

/**
 * Get cached leaderboard or generate new one
 *
 * @param context - Devvit context
 * @param subreddit - Subreddit name
 * @returns Cached or fresh leaderboard data
 */
export async function getCachedLeaderboard(
  context: Devvit.Context,
  subreddit: string
): Promise<LeaderboardRow[]> {
  const cacheKey = `leaderboard:${subreddit}:${getTodayKey()}`;
  const cacheTtl = 5 * 60 * 1000; // 5 minutes

  try {
    // Check cache
    const cached = await context.redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached) as { rows: LeaderboardRow[]; ts: number };
      if (Date.now() - data.ts < cacheTtl) {
        console.log('Returning cached leaderboard');
        return data.rows;
      }
    }

    // Generate fresh leaderboard
    console.log('Generating fresh leaderboard');
    const rows = await getDailyLeaderboard(context, subreddit);

    // Cache result
    await context.redis.set(
      cacheKey,
      JSON.stringify({ rows, ts: Date.now() }),
      { expiration: new Date(Date.now() + cacheTtl) }
    );

    return rows;
  } catch (error) {
    console.error('Error in getCachedLeaderboard:', error);
    return [];
  }
}

/**
 * Get today's date key for cache invalidation
 */
function getTodayKey(): string {
  const today = new Date();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(
    today.getUTCDate()
  ).padStart(2, '0')}`;
}
