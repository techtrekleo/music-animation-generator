import { AudioData } from '../types';

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Float32Array | null = null;
  private timeDomainData: Float32Array | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private animationId: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();
      
      // 配置分析器
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // 連接節點
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // 初始化數據數組
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Float32Array(bufferLength);
      this.timeDomainData = new Float32Array(bufferLength);
      
    } catch (error) {
      console.error('Audio context initialization failed:', error);
    }
  }

  async loadAudioFile(file: File): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      // 停止當前播放
      this.stop();
      
      // 創建新的音頻源
      this.source = this.audioContext!.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.gainNode!);
      
    } catch (error) {
      console.error('Failed to load audio file:', error);
      throw error;
    }
  }

  play(): void {
    if (!this.source || !this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    try {
      this.source.start();
      this.isPlaying = true;
      this.startAnalysis();
    } catch (error) {
      console.error('Audio start error:', error);
      // 如果音頻無法播放，仍然啟動分析
      this.isPlaying = true;
      this.startAnalysis();
    }
  }

  pause(): void {
    if (this.source && this.isPlaying) {
      try {
        this.source.stop();
      } catch (error) {
        console.error('Audio stop error:', error);
      }
      this.isPlaying = false;
      this.stopAnalysis();
    }
  }

  stop(): void {
    if (this.source) {
      try {
        this.source.stop();
      } catch (error) {
        console.error('Audio stop error:', error);
      }
      this.source = null;
    }
    this.isPlaying = false;
    this.stopAnalysis();
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private startAnalysis(): void {
    const analyze = () => {
      if (!this.isPlaying || !this.analyser) return;
      
      this.analyser.getFloatFrequencyData(this.frequencyData! as any);
      this.analyser.getFloatTimeDomainData(this.timeDomainData! as any);
      
      this.animationId = requestAnimationFrame(analyze);
    };
    
    analyze();
  }

  private stopAnalysis(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getAudioData(): AudioData {
    if (!this.frequencyData || !this.timeDomainData) {
      return {
        frequencyData: new Float32Array(0),
        timeDomainData: new Float32Array(0),
        bassLevel: 0,
        midLevel: 0,
        trebleLevel: 0,
        volume: 0,
        beat: false
      };
    }

    // 計算頻率帶
    const bassLevel = this.calculateFrequencyBand(this.frequencyData, 0, 10);
    const midLevel = this.calculateFrequencyBand(this.frequencyData, 10, 50);
    const trebleLevel = this.calculateFrequencyBand(this.frequencyData, 50, 100);

    // 計算音量
    const volume = this.calculateRMS(this.timeDomainData);

    // 簡單的節拍檢測
    const beat = this.detectBeat(volume);

    return {
      frequencyData: this.frequencyData,
      timeDomainData: this.timeDomainData,
      bassLevel,
      midLevel,
      trebleLevel,
      volume,
      beat
    };
  }

  private calculateFrequencyBand(data: Float32Array, start: number, end: number): number {
    const length = data.length;
    const startIndex = Math.floor((start / 100) * length);
    const endIndex = Math.floor((end / 100) * length);
    
    let sum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      sum += Math.abs(data[i]);
    }
    
    return sum / (endIndex - startIndex);
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  private detectBeat(volume: number): boolean {
    // 簡單的節拍檢測算法
    const threshold = 0.3;
    return volume > threshold;
  }

  getCurrentTime(): number {
    if (!this.audioContext) return 0;
    return this.audioContext.currentTime;
  }

  getDuration(): number {
    if (!this.source || !this.source.buffer) return 0;
    return this.source.buffer.duration;
  }

  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
