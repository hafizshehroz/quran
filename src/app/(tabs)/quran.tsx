import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { PDF_PAGES } from '../../data/pdf-pages';
import { initialReaderPage } from '../../services/persistence';
import { pdfConfig } from '../../services/quran';
import { useApp } from '../../state/app-state';
import { AppText, Button, Screen, SectionLabel, serif } from '../../components/ui';

export default function QuranScreen() {
  const { preferences, colors } = useApp();
  const page = initialReaderPage(preferences);
  return <Screen title="Your Mushaf" subtitle="A quiet space to read">
    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
      <View style={{ width: 210, height: 305, backgroundColor: colors.reader, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.border }}>
        <Image source={PDF_PAGES[page - 1]?.source} style={{ flex: 1 }} contentFit="contain" accessibilityLabel={'Preview of PDF page ' + page} />
      </View>
      <AppText style={{ fontFamily: serif, fontSize: 28, lineHeight: 36, marginTop: 25 }}>Read at your own pace.</AppText>
      <AppText muted style={{ textAlign: 'center', marginVertical: 12, maxWidth: 320 }}>The original pages, just as they appear in your PDF. Swipe, save a page, and pick up where you left off.</AppText>
      <Button icon="book" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => router.push({ pathname: '/reader', params: { page } })}>{preferences.lastRead ? 'Resume at page ' + page : 'Open the Quran'}</Button>
    </View>
    <SectionLabel style={{ marginTop: 26 }}>This edition</SectionLabel>
    <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingVertical: 16, gap: 8 }}>
      <AppText>{pdfConfig.title} · {pdfConfig.totalPages} PDF pages</AppText>
      <AppText muted style={{ fontSize: 13 }}>Includes the original cover. PDF page numbers may differ from the printed numbers. Scan quality is limited to the source PDF.</AppText>
      <AppText muted style={{ fontSize: 13 }}>All Surah and Juz links follow this edition’s own pagination. They were checked against the original scan.</AppText>
    </View>
  </Screen>;
}
