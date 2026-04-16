import { TRPCError } from "@trpc/server";
import { getAppBaseUrl } from "@/lib/app-config";
import { URL_ERRORS } from "./constants";

function getRequestOrigin(request: Request): string | null {
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    return originHeader;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return null;
  }

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function resolveBaseUrl(request?: Request | null): string {
  if (request) {
    const dynamicOrigin = getRequestOrigin(request);
    if (dynamicOrigin) {
      return dynamicOrigin;
    }
  }

  return getAppBaseUrl();
}

export function buildPollUrl(token: string, request?: Request | null): string {
  try {
    const appUrl = resolveBaseUrl(request);
    return `${appUrl}/poll/${token}`;
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: URL_ERRORS.appUrlInvalid,
    });
  }
}
