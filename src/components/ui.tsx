import React from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { createButton } from '@gluestack-ui/core/button/creator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../state/app-state';
import { Icon, type IconName } from './icon';

const GSButton = createButton({ Root: Pressable, Text, Group: View, Spinner: ActivityIndicator, Icon: View });
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

export function AppText({ children, muted = false, style, ...props }: React.ComponentProps<typeof Text> & { muted?: boolean }) {
  const { colors } = useApp();
  return <Text {...props} style={[{ color: muted ? colors.muted : colors.text, fontSize: 15, lineHeight: 23 }, style]}>{children}</Text>;
}

export function IconButton({ icon, label, onPress, disabled, active, color }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; active?: boolean; color?: string }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} aria-disabled={!!disabled} aria-pressed={active} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: active ? colors.primarySoft : 'transparent', opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}>
    <Icon name={icon} color={color ?? colors.text} filled={active && icon === 'bookmark'} />
  </Pressable>;
}

export function Button({ children, onPress, icon, secondary = false, disabled = false, style, label }: { children: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; label?: string }) {
  const { colors } = useApp();
  return <GSButton onPress={onPress} isDisabled={disabled} accessibilityLabel={label ?? children} accessibilityRole="button"
    style={[styles.button, { backgroundColor: secondary ? colors.surfaceAlt : colors.primary, opacity: disabled ? 0.4 : 1 }, style]}>
    <GSButton.Text style={{ fontSize: 15, fontWeight: '600', color: secondary ? colors.text : colors.onPrimary }}>{children}</GSButton.Text>
    {icon && <Icon name={icon} size={19} color={secondary ? colors.text : colors.onPrimary} />}
  </GSButton>;
}

export function Header({ title, subtitle, back = false, right }: { title: string; subtitle?: string; back?: boolean; right?: React.ReactNode }) {
  const { colors, setDrawerOpen } = useApp();
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: insets.top + 8, backgroundColor: colors.background }}>
    <View style={styles.header}>
      <IconButton icon={back ? 'back' : 'menu'} label={back ? 'Go back' : 'Open navigation menu'} onPress={() => back ? (router.canGoBack() ? router.back() : router.replace('/')) : setDrawerOpen(true)} />
      <View style={{ flex: 1, paddingLeft: 6 }}><AppText style={{ fontSize: 19, fontWeight: '600' }}>{title}</AppText>{subtitle && <AppText muted style={{ fontSize: 12, lineHeight: 18 }}>{subtitle}</AppText>}</View>
      {right ?? (!back && <IconButton icon="settings" label="Open settings" onPress={() => router.push('/settings')} />)}
    </View>
  </View>;
}

export function Screen({ children, title, subtitle, back, scroll = true, right }: { children: React.ReactNode; title: string; subtitle?: string; back?: boolean; scroll?: boolean; right?: React.ReactNode }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Header title={title} subtitle={subtitle} back={back} right={right} />
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 18, paddingBottom: Math.max(28, insets.bottom + 20), width: '100%', maxWidth: 760, alignSelf: 'center' }}>{children}</ScrollView> : children}
  </View>;
}

export function SectionLabel({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  const { colors } = useApp();
  return <AppText style={[{ fontSize: 11, fontWeight: '700', letterSpacing: 2.2, color: colors.muted, marginBottom: 14 }, style]}>{children.toUpperCase()}</AppText>;
}

export function EmptyState({ icon = 'bookmark', title, description, action, onAction }: { icon?: IconName; title: string; description: string; action?: string; onAction?: () => void }) {
  const { colors } = useApp();
  return <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 20, gap: 16 }}>
    <View style={{ padding: 22, backgroundColor: colors.primarySoft, borderRadius: 44 }}><Icon name={icon} size={32} color={colors.primary} /></View>
    <AppText style={{ fontFamily: serif, fontSize: 25, textAlign: 'center', lineHeight: 32 }}>{title}</AppText>
    <AppText muted style={{ textAlign: 'center', maxWidth: 320 }}>{description}</AppText>
    {action && onAction && <Button onPress={onAction}>{action}</Button>}
  </View>;
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const { colors } = useApp();
  return <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingLeft: 16, marginVertical: 14 }}>
    <Icon name="search" color={colors.muted} size={19} />
    <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted} accessibilityLabel={placeholder} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={{ flex: 1, minHeight: 50, paddingHorizontal: 12, fontSize: 15, color: colors.text }} />
    {!!value && <IconButton icon="close" label="Clear search" onPress={() => onChange('')} />}
  </View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, width: '100%', maxWidth: 800, alignSelf: 'center' },
  button: { minHeight: 50, paddingHorizontal: 21, paddingVertical: 13, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
});
