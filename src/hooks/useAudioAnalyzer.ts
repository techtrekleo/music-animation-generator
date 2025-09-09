import { useState, useEffect, useRef } from 'react';
import { AudioAnalyzer } from '../audio/AudioAnalyzer';
import { AudioData, MusicFile } from '../types';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    analyzerRef.current = new AudioAnalyzer();
    
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const loadAudioFile = async (file: File): Promise<void> => {
    if (!analyzerRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await analyzerRef.current.loadAudioFile(file);
      setDuration(analyzerRef.current.getDuration());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio file');
    } finally {
      setIsLoading(false);
    }
  };

  const play = (): void => {
    if (!analyzerRef.current) return;
    
    analyzerRef.current.play();
    setIsPlaying(true);
    startAudioDataUpdate();
  };

  const pause = (): void => {
    if (!analyzerRef.current) return;
    
    analyzerRef.current.pause();
    setIsPlaying(false);
    stopAudioDataUpdate();
  };

  const stop = (): void => {
    if (!analyzerRef.current) return;
    
    analyzerRef.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    stopAudioDataUpdate();
  };

  const setVolume = (volume: number): void => {
    if (!analyzerRef.current) return;
    analyzerRef.current.setVolume(volume);
  };

  const startAudioDataUpdate = (): void => {
    const update = () => {
      if (!analyzerRef.current || !analyzerRef.current.isAudioPlaying()) {
        return;
      }
      
      const data = analyzerRef.current.getAudioData();
      const time = analyzerRef.current.getCurrentTime();
      
      setAudioData(data);
      setCurrentTime(time);
      
      animationFrameRef.current = requestAnimationFrame(update);
    };
    
    update();
  };

  const stopAudioDataUpdate = (): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  return {
    audioData,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    loadAudioFile,
    play,
    pause,
    stop,
    setVolume
  };
};
