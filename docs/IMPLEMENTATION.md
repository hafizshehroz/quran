# Holy Quran

## Existing stack retained

Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58, gluestack core 5.0.15, NativeWind 5.0.0-rc.0 and its matching react-native-css 3.1.0-rc.0. The existing gluestack provider, overlays, theme variables and button creator are reused. Screens remain in src/app; domain logic and components live outside routes.

AsyncStorage 2.2.0 is the only added runtime library. Expo selected its SDK-compatible version; it is included in Expo Go. Playwright is a development-only browser testing tool.

## Run and check

    npm ci
    npx expo start --clear
    npx expo lint
    npx tsc --noEmit
    npm test
    npx expo install --check

The current reader runs in Expo Go on SDK 58 and needs no additional PDF native module. All prepared pages and index metadata are bundled for offline use. Browser tests cover the web implementation; they do not replace physical Android and iOS testing.

## PDF inspection and reader decision

The supplied assets/quran.pdf is 150,565,015 bytes, 549 pages, produced by iLovePDF, with scanned Tajweed pages. SHA-256 is recorded in src/data/pdf-document.json. It has no usable Quran text layer. The scan's original resolution limits sharpness; upsampling does not create more detail.

The options reviewed:

| Option | Benefit | Cost |
| --- | --- | --- |
| react-native-pdf | Direct PDF rendering and zoom | Custom native PDF/blob modules, config plugins and a development build; not Expo Go. Native RN 0.88 builds would need verification. |
| WebView/PDF.js | Direct PDF rendering in a web renderer | Bundled PDF.js/worker and a native WebView, large document loading, extra memory and gesture coordination. A browser PDF iframe does not provide consistent Android/iOS paging. |
| Prepared PDF page images + expo-image | Existing Expo native renderer, offline, cross-platform, bounded decoded images | Additional generated assets; PDF replacement requires a preparation step; no vector zoom or live arbitrary-PDF import. |

The third option is implemented. These are actual pages rendered from the provided PDF, not recreated Quran text, placeholder Quran, or a different Mushaf. Poppler rasterizes the complete page at an 1800-pixel long edge, including page artwork and PDF-added labels. WebP at quality 95 balances quality and offline package size. It is a high-quality lossy asset encoding, not a claim of byte-identical PDF rendering. The optional brightness setting uniformly dims the page; it does not invert colored Tajweed marks.

The reader renders one page per horizontal snap with a three-viewport FlatList window, one initial page and at most two cells per batch. expo-image uses disk caching. A visible page is at most about 1800 x 1200 pixels; nearby pages are recycled. It never decodes all 549 pages. Page controls and jump modal sit outside the swipe surface. The reader is outside the tab navigator, hides bottom navigation, disables the stack's competing swipe-back gesture, respects all safe-area edges, and recomputes its layout after rotation.

The prepared offline page set is approximately 312 MiB on disk. This is an explicit package-size tradeoff for the detailed color scan, not the app's measured installed size. It must be measured in signed release builds and Play Console/App Store tooling before release. The original 144 MiB PDF and the review sheets are not runtime imports. Review evidence is in docs/verification/; it is not included in the app bundle.

The reader also has a persisted fit-width mode for larger text, especially in landscape. It renders only the current page in a vertical ScrollView and uses the external Previous/Next controls for page turns, preventing a vertical reading gesture from accidentally changing pages. Its top-bar toggle restores the whole-page swipe reader. Page changes reset the vertical scroll position to the top. The default whole-page mode remains faithful to the page's aspect ratio.

## Replace the source PDF

Install Poppler and WebP CLI tools on the preparation machine (on macOS: brew install poppler webp). They are build-time tools, not app dependencies.

    python3 scripts/prepare-quran.py /absolute/path/to/final-quran.pdf

This writes all page assets under assets/quran-pages/<PDF checksum prefix>/, updates the static Metro asset manifest in src/data/pdf-pages.ts and writes document metadata. Commit the generated assets and both manifests with the app; EAS does not need Poppler when the prepared assets are committed. The source PDF is not imported into the JavaScript bundle, so it is not also packaged at runtime.

Keep the PDF source at assets/quran.pdf if the documented source path should match it. The preparation command can render an alternate path directly. After a source change, visually review pages, update this document, and add mappings only after reviewing that exact edition. Old edition-specific progress, bookmarks and user mappings are not applied to a new checksum. Theme and reader preferences are retained. Old generated asset folders can be archived separately once their builds are no longer needed.

If preparation fails, it does not publish a new asset manifest. Missing files at build time cause an explicit asset resolution failure. Runtime image load failures show a retry state instead of blank Quran content.

## What is verified

PDF ordinals are 1-based. PDF page 1 is the cover; page 2 contains Al-Fatihah; page 3 begins Al-Baqarah; page 549 contains Al-Falaq and An-Nas and the closing supplication. Printed folios are not used to derive PDF ordinals. No fixed cover/index offset or total printed-folio count has been inferred; those require a separate folio audit.

