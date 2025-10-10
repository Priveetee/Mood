export function transparentize(hslColor: string, opacity: number): string {
  const match = hslColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return hslColor;
  
  const [, h, s, l] = match;
  return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
}
