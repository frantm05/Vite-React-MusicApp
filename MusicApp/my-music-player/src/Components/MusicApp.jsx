import { useState, useRef, useEffect } from "react";
import PlayerTop from "./PlayerTop";
import PlayerBody from "./PlayerBody";
import SongList from "./SongList";
import SongInfo from "./SongInfo";
import SongDuration from "./SongDuration";
import Time from "./Time";
import PlayerFooter from "./PlayerFooter";
import Controls from "./Controls";

/**
 * The main component for the music player application.
 * It manages the state and behavior of the music player.
 */
const MusicApp = () => {
  const songRefs = useRef([]);
  const [songData, setSongData] = useState([
    {
      name: "City Of Stars",
      artist: "Ryan Gosling & Emma Stone",
      src: "City Of Stars.mp3",
      img: "lalaland.jpg",
    },
    {
      name: "Nightcall",
      artist: "Kavinsky",
      src: "Nightcall.mp3",
      img: "drive.jpg",
    },
    {
      name: "Pedro",
      artist: "Raffaella Carrà",
      src: "Pedro.mp3",
      img: "pedro.jpg",
    },
    {
      name: "Good Feeling",
      artist: "Violet",
      src: "goodFeeling.mp3",
      img: "goodFeeling.jpg",
    },
    {
      name: "Duel of the Fates",
      artist: "John Williams",
      src: "Duel of the Fates.mp3",
      img: "duel_of_the_fates.jpg",
    },
  ]);

  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [showSongsList, setShowSongsList] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    loadSong(songIndex);
  }, [songIndex]);


  const handleShowSongsList = () => {
    setShowSongsList(!showSongsList);
  };


  const loadSong = (index) => {
    if (audioRef.current) {
      audioRef.current.src = `./src/assets/${songData[index].src}`;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
    document.querySelector(".song-name").textContent = songData[index].name;
    document.querySelector(".song-artist").textContent = songData[index].artist;
    if (document.querySelector(".song-list-details.selected")) {
      songRefs.current[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  /**
   * Plays the next song in the playlist.
   */
  const nextSongPlay = () => {
    let newIndex = songIndex + 1;
    if (newIndex > songData.length - 1) {
      newIndex = 0;
    }
    setSongIndex(newIndex);
    loadSong(newIndex);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      const songCurrentTime = document.querySelector(".time span:nth-child(1)");
      const songDuration = document.querySelector(".time span:nth-child(2)");
      const audioDuration = audio.duration;
      const totalMinutes = Math.floor(audioDuration / 60);
      const totalSeconds = Math.floor(audioDuration % 60);
      if (isNaN(totalMinutes) || isNaN(totalSeconds)) {
        return;
      }
      const currentMinutes = Math.floor(audio.currentTime / 60);
      const currentSeconds = Math.floor(audio.currentTime % 60);
      songCurrentTime.textContent = `${currentMinutes}:${
        currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds
      }`;
      songDuration.textContent = `${totalMinutes}:${
        totalSeconds < 10 ? `0${totalSeconds}` : totalSeconds
      }`;

      const currentTime = audio.currentTime;
      const duration = audio.duration;
      const progress = (currentTime / duration) * 100;
      document.querySelector(".song-progress").style.width = `${progress}%`;

      if (currentTime === duration) {
        nextSongPlay();
      }
    };

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, );



  return (
    <div className="container">
      <div className="player">
        <PlayerTop handleShowSongsList={handleShowSongsList} />
        {showSongsList ? (
          <SongList
            songRefs={songRefs}
            songData={songData}
            songIndex={songIndex}
            setSongIndex={setSongIndex}
            setSongData={setSongData}
          />
        ) : (
          <PlayerBody
            songData={songData}
            songIndex={songIndex}
            isPlaying={isPlaying}
          />
        )}
        <SongInfo />
        <SongDuration audioRef={audioRef} />
        <Time />
        <Controls
          nextSongPlay={nextSongPlay}
          setSongIndex={setSongIndex}
          setIsPlaying={setIsPlaying}
          songIndex={songIndex}
          audioRef={audioRef}
          songData={songData}
          loadSong={loadSong}
          isPlaying={isPlaying}
        />
        <PlayerFooter />
      </div>
    </div>
  );
};

export default MusicApp;
