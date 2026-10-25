import { firstQuranPage, isValidPage, pdfConfig, type NavigationMaps } from './quran';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Bookmark = { page: number; createdAt: string };
export type ReadingPosition = { page: number; updatedAt: string; surahId?: number; juzId?: number };
export type Preferences = {
  version: 1;
  edition: string;
  theme: ThemePreference;
  lastRead: ReadingPosition | null;
  bookmarks: Bookmark[];
  reader: { dim: boolean; direction: 'rtl' | 'ltr'; fit: 'page' | 'width' };
  maps: NavigationMaps;
};

export function defaultPreferences(): Preferences {
  return {
    version: 1, edition: pdfConfig.id, theme: 'system', lastRead: null,
    bookmarks: [], reader: { dim: false, direction: 'rtl', fit: 'page' }, maps: { surah: {}, juz: {} },
  };
}

export function parsePreferences(raw: string | null): Preferences {
  const defaults = defaultPreferences();
  if (!raw) return defaults;
  const input = JSON.parse(raw);
  if (!input || typeof input !== 'object' || input.version !== 1) {
    throw new Error('Saved data uses an unsupported format. It has been preserved.');
  }
  const result = { ...defaults };
  if (['system', 'light', 'dark'].includes(input.theme)) result.theme = input.theme;
  if (typeof input.reader?.dim === 'boolean') result.reader.dim = input.reader.dim;
  if (input.reader?.direction === 'ltr') result.reader.direction = 'ltr';
  if (input.reader?.fit === 'width') result.reader.fit = 'width';
  // Changing the PDF must never reuse another edition's bookmarks or mappings.
  if (input.edition !== pdfConfig.id) return result;
  if (isValidPage(input.lastRead?.page) && typeof input.lastRead.updatedAt === 'string' && Number.isFinite(Date.parse(input.lastRead.updatedAt))) {
    result.lastRead = { page: input.lastRead.page, updatedAt: input.lastRead.updatedAt };
    if (Number.isInteger(input.lastRead.surahId) && input.lastRead.surahId >= 1 && input.lastRead.surahId <= 114) result.lastRead.surahId = input.lastRead.surahId;
    if (Number.isInteger(input.lastRead.juzId) && input.lastRead.juzId >= 1 && input.lastRead.juzId <= 30) result.lastRead.juzId = input.lastRead.juzId;
  }
  if (Array.isArray(input.bookmarks)) {
    const seen = new Set<number>();
    result.bookmarks = input.bookmarks.filter((b: Bookmark) => {
      if (!b || !isValidPage(b.page) || typeof b.createdAt !== 'string' || !Number.isFinite(Date.parse(b.createdAt)) || seen.has(b.page)) return false;
      seen.add(b.page);
      return true;
    }).map((b: Bookmark) => ({ page: b.page, createdAt: b.createdAt }));
  }
  for (const kind of ['surah', 'juz'] as const) {
    if (input.maps?.[kind] && typeof input.maps[kind] === 'object') {
      for (const [id, mapping] of Object.entries(input.maps[kind])) {
        const m = mapping as { page?: unknown } | null;
        if (Number(id) >= 1 && Number(id) <= (kind === 'surah' ? 114 : 30) && Number.isInteger(Number(id)) && typeof m?.page === 'number' && isValidPage(m.page)) {
          result.maps[kind][id] = { page: m.page, verifiedBy: 'user' };
        }
      }
    }
  }
  return result;
}


export const initialReaderPage = (p: Preferences) => p.lastRead?.page ?? firstQuranPage;
