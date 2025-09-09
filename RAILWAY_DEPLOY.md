# Railway 部署指南

## 🚀 部署到 Railway

### 1. 連接 GitHub 倉庫
1. 前往 [Railway](https://railway.app/)
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇 `techtrekleo/music-animation-generator` 倉庫

### 2. 自動部署配置
Railway 會自動檢測到這是一個 Vite + React 專案，並使用以下配置：

- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Node.js Version**: 18+

### 3. 環境變數
目前不需要額外的環境變數，但可以根據需要添加：

```bash
NODE_ENV=production
VITE_APP_TITLE=Music Animation Generator
```

### 4. 部署後檢查
部署完成後，Railway 會提供一個 URL，例如：
`https://music-animation-generator-production.up.railway.app`

### 5. 功能測試
部署後請測試以下功能：
- ✅ 頁面正常載入
- ✅ 音樂檔案上傳
- ✅ 動畫效果播放
- ✅ 影片錄製功能

## 🔧 Railway 特定配置

### 端口配置
Railway 會自動分配端口，Vite 預覽伺服器會自動使用 `PORT` 環境變數。

### 靜態資源
所有靜態資源都會被正確處理，包括：
- CSS 文件
- JavaScript 文件
- 音頻檔案上傳

### HTTPS
Railway 自動提供 HTTPS 支援，這對 Web Audio API 很重要。

## 📝 部署注意事項

### 瀏覽器相容性
- 需要支援 Web Audio API 的現代瀏覽器
- 建議使用 Chrome、Firefox、Safari 最新版本

### 檔案大小限制
- Railway 有檔案上傳大小限制
- 建議音樂檔案不超過 50MB

### 性能優化
- Railway 會自動處理 CDN 和快取
- 靜態資源會被優化壓縮

## 🐛 常見問題

### Q: 部署後無法播放音樂？
A: 檢查瀏覽器控制台是否有 CORS 錯誤，確保使用 HTTPS。

### Q: 動畫效果不流暢？
A: 可能是伺服器資源限制，可以考慮升級 Railway 方案。

### Q: 影片錄製失敗？
A: 檢查瀏覽器是否支援 MediaRecorder API。

## 🔄 更新部署
每次推送到 GitHub main 分支時，Railway 會自動重新部署。

```bash
git add .
git commit -m "Update: 描述更新內容"
git push origin main
```

## 📊 監控和日誌
在 Railway Dashboard 中可以查看：
- 部署狀態
- 應用日誌
- 資源使用情況
- 錯誤報告
