import { View } from 'react-native';
import { AppText, Screen, SectionLabel, serif } from '../components/ui';
import { MushafMotif } from '../components/icon';
import { useApp } from '../state/app-state';
import { pdfConfig } from '../services/quran';

export default function AboutScreen() {
  const { colors } = useApp();
  return <Screen title="About Holy Quran" back>
    <View style={{ alignItems: 'center', paddingVertical: 16, gap: 14 }}><MushafMotif size={110} color={colors.gold} /><AppText style={{ fontFamily: serif, fontSize: 29, lineHeight: 38 }}>A companion for the journey.</AppText><AppText muted style={{ fontSize: 12 }}>Holy Quran · Version 1.0.0</AppText></View>
    <AppText muted style={{ marginVertical: 18 }}>A simple place to read, reflect, and return to the Quran. The reader displays pages rendered from the supplied Tajweed Mushaf PDF, with its original Arabic text, diacritics, colors, and artwork.</AppText>
    <SectionLabel style={{ marginTop: 18 }}>The supplied Mushaf</SectionLabel>
    <AppText style={{ marginBottom: 14 }}>{pdfConfig.totalPages} PDF pages, including the cover. Al-Fatihah begins on PDF page 2 and Al-Baqarah on PDF page 3. The last PDF page contains Al-Falaq and An-Nas.</AppText>
    <AppText muted style={{ marginBottom: 20 }}>PDF ordinals and printed folios are different. This app always labels page numbers as PDF pages. No constant offset or another edition’s page mapping is assumed.</AppText>
    <SectionLabel>Chapter and Juz information</SectionLabel>
    <AppText muted style={{ marginBottom: 20 }}>Names, ayah counts, revelation classifications, and Juz starting references are sourced from Quran.com’s API and bundled for offline use. Revelation classifications follow that source’s convention.</AppText>
    <AppText muted style={{ marginBottom: 20 }}>All 114 Surah and 30 Juz starting pages were visually checked against this scan. Juz references follow this edition’s divisions, which differ in a few places from standard Madani editions. You can adjust a link from its index menu; your changes stay on this device.</AppText>
    <SectionLabel>Faithful reading</SectionLabel>
    <AppText muted style={{ marginBottom: 20 }}>Changing the interface theme does not recolor the Quran page. Optional soft brightness applies a uniform dimming layer. Color inversion is intentionally unavailable because this scan uses Tajweed colors.</AppText>
    <SectionLabel>Accessibility</SectionLabel>
    <AppText muted>The surrounding app supports screen readers and adjustable system text size. These scanned pages have no accessible Arabic text layer; the app does not claim that a screen reader can recite the page.</AppText>
  </Screen>;
}
