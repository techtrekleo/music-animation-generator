export class XylophoneSynth {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private masterVolume: number = 0.3;

  constructor() {
    this.initAudioContext();
  }

  private async initAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.masterVolume;
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async playNote(frequency: number, velocity: number = 1.0): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      await this.initAudioContext();
      if (!this.audioContext || !this.gainNode) return;
    }

    // 確保音頻上下文已啟動
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // 創建木琴音色
    this.createXylophoneSound(frequency, velocity);
  }

  private createXylophoneSound(frequency: number, velocity: number): void {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const duration = 0.5; // 音符持續時間

    // 主音調 - 使用正弦波
    const oscillator1 = this.audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(frequency, now);

    // 泛音 - 添加八度和五度泛音來模擬木琴音色
    const oscillator2 = this.audioContext.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(frequency * 2, now); // 八度

    const oscillator3 = this.audioContext.createOscillator();
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(frequency * 3, now); // 五度

    // 創建增益節點來控制音量包絡
    const gainNode1 = this.audioContext.createGain();
    const gainNode2 = this.audioContext.createGain();
    const gainNode3 = this.audioContext.createGain();

    // 設置音量包絡 - 快速攻擊，快速衰減
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.3;
    const releaseTime = 0.4;

    // 主音調包絡
    gainNode1.gain.setValueAtTime(0, now);
    gainNode1.gain.linearRampToValueAtTime(velocity * 0.8, now + attackTime);
    gainNode1.gain.exponentialRampToValueAtTime(velocity * sustainLevel, now + attackTime + decayTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // 泛音包絡
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.linearRampToValueAtTime(velocity * 0.4, now + attackTime);
    gainNode2.gain.exponentialRampToValueAtTime(velocity * sustainLevel * 0.5, now + attackTime + decayTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    gainNode3.gain.setValueAtTime(0, now);
    gainNode3.gain.linearRampToValueAtTime(velocity * 0.2, now + attackTime);
    gainNode3.gain.exponentialRampToValueAtTime(velocity * sustainLevel * 0.3, now + attackTime + decayTime);
    gainNode3.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // 連接音頻節點
    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);
    oscillator3.connect(gainNode3);

    gainNode1.connect(this.gainNode!);
    gainNode2.connect(this.gainNode!);
    gainNode3.connect(this.gainNode!);

    // 啟動振盪器
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);

    // 停止振盪器
    oscillator1.stop(now + duration);
    oscillator2.stop(now + duration);
    oscillator3.stop(now + duration);

    // 添加木琴特有的敲擊聲 - 使用噪聲
    this.addStrikeSound(velocity, now);
  }

  private addStrikeSound(velocity: number, startTime: number): void {
    if (!this.audioContext || !this.gainNode) return;

    // 創建噪聲緩衝區來模擬敲擊聲
    const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1秒的噪聲
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // 生成白噪聲
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * velocity * 0.1;
    }

    // 創建噪聲源
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    // 創建濾波器來模擬木琴的共振
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.setValueAtTime(5, startTime);

    // 創建增益節點來控制敲擊聲的包絡
    const strikeGain = this.audioContext.createGain();
    strikeGain.gain.setValueAtTime(0, startTime);
    strikeGain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.001);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    // 連接音頻節點
    noiseSource.connect(filter);
    filter.connect(strikeGain);
    strikeGain.connect(this.gainNode!);

    // 播放噪聲
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.1);
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.masterVolume;
    }
  }

  getVolume(): number {
    return this.masterVolume;
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
