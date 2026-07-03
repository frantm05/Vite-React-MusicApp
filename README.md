# Music App 🎶

A fully functional music player built with **React**, **TypeScript** and **Vite**. It combines a bundled local music library, your own uploaded tracks, and online search powered by the free **iTunes Search API**.

### Features ✨

- **Local library**: play the bundled tracks with full playback control.
- **Your own music**: upload audio files (with optional cover art) straight in the browser - they're stored in IndexedDB and survive reloads.
- **Online search from three sources**:
  - **iTunes Search API** - huge catalog, ~30s preview clips (no free API offers full-length streaming of mainstream catalog).
  - **Audius** - openly licensed / artist-uploaded music with **full-length streaming**, and tracks whose artist allows it can be **saved into your library** for keeps.
  - **Internet Archive** - legal live recordings of well-known bands (Live Music Archive) and netlabel releases, full-length and **downloadable into your library**.
- **Playlists**: create your own playlists and add tracks from any list via the "+" button.
- **Favorites**: like any track, persisted in `localStorage`.
- **Playback controls**: play/pause, next/previous, drag-to-seek progress bar, volume flyout with mute, shuffle, and three repeat modes.
- **Swipe navigation**: switch tabs by swiping left/right on touch screens, or use the bottom tab bar.
- **Responsive**: single-column player on mobile, two-pane layout (player + list) on desktop.
- **PWA-ready**: web app manifest and icons - add it to your phone's home screen and it opens like a native app.
- **Accessible**: labelled controls, keyboard seeking, visible focus states, screen-reader announcements on tab switch. Self-hosted Nunito font with full Czech diacritics support.

### Tech stack 🛠️

- **React 18** + **TypeScript** + **Vite 5**
- **Vitest** unit tests and a **GitHub Actions** CI pipeline (lint, typecheck, test, build)
- **iTunes Search API** for song search and preview playback
- **IndexedDB** for user-uploaded tracks, **Font Awesome** icons (self-hosted via npm)

### Getting started 🚀

```bash
git clone https://github.com/frantm05/Vite-React-MusicApp.git
cd Vite-React-MusicApp
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Other scripts:

```bash
npm run build      # typecheck + production build (dist/)
npm test           # unit tests (vitest)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

### Project structure

```
src/
├── Components/   # presentational React components
├── hooks/        # useAudioPlayer, useCustomLibrary, useItunesSearch, ...
├── services/     # iTunes API client, IndexedDB access
├── utils/        # pure helpers (queue navigation, time formatting) + tests
├── data/         # bundled local library
└── types.ts      # Track union type & shared types
```

### API note

Search uses the public `https://itunes.apple.com/search` endpoint. It needs no API key or configuration, but returns only ~30-second preview clips (`previewUrl`) - the same licensing limitation Spotify or Deezer have without a paid streaming license.
