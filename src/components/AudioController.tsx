import { useRef, useState, useCallback } from 'react';
import { useI18n } from '../i18n/index';
import styles from './GameControls.module.css';

export default function AudioController() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/chavo-del-ocho.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      } catch {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  return (
    <div className={styles.audioController} data-testid="audio-controller">
      <button
        className={styles.audioButton}
        onClick={togglePlay}
        data-testid="audio-toggle"
      >
        {isPlaying ? t('audio.pause') : t('audio.play')}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className={styles.volumeSlider}
        data-testid="volume-slider"
        aria-label="Volume"
      />
    </div>
  );
}
