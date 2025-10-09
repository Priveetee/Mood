// Simple function to add alpha transparency to hsl colors
export function transparentize(hslColor: string, opacity: number): string {
  // Regex to capture HSL values
  const match = hslColor.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) return hslColor;
  
  const [, h, s, l] = match;
  return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
}
