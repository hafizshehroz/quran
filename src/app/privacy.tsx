import { AppText, Screen, SectionLabel } from '../components/ui';

export default function PrivacyScreen() {
  return <Screen title="Privacy policy" back>
    <SectionLabel>For the current version</SectionLabel>
    <AppText style={{ marginBottom: 22 }}>Holy Quran works offline. This version has no accounts, analytics, advertising SDK, or app-operated server. It does not send your bookmarks, reading position, or preferences to us.</AppText>
    <SectionLabel>Stored on your device</SectionLabel>
    <AppText muted style={{ marginBottom: 22 }}>The app stores your last-read page, saved bookmarks, theme choice, reader preferences, and any page links you confirm. Storage is local and unencrypted. Your operating system may include app data in device backups according to your device settings. Uninstalling the app may remove it.</AppText>
    <SectionLabel>Quran and metadata</SectionLabel>
    <AppText muted style={{ marginBottom: 22 }}>Quran page images and index information are bundled with the app. Reading and searching do not contact Quran.com or any third party.</AppText>
    <SectionLabel>Advertising</SectionLabel>
    <AppText muted style={{ marginBottom: 22 }}>This version does not load advertisements or contact an advertising provider. Any development ad placeholders are visual reservations only. If ads are added in a future release, this policy and any required consent choices must be updated before that release.</AppText>
    <SectionLabel>Device permissions</SectionLabel>
    <AppText muted style={{ marginBottom: 22 }}>The app does not request access to your location, contacts, microphone, camera, or photos for reading. Development tooling may use network access while running a development build.</AppText>
    <SectionLabel>Contact</SectionLabel>
    <AppText muted>For questions about this app or your data, use the publisher contact shown on the app’s store listing.</AppText>
  </Screen>;
}
