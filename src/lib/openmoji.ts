const OPENMOJI_CODE_PATTERN = /^[0-9A-F]+(?:-[0-9A-F]+)*$/;

export function normalizeOpenMojiCode(rawCode: string): string | null {
  const normalized = rawCode.trim().toUpperCase();
  if (normalized.length === 0) {
    return null;
  }
  return OPENMOJI_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function openMojiPath(rawCode: string): string {
  const code = normalizeOpenMojiCode(rawCode);
  return code ? `/api/openmoji/${code}` : "/icon.svg";
}
