import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { chapters, chapterName, getMapping, juzs, normalizeSearch, type IndexKind } from '../services/quran';
import { initialReaderPage } from '../services/persistence';
import { useApp } from '../state/app-state';
import { AppText, EmptyState, IconButton, Screen, SearchField, SectionLabel } from './ui';
import { AdBanner } from './ad-banner';

export function QuranIndex({ kind }: { kind: IndexKind }) {
  const { colors, preferences } = useApp();
  const [search, setSearch] = useState('');
  const surahs = kind === 'surah';
  const complete = (surahs ? chapters : juzs).every(item => !!getMapping(preferences.maps, kind, item.id));
  const items = useMemo(() => {
    const normalized = normalizeSearch(search);
    return (surahs ? chapters.map(c => ({
      id: c.id, name: c.name, arabic: c.arabic, description: c.ayahs + ' ayahs · ' + (c.revelation === 'makkah' ? 'Makki' : 'Madani'), search: c.name + c.arabic + c.translation + c.id,
    })) : juzs.map(j => ({
      id: j.id, name: 'Juz ' + j.id, arabic: 'الجزء ' + j.id.toLocaleString('ar'), description: chapterName(j.surah) + ' · Ayah ' + j.ayah, search: 'juz' + j.id + chapterName(j.surah),
    }))).filter(item => normalizeSearch(item.search).includes(normalized));
  }, [search, surahs]);
  const open = (id: number, assign = false) => {
    const mapping = getMapping(preferences.maps, kind, id);
    router.push({ pathname: '/reader', params: {
      page: mapping?.page ?? initialReaderPage(preferences),
      ...(assign || !mapping ? { assign: kind, id } : kind === 'surah' ? { surahId: id } : { juzId: id }),
    } });
  };
  return <Screen title={surahs ? 'Surah index' : 'Juz index'} subtitle={surahs ? 'Find a chapter. Find your moment.' : 'Thirty parts. One continuous journey.'} scroll={false}>
    <FlatList data={items} keyExtractor={item => String(item.id)} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, maxWidth: 760, width: '100%', alignSelf: 'center' }}
      ListHeaderComponent={<View>
        <SearchField value={search} onChange={setSearch} placeholder={surahs ? 'Search by Arabic or English name' : 'Search Juz or starting Surah'} />
        <View style={{ padding: 13, borderRadius: 12, backgroundColor: colors.primarySoft, marginBottom: 22 }}>
          <AppText style={{ color: colors.primary, fontSize: 12, lineHeight: 19 }}>{complete ? 'Page links checked against your original Mushaf. Tap an entry to begin reading.' : 'Page links are specific to your Mushaf. Tap an unlinked entry to find and confirm its first page.'}</AppText>
        </View>
        <SectionLabel>{surahs ? '114 Surahs' : '30 Juz'}</SectionLabel>
      </View>}
      ListEmptyComponent={<EmptyState icon="search" title="No matches yet" description="Try a different spelling, Arabic name, or number." action="Clear search" onAction={() => setSearch('')} />}
      ListFooterComponent={<AdBanner placement={surahs ? 'surahs' : 'juz'} />}
      renderItem={({ item }) => {
        const mapping = getMapping(preferences.maps, kind, item.id);
        return <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border }}>
          <Pressable onPress={() => open(item.id)} accessibilityRole="button" accessibilityLabel={item.name + ', ' + item.description + (mapping ? ', PDF page ' + mapping.page : ', set starting page')}
            style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18, opacity: pressed ? 0.6 : 1 })}>
            <View style={{ height: 38, width: 38, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><AppText style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{String(item.id).padStart(2, '0')}</AppText></View>
            <View style={{ flex: 1, gap: 3 }}>
              <AppText style={{ fontSize: 15, fontWeight: '600' }}>{item.name}</AppText>
              <AppText muted style={{ fontSize: 11, lineHeight: 17 }}>{item.description}</AppText>
              <AppText style={{ color: colors.primary, fontSize: 11, lineHeight: 17 }}>{mapping ? 'PDF page ' + mapping.page + (mapping.verifiedBy === 'user' ? ' · Your link' : '') : 'Set page link'}</AppText>
            </View>
            <AppText style={{ fontSize: 22, lineHeight: 38, textAlign: 'right', writingDirection: 'rtl', maxWidth: '38%' }}>{item.arabic}</AppText>
          </Pressable>
          {mapping && <IconButton icon="more" label={'Edit starting page for ' + item.name} onPress={() => open(item.id, true)} />}
        </View>;
      }} />
  </Screen>;
}
