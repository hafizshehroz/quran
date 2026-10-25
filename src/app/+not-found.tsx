import { router } from 'expo-router';
import { EmptyState, Screen } from '../components/ui';
export default function NotFoundScreen() {
  return <Screen title="Holy Quran" back><EmptyState icon="book" title="This page is not here." description="Return home to continue your reading." action="Go home" onAction={() => router.replace('/')} /></Screen>;
}
