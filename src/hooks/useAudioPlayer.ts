
import { useState, useRef, useEffect } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
  });

  const loadTrack = async (url: string) => {
    console.log('Loading track from URL:', url);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setState(prev => ({ ...prev, isLoading: true, currentTime: 0, duration: 0 }));
    
    try {
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners before setting src
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setState(prev => ({
          ...prev,
          duration: audio.duration,
          isLoading: false,
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
        }));
      });

      audio.addEventListener('ended', () => {
        console.log('Audio playback ended');
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
        }));
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.error('Audio error details:', audio.error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isPlaying: false,
        }));
      });

      audio.addEventListener('canplay', () => {
        console.log('Audio can start playing');
      });

      audio.addEventListener('loadstart', () => {
        console.log('Audio load started');
      });

      // Set crossOrigin before setting src to handle CORS
      audio.crossOrigin = 'anonymous';
      audio.volume = state.volume;
      
      // Set the source URL
      audio.src = url;
      
      // Preload the audio
      audio.load();
      
    } catch (error) {
      console.error('Error loading audio:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }));
    }
  };

  const play = async () => {
    if (audioRef.current) {
      try {
        console.log('Attempting to play audio');
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
        console.log('Audio playback started successfully');
      } catch (error) {
        console.error('Error playing audio:', error);
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      console.log('Pausing audio');
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  };

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    ...state,
    loadTrack,
    play,
    pause,
    seekTo,
    setVolume,
    cleanup,
  };
};
