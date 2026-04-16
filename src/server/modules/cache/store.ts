import { getDragonflyClient } from "./dragonfly-client";

type CacheValue = Record<string, unknown> | unknown[];

function isCacheValue(value: unknown): value is CacheValue {
  if (Array.isArray(value)) {
    return true;
  }
  return typeof value === "object" && value !== null;
}

async function deleteKeys(client: Awaited<ReturnType<typeof getDragonflyClient>>, keys: string[]) {
  if (!client || keys.length === 0) {
    return;
  }

  for (const key of keys) {
    await client.del(key);
  }
}

export async function getCacheValue<T extends CacheValue>(key: string): Promise<T | null> {
  const client = await getDragonflyClient();
  if (!client) {
    return null;
  }

  try {
    const raw = await client.get(key);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isCacheValue(parsed) ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export async function setCacheValue(key: string, value: CacheValue, ttlSeconds: number) {
  const client = await getDragonflyClient();
  if (!client) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch {
    return;
  }
}

export async function deleteCacheKeys(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const client = await getDragonflyClient();
  if (!client) {
    return;
  }

  try {
    await deleteKeys(client, keys);
  } catch {
    return;
  }
}

export async function deleteCacheByPatterns(patterns: string[]) {
  if (patterns.length === 0) {
    return;
  }

  const client = await getDragonflyClient();
  if (!client) {
    return;
  }

  try {
    const keys = new Set<string>();
    for (const pattern of patterns) {
      for await (const keyBatch of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        for (const key of keyBatch) {
          keys.add(key);
        }
      }
    }

    if (keys.size > 0) {
      await deleteKeys(client, [...keys]);
    }
  } catch {
    return;
  }
}
