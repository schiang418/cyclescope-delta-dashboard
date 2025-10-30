import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { CHART_CATEGORIES, getAllCharts, getChartById } from "../shared/chartData";
import { captureMultipleCharts, captureChartImage, getChartImageBuffer } from "./chartScreenshot";
import AdmZip from 'adm-zip';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Timestamp file paths
const TIMESTAMP_FILE = join(process.cwd(), 'client', 'public', 'last-update.json');
const CHART_TIMESTAMPS_FILE = join(process.cwd(), 'client', 'public', 'chart-timestamps.json');

// Helper to get last update timestamp
function getLastUpdateTimestamp(): any {
  try {
    if (existsSync(TIMESTAMP_FILE)) {
      const data = JSON.parse(readFileSync(TIMESTAMP_FILE, 'utf-8'));
      return data;
    }
  } catch (error) {
    console.error('Error reading timestamp file:', error);
  }
  return null;
}

// Helper to get chart-specific timestamps
function getChartTimestamps(): Record<string, string> {
  try {
    if (existsSync(CHART_TIMESTAMPS_FILE)) {
      return JSON.parse(readFileSync(CHART_TIMESTAMPS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading chart timestamps file:', error);
  }
  return {};
}

// Helper to save chart-specific timestamp
function saveChartTimestamp(chartId: number): void {
  try {
    const timestamps = getChartTimestamps();
    timestamps[chartId.toString()] = new Date().toISOString();
    writeFileSync(CHART_TIMESTAMPS_FILE, JSON.stringify(timestamps, null, 2));
  } catch (error) {
    console.error('Error saving chart timestamp:', error);
  }
}

// Helper to save last update timestamp
function saveLastUpdateTimestamp(successCount: number, totalCount: number): void {
  try {
    const now = new Date().toISOString();
    const existingData = getLastUpdateTimestamp() || {};
    
    const data = {
      lastAttempt: now,
      lastAttemptTimestamp: Date.now(),
      lastAttemptSuccess: successCount,
      lastAttemptTotal: totalCount,
      lastFullSuccess: (successCount === totalCount) ? now : (existingData.lastFullSuccess || null),
      lastFullSuccessTimestamp: (successCount === totalCount) ? Date.now() : (existingData.lastFullSuccessTimestamp || null)
    };
    writeFileSync(TIMESTAMP_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving timestamp file:', error);
  }
}

export const chartRouter = router({
  // Get all chart categories with charts
  getCategories: publicProcedure.query(() => {
    return CHART_CATEGORIES;
  }),

  // Get last update timestamp
  getLastUpdate: publicProcedure.query(() => {
    return getLastUpdateTimestamp();
  }),

  // Get chart-specific timestamps
  getChartTimestamps: publicProcedure.query(() => {
    return getChartTimestamps();
  }),

  // Get all charts (flat list)
  getAllCharts: publicProcedure.query(() => {
    return getAllCharts();
  }),

  // Get single chart by ID
  getChart: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const chart = getChartById(input.id);
      if (!chart) {
        throw new Error(`Chart with id ${input.id} not found`);
      }
      return chart;
    }),

  // Trigger chart update with screenshot capture
  updateCharts: publicProcedure
    .input(z.object({ chartIds: z.array(z.number()).optional() }))
    .mutation(async ({ input }) => {
      const chartsToUpdate = input.chartIds 
        ? input.chartIds.map(id => getChartById(id)).filter(Boolean)
        : getAllCharts();
      
      const chartsDir = join(process.cwd(), 'client', 'public', 'charts');
      
      // Ensure charts directory exists
      if (!existsSync(chartsDir)) {
        mkdirSync(chartsDir, { recursive: true });
      }
      
      let successCount = 0;
      const results = [];
      
      for (const chart of chartsToUpdate) {
        if (!chart) continue;
        
        const filename = `${chart.id.toString().padStart(2, '0')}_${chart.name}.png`;
        const outputPath = join(chartsDir, filename);
        const scriptPath = join(process.cwd(), 'scripts', 'capture_chart.py');
        
        try {
          // Run Python script to capture chart
          // Try python3.11 first (Nixpacks), fallback to python3
          let pythonCmd = 'python3.11';
          try {
            execSync('which python3.11', { stdio: 'pipe' });
          } catch {
            pythonCmd = 'python3';
          }
          
          const result = execSync(`${pythonCmd} "${scriptPath}" "${chart.url}" "${outputPath}"`, {
            timeout: 60000, // 60 second timeout per chart
            stdio: 'pipe',
            encoding: 'utf-8'
          });
          
          // Parse JSON result from Python script
          const jsonResult = JSON.parse(result.toString());
          
          if (!jsonResult.success) {
            throw new Error(jsonResult.error || 'Python script failed');
          }
          
          if (existsSync(outputPath)) {
            successCount++;
            saveChartTimestamp(chart.id); // Save individual chart timestamp
            results.push({ chartId: chart.id, success: true, chartName: chart.name });
          } else {
            results.push({ chartId: chart.id, success: false, chartName: chart.name, error: 'File not created' });
          }
        } catch (error: any) {
          results.push({ chartId: chart.id, success: false, chartName: chart.name, error: error.message });
        }
      }
      
      // Always save timestamp (even if all failed)
      saveLastUpdateTimestamp(successCount, chartsToUpdate.length);
      
      return {
        success: successCount > 0,
        message: `Updated ${successCount}/${chartsToUpdate.length} charts successfully`,
        updatedCharts: results.filter(r => r.success).map(r => r.chartId),
        results,
        lastUpdate: getLastUpdateTimestamp()
      };
    }),

  // Get chart image (serves from saved file)
  getChartImage: publicProcedure
    .input(z.object({ chartId: z.number() }))
    .query(({ input }) => {
      const chart = getChartById(input.chartId);
      if (!chart) {
        throw new Error(`Chart ${input.chartId} not found`);
      }

      const filename = `${chart.id.toString().padStart(2, '0')}_${chart.name}.png`;
      const filePath = join(process.cwd(), 'client', 'public', 'charts', filename);
      
      if (!existsSync(filePath)) {
        // Return null if image doesn't exist yet
        return {
          success: false,
          exists: false,
          chartId: input.chartId
        };
      }

      // Read image and convert to base64
      const imageBuffer = readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');
      
      return {
        success: true,
        exists: true,
        chartId: input.chartId,
        imageData: `data:image/png;base64,${base64Image}`
      };
    }),

  // Download a single chart (fetches latest from StockCharts)
  downloadChart: publicProcedure
    .input(z.object({ chartId: z.number() }))
    .mutation(async ({ input }) => {
      const chart = getChartById(input.chartId);
      if (!chart) {
        throw new Error(`Chart ${input.chartId} not found`);
      }

      const imageBuffer = await getChartImageBuffer(chart);
      
      if (!imageBuffer) {
        throw new Error('Failed to capture chart image');
      }

      // Convert buffer to base64 for transmission
      const base64Image = imageBuffer.toString('base64');
      
      return {
        success: true,
        chartName: chart.name,
        imageData: `data:image/png;base64,${base64Image}`,
        filename: `${chart.name}.png`
      };
    }),

  // Download all charts as a ZIP file
  downloadAllAsZip: publicProcedure
    .mutation(async () => {
      const charts = getAllCharts();
      
      // Create ZIP file
      const zip = new AdmZip();
      
      // Add each chart from the public/charts folder
      const chartsDir = join(process.cwd(), 'client', 'public', 'charts');
      
      let successCount = 0;
      for (const chart of charts) {
        const filename = `${chart.id.toString().padStart(2, '0')}_${chart.name}.png`;
        const filePath = join(chartsDir, filename);
        
        if (existsSync(filePath)) {
          const imageData = readFileSync(filePath);
          zip.addFile(`${chart.name}.png`, imageData);
          successCount++;
        }
      }
      
      // Get ZIP buffer
      const zipBuffer = zip.toBuffer();
      const base64Zip = zipBuffer.toString('base64');
      
      return {
        success: true,
        message: `Created ZIP with ${successCount}/${charts.length} charts`,
        zipData: `data:application/zip;base64,${base64Zip}`,
        filename: `cyclescope_charts_${new Date().toISOString().split('T')[0]}.zip`
      };
    }),
});

