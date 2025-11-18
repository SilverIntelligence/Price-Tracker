// Temporary shim until upstream types catch up to runtime
import '@devvit/public-api';

declare module '@devvit/public-api' {
  interface KVClient {
    get<T = unknown>(namespace: string, key: string): Promise<T | undefined>;
    set<T = unknown>(namespace: string, key: string, value: T): Promise<void>;
  }

  interface SecretsClient {
    get(name: string): Promise<string | undefined>;
  }

  interface Context {
    postId?: string;
    subredditName?: string;
    kv: KVClient;
    secrets: SecretsClient;
  }

  interface UIClient {
    navigateTo(path: string): Promise<void>;
  }

  interface SchedulerAPI {
    cron(spec: string, fn: (event: unknown, ctx: Context) => Promise<void> | void): void;
  }

  interface RedditAPIClient {
    stickyPost(options: { id: string; num: number }): Promise<void>;
  }

  interface Configuration {
    reddit?: {
      posts?: {
        list?: Array<{ trigger: string; path: string }>;
      };
    };
  }

  namespace Devvit {
    const scheduler: SchedulerAPI;
    function addView(
      path: string,
      render: (ctx: Context, params?: Record<string, string>) => Promise<JSX.Element>
    ): void;
  }
}
