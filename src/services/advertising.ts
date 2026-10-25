// UI reservations only. No SDK, tracking, network calls, or production IDs.
export type AdPlacement = 'home' | 'surahs' | 'juz' | 'bookmarks';
export const advertising = {
  showPlaceholders: __DEV__ && process.env.EXPO_PUBLIC_AD_PLACEHOLDERS === 'true',
  placements: { home: true, surahs: true, juz: true, bookmarks: true },
  readerAds: false,
} as const;
