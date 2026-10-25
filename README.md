# Holy Quran

An offline Expo Quran reader for Android and iOS, built on Expo SDK 58, Expo Router, gluestack-ui and NativeWind.

## Run

    npm ci
    npx expo start --clear

Open with the matching SDK 58 Expo Go app. The reader uses page images prepared directly from the supplied PDF; it does not need a custom PDF native module.

## Features

- Original Tajweed Mushaf pages, swipe navigation, page jump, fit-width reading and previous/next controls.
- Five main tabs, a side drawer and an immersive reader.
- Searchable Arabic/English Surah index and all 30 Juz.
- Persistent reading position, bookmarks, reader settings and System/Light/Dark theme.
- Edition-specific page links, with explicit preview and confirmation for unverified starts.
- Isolated ad placement reservations, disabled by default; no advertising SDK or tracking.

## Verify

    npm run lint
    npm run typecheck
    npm test
    npm run test:web
    npx expo install --check

Browser tests use local Google Chrome and start Metro on port 8083. Physical-device QA and EAS release builds remain necessary before public distribution.

## The supplied PDF

The source has **549 PDF pages**, including its cover. PDF page 2 is Al-Fatihah and page 3 begins Al-Baqarah. Page numbers in the app are PDF ordinals, not printed Mushaf folios.

All 114 Surah and 30 Juz starts were visually checked against this scan. The edition-specific data lives separately from the UI. Its Juz references also account for this edition’s divisions. Index menus allow local corrections; a replacement PDF starts with unverified links until its own mapping is supplied.

To replace the PDF, install Poppler and WebP command-line tools on your preparation machine, then:

    python3 scripts/prepare-quran.py /path/to/final-quran.pdf

Commit the generated page assets and manifests before building. The app bundles those pages for offline use; the source PDF is not duplicated in the runtime bundle. This is a prepared-page reader, not a live PDF-import feature.

See [implementation and release notes](docs/IMPLEMENTATION.md) for the reader decision, metadata sources, edition verification, persistence, monetization, EAS setup and remaining release checks.
