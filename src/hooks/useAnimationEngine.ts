import { useState, useEffect, useRef } from 'react';
import { AnimationEngine } from '../animation/AnimationEngine';
import { AnimationConfig, AnimationEffect, AudioData } from '../types';

export const useAnimationEngine = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const engineRef = useRef<AnimationEngine | null>(null);
  const configRef = useRef<AnimationConfig>({
    effects: [],
    backgroundColor: '#000000',
    resolution: { width: 1920, height: 1080 },
    fps: 60,
    duration: 0
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      engineRef.current = new AnimationEngine(canvasRef.current, configRef.current);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize animation engine');
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [canvasRef]);

  const updateConfig = (newConfig: Partial<AnimationConfig>): void => {
    configRef.current = { ...configRef.current, ...newConfig };
    
    if (engineRef.current) {
      // 更新背景色
      if (newConfig.backgroundColor) {
        engineRef.current['scene'].background = new (engineRef.current['scene'].background.constructor as any)(newConfig.backgroundColor);
      }
      
      // 更新解析度
      if (newConfig.resolution) {
        engineRef.current.resize(newConfig.resolution.width, newConfig.resolution.height);
      }
    }
  };

  const addEffect = (effect: AnimationEffect): void => {
    if (!engineRef.current) return;
    
    engineRef.current.addEffect(effect);
    configRef.current.effects.push(effect);
  };

  const removeEffect = (effectId: string): void => {
    if (!engineRef.current) return;
    
    engineRef.current.removeEffect(effectId);
    configRef.current.effects = configRef.current.effects.filter(e => e.id !== effectId);
  };

  const updateAudioData = (audioData: AudioData): void => {
    if (!engineRef.current) return;
    engineRef.current.updateAudioData(audioData);
  };

  const start = (): void => {
    if (!engineRef.current) return;
    
    engineRef.current.start();
    setIsPlaying(true);
  };

  const stop = (): void => {
    if (!engineRef.current) return;
    
    engineRef.current.stop();
    setIsPlaying(false);
  };

  const resize = (width: number, height: number): void => {
    if (!engineRef.current) return;
    engineRef.current.resize(width, height);
  };

  return {
    isInitialized,
    isPlaying,
    error,
    updateConfig,
    addEffect,
    removeEffect,
    updateAudioData,
    start,
    stop,
    resize
  };
};
