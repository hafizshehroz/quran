import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

export type IconName = 'home' | 'book' | 'list' | 'layers' | 'bookmark' | 'menu' | 'close' | 'arrow' | 'back' | 'search' | 'settings' | 'sun' | 'moon' | 'system' | 'info' | 'shield' | 'check' | 'jump' | 'more';
const paths: Record<IconName, string> = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  book: 'M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z',
  list: 'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
  layers: 'm12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5M3 18l9 5 9-5',
  bookmark: 'M6 3h12v18l-6-4-6 4Z',
  menu: 'M4 6h16M4 12h16M4 18h11',
  close: 'm6 6 12 12M6 18 18 6',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  back: 'M20 12H5m6-6-6 6 6 6',
  search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  moon: 'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z',
  system: 'M3 4h18v13H3ZM8 21h8m-4-4v4',
  info: 'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Zm-5 10 3 3 7-7',
  check: 'm5 12 4 4L20 5',
  jump: 'M4 3v18m16-18v18M8 8l4 4-4 4m8-8-4 4 4 4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};
export function Icon({ name, size = 22, color = '#285E49', filled = false }: { name: IconName; size?: number; color?: string; filled?: boolean }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round"><Path d={paths[name]} /></Svg>;
}

export function MushafMotif({ size = 150, color = '#C4B07C' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 160 160" fill="none" stroke={color} strokeWidth={0.85} aria-hidden>
    <Circle cx="80" cy="80" r="62" /><Circle cx="80" cy="80" r="54" />
    <Polygon points="80,8 101,29 131,29 131,59 152,80 131,101 131,131 101,131 80,152 59,131 29,131 29,101 8,80 29,59 29,29 59,29" />
    <Rect x="36" y="36" width="88" height="88" transform="rotate(45 80 80)" />
    <Path d="M80 55v55m0-55c-12-9-23-9-35-6v50c12-3 23-3 35 6 12-9 23-9 35-6V49c-12-3-23-3-35 6Z" strokeWidth="1.5" />
    <Path d="M52 62c7-1 12 0 20 4m-20 6c7-1 12 0 20 4m-20 6c7-1 12 0 20 4m16-20c8-4 13-5 20-4m-20 14c8-4 13-5 20-4m-20 14c8-4 13-5 20-4" />
  </Svg>;
}
