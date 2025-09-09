export class VideoExporter {
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async startRecording(): Promise<void> {
    try {
      const stream = this.canvas.captureStream(60); // 60 FPS
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000 // 5 Mbps
      });

      this.recordedChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 每100ms收集一次數據
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  downloadVideo(blob: Blob, filename: string = 'music-animation.webm'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async convertToMP4(webmBlob: Blob): Promise<Blob> {
    // 這裡可以使用 FFmpeg.wasm 來轉換格式
    // 暫時返回原始 blob
    return webmBlob;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  getRecordingDuration(): number {
    // 簡單的錄製時間計算
    return this.recordedChunks.length * 0.1; // 假設每100ms一個chunk
  }
}
