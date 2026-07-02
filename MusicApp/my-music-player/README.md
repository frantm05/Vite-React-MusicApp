# Music App 🎶

Plnohodnotný hudební přehrávač postavený na **React** a **Vite**. Kombinuje lokální knihovnu skladeb s online vyhledáváním přes veřejné **iTunes Search API**.

### Funkce ✨

- **Přehrávání lokálních skladeb** – knihovna s vlastní hudbou zabalenou přímo v aplikaci.
- **Vyhledávání skladeb online** – zdarma přes iTunes Search API (bez nutnosti API klíče). Z licenčních důvodů jde vždy o cca 30sekundovou ukázku skladby (žádné bezplatné API neposkytuje legální streamování celých skladeb).
- **Oblíbené** – uložení skladeb do oblíbených, perzistentní přes `localStorage`.
- **Ovládání přehrávání** – play/pause, další/předchozí, posun v skladbě klikem na progress bar.
- **Hlasitost** – posuvník hlasitosti + rychlé ztlumení.
- **Shuffle a repeat** – náhodné přehrávání a tři režimy opakování (vypnuto / celá fronta / jedna skladba).
- **Responzivní design** – funguje na mobilu i desktopu.
- **Přístupnost** – `aria-label` na ovládacích prvcích, viditelný focus stav pro klávesnici.

### Technologie 🛠️

- **React 18** + **Vite 5**
- **iTunes Search API** – veřejné REST API bez nutnosti autentizace
- Ikony **Font Awesome** (self-hosted přes npm, bez závislosti na CDN)

### Instalace a spuštění 🚀

1.  Naklonuj repozitář:
    ```bash
    git clone https://github.com/frantm05/Vite-React-MusicApp.git
    ```
2.  Přejdi do adresáře projektu:
    ```bash
    cd MusicApp/my-music-player
    ```
3.  Nainstaluj závislosti:
    ```bash
    npm install
    ```
4.  Spusť vývojový server:
    ```bash
    npm run dev
    ```

Aplikace poběží na `http://localhost:5173`.

### Poznámka k API

Vyhledávání používá veřejný endpoint `https://itunes.apple.com/search`. Nevyžaduje API klíč ani žádnou konfiguraci, ale vrací pouze cca 30sekundové ukázky skladeb (`previewUrl`) – to je stejné omezení, jaké mají i Spotify nebo Deezer bez placené licence pro streamování.
