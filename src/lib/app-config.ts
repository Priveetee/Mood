const FALLBACK_BASE_URL = "http://localhost:3001";

function normalizeTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getAppBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
  const safeUrl =
    configuredUrl && configuredUrl.trim().length > 0 ? configuredUrl : FALLBACK_BASE_URL;
  return normalizeTrailingSlash(safeUrl);
}
