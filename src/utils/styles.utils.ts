import { ColorSchemeName } from 'react-native';

export const getIsDarkMode = (colorScheme: ColorSchemeName) => colorScheme === 'dark';

/**
 * Converts a hex color to rgba string.
 * @param hex - e.g. '#10B981' or '10B981'
 * @param alpha - 0..1
 */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}