import React, { useState } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { VideoExporter } from '../utils/VideoExporter';

interface ControlPanelProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  canvasRef
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoExporter] = useState(() => 
    canvasRef.current ? new VideoExporter(canvasRef.current) : null
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleRecord = async () => {
    if (!videoExporter) return;

    if (!isRecording) {
      try {
        await videoExporter.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    } else {
      try {
        const blob = await videoExporter.stopRecording();
        videoExporter.downloadVideo(blob, `music-animation-${Date.now()}.webm`);
        setIsRecording(false);
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={onStop}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="停止"
        >
          <Square className="h-6 w-6 text-gray-700" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          title={isPlaying ? "暫停" : "播放"}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8" />
          )}
        </button>

        <button
          onClick={handleRecord}
          className={`p-3 rounded-full transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isRecording ? "停止錄製" : "開始錄製"}
        >
          <div className={`h-6 w-6 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
        </button>
      </div>

      {/* 音量控制 */}
      <div className="flex items-center space-x-3">
        <Volume2 className="h-5 w-5 text-gray-600" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 w-12">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* 錄製狀態 */}
      {isRecording && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse h-3 w-3 bg-red-500 rounded-full" />
            <span className="text-red-700 font-medium">正在錄製影片...</span>
          </div>
        </div>
      )}
    </div>
  );
};
