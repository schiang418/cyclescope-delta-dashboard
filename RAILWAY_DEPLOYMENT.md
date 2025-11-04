# CycleScope Dashboard - Railway 部署指南

## 📋 部署前準備

### 1. 環境變數設定

在 Railway 專案中設定以下環境變數：

```bash
# Node.js 環境
NODE_ENV=production
PORT=3000

# 資料庫（如果需要）
# DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret（自行生成）
JWT_SECRET=your-secret-key-here

# OAuth（如果需要登入功能）
# OAUTH_SERVER_URL=https://api.manus.im
# VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
# VITE_APP_ID=your-app-id

# 應用設定
VITE_APP_TITLE=CycleScope Market Analysis Dashboard
VITE_APP_LOGO=/logo.svg
```

### 2. 修改專案配置

由於這個專案原本是為 Manus 平台設計的，需要做一些調整才能在 Railway 上運行：

#### 移除 Manus 特定功能

1. **移除 OAuth 登入功能**（或使用其他 OAuth 提供商）
2. **簡化資料庫需求**（如果不需要用戶系統）
3. **移除 Manus 內建 API 依賴**

#### 簡化版本（僅圖表展示，無登入）

如果您只需要圖表展示功能（不需要用戶登入），可以：

1. 移除 `server/_core/auth.ts` 相關代碼
2. 將所有 `protectedProcedure` 改為 `publicProcedure`
3. 移除資料庫依賴

### 3. 添加 Railway 配置檔案

在專案根目錄創建 `railway.json`：

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. 修改 package.json

確保有正確的啟動腳本：

```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "preview": "vite preview"
  }
}
```

## 🚀 部署步驟

### 方法 1: GitHub 連接（推薦）

1. 將專案推送到 GitHub
2. 在 Railway 中點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇您的倉庫
5. 設定環境變數
6. 點擊 "Deploy"

### 方法 2: Railway CLI

```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登入
railway login

# 初始化專案
railway init

# 部署
railway up
```

## ⚠️ 重要注意事項

### Python 依賴問題

這個專案使用 Python + Selenium 來截圖。Railway 預設可能沒有安裝 Python 和 Chrome。

**解決方案：**

1. **使用 Nixpacks 配置** - 創建 `nixpacks.toml`：

```toml
[phases.setup]
nixPkgs = ["python311", "chromium", "chromedriver"]

[phases.install]
cmds = ["pip install selenium pillow"]

[start]
cmd = "pnpm start"
```

2. **或者移除實時截圖功能** - 只使用預先生成的圖表檔案

### 簡化建議

如果您只需要展示圖表（不需要實時更新），建議：

1. **移除 Python 截圖功能**
2. **使用預先生成的圖表**（已在 `client/public/charts/` 中）
3. **移除 "Update All Charts" 按鈕**
4. **保留 "Download All" 功能**（使用現有檔案）

這樣部署會更簡單，也更穩定。

## 📦 簡化版部署（推薦）

如果您想要最簡單的部署方式：

1. 移除所有 Python 相關代碼
2. 移除 OAuth 登入功能
3. 只保留圖表展示和下載功能
4. 使用靜態圖表檔案

需要我為您準備簡化版本嗎？

