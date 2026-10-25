import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/app-state';
import { PDF_PAGES } from '../data/pdf-pages';
import { chapterName, isValidPage, pageNames, pdfConfig } from '../services/quran';
import { initialReaderPage } from '../services/persistence';
import { AppText, Button, IconButton } from '../components/ui';
import { QuranPdfViewer } from '../components/quran-pdf-viewer';
import { PageJump } from '../components/page-jump';

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ page?: string; assign?: string; id?: string; surahId?: string; juzId?: string }>();
  const { colors, preferences, recordPage, toggleBookmark, setMapping, setReader } = useApp();
  const insets = useSafeAreaInsets();
  const initial = isValidPage(Number(params.page)) ? Number(params.page) : initialReaderPage(preferences);
  const [page, setPage] = useState(initial);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const list = useRef<FlatList<(typeof PDF_PAGES)[number]>>(null);
  const assignment = params.assign === 'surah' || params.assign === 'juz' ? params.assign : undefined;
  const id = Number(params.id);
  const assigning = !!assignment && Number.isInteger(id) && id >= 1 && id <= (assignment === 'surah' ? 114 : 30);
  const assignmentName = assignment === 'surah' ? chapterName(id) : 'Juz ' + id;
  const selected = preferences.bookmarks.some(b => b.page === page);
  const originPage = useRef(initial);
  const pageChanged = useCallback((next: number) => {
    if (!isValidPage(next)) return;
    setPage(next);
    router.setParams({ page: String(next) });
    if (!assigning) recordPage(next, next === originPage.current ? {
      ...(Number(params.surahId) >= 1 && Number(params.surahId) <= 114 ? { surahId: Number(params.surahId) } : {}),
      ...(Number(params.juzId) >= 1 && Number(params.juzId) <= 30 ? { juzId: Number(params.juzId) } : {}),
    } : undefined);
  }, [assigning, recordPage, params.surahId, params.juzId]);
  const goTo = (next: number) => {
    if (!isValidPage(next)) return;
    list.current?.scrollToIndex({ index: next - 1, animated: false });
    pageChanged(next);
  };
  return <View style={{ flex: 1, backgroundColor: colors.reader, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.background }}>
      <IconButton icon="back" label="Close reader" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      <View style={{ flex: 1, paddingHorizontal: 6 }}><AppText numberOfLines={1} style={{ fontWeight: '600', fontSize: 14 }}>{assigning ? assignmentName : pageNames(page, preferences.maps)}</AppText><AppText muted style={{ fontSize: 10, lineHeight: 16 }}>{assigning ? 'Find and check its starting page' : 'YOUR ORIGINAL MUSHAF'}</AppText></View>
      <IconButton icon="jump" label={preferences.reader.fit === 'width' ? 'Fit whole page to screen' : 'Fit page to width'} active={preferences.reader.fit === 'width'} onPress={() => setReader({ fit: preferences.reader.fit === 'width' ? 'page' : 'width' })} />
      <IconButton icon="moon" label={preferences.reader.dim ? 'Restore original brightness' : 'Soften page brightness'} active={preferences.reader.dim} onPress={() => setReader({ dim: !preferences.reader.dim })} />
      {!assigning && <IconButton icon="bookmark" label={selected ? 'Remove bookmark' : 'Bookmark this page'} active={selected} onPress={() => toggleBookmark(page)} />}
    </View>
    <View style={{ flex: 1 }} onLayout={event => {
      const { width, height } = event.nativeEvent.layout;
      if (width > 0 && height > 0) setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    }}>
      {size.width > 0 && size.height > 0 && <QuranPdfViewer key={size.width + ':' + size.height + ':' + preferences.reader.direction} page={page} onPageChange={pageChanged} width={size.width} height={size.height} listRef={list} />}
    </View>
    <View style={{ paddingBottom: Math.max(12, insets.bottom), paddingHorizontal: 14, paddingTop: 7, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Button secondary disabled={page <= 1} onPress={() => goTo(page - 1)} label="Previous PDF page" style={{ paddingHorizontal: 14, minHeight: 46 }}>Previous</Button>
        <Pressable accessibilityRole="button" accessibilityLabel={'PDF page ' + page + ' of ' + pdfConfig.totalPages + '. Jump to page'} onPress={() => setJumpOpen(true)} style={{ minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center' }}><AppText style={{ fontSize: 13, fontWeight: '600' }}>{page} / {pdfConfig.totalPages}</AppText><AppText muted style={{ fontSize: 10, lineHeight: 15 }}>PDF PAGE · TAP TO JUMP</AppText></Pressable>
        <Button secondary disabled={page >= pdfConfig.totalPages} onPress={() => goTo(page + 1)} label="Next PDF page" style={{ paddingHorizontal: 14, minHeight: 46 }}>Next</Button>
      </View>
      {assigning ? <View style={{ paddingTop: 10, gap: 8 }}><AppText muted style={{ fontSize: 11, lineHeight: 17, textAlign: 'center' }}>Confirm only after checking that {assignmentName} begins on this page. This link is saved on your device.</AppText><Button onPress={() => { if (assignment) setMapping(assignment, id, page); router.back(); }}>{'Confirm start: PDF page ' + page}</Button></View> : <AppText muted style={{ fontSize: 10, textAlign: 'center', lineHeight: 18, paddingTop: 3 }}>{preferences.reader.fit === 'width' ? 'Scroll to read · Use Previous / Next to turn pages' : preferences.reader.direction === 'rtl' ? 'Swipe right for the next page' : 'Swipe left for the next page'}{preferences.reader.dim ? ' · Soft brightness on' : ''}</AppText>}
    </View>
    {jumpOpen && <PageJump currentPage={page} onClose={() => setJumpOpen(false)} onJump={goTo} />}
  </View>;
}
