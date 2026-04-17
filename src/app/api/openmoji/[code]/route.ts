import { normalizeOpenMojiCode } from "@/lib/openmoji";
import { getOpenMojiSvg } from "@/server/modules/openmoji/proxy";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await context.params;
  const code = normalizeOpenMojiCode(rawCode);
  if (!code) {
    return new Response("Invalid OpenMoji code", { status: 400 });
  }

  const svg = await getOpenMojiSvg(code);
  if (!svg) {
    return new Response("OpenMoji not found", { status: 404 });
  }

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
