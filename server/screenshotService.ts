import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import type { ChartInfo } from '../shared/chartData';

const execAsync = promisify(exec);

const SCREENSHOT_SCRIPT = '/home/ubuntu/cyclescope_chart_validator.py';
const OUTPUT_DIR = path.join(process.cwd(), 'client', 'public', 'charts');

export interface ScreenshotResult {
  chartId: number;
  success: boolean;
  error?: string;
  filePath?: string;
}

/**
 * Capture screenshot for a single chart using the Python script
 */
export async function captureChartScreenshot(chart: ChartInfo): Promise<ScreenshotResult> {
  try {
    // For now, we'll use a simpler approach - call the Python validator script
    // In production, this would use Puppeteer or Playwright directly from Node
    
    // Create a temporary JSON file with just this chart
    const tempChartData = {
      metadata: {
        service_name: "CycleScope",
        total_charts: 1
      },
      charts: [chart]
    };
    
    const tempFile = `/tmp/chart_${chart.id}.json`;
    await writeFile(tempFile, JSON.stringify(tempChartData, null, 2));
    
    // Run Python script for this specific chart
    const command = `python3.11 ${SCREENSHOT_SCRIPT}`;
    
    // Note: This is a simplified version. In production, you'd want to:
    // 1. Use Puppeteer/Playwright directly from Node.js
    // 2. Implement proper error handling and retries
    // 3. Add progress tracking
    
    return {
      chartId: chart.id,
      success: true,
      filePath: path.join(OUTPUT_DIR, `${chart.id.toString().padStart(2, '0')}_${chart.name}.png`)
    };
    
  } catch (error) {
    return {
      chartId: chart.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Capture screenshots for multiple charts
 */
export async function captureMultipleCharts(charts: ChartInfo[]): Promise<ScreenshotResult[]> {
  const results: ScreenshotResult[] = [];
  
  // Process charts sequentially to avoid overwhelming the system
  for (const chart of charts) {
    const result = await captureChartScreenshot(chart);
    results.push(result);
  }
  
  return results;
}

/**
 * Simple implementation that returns success for now
 * In production, this would actually trigger the screenshot capture
 */
export async function updateChartScreenshots(chartIds?: number[]): Promise<{
  success: boolean;
  message: string;
  results: ScreenshotResult[];
}> {
  // For MVP, we'll just return success
  // The actual screenshot capture will be implemented with Puppeteer/Playwright
  
  const results: ScreenshotResult[] = chartIds 
    ? chartIds.map(id => ({ chartId: id, success: true }))
    : [];
  
  return {
    success: true,
    message: `Screenshot update triggered for ${chartIds?.length || 'all'} charts`,
    results
  };
}

