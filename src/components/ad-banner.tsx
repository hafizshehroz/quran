import { View } from 'react-native';
import { useApp } from '../state/app-state';
import { advertising, type AdPlacement } from '../services/advertising';
import { AppText } from './ui';

export function AdBanner({ placement }: { placement: AdPlacement }) {
  const { colors } = useApp();
  if (!advertising.showPlaceholders || !advertising.placements[placement]) return null;
  return <View accessible accessibilityLabel="Development advertisement placeholder" style={{ marginTop: 28, minHeight: 62, borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
    <AppText muted style={{ fontSize: 10, letterSpacing: 2 }}>ADVERTISEMENT</AppText>
    <AppText muted style={{ fontSize: 11 }}>Development preview · no ads are loaded</AppText>
  </View>;
}
