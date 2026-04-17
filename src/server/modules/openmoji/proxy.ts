import { CACHE_TTL } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";

type OpenMojiFetchResult = { kind: "ok"; svg: string } | { kind: "not-found" } | { kind: "error" };

type LocalSvg = {
  svg: string;
  expiresAtMs: number;
};

type OpenMojiGlobal = typeof globalThis & {
  __moodOpenMojiLocalCache?: Map<string, LocalSvg>;
  __moodOpenMojiFailedUntil?: Map<string, number>;
  __moodOpenMojiNotFoundUntil?: Map<string, number>;
};

const OPENMOJI_CDN_BASE = "https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg";
const LOCAL_CACHE_MS = 10 * 60 * 1000;
const FAILURE_COOLDOWN_MS = 15 * 1000;
const NOT_FOUND_CACHE_MS = 5 * 60 * 1000;

function getCaches() {
  const openMojiGlobal = globalThis as OpenMojiGlobal;
  if (!openMojiGlobal.__moodOpenMojiLocalCache) {
    openMojiGlobal.__moodOpenMojiLocalCache = new Map<string, LocalSvg>();
  }
  if (!openMojiGlobal.__moodOpenMojiFailedUntil) {
    openMojiGlobal.__moodOpenMojiFailedUntil = new Map<string, number>();
  }
  if (!openMojiGlobal.__moodOpenMojiNotFoundUntil) {
    openMojiGlobal.__moodOpenMojiNotFoundUntil = new Map<string, number>();
  }

  return {
    local: openMojiGlobal.__moodOpenMojiLocalCache,
    failedUntil: openMojiGlobal.__moodOpenMojiFailedUntil,
    notFoundUntil: openMojiGlobal.__moodOpenMojiNotFoundUntil,
  };
}

function cacheKey(code: string) {
  return `openmoji:${code}`;
}

function candidateCodes(code: string): string[] {
  const strippedVariant = code
    .split("-")
    .filter((segment) => segment !== "FE0F")
    .join("-");

  if (!strippedVariant || strippedVariant === code) {
    return [code];
  }

  return [code, strippedVariant];
}

async function fetchFromCdn(code: string): Promise<OpenMojiFetchResult> {
  const url = `${OPENMOJI_CDN_BASE}/${code}.svg`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 404) {
      return { kind: "not-found" };
    }
    if (!response.ok) {
      return { kind: "error" };
    }

    const svg = await response.text();
    if (!svg?.includes("<svg")) {
      return { kind: "error" };
    }

    return { kind: "ok", svg };
  } catch {
    return { kind: "error" };
  }
}

export async function getOpenMojiSvg(code: string): Promise<string | null> {
  const now = Date.now();
  const { local, failedUntil, notFoundUntil } = getCaches();

  const codes = candidateCodes(code);
  const ttlSeconds = Math.max(CACHE_TTL.publicResultsSeconds, 7 * 24 * 60 * 60);

  for (const candidate of codes) {
    const localEntry = local.get(candidate);
    if (localEntry && localEntry.expiresAtMs > now) {
      local.set(code, localEntry);
      return localEntry.svg;
    }

    if (now < (notFoundUntil.get(candidate) ?? 0)) {
      continue;
    }
    if (now < (failedUntil.get(candidate) ?? 0)) {
      continue;
    }

    const redisHit = await getCacheValue<{ svg: string }>(cacheKey(candidate));
    if (redisHit?.svg) {
      const entry = { svg: redisHit.svg, expiresAtMs: now + LOCAL_CACHE_MS };
      local.set(candidate, entry);
      local.set(code, entry);
      if (candidate !== code) {
        await setCacheValue(cacheKey(code), { svg: redisHit.svg }, ttlSeconds);
      }
      return redisHit.svg;
    }

    const fetched = await fetchFromCdn(candidate);
    if (fetched.kind === "ok") {
      failedUntil.delete(candidate);
      notFoundUntil.delete(candidate);
      const entry = { svg: fetched.svg, expiresAtMs: now + LOCAL_CACHE_MS };
      local.set(candidate, entry);
      local.set(code, entry);
      await setCacheValue(cacheKey(candidate), { svg: fetched.svg }, ttlSeconds);
      if (candidate !== code) {
        await setCacheValue(cacheKey(code), { svg: fetched.svg }, ttlSeconds);
      }
      return fetched.svg;
    }

    if (fetched.kind === "not-found") {
      failedUntil.delete(candidate);
      notFoundUntil.set(candidate, now + NOT_FOUND_CACHE_MS);
      continue;
    }

    failedUntil.set(candidate, now + FAILURE_COOLDOWN_MS);
  }

  return null;
}
