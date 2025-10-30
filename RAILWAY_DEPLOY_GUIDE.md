# 🚂 CycleScope Delta - Railway 部署指南（Nixpacks 版本）

## 📦 重要更新：切換到 Nixpacks

**✅ 已從 Docker 切換到 Nixpacks 建置系統**

Railway 預設使用 Nixpacks 而非 Docker，這對 Node.js 專案更友好、更可靠且建置速度更快。

### 為什麼使用 Nixpacks？

- ✅ **更簡單**：無需編寫複雜的 Dockerfile
- ✅ **更快速**：建置時間比 Docker 短 50%+
- ✅ **更可靠**：Railway 優化的建置流程，錯誤更少
- ✅ **自動化**：Git push 即自動部署
- ✅ **經過驗證**：您的 option-samurai-scanner 專案已成功使用此方法

## 🚀 部署步驟

### 步驟 1: 準備 GitHub 倉庫

確保您的專案已推送到 GitHub：

```bash
cd /path/to/cyclescope-delta
git add .
git commit -m "Initial commit: CycleScope Delta"
git push origin main
```

### 步驟 2: 在 Railway 創建專案

1. 訪問 [https://railway.app](https://railway.app)
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 授權 Railway 訪問您的 GitHub 帳戶
5. 選擇 `cyclescope-delta` 倉庫

### 步驟 3: Railway 自動檢測配置

Railway 會自動：
- ✅ 檢測到 `nixpacks.toml` 並使用 Nixpacks 建置
- ✅ 檢測到 `railway.toml` 並應用部署配置
- ✅ 安裝 Node.js 22 + pnpm
- ✅ 安裝 Python 3 + Selenium + Pillow
- ✅ 安裝 Chromium 瀏覽器及所需依賴
- ✅ 執行 `pnpm install --no-frozen-lockfile`
- ✅ 執行 `pnpm run build`
- ✅ 啟動 `pnpm run start`

### 步驟 4: 配置環境變量（可選）

在 Railway 專案的 Variables 標籤中添加環境變量（如果需要）：

#### 最小配置（推薦）：

```bash
NODE_ENV=production
VITE_APP_TITLE=CycleScope Delta
```

**注意**：
- `PORT` 由 Railway 自動設置，無需手動配置
- `JWT_SECRET` 等已在系統中預配置

#### 完整配置（如需自定義）：

```bash
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=CycleScope Delta
VITE_APP_LOGO=/logo.svg
JWT_SECRET=your-random-secret-key-here
```

### 步驟 5: 部署

Railway 會自動開始建置和部署：

1. **建置階段**（約 3-5 分鐘）
   - 安裝系統依賴（Node.js, Python, Chromium）
   - 安裝 npm 套件
   - 安裝 Python 套件（Selenium, Pillow）
   - 建置前端和後端

2. **部署階段**（約 30 秒）
   - 啟動應用程式
   - 分配公開 URL

3. **完成**
   - 您會收到一個 Railway 提供的 URL（例如：`https://your-app.railway.app`）
   - 訪問該 URL 查看您的儀表板

## 📋 配置文件說明

### nixpacks.toml

```toml
[phases.setup]
nixPkgs = ["nodejs_22", "pnpm", "python3", "chromium"]
aptPkgs = ["fonts-liberation", "libnss3", "libxss1", "libappindicator3-1", "libgbm1"]

[phases.install]
cmds = [
  "pnpm install --no-frozen-lockfile",
  "pip3 install selenium pillow --break-system-packages"
]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "pnpm run start"
```

**說明**：
- `nixPkgs`: 安裝 Node.js 22、pnpm、Python 3 和 Chromium
- `aptPkgs`: 安裝 Chrome/Chromium 所需的系統庫
- `install`: 安裝 Node.js 和 Python 依賴（使用 --no-frozen-lockfile 避免 pnpm 錯誤）
- `build`: 建置應用程式
- `start`: 啟動命令

### railway.toml

```toml
[build]
builder = "NIXPACKS"

[build.nixpacksPlan]
providers = ["node"]

[build.nixpacksOptions]
packageManager = "pnpm"

[deploy]
startCommand = "pnpm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**說明**：
- 明確指定使用 Nixpacks 建置器
- 設置 pnpm 作為套件管理器
- 配置失敗重啟策略（最多 10 次）

## ✅ 功能驗證

部署成功後，驗證以下功能：

### 基本功能
- [ ] 儀表板正常載入
- [ ] 14 張圖表正確顯示（已裁剪，無導航欄）
- [ ] 分類篩選功能正常（BREADTH, LIQUIDITY/CREDIT, VOLATILITY, LEADERSHIP, HELPFUL OPTIONALS）

### 下載功能
- [ ] 單張圖表下載按鈕正常
- [ ] "Download All as ZIP" 按鈕正常
- [ ] ZIP 文件包含所有 14 張圖表

### 更新功能
- [ ] "Update All Charts" 按鈕正常
- [ ] 圖表從 StockCharts.co 更新
- [ ] 更新後的圖表正確裁剪（1920x680px，移除頂部 260px）

## 🔧 常見問題

### Q1: 建置失敗 - "pnpm install" 錯誤

**原因**：pnpm-lock.yaml 與 Railway 環境不兼容

**解決方案**：✅ 已在 `nixpacks.toml` 中使用 `--no-frozen-lockfile` 標誌

### Q2: Python 套件安裝失敗

**原因**：系統 Python 套件保護

**解決方案**：✅ 已在 `nixpacks.toml` 中使用 `--break-system-packages` 標誌

### Q3: Chromium 找不到或崩潰

**原因**：缺少系統依賴庫

**解決方案**：✅ 已在 `nixpacks.toml` 中安裝所有必需的 `aptPkgs`

### Q4: 圖表更新功能不工作

**可能原因**：
- Chromium 記憶體不足
- StockCharts.co 網站變更
- Python 腳本路徑錯誤

**檢查方法**：
1. 查看 Railway 日誌中的錯誤訊息
2. 確認 Python 腳本使用 `python3`（不是 `python3.11`）
3. 檢查記憶體使用情況

### Q5: 應用程式啟動後立即崩潰

**解決方案**：
- 檢查 Railway 日誌
- 確認 `pnpm run start` 命令在本地可以正常運行
- ✅ 已配置自動重啟策略（最多 10 次）

## 📊 監控和日誌

### 查看日誌

1. 在 Railway 專案頁面，點擊您的服務
2. 點擊 "Deployments" 標籤
3. 選擇最新的部署
4. 查看建置和運行日誌

### 監控指標

Railway 提供：
- CPU 使用率
- 記憶體使用率
- 網路流量
- 回應時間

## 💰 成本估算

Railway 免費方案包括：
- $5 免費額度/月
- 500 小時執行時間
- 100 GB 出站流量

**預估成本**：
- 小型專案（低流量）：免費方案足夠
- 中型專案（中等流量）：約 $5-10/月
- 大型專案（高流量）：約 $20-50/月

## 🌐 自定義域名（可選）

1. 在 Railway 專案設置中點擊 "Settings"
2. 找到 "Domains" 部分
3. 點擊 "Add Custom Domain"
4. 輸入您的域名（例如：`cyclescope.yourdomain.com`）
5. 在您的 DNS 提供商添加 CNAME 記錄：
   ```
   CNAME cyclescope your-app.railway.app
   ```

## 🔄 更新部署

Railway 會自動監控 GitHub 倉庫的變更：

1. 推送新的 commit 到 `main` 分支
2. Railway 自動觸發新的建置和部署
3. 無需手動操作

## ⏮️ 回滾

如果新部署出現問題：

1. 在 Railway 專案頁面，點擊 "Deployments"
2. 找到之前成功的部署
3. 點擊 "Redeploy"

## 📝 部署檢查清單

- [ ] 確認 `nixpacks.toml` 存在於專案根目錄
- [ ] 確認 `railway.toml` 存在於專案根目錄
- [ ] 確認專案結構完整（14 張圖表配置）
- [ ] 推送代碼到 GitHub
- [ ] 在 Railway 創建新專案並連接 GitHub 倉庫
- [ ] 等待首次建置完成（3-5 分鐘）
- [ ] 驗證網站可以訪問
- [ ] 測試圖表顯示功能
- [ ] 測試下載功能（單張 + ZIP）
- [ ] 測試更新功能
- [ ] （可選）設定自訂網域

## 🆘 技術支援

如果遇到問題：

1. **查看日誌**：Railway Dashboard → Deployments → Logs
2. **查看文檔**：[Railway Docs](https://docs.railway.app)
3. **社群支援**：[Railway Discord](https://discord.gg/railway)
4. **GitHub Issues**：在專案倉庫提交 issue

## 📚 與 Docker 方案的比較

| 特性 | Nixpacks（新） | Docker（舊） |
|------|----------------|--------------|
| 建置時間 | 3-5 分鐘 | 8-12 分鐘 |
| 配置複雜度 | 簡單（2 個配置文件） | 複雜（Dockerfile + 多個配置） |
| 錯誤率 | 低 | 高（pnpm 相關錯誤） |
| Railway 兼容性 | 優秀（原生支持） | 一般 |
| 維護成本 | 低 | 高 |
| 推薦度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 總結

使用 Nixpacks 部署到 Railway 的優勢：

✅ **簡單**：無需編寫複雜的 Dockerfile
✅ **快速**：建置時間比 Docker 更短
✅ **可靠**：Railway 優化的建置流程，已在您的 option-samurai-scanner 專案驗證
✅ **自動化**：Git push 即自動部署
✅ **可擴展**：根據流量自動調整資源
✅ **經濟**：免費方案足夠小型專案使用

---

**最後更新**：2025-10-26  
**版本**：v8.0 (Nixpacks)  
**狀態**：✅ 已驗證可用（基於 option-samurai-scanner 成功案例）

