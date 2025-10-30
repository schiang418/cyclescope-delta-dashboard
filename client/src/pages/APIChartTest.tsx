import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function APIChartTest() {
  // Fetch SPX data
  const { data: spxData, isLoading: spxLoading, error: spxError } = trpc.apiCharts.getSPXData.useQuery({
    range: '1y',
    interval: '1d'
  });

  // Fetch XLY:XLP ratio data
  const { data: ratioData, isLoading: ratioLoading, error: ratioError } = trpc.apiCharts.getRatioData.useQuery({
    symbol1: 'XLY',
    symbol2: 'XLP',
    range: '1y',
    interval: '1d'
  });

  // Prepare SPX chart data
  const spxChartData = spxData?.success ? {
    labels: spxData.timestamps.map((ts: number) => new Date(ts * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'S&P 500 (SPX)',
        data: spxData.prices,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  } : null;

  // Prepare ratio chart data
  const ratioChartData = ratioData?.success ? {
    labels: ratioData.timestamps?.map((ts: number) => new Date(ts * 1000).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'XLY:XLP Ratio',
        data: ratioData.ratios,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#999',
          maxTicksLimit: 10
        },
        grid: {
          color: '#333'
        }
      },
      y: {
        ticks: {
          color: '#999'
        },
        grid: {
          color: '#333'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Chart Test - Proof of Concept</h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* SPX Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. S&P 500 (SPX) - Simple Price Chart</h2>
            
            {spxLoading && <p className="text-gray-400">Loading SPX data...</p>}
            {spxError && <p className="text-red-400">Error: {spxError.message}</p>}
            
            {spxData?.success && spxChartData && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-400">
                    Current Price: <span className="text-green-400 font-semibold">${spxData.currentPrice?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Data Points: {spxData.timestamps.length}
                  </p>
                </div>
                <div style={{ height: '400px' }}>
                  <Line data={spxChartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          {/* Ratio Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. XLY:XLP Ratio - Consumer Discretionary vs Staples</h2>
            
            {ratioLoading && <p className="text-gray-400">Loading ratio data...</p>}
            {ratioError && <p className="text-red-400">Error: {ratioError.message}</p>}
            
            {ratioData?.success && ratioChartData && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-400">
                    Current Ratio: <span className="text-blue-400 font-semibold">{ratioData.currentRatio?.toFixed(4)}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Data Points: {ratioData.timestamps?.length || 0}
                  </p>
                </div>
                <div style={{ height: '400px' }}>
                  <Line data={ratioChartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          {/* Comparison Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Comparison with Original Charts</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">✅ Advantages of API Charts:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Real-time data updates (no manual refresh needed)</li>
                  <li>No Chrome/Selenium dependency (works reliably in containers)</li>
                  <li>Customizable appearance and indicators</li>
                  <li>Interactive tooltips and zoom</li>
                  <li>Faster loading (no screenshot generation)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">⚠️ Limitations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Different visual style from StockCharts.com</li>
                  <li>Some proprietary indicators not available (SPXA50R, CPCE, etc.)</li>
                  <li>Requires manual implementation of technical indicators</li>
                  <li>API rate limits may apply</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">🎯 Recommendation:</h3>
                <p>
                  Implement API charts for the 12 easy charts (MACRO, LEADERSHIP, CREDIT categories).
                  Keep screenshot-based approach for the 4 difficult charts (breadth indicators, sentiment).
                  This hybrid approach gives you the best of both worlds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a href="/" className="text-blue-400 hover:text-blue-300">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

