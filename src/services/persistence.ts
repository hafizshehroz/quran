import AsyncStorage from '@react-native-async-storage/async-storage';
import { parsePreferences, type Preferences } from './preferences';
export * from './preferences';

export const STORAGE_KEY = '@holy-quran/preferences/v1';

export async function loadPreferences() {
  return parsePreferences(await AsyncStorage.getItem(STORAGE_KEY));
}

let pendingWrite: Promise<void> = Promise.resolve();
export function savePreferences(preferences: Preferences): Promise<void> {
  const raw = JSON.stringify(preferences);
  const write = pendingWrite.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, raw));
  pendingWrite = write;
  return write;
}

