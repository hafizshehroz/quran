import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/app-state';
import { initialReaderPage } from '../services/persistence';
import { firstQuranPage } from '../services/quran';
import { AppText, IconButton, serif } from './ui';
import { Icon, MushafMotif, type IconName } from './icon';

export function AppDrawer() {
  const { colors, drawerOpen, setDrawerOpen, preferences } = useApp();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [animation] = useState(() => new Animated.Value(0));
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    Animated.timing(animation, { toValue: drawerOpen ? 1 : 0, duration: 230, useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
      if (finished && !drawerOpen) setVisible(false);
    });
  }, [drawerOpen, animation]);
  const close = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);
  const entries: { title: string; icon: IconName; href: Href; path: string }[] = [
    { title: 'Home', icon: 'home', href: '/', path: '/' },
    { title: 'Read Quran', icon: 'book', href: { pathname: '/reader', params: { page: firstQuranPage } }, path: '/quran' },
    { title: 'Surah index', icon: 'list', href: '/surahs', path: '/surahs' },
    { title: 'Juz index', icon: 'layers', href: '/juz', path: '/juz' },
    { title: 'Bookmarks', icon: 'bookmark', href: '/bookmarks', path: '/bookmarks' },
    { title: 'Last read', icon: 'jump', href: { pathname: '/reader', params: { page: initialReaderPage(preferences) } }, path: '/reader' },
    { title: 'Settings', icon: 'settings', href: '/settings', path: '/settings' },
    { title: 'About the app', icon: 'info', href: '/about', path: '/about' },
    { title: 'Privacy policy', icon: 'shield', href: '/privacy', path: '/privacy' },
  ];
  return <Modal visible={drawerOpen || visible} onShow={() => setVisible(true)} transparent onRequestClose={close} animationType="none" statusBarTranslucent>
    <View style={{ flex: 1 }} accessibilityViewIsModal>
      <Animated.View style={{ position: 'absolute', inset: 0, backgroundColor: '#000', opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.48] }) }}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel="Close navigation menu" accessibilityRole="button" />
      </Animated.View>
      <Animated.View style={{ width: '85%', maxWidth: 350, flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, transform: [{ translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [-360, 0] }) }] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22 }}>
          <AppText style={{ letterSpacing: 3, fontSize: 12, fontWeight: '700' }}>HOLY QURAN</AppText>
          <IconButton icon="close" label="Close navigation" onPress={close} />
        </View>
        <View style={{ paddingHorizontal: 28, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 18, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 14 }}>
          <MushafMotif size={64} color={colors.gold} />
          <View><AppText style={{ fontFamily: serif, fontSize: 24 }}>Your quiet space.</AppText><AppText muted style={{ fontSize: 12 }}>Read. Reflect. Return.</AppText></View>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {entries.map(entry => <Pressable key={entry.title} onPress={() => { close(); router.navigate(entry.href); }} accessibilityRole="button" accessibilityState={{ selected: pathname === entry.path }}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 18, minHeight: 53, marginBottom: 3, borderRadius: 12, paddingHorizontal: 16, backgroundColor: pathname === entry.path ? colors.primarySoft : pressed ? colors.surfaceAlt : 'transparent' })}>
            <Icon name={entry.icon} size={20} color={pathname === entry.path ? colors.primary : colors.muted} /><AppText style={{ color: pathname === entry.path ? colors.primary : colors.text, fontWeight: pathname === entry.path ? '600' : '400' }}>{entry.title}</AppText>
          </Pressable>)}
        </ScrollView>
        <AppText muted style={{ fontSize: 11, textAlign: 'center', letterSpacing: 1 }}>A companion for your daily reading</AppText>
      </Animated.View>
    </View>
  </Modal>;
}
