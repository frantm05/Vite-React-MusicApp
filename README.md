# Music App 🎶

A fully functional music player built with **React** and **Vite**. It combines a bundled local music library with online search powered by the free **iTunes Search API**.

### Features ✨

- **Local library**: play the bundled tracks with full playback control.
- **Online search**: search any song or artist via the iTunes Search API (no API key required). Results play a ~30s preview clip, since no free API offers full-length legal streaming.
- **Favorites**: like any track (local or from search) and find it later, persisted in `localStorage`.
- **Playback controls**: play/pause, next/previous, click-to-seek progress bar, volume slider with mute, shuffle, and three repeat modes.
- **Responsive, accessible UI**: works on mobile and desktop, with `aria-label`s and visible keyboard focus states.

### Technologies Used 🛠️

- **React 18** + **Vite 5**
- **iTunes Search API** for song search and preview playback
- **Font Awesome** icons (self-hosted via npm)

### Installation and Usage 🚀

1.  Clone the repository:
    ```bash
    git clone https://github.com/frantm05/Vite-React-MusicApp.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd MusicApp/my-music-player
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.

See [`MusicApp/my-music-player/README.md`](MusicApp/my-music-player/README.md) for more detail.
