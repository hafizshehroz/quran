import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useApp } from '../../state/app-state';
import { initialReaderPage } from '../../services/persistence';
import { chapterName, pageNames, pdfConfig } from '../../services/quran';
import { AppText, Screen, SectionLabel, serif } from '../../components/ui';
import { Icon, MushafMotif, type IconName } from '../../components/icon';
import { AdBanner } from '../../components/ad-banner';

export default function HomeScreen() {
  const { colors, preferences } = useApp();
  const page = initialReaderPage(preferences);
  const openReader = () => router.push({ pathname: '/reader', params: { page } });
  const shortcuts: { label: string; detail: string; icon: IconName; href: Href }[] = [
    { label: 'Surah index', detail: '114 chapters', icon: 'list', href: '/surahs' },
    { label: 'Juz index', detail: '30 parts', icon: 'layers', href: '/juz' },
    { label: 'Bookmarks', detail: preferences.bookmarks.length + ' saved pages', icon: 'bookmark', href: '/bookmarks' },
    { label: 'Settings', detail: 'Make it your own', icon: 'settings', href: '/settings' },
  ];
  return <Screen title="Holy Quran" subtitle="Your daily companion">
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 12 }}>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700', color: colors.gold, marginBottom: 10 }}>READ · REFLECT · RETURN</AppText>
        <AppText accessibilityRole="header" style={{ fontFamily: serif, fontSize: 32, lineHeight: 39 }}>A little stillness.{'\n'}A deeper connection.</AppText>
        <AppText muted style={{ fontSize: 13, marginTop: 12, lineHeight: 21 }}>Make space for the Quran in your day.</AppText>
      </View>
      <View style={{ width: 94, overflow: 'hidden' }}><MushafMotif size={94} color={colors.gold} /></View>
    </View>
    <View style={{ backgroundColor: '#244E3D', padding: 23, borderRadius: 20, marginBottom: 30, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -45, top: -48, opacity: 0.15 }}><MushafMotif size={200} color="#E9DCB8" /></View>
      <AppText style={{ color: '#CEDECF', fontSize: 10, letterSpacing: 2, fontWeight: '600', marginBottom: 18 }}>{preferences.lastRead ? 'CONTINUE YOUR JOURNEY' : 'BEGIN YOUR JOURNEY'}</AppText>
      <AppText style={{ color: '#FFF9EA', fontFamily: serif, fontSize: 28, lineHeight: 36 }}>{preferences.lastRead ? preferences.lastRead.surahId ? chapterName(preferences.lastRead.surahId) : pageNames(page, preferences.maps) : 'The Quran awaits.'}</AppText>
      <AppText style={{ color: '#C4D4C6', fontSize: 13, marginTop: 6 }}>PDF page {page} of {pdfConfig.totalPages}</AppText>
      {preferences.lastRead?.juzId && <AppText style={{ color: '#C4D4C6', fontSize: 12 }}>Juz {preferences.lastRead.juzId}</AppText>}
      {preferences.lastRead && <View accessibilityLabel={'Reading position: page ' + page + ' of ' + pdfConfig.totalPages} style={{ marginTop: 18, height: 3, borderRadius: 2, backgroundColor: '#426451', overflow: 'hidden' }}><View style={{ width: (page / pdfConfig.totalPages * 100) + '%', height: 3, backgroundColor: '#D3BF87' }} /></View>}
      <Pressable onPress={openReader} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 23, backgroundColor: '#F2ECDC', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.8 : 1 })}>
        <AppText style={{ color: '#244E3D', fontWeight: '600' }}>{preferences.lastRead ? 'Continue reading' : 'Read Quran'}</AppText><Icon name="arrow" color="#244E3D" size={20} />
      </Pressable>
    </View>
    <SectionLabel>Explore your Mushaf</SectionLabel>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {shortcuts.map(item => <Pressable key={item.label} onPress={() => router.navigate(item.href)} accessibilityRole="button" style={({ pressed }) => ({ flexBasis: '47%', flexGrow: 1, minWidth: 125, padding: 19, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.surfaceAlt : colors.surface })}>
        <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.primarySoft, marginBottom: 16 }}><Icon name={item.icon} color={colors.primary} size={20} /></View>
        <AppText style={{ fontWeight: '600', fontSize: 14 }}>{item.label}</AppText><AppText muted style={{ fontSize: 12, marginTop: 3 }}>{item.detail}</AppText>
      </Pressable>)}
    </View>
    <View style={{ marginTop: 28, flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border }}><Icon name="book" color={colors.gold} size={20} /><AppText muted style={{ fontSize: 12, flex: 1 }}>Your original Mushaf. Available offline.{'\n'}No interruptions while you read.</AppText></View>
    <AdBanner placement="home" />
  </Screen>;
}
