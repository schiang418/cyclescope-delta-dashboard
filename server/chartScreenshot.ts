import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { ChartInfo } from '../shared/chartData';

const execAsync = promisify(exec);
const OUTPUT_DIR = path.join(process.cwd(), 'client', 'public', 'charts');
const PYTHON_SCRIPT = path.join(process.cwd(), 'scripts', 'capture_chart.py');

// Detect available Python command
function getPythonCommand(): string {
  const commands = ['python3.11', 'python3', 'python'];
  
  for (const cmd of commands) {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
      console.log(`Using Python command: ${cmd}`);
      return cmd;
    } catch {
      // Command not found, try next
    }
  }
  
  throw new Error('No Python installation found. Tried: python3.11, python3, python');
}

const PYTHON_CMD = getPythonCommand();

export interface ScreenshotResult {
  chartId: number;
  chartName: string;
  success: boolean;
  error?: string;
  filePath?: string;
  fileSize?: number;
}

/**
 * Capture only the chart canvas from StockCharts.co using Python/Selenium
 */
export async function captureChartImage(chart: ChartInfo): Promise<ScreenshotResult> {
  try {
    console.log(`[${chart.id}] Capturing chart: ${chart.name}`);
    
    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });
    
    // Define output path
    const filename = `${chart.id.toString().padStart(2, '0')}_${chart.name}.png`;
    const filePath = path.join(OUTPUT_DIR, filename);
    
    // Call Python script to capture chart
    const command = `${PYTHON_CMD} "${PYTHON_SCRIPT}" "${chart.url}" "${filePath}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large images
    });
    
    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.warn(`[${chart.id}] Warning:`, stderr);
    }
    
    // Parse JSON response from Python script
    const result = JSON.parse(stdout.trim());
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error from Python script');
    }
    
    console.log(`[${chart.id}] ✓ Chart captured successfully`);
    
    return {
      chartId: chart.id,
      chartName: chart.name,
      success: true,
      filePath
    };
    
  } catch (error) {
    console.error(`[${chart.id}] ✗ Error:`, error);
    
    return {
      chartId: chart.id,
      chartName: chart.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Capture multiple charts sequentially
 */
export async function captureMultipleCharts(charts: ChartInfo[]): Promise<ScreenshotResult[]> {
  const results: ScreenshotResult[] = [];
  
  console.log(`\nStarting capture of ${charts.length} charts...`);
  
  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    console.log(`\n[${i + 1}/${charts.length}] Processing: ${chart.name}`);
    
    const result = await captureChartImage(chart);
    results.push(result);
    
    // Small delay between requests
    if (i < charts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\n✓ Capture complete: ${successCount} succeeded, ${failCount} failed\n`);

  return results;
}

/**
 * Get chart image as buffer for direct download
 */
export async function getChartImageBuffer(chart: ChartInfo): Promise<Buffer | null> {
  try {
    console.log(`Downloading chart: ${chart.name}`);
    
    // Call Python script without output path to get base64 data
    const command = `python3.11 "${PYTHON_SCRIPT}" "${chart.url}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024
    });
    
    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.warn(`Warning:`, stderr);
    }
    
    const result = JSON.parse(stdout.trim());
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to capture chart');
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(result.imageData, 'base64');
    
    console.log(`✓ Chart downloaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    
    return imageBuffer;
    
  } catch (error) {
    console.error(`Error downloading chart ${chart.name}:`, error);
    return null;
  }
}

