# CycleScope Delta

**Market Analysis Dashboard with 14 Key Charts**

CycleScope Delta is a professional financial market analysis dashboard that automatically captures and displays 14 critical market charts from StockCharts.com. Built with modern web technologies and designed for traders and analysts who need quick access to key market indicators.

## 📊 Chart Categories

The dashboard organizes 14 charts across 5 key categories:

### 1️⃣ BREADTH (3 charts)
- SPXA50R - S&P 500 % Above 50-day MA
- SPXA150R - S&P 500 % Above 150-day MA  
- SPXA200R - S&P 500 % Above 200-day MA

### 2️⃣ LIQUIDITY/CREDIT (2 charts)
- HYG:IEF - High Yield vs Treasury
- LQD:IEF - Investment Grade vs Treasury

### 3️⃣ VOLATILITY (3 charts)
- VIX:VXV - VIX Term Structure
- VVIX - Volatility of VIX
- VIX - VIX Index

### 4️⃣ LEADERSHIP (2 charts)
- RSP:SPY - Equal Weight vs Market Cap
- SMH:SPY - Semiconductors vs S&P 500

### 5️⃣ HELPFUL OPTIONALS (4 charts)
- CPCE - Put/Call Ratio
- XLY:XLP - Consumer Discretionary vs Staples
- IWF:IWD - Growth vs Value
- USD - US Dollar Index

## ✨ Key Features

- **Automated Chart Updates**: Fetch latest charts from StockCharts.com with one click
- **Individual & Batch Updates**: Update single charts or all 14 charts at once
- **Timestamp Tracking**: Track when each chart was last updated
- **Download Functionality**: Download individual charts or all charts as a ZIP file
- **Category Filtering**: Filter charts by category for focused analysis
- **Dark/Light Theme**: Toggle between dark and light themes
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Real-time Status**: See success/failure status for each update attempt

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **TailwindCSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **tRPC** - End-to-end type-safe API

### Backend
- **Node.js 22** - Runtime environment
- **Express** - Web server
- **tRPC** - Type-safe API layer
- **Python 3.11** - Chart screenshot capture
- **Selenium** - Browser automation
- **Chromium** - Headless browser

### Database
- **MySQL/TiDB** - Data persistence
- **Drizzle ORM** - Type-safe database queries

### Deployment
- **Docker** - Containerization
- **Railway** - Cloud hosting platform

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- Python 3.11+
- Chromium browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/cyclescope-delta.git
cd cyclescope-delta
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Push database schema:
```bash
pnpm db:push
```

5. Start development server:
```bash
pnpm dev
```

The dashboard will be available at `http://localhost:3000`

## 📦 Building for Production

```bash
pnpm build
pnpm start
```

## 🐳 Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
docker build -t cyclescope-delta .
docker run -p 3000:3000 cyclescope-delta
```

## 🚂 Railway Deployment

This project is optimized for Railway deployment:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will automatically detect the Dockerfile
4. Add required environment variables
5. Deploy!

See `RAILWAY_DEPLOY_GUIDE.md` for detailed deployment instructions.

## 📝 Environment Variables

Required environment variables:
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL

See `.env.example` for complete list.

## 🎯 Usage

### Update All Charts
Click the "Update All Charts" button in the header to fetch the latest versions of all 14 charts from StockCharts.com. This process takes 3-5 minutes.

### Update Individual Chart
Click the refresh icon on any chart card to update just that chart.

### Download Charts
- Click the download icon on any chart to download it as PNG
- Click "Download All as ZIP" to download all 14 charts in a single ZIP file

### Filter by Category
Click on any category badge to filter charts by that category. Click "All" to show all charts.

### Toggle Theme
Click the sun/moon icon in the header to switch between light and dark themes.

## 🔧 Development

### Project Structure
```
cyclescope-delta/
├── client/               # Frontend React application
│   ├── public/          # Static assets
│   └── src/             # Source code
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── lib/         # Utilities
├── server/              # Backend Express + tRPC
│   ├── _core/          # Core server infrastructure
│   └── routers/        # tRPC routers
├── shared/              # Shared types and constants
│   ├── chartData.ts    # Chart configuration
│   └── chart_links.json # Chart metadata
├── scripts/             # Python scripts
│   └── capture_chart.py # Selenium screenshot script
├── drizzle/            # Database schema and migrations
└── Dockerfile          # Docker configuration
```

### Key Files
- `shared/chartData.ts` - Chart categories and configuration
- `server/chartRouter.ts` - Chart update and download API
- `server/chartScreenshot.ts` - Python script execution
- `scripts/capture_chart.py` - Selenium chart capture
- `client/src/pages/Home.tsx` - Main dashboard UI

## 🐛 Troubleshooting

### Charts not updating
- Check that Python 3.11 and Chromium are installed
- Verify StockCharts.com URLs are accessible
- Check server logs for error messages

### Images not displaying
- Charts are served via API endpoint, not static files
- Check that chart files exist in `client/public/charts/`
- Verify tRPC API is responding correctly

### Railway deployment issues
- Ensure Dockerfile is present in repository
- Check Railway build logs for errors
- Verify all environment variables are set

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for traders and market analysts

