import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/app-state';
import { pageNames } from '../../services/quran';
import { AppText, EmptyState, IconButton, Screen, SectionLabel } from '../../components/ui';
import { Icon } from '../../components/icon';
import { AdBanner } from '../../components/ad-banner';

export default function BookmarksScreen() {
  const { preferences, colors, toggleBookmark } = useApp();
  const bookmarks = [...preferences.bookmarks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Screen title="Bookmarks" subtitle="Keep a place for what moves you." scroll={false}>
    <FlatList data={bookmarks} keyExtractor={item => String(item.page)}
      contentContainerStyle={{ padding: 24, paddingTop: 18, maxWidth: 760, width: '100%', alignSelf: 'center', flexGrow: 1 }}
      ListHeaderComponent={bookmarks.length ? <SectionLabel>{bookmarks.length + ' saved ' + (bookmarks.length === 1 ? 'page' : 'pages')}</SectionLabel> : undefined}
      ListEmptyComponent={<EmptyState title="A place to return to." description="Tap the bookmark icon while reading to save a page. Your bookmarks stay on this device." action="Read Quran" onAction={() => router.push('/reader')} />}
      ListFooterComponent={<AdBanner placement="bookmarks" />}
      renderItem={({ item }) => <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border }}>
        <Pressable onPress={() => router.push({ pathname: '/reader', params: { page: item.page } })} accessibilityRole="button" accessibilityLabel={'Read bookmarked PDF page ' + item.page}
          style={({ pressed }) => ({ flex: 1, minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 17, paddingVertical: 16, opacity: pressed ? 0.6 : 1 })}>
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: 13, padding: 15 }}><Icon name="bookmark" color={colors.primary} size={22} /></View>
          <View style={{ flex: 1 }}><AppText style={{ fontWeight: '600' }}>{pageNames(item.page, preferences.maps)}</AppText><AppText muted style={{ fontSize: 12 }}>PDF page {item.page}</AppText><AppText muted style={{ fontSize: 11 }}>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</AppText></View>
        </Pressable>
        <IconButton icon="close" label={'Remove bookmark for page ' + item.page} onPress={() => toggleBookmark(item.page)} />
      </View>} />
  </Screen>;
}
