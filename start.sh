#!/bin/bash

echo "🎵 音樂動畫生成器啟動腳本"
echo "================================"

# 檢查 Node.js 是否已安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 未找到 Node.js"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

# 檢查 npm 是否已安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤: 未找到 npm"
    echo "請先安裝 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴套件..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        exit 1
    fi
    echo "✅ 依賴安裝完成"
else
    echo "✅ 依賴套件已存在"
fi

echo ""
echo "🚀 啟動開發伺服器..."
echo "瀏覽器將自動開啟: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止伺服器"
echo ""

# 啟動開發伺服器
npm run dev
