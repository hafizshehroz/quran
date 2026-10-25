import { Pressable, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../state/app-state';
import { AppText, Screen, SectionLabel } from '../components/ui';
import { Icon, type IconName } from '../components/icon';
import type { ThemePreference } from '../services/persistence';

export default function SettingsScreen() {
  const { preferences, colors, setTheme, setReader } = useApp();
  const choices: { value: ThemePreference; name: string; description: string; icon: IconName }[] = [
    { value: 'system', name: 'Follow system', description: 'Match your device appearance', icon: 'system' },
    { value: 'light', name: 'Light', description: 'Warm paper and quiet greens', icon: 'sun' },
    { value: 'dark', name: 'Dark', description: 'A softer interface after sunset', icon: 'moon' },
  ];
  return <Screen title="Settings" subtitle="Make yourself at home." back>
    <SectionLabel>Appearance</SectionLabel>
    <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
      {choices.map((choice, index) => <Pressable key={choice.value} onPress={() => setTheme(choice.value)} accessibilityRole="radio" aria-checked={preferences.theme === choice.value}
        style={{ padding: 18, minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: index < choices.length - 1 ? 1 : 0, borderColor: colors.border }}>
        <Icon name={choice.icon} color={colors.primary} size={22} /><View style={{ flex: 1 }}><AppText style={{ fontWeight: '600' }}>{choice.name}</AppText><AppText muted style={{ fontSize: 12 }}>{choice.description}</AppText></View>
        <View style={{ width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: preferences.theme === choice.value ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: preferences.theme === choice.value ? colors.primary : 'transparent' }}>{preferences.theme === choice.value && <Icon name="check" color={colors.onPrimary} size={15} />}</View>
      </Pressable>)}
    </View>
    <SectionLabel style={{ marginTop: 30 }}>Reader</SectionLabel>
    <View style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 18, gap: 12 }}>
      <AppText style={{ fontWeight: '600' }}>Page size</AppText>
      <View style={{ flexDirection: 'row', gap: 10 }}>{(['page', 'width'] as const).map(fit => <Pressable key={fit} onPress={() => setReader({ fit })} accessibilityRole="radio" aria-checked={preferences.reader.fit === fit} style={{ flex: 1, minHeight: 48, padding: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: preferences.reader.fit === fit ? colors.primarySoft : colors.surface }}>
        <AppText style={{ fontSize: 13, color: preferences.reader.fit === fit ? colors.primary : colors.text }}>{fit === 'page' ? 'Fit whole page' : 'Fit page width'}</AppText>
      </Pressable>)}</View>
      <AppText muted style={{ fontSize: 12 }}>Fit width enlarges the page for landscape reading. Scroll vertically and use Previous / Next to turn pages.</AppText>
    </View>
    <View style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ flex: 1 }}><AppText style={{ fontWeight: '600' }}>Softer page brightness</AppText><AppText muted style={{ fontSize: 12, marginTop: 5 }}>Gently dims the original page. Tajweed colors are preserved; this is not an inverted dark PDF.</AppText></View>
      <Switch value={preferences.reader.dim} onValueChange={dim => setReader({ dim })} accessibilityLabel="Softer page brightness" trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.surface} />
    </View>
    <View style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 18, gap: 12 }}>
      <AppText style={{ fontWeight: '600' }}>Page turn direction</AppText>
      <View style={{ flexDirection: 'row', gap: 10 }}>{(['rtl', 'ltr'] as const).map(direction => <Pressable key={direction} onPress={() => setReader({ direction })} accessibilityRole="radio" aria-checked={preferences.reader.direction === direction} style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: preferences.reader.direction === direction ? colors.primarySoft : colors.surface }}>
        <AppText style={{ fontSize: 13, color: preferences.reader.direction === direction ? colors.primary : colors.text }}>{direction === 'rtl' ? 'Right to left' : 'Left to right'}</AppText>
      </Pressable>)}</View>
      <AppText muted style={{ fontSize: 12 }}>Right to left turns like a physical Mushaf: swipe right to move forward.</AppText>
    </View>
    <SectionLabel style={{ marginTop: 30 }}>Your data</SectionLabel>
    <AppText muted style={{ fontSize: 13 }}>Your reading position, bookmarks, page links, and preferences are stored on this device. No account is needed. Removing the app may erase this data.</AppText>
    <Pressable accessibilityRole="button" onPress={() => router.push('/about')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 22, minHeight: 50 }}><Icon name="info" color={colors.primary} size={20} /><AppText>About this edition</AppText><View style={{ flex: 1 }} /><Icon name="arrow" size={19} color={colors.muted} /></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('/privacy')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18, minHeight: 50 }}><Icon name="shield" color={colors.primary} size={20} /><AppText>Privacy policy</AppText><View style={{ flex: 1 }} /><Icon name="arrow" size={19} color={colors.muted} /></Pressable>
  </Screen>;
}