All 114 Surah headings were visually reviewed in crops of the source pages, with At-Tawbah reviewed separately in full on PDF page 169 because it has no Bismillah heading. All 30 Juz section starts were reviewed against their opening verses. The separate edition-surahs.json and edition-juz.json datasets are bound to the source SHA-256. The datasets are an edition navigation index; a publisher should still commission an independent content audit for scan omissions, duplicates, and religious accuracy before distribution.

All 114 Surahs and all 30 Juz are bundled. Names, ayah counts, revelation classifications and canonical Juz references come from Quran.com's API; source details are in src/data/provenance.json. The API's standard Madani page fields were explicitly discarded. Seven Juz start references differ in this scan: 4 begins at 3:92, 7 at 5:83, 11 at 9:94, 14 at 15:2, 20 at 27:60, 21 at 29:45, and 23 at 36:22. These references were read from the actual first-page verses and override the canonical references only for this checksum.

Unverified entries say “Set page link.” Opening one enters a preview that does not overwrite the last-read position. The user can browse or jump, inspect the scan, and explicitly confirm the first page. User links are labeled separately and can be edited using the entry's menu. They remain local and do not become editorially verified defaults. Selecting an established link opens that exact PDF page.

The current complete, ordered edition index identifies the Surah/Juz for reading positions. Pages on which multiple Surahs begin list those starts rather than inventing one unambiguous Surah. If a replacement edition has an incomplete or non-monotonic index, range inference is disabled and only exact known starts are used. Progress indicates position in the PDF, not completed Quran reading.

## Persistence

src/services/preferences.ts owns validation and schema; persistence.ts owns storage access; state/app-state.tsx exposes reading actions. Writes are serialized to prevent an older page save from winning a race. Hydration completes before reading screens mount. Read failures preserve existing storage and pause writes, with a retry message. Write failures are surfaced and retryable.

Bookmarks are deduplicated and edition-scoped. Page bounds and local mapping IDs are validated during restore. The schema is versioned for future migration/cloud sync. Storage is local and unencrypted. No account, analytics, telemetry, tracking, or cloud synchronization is implemented.

## Monetization

Only isolated, opt-in development reservations exist. Set EXPO_PUBLIC_AD_PLACEHOLDERS=true to see them on supported non-reader screens; they are off by default and absent from production builds. No ad SDK is installed, no production ad IDs are committed, and no ad request is made. The reader has no ad component or placement.

The native advertising product is Google AdMob through the Google Mobile Ads SDK, not website AdSense. Google publishes native Android/iOS SDKs; the common React Native/Expo wrapper is maintained by Invertase, not an official Google Expo module. Current wrapper docs require React Native >=0.86 and New Architecture, and provide an Expo config plugin. A real integration still requires selecting and testing the exact wrapper/SDK versions with this SDK 58 project, a custom development/EAS build, configured app IDs, test ad unit IDs during development, consent before initialization where required, and failure-safe banner components.

Production also requires an AdMob account/app registration, supported store listing and app readiness review, publisher/app verification as required, app-ads.txt setup, privacy disclosures and applicable consent handling. Website AdSense approval does not approve these native app placements. Keep ads limited to the four configured non-reading placements. Do not add app-open, interstitial, rewarded-gate or reader ads.

## Build and release

No ios/ or android/ folders were created. Native settings remain in app.json. The orientation setting now allows portrait and landscape, and iPad support is enabled. A custom geometric book mark replaces the starter icon and splash artwork. Its editable source is assets/brand-mark.svg; scripts/prepare-brand.cjs generates the native PNGs using the development-only browser renderer.

eas.json provides preview and production profiles:

    npx eas-cli@latest build:configure
    npx eas-cli@latest build --profile preview --platform android
    npx eas-cli@latest build --profile production --platform all

Before a real build, supply the publisher's application identifiers and link the EAS project through build:configure. Build/submission has not been triggered. A development client is not required for the implemented reader. If a future PDF or ads module needs native code, install expo-dev-client with npx expo install, add a development profile with developmentClient: true, configure its plugins and build it with EAS.

Before public release: complete edition mapping/content review; confirm distribution rights for the supplied scan; provide publisher privacy/contact URLs; supply final branding/identifiers; test on physical iOS/Android phones and tablets (page order, rotation, safe areas, rapid jumps, process restart, storage errors, large text and scan readability); and measure memory and download size in signed release builds. All page assets are offline, so package size is an explicit tradeoff.

## Reference documentation

- https://docs.expo.dev/versions/v58.0.0/
- https://docs.expo.dev/versions/v58.0.0/sdk/image/
- https://docs.expo.dev/versions/v58.0.0/sdk/async-storage/
- https://docs.expo.dev/router/advanced/tabs/
- https://reactnative.dev/docs/next/appearance
- https://gluestack.io/ui/docs/home/theme-configuration/dark-mode
- https://github.com/wonday/react-native-pdf
- https://docs.page/invertase/react-native-google-mobile-ads
- https://developers.google.com/admob/android/quick-start
- https://support.google.com/admob/answer/10564477
- https://docs.expo.dev/build/eas-json/
