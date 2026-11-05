import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { tourismCopy } from "@/i18n/translations";

export function BackgroundMusic() {
  const { lang } = useLanguage();
  const copy = tourismCopy[lang] ?? tourismCopy.en;
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicStarting, setMusicStarting] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const playerRef = useRef<HTMLAudioElement>(null);

  async function toggleBackgroundMusic() {
    if (musicStarting) return;
    setMusicStarting(true);
    setMusicError(false);

    try {
      const player = playerRef.current;
      if (!player) throw new Error("Background audio element is unavailable.");

      if (musicPlaying) {
        player.pause();
        setMusicPlaying(false);
        return;
      }

      await player.play();
      setMusicPlaying(true);
    } catch (error) {
      setMusicPlaying(false);
      setMusicError(true);
      console.error("Could not play background music.", error);
    } finally {
      setMusicStarting(false);
    }
  }

  return (
    <>
      <audio
        ref={playerRef}
        id="background-music"
        src="/audio/intro.mp3"
        loop
        preload="none"
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
      />
      <button
        type="button"
        className={`egypt-music-toggle athara-global-music${musicPlaying ? " is-playing" : ""}`}
        onClick={() => void toggleBackgroundMusic()}
        disabled={musicStarting}
        aria-label={musicPlaying ? copy.musicMute : copy.musicPlay}
        aria-pressed={musicPlaying}
      >
        {musicPlaying ? (
          <Volume2 size={20} aria-hidden="true" />
        ) : (
          <VolumeX size={20} aria-hidden="true" />
        )}
      </button>
      {musicError && (
        <span className="sr-only" role="alert">
          {copy.musicError}
        </span>
      )}
    </>
  );
}
