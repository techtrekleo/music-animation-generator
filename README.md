# 音樂動畫生成器 (Music Animation Generator)

## 專案概述
這是一個能夠根據上傳的音樂自動生成動畫影片的系統，類似於YouTube Shorts中的音樂視覺化效果。

## 功能特色
- 🎵 **音頻分析**: 實時分析音樂頻譜、節拍和強度
- 🎨 **動畫生成**: 根據音樂節拍自動生成動態視覺效果
- 🎬 **影片導出**: 生成高品質的動畫影片
- 🎯 **多種效果**: 支援多種視覺效果模式
- 📱 **行動優化**: 適合短影片格式輸出

## 技術架構
- **前端**: React + TypeScript + Canvas API
- **音頻處理**: Web Audio API + Tone.js
- **動畫引擎**: Three.js + GSAP
- **影片導出**: MediaRecorder API + FFmpeg

## 安裝與使用
```bash
npm install
npm run dev
```

## 專案結構
```
music-animation-generator/
├── src/
│   ├── components/          # React 組件
│   ├── audio/              # 音頻處理模組
│   ├── animation/          # 動畫引擎
│   ├── effects/            # 視覺效果
│   └── utils/              # 工具函數
├── public/                 # 靜態資源
└── dist/                   # 建置輸出
```

## 開發進度
- [x] 專案初始化
- [ ] 音頻分析系統
- [ ] 動畫引擎開發
- [ ] 視覺效果實現
- [ ] 影片導出功能
- [ ] UI/UX 優化
