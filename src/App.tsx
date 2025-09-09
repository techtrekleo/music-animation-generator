import { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnimationCanvas } from './components/AnimationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { EffectSelector } from './components/EffectSelector';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { AnimationEffect, MusicFile } from './types';
import { Music, Sparkles, Download } from 'lucide-react';

function App() {
  const [musicFile, setMusicFile] = useState<MusicFile | null>(null);
  const [effects, setEffects] = useState<AnimationEffect[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [volume, setVolume] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    loadAudioFile,
    play,
    pause,
    stop,
    setVolume: setAudioVolume
  } = useAudioAnalyzer();

  const handleFileSelect = async (file: File) => {
    setIsGenerating(true);
    try {
      await loadAudioFile(file);
      setMusicFile({
        file,
        name: file.name,
        duration: 0, // 會在載入後更新
        size: file.size,
        type: file.type
      });
    } catch (err) {
      console.error('Failed to load audio file:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    play();
  };

  const handlePause = () => {
    pause();
  };

  const handleStop = () => {
    stop();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setAudioVolume(newVolume);
  };

  const handleEffectsChange = (newEffects: AnimationEffect[]) => {
    setEffects(newEffects);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* 標題 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Music className="h-12 w-12 text-white" />
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <Download className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            音樂動畫生成器
          </h1>
          <p className="text-xl text-gray-300">
            上傳音樂，自動生成動態視覺效果
          </p>
        </div>

        {/* 錯誤顯示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>錯誤:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：檔案上傳和效果選擇 */}
          <div className="space-y-6">
            {/* 檔案上傳 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">音樂檔案</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoading || isGenerating}
              />
              
              {musicFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700">
                    <div className="font-medium">已載入: {musicFile.name}</div>
                    <div>檔案大小: {(musicFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div>格式: {musicFile.type}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 效果選擇器 */}
            <EffectSelector
              effects={effects}
              onEffectsChange={handleEffectsChange}
            />

            {/* 背景顏色選擇 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">背景設定</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  背景顏色
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{backgroundColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 中間：動畫畫布 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">動畫預覽</h2>
              
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <AnimationCanvas
                  effects={effects}
                  backgroundColor={backgroundColor}
                  resolution={{ width: 1920, height: 1080 }}
                />
              </div>

              {/* 控制面板 */}
              {musicFile && (
                <div className="mt-6">
                  <ControlPanel
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChange}
                    canvasRef={canvasRef}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用說明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. 上傳音樂</h4>
              <p>支援 MP3、WAV、OGG、M4A 格式的音樂檔案</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. 選擇效果</h4>
              <p>從多種視覺效果中選擇，並調整參數</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. 播放預覽</h4>
              <p>播放音樂並即時預覽動畫效果</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">4. 錄製影片</h4>
              <p>點擊錄製按鈕生成最終的動畫影片</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
