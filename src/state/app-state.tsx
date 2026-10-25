import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences, type ThemePreference } from '../services/persistence';
import { isValidPage, readingContext, type IndexKind } from '../services/quran';
import { darkColors, lightColors } from '../theme/colors';

function useApplicationState() {
  const system = useColorScheme();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const restore = useCallback(async () => {
    try {
      const saved = await loadPreferences();
      setPreferences(saved);
      setCanSave(true);
      setStorageError(null);
    } catch {
      setStorageError('Your saved reading data could not be opened. Changes will not be saved until storage recovers.');
    } finally { setReady(true); }
  }, []);
  useEffect(() => { void Promise.resolve().then(restore); }, [restore]);
  useEffect(() => {
    if (!ready || !canSave) return;
    let current = true;
    void savePreferences(preferences).then(() => {
      if (current) setStorageError(null);
    }).catch(() => {
      if (current) setStorageError('Your latest changes could not be saved. Please retry.');
    });
    return () => { current = false; };
  }, [preferences, ready, canSave]);

  const retryStorage = useCallback(async () => {
    if (!canSave) return restore();
    try { await savePreferences(preferences); setStorageError(null); }
    catch { setStorageError('Storage is still unavailable. Please try again.'); }
  }, [canSave, preferences, restore]);

  const setTheme = useCallback((theme: ThemePreference) => setPreferences(p => ({ ...p, theme })), []);
  const setReader = useCallback((reader: Partial<Preferences['reader']>) => setPreferences(p => ({ ...p, reader: { ...p.reader, ...reader } })), []);
  const recordPage = useCallback((page: number, context?: { surahId?: number; juzId?: number }) => {
    if (!isValidPage(page)) return;
    setPreferences(p => ({ ...p, lastRead: { page, updatedAt: new Date().toISOString(), ...readingContext(page, p.maps), ...context } }));
  }, []);
  const toggleBookmark = useCallback((page: number) => {
    if (!isValidPage(page)) return;
    setPreferences(p => ({ ...p, bookmarks: p.bookmarks.some(b => b.page === page)
      ? p.bookmarks.filter(b => b.page !== page)
      : [...p.bookmarks, { page, createdAt: new Date().toISOString() }] }));
  }, []);
  const setMapping = useCallback((kind: IndexKind, id: number, page: number) => {
    if (!isValidPage(page) || !Number.isInteger(id) || id < 1 || id > (kind === 'surah' ? 114 : 30)) return;
    setPreferences(p => ({ ...p, maps: { ...p.maps, [kind]: { ...p.maps[kind], [id]: { page, verifiedBy: 'user' } } } }));
  }, []);
  const resolvedTheme = preferences.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : preferences.theme;
  return useMemo(() => ({ preferences, ready, storageError, retryStorage, drawerOpen, setDrawerOpen,
    theme: resolvedTheme, colors: resolvedTheme === 'dark' ? darkColors : lightColors,
    setTheme, setReader, recordPage, toggleBookmark, setMapping }),
  [preferences, ready, storageError, retryStorage, drawerOpen, resolvedTheme, setTheme, setReader, recordPage, toggleBookmark, setMapping]);
}

const AppContext = createContext<ReturnType<typeof useApplicationState> | null>(null);
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const value = useApplicationState();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppStateProvider');
  return value;
}
