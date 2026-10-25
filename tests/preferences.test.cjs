const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

// Run pure TypeScript domain modules with Node, without a native renderer.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};
const { defaultPreferences, parsePreferences, initialReaderPage } = require('../src/services/preferences.ts');
const { chapters, juzs, getMapping, reviewedMaps, isValidPage, normalizeSearch, pdfConfig, pageNames, readingContext } = require('../src/services/quran.ts');

test('an edition change keeps appearance but never reuses pages and links', () => {
  const old = { ...defaultPreferences(), edition: 'another-edition', theme: 'dark',
    lastRead: { page: 25, updatedAt: '2026-10-25T00:00:00Z' },
    bookmarks: [{ page: 30, createdAt: '2026-10-25T00:00:00Z' }],
    maps: { surah: { '2': { page: 9 } }, juz: {} } };
  const loaded = parsePreferences(JSON.stringify(old));
  assert.equal(loaded.theme, 'dark');
  assert.equal(loaded.lastRead, null);
  assert.deepEqual(loaded.bookmarks, []);
  assert.deepEqual(loaded.maps, { surah: {}, juz: {} });
  assert.equal(loaded.edition, pdfConfig.id);
});

test('invalid storage is reported instead of silently replacing saved data', () => {
  assert.throws(() => parsePreferences('{'));
  assert.throws(() => parsePreferences('null'));
  assert.throws(() => parsePreferences('{"version":99}'));
});

test('bounds, duplicate bookmarks, and invalid links are sanitized', () => {
  const data = defaultPreferences();
  data.lastRead = { page: pdfConfig.totalPages + 1, updatedAt: '2026-10-25T00:00:00Z' };
  data.bookmarks = [2, 2, 0, 3.5, pdfConfig.totalPages + 1].map(page => ({ page, createdAt: '2026-10-25T00:00:00Z' }));
  data.maps = { surah: { '0': { page: 3 }, '1': { page: 2 }, '115': { page: 4 }, '2': null }, juz: { '1': { page: 2 }, '31': { page: 3 } } };
  const result = parsePreferences(JSON.stringify(data));
  assert.equal(result.lastRead, null);
  assert.deepEqual(result.bookmarks.map(b => b.page), [2]);
  assert.deepEqual(Object.keys(result.maps.surah), ['1']);
  assert.deepEqual(Object.keys(result.maps.juz), ['1']);
  assert.equal(isValidPage(NaN), false);
  assert.equal(isValidPage(1.5), false);
  assert.equal(isValidPage(pdfConfig.totalPages), true);
});

test('reading position, preferences and verified local links survive a round trip', () => {
  const data = defaultPreferences();
  data.theme = 'light';
  data.reader = { dim: true, direction: 'ltr', fit: 'width' };
  data.lastRead = { page: 42, updatedAt: '2026-10-25T00:00:00Z', surahId: 2 };
  data.maps.surah['2'] = { page: 3, verifiedBy: 'user' };
  data.bookmarks.push({ page: 549, createdAt: '2026-10-25T00:00:00Z' });
  const restored = parsePreferences(JSON.stringify(data));
  assert.deepEqual(restored, data);
  assert.equal(initialReaderPage(restored), 42);
});

test('verified mappings follow this edition, including shared-page chapter starts', () => {
  const maps = { surah: {}, juz: {} };
  assert.equal(getMapping(maps, 'surah', 1).page, 2);
  assert.equal(getMapping(maps, 'surah', 3).page, 46);
  assert.equal(getMapping(maps, 'juz', 2).page, 21);
  assert.equal(pageNames(25, maps), 'Al-Baqarah');
  assert.equal(readingContext(25, maps).juzId, 2);
  assert.equal(getMapping(maps, 'surah', 113).page, getMapping(maps, 'surah', 114).page);
  assert.equal(readingContext(549, maps).surahId, undefined);
  assert.equal(readingContext(1, maps).juzId, undefined);
  assert.equal(juzs.find(j => j.id === 4).ayah, 92);
  assert.equal(juzs.find(j => j.id === 14).ayah, 2);
  for (const kind of ['surah', 'juz']) {
    for (const mapping of Object.values(reviewedMaps[kind])) assert.ok(isValidPage(mapping.page));
  }
});

test('bundled Quran metadata is complete and Juz references are valid', () => {
  assert.equal(chapters.length, 114);
  assert.equal(juzs.length, 30);
  assert.deepEqual(chapters.map(c => c.id), Array.from({ length: 114 }, (_, i) => i + 1));
  assert.deepEqual(juzs.map(j => j.id), Array.from({ length: 30 }, (_, i) => i + 1));
  for (const j of juzs) {
    const chapter = chapters.find(c => c.id === j.surah);
    assert.ok(chapter && j.ayah >= 1 && j.ayah <= chapter.ayahs);
  }
  assert.equal(normalizeSearch('Al-Fātiḥah'), normalizeSearch('al fatihah'));
  assert.equal(normalizeSearch('إِبْرَاهِيم'), normalizeSearch('ابراهيم'));
});
