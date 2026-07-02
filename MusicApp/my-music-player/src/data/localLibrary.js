import cityOfStarsAudio from "../assets/City Of Stars.mp3";
import duelOfTheFatesAudio from "../assets/Duel of the Fates.mp3";
import nightcallAudio from "../assets/Nightcall.mp3";
import pedroAudio from "../assets/PEDRO.mp3";
import goodFeelingAudio from "../assets/goodFeeling.mp3";

import lalalandImg from "../assets/lalaland.jpg";
import driveImg from "../assets/drive.jpg";
import pedroImg from "../assets/pedro.jpg";
import goodFeelingImg from "../assets/goodFeeling.jpg";
import duelOfTheFatesImg from "../assets/duel_of_the_fates.jpg";

/**
 * Statically bundled tracks. Importing the files (instead of referencing
 * "/src/assets/..." string paths) lets Vite fingerprint and copy them into
 * the production build - string paths only happened to work in dev server.
 */
export const localLibrary = [
  {
    id: "local-city-of-stars",
    source: "local",
    isPreview: false,
    name: "City Of Stars",
    artist: "Ryan Gosling & Emma Stone",
    src: cityOfStarsAudio,
    img: lalalandImg,
  },
  {
    id: "local-nightcall",
    source: "local",
    isPreview: false,
    name: "Nightcall",
    artist: "Kavinsky",
    src: nightcallAudio,
    img: driveImg,
  },
  {
    id: "local-pedro",
    source: "local",
    isPreview: false,
    name: "Pedro",
    artist: "Raffaella Carrà",
    src: pedroAudio,
    img: pedroImg,
  },
  {
    id: "local-good-feeling",
    source: "local",
    isPreview: false,
    name: "Good Feeling",
    artist: "Violet",
    src: goodFeelingAudio,
    img: goodFeelingImg,
  },
  {
    id: "local-duel-of-the-fates",
    source: "local",
    isPreview: false,
    name: "Duel of the Fates",
    artist: "John Williams",
    src: duelOfTheFatesAudio,
    img: duelOfTheFatesImg,
  },
];
