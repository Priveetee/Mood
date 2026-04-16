import { createClient } from "redis";

type DragonflyClient = ReturnType<typeof createClient>;

type CacheGlobal = typeof globalThis & {
  __moodDragonflyClient?: DragonflyClient;
  __moodDragonflyConnectPromise?: Promise<DragonflyClient | null>;
};

function getDragonflyUrl(): string | null {
  const url = process.env.DRAGONFLY_URL;
  return url && url.trim().length > 0 ? url : null;
}

function createDragonflyClient(url: string): DragonflyClient {
  const client = createClient({ url });
  client.on("error", () => undefined);
  return client;
}

export async function getDragonflyClient(): Promise<DragonflyClient | null> {
  const cacheGlobal = globalThis as CacheGlobal;

  if (cacheGlobal.__moodDragonflyClient?.isOpen) {
    return cacheGlobal.__moodDragonflyClient;
  }

  if (!cacheGlobal.__moodDragonflyConnectPromise) {
    cacheGlobal.__moodDragonflyConnectPromise = (async () => {
      const url = getDragonflyUrl();
      if (!url) {
        return null;
      }

      try {
        const client = createDragonflyClient(url);
        await client.connect();
        cacheGlobal.__moodDragonflyClient = client;
        return client;
      } catch {
        return null;
      } finally {
        cacheGlobal.__moodDragonflyConnectPromise = undefined;
      }
    })();
  }

  return cacheGlobal.__moodDragonflyConnectPromise;
}
