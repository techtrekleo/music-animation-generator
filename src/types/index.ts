// 音頻分析相關類型
export interface AudioData {
  frequencyData: Float32Array;
  timeDomainData: Float32Array;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  volume: number;
  beat: boolean;
}

// 動畫效果類型
export interface AnimationEffect {
  id: string;
  name: string;
  type: 'marble' | 'wave' | 'particle' | 'geometric' | 'fluid' | 'neural';
  intensity: number;
  color: string;
  speed: number;
  size: number;
}

// 動畫配置
export interface AnimationConfig {
  effects: AnimationEffect[];
  backgroundColor: string;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  duration: number;
}

// 音樂檔案資訊
export interface MusicFile {
  file: File;
  name: string;
  duration: number;
  size: number;
  type: string;
}

// 動畫狀態
export interface AnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

// 視覺化參數
export interface VisualizationParams {
  sensitivity: number;
  smoothing: number;
  colorScheme: 'rainbow' | 'monochrome' | 'gradient' | 'neon';
  effectIntensity: number;
  particleCount: number;
}
