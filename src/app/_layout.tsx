import { Stack } from 'expo-router';
import { ActivityIndicator, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AppStateProvider, useApp } from '../state/app-state';
import { AppDrawer } from '../components/app-drawer';
import { AppText } from '../components/ui';
import '../global.css';

function AppNavigation() {
  const { preferences, ready, colors, theme, storageError, retryStorage } = useApp();
  return (
    <GluestackUIProvider mode={preferences.theme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background, direction: 'ltr' }}>
        {ready ? <>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reader" options={{ gestureEnabled: false }} />
          </Stack>
          {storageError && <Pressable accessibilityRole="button" accessibilityLabel={storageError + ' Retry storage'} onPress={() => void retryStorage()} style={{ paddingHorizontal: 22, paddingVertical: 14, backgroundColor: colors.surfaceAlt }}><AppText style={{ color: colors.danger, fontSize: 12 }}>{storageError} Tap to retry.</AppText></Pressable>}
          <AppDrawer />
        </> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}><ActivityIndicator color={colors.primary} /><AppText muted>Opening your Mushaf…</AppText></View>}
      </View>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return <AppStateProvider><AppNavigation /></AppStateProvider>;
}
