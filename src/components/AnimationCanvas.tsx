import React, { useRef, useEffect } from 'react';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { AnimationEffect } from '../types';

interface AnimationCanvasProps {
  effects: AnimationEffect[];
  backgroundColor?: string;
  resolution?: { width: number; height: number };
  xylophoneVolume?: number;
  onXylophoneVolumeChange?: (volume: number) => void;
}

export const AnimationCanvas: React.FC<AnimationCanvasProps> = ({
  effects,
  backgroundColor = '#000000',
  resolution = { width: 1920, height: 1080 },
  xylophoneVolume = 0.5,
  onXylophoneVolumeChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData } = useAudioAnalyzer();
  const {
    isInitialized,
    isPlaying,
    error,
    updateConfig,
    addEffect,
    removeEffect,
    updateAudioData,
    setXylophoneVolume,
    start,
    resize
  } = useAnimationEngine(canvasRef);

  // 更新配置
  useEffect(() => {
    updateConfig({ backgroundColor, resolution });
  }, [backgroundColor, resolution, updateConfig]);

  // 添加/移除效果
  useEffect(() => {
    effects.forEach(effect => {
      addEffect(effect);
    });

    return () => {
      effects.forEach(effect => {
        removeEffect(effect.id);
      });
    };
  }, [effects, addEffect, removeEffect]);

  // 更新音頻數據
  useEffect(() => {
    if (audioData) {
      updateAudioData(audioData);
    }
  }, [audioData, updateAudioData]);

  // 更新木琴音量
  useEffect(() => {
    setXylophoneVolume(xylophoneVolume);
  }, [xylophoneVolume, setXylophoneVolume]);

  // 處理視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        resize(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始調整

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resize]);

  // 自動開始動畫
  useEffect(() => {
    if (isInitialized && !isPlaying) {
      console.log('Starting animation from AnimationCanvas...');
      start();
    }
  }, [isInitialized, isPlaying, start]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            動畫引擎初始化失敗
          </div>
          <div className="text-gray-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-lg font-semibold">初始化動畫引擎...</div>
          </div>
        </div>
      )}
      
      {/* 音頻數據顯示 */}
      {audioData && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
          <div className="text-sm space-y-1">
            <div>音量: {audioData.volume.toFixed(2)}</div>
            <div>低音: {audioData.bassLevel.toFixed(2)}</div>
            <div>中音: {audioData.midLevel.toFixed(2)}</div>
            <div>高音: {audioData.trebleLevel.toFixed(2)}</div>
            <div className={audioData.beat ? 'text-yellow-400' : 'text-gray-400'}>
              節拍: {audioData.beat ? '●' : '○'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
