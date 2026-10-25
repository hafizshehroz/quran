import chapters from '../data/chapters.json';
import canonicalJuzs from '../data/juzs.json';
import editionJuz from '../data/edition-juz.json';
import editionSurahs from '../data/edition-surahs.json';
import document from '../data/pdf-document.json';
const PDF_PAGE_COUNT = document.pageCount;
const PDF_SHA256 = document.sha256;
export const juzs = PDF_SHA256 === editionJuz.sha256
  ? editionJuz.entries.map(({ id, surah, ayah }) => ({ id, surah, ayah }))
  : canonicalJuzs;

export { chapters };
export type Chapter = (typeof chapters)[number];
export type IndexKind = 'surah' | 'juz';
export type PageMapping = { page: number; verifiedBy: 'review' | 'user' };
export type NavigationMaps = Record<IndexKind, Record<string, PageMapping>>;

// PDF ordinals are 1-based. Printed folios cannot be derived by a fixed offset.
export const pdfConfig = {
  id: PDF_SHA256,
  title: 'Tajweed Mushaf',
  totalPages: PDF_PAGE_COUNT,
  sourcePath: 'assets/quran.pdf',
  renderer: 'faithful-page-images',
  metadataSource: 'https://api.quran.com/api/v4/chapters?language=en',
  juzSource: 'https://api.quran.com/api/v4/juzs',
};

const reviewedEdition = '9985b515f88a0b47762864d5e86be632edc575c8999113285ba51623c842797e';
export const firstQuranPage = PDF_SHA256 === reviewedEdition ? 2 : 1;
// Visually checked against this exact scan. Never use the API's Madani pages.
export const reviewedMaps: NavigationMaps = PDF_SHA256 === reviewedEdition ? {
  surah: Object.fromEntries(editionSurahs.entries.map(s => [s.id, { page: s.page, verifiedBy: 'review' as const }])),
  juz: Object.fromEntries(editionJuz.entries.map(j => [j.id, { page: j.page, verifiedBy: 'review' as const }])),
} : { surah: {}, juz: {} };

export function isValidPage(page: number): boolean {
  return Number.isInteger(page) && page >= 1 && page <= PDF_PAGE_COUNT;
}

export function getMapping(maps: NavigationMaps, kind: IndexKind, id: number) {
  return maps[kind][id] ?? reviewedMaps[kind][id];
}

export function chapterName(id: number) {
  return chapters.find(chapter => chapter.id === id)?.name ?? 'Quran';
}

// Range inference is allowed only for a complete, ordered edition index.
export function pageNames(page: number, maps: NavigationMaps): string {
  const names = chapters.filter(c => getMapping(maps, 'surah', c.id)?.page === page).map(c => c.name);
  if (names.length) return names.join(' · ');
  const context = readingContext(page, maps);
  return context.surahId ? chapterName(context.surahId) : 'PDF page ' + page;
}

export function normalizeSearch(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/[^\p{L}\p{N}]/gu, '');
}

export function readingContext(page: number, maps: NavigationMaps): { surahId?: number; juzId?: number } {
  const context: { surahId?: number; juzId?: number } = {};
  for (const kind of ['surah', 'juz'] as const) {
    const count = kind === 'surah' ? 114 : 30;
    const entries = Array.from({ length: count }, (_, i) => ({ id: i + 1, mapping: getMapping(maps, kind, i + 1) }));
    const complete = entries.every((entry, i) => entry.mapping && isValidPage(entry.mapping.page)
      && (i === 0 || entry.mapping.page >= (entries[i - 1].mapping?.page ?? Infinity)));
    if (kind === 'surah' && entries.filter(entry => entry.mapping?.page === page).length > 1) continue;
    const selected = complete
      ? entries.filter(entry => entry.mapping!.page <= page).at(-1)
      : entries.find(entry => entry.mapping?.page === page);
    if (selected) {
      if (kind === 'surah') context.surahId = selected.id;
      else context.juzId = selected.id;
    }
  }
  return context;
}
