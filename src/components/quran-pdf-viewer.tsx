import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, View, type ListViewToken } from 'react-native';
import { Image } from 'expo-image';
import { PDF_PAGES } from '../data/pdf-pages';
import { useApp } from '../state/app-state';
import { AppText, Button } from './ui';

type PdfPage = (typeof PDF_PAGES)[number];
const viewability = { itemVisiblePercentThreshold: 80, minimumViewTime: 200 };
const PageImage = memo(function PageImage({ item, width, height, dim, fitWidth = false, onDisplayed }: { item: PdfPage; width: number; height: number; dim: boolean; fitWidth?: boolean; onDisplayed?: () => void }) {
  const { colors } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const availableWidth = Math.max(1, width - 16);
  const availableHeight = Math.max(1, height - 12);
  const scale = fitWidth ? availableWidth / item.width : Math.min(availableWidth / item.width, availableHeight / item.height);
  const pageWidth = item.width * scale;
  const pageHeight = item.height * scale;
  return <View style={{ width, height: fitWidth && !error ? Math.max(height, pageHeight + 12) : height, alignItems: 'center', justifyContent: 'center' }}>
    {error ? <View style={{ padding: 30, gap: 16, alignItems: 'center', maxWidth: 340 }}>
      <AppText style={{ textAlign: 'center' }}>This page could not be opened.</AppText><AppText muted style={{ fontSize: 12, textAlign: 'center' }}>The page asset may be missing. Retry, or reopen the app after restoring the Quran pages.</AppText>
      <Button secondary onPress={() => { setError(false); setLoading(true); setAttempt(a => a + 1); }}>Try again</Button>
    </View> : <View style={{ width: pageWidth, height: pageHeight, backgroundColor: '#FFFDF1' }}>
      <Image key={attempt} source={item.source} style={{ width: pageWidth, height: pageHeight }} contentFit="contain" cachePolicy="disk" transition={0}
        recyclingKey={String(item.page)} accessibilityLabel={'Original Quran PDF page ' + item.page + '. Scanned page; accessible text is not available.'}
        onLoadStart={() => setLoading(true)} onLoad={() => { setLoading(false); onDisplayed?.(); }} onError={() => { setError(true); setLoading(false); }} />
      {dim && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />}
      {loading && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.min(pageHeight, availableHeight), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}><ActivityIndicator color={colors.primary} /><AppText muted style={{ fontSize: 12, marginTop: 12 }}>Opening page {item.page}…</AppText></View>}
    </View>}
  </View>;
});

export function QuranPdfViewer({ page, onPageChange, width, height, listRef, onInteraction }: { page: number; onPageChange: (page: number) => void; width: number; height: number; listRef: React.RefObject<FlatList<PdfPage> | null>; onInteraction?: () => void }) {
  const { preferences } = useApp();
  const onChangeRef = useRef(onPageChange);
  useEffect(() => { onChangeRef.current = onPageChange; }, [onPageChange]);
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const item = viewableItems.find(token => token.isViewable)?.item;
    if (item) onChangeRef.current(item.page);
  }, []);
  if (preferences.reader.fit === 'width') {
    return <ScrollView key={page} testID="reader-width-scroll" style={{ flex: 1 }} directionalLockEnabled contentContainerStyle={{ alignItems: 'center' }}>
      <PageImage item={PDF_PAGES[page - 1]} width={width} height={height} dim={preferences.reader.dim} fitWidth onDisplayed={() => onPageChange(page)} />
    </ScrollView>;
  }
  return <FlatList ref={listRef} data={PDF_PAGES} horizontal pagingEnabled inverted={preferences.reader.direction === 'rtl'}
    initialScrollIndex={page - 1} getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
    keyExtractor={item => String(item.page)} showsHorizontalScrollIndicator={false}
    initialNumToRender={1} maxToRenderPerBatch={2} windowSize={3}
    onViewableItemsChanged={onViewable} viewabilityConfig={viewability}
    onScrollBeginDrag={onInteraction}
    onScrollToIndexFailed={({ index }) => listRef.current?.scrollToOffset({ offset: width * index, animated: false })}
    renderItem={({ item }) => <PageImage item={item} width={width} height={height} dim={preferences.reader.dim} />}
    style={{ flex: 1, direction: 'ltr' }}
  />;
}
