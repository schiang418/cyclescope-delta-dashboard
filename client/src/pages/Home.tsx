import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { Download, ExternalLink, Moon, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { CHART_CATEGORIES, getChartById } from "@shared/chartData";

// Component to fetch and display chart image via API
function ChartImage({ chartId, chartName, cacheKey }: { chartId: number; chartName: string; cacheKey: number }) {
  const { data: imageData } = trpc.charts.getChartImage.useQuery({ chartId }, {
    // Refetch when cache key changes
    refetchOnMount: true,
    staleTime: 0,
  });

  if (!imageData || !imageData.exists) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md border border-border">
        <p className="text-muted-foreground text-sm">No image available</p>
      </div>
    );
  }

  return (
    <img
      key={cacheKey}
      src={imageData.imageData}
      alt={chartName}
      className="w-full h-auto rounded-md border border-border"
    />
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cacheKey, setCacheKey] = useState(Date.now());

  // Get last update timestamp
  const { data: lastUpdateData, refetch: refetchLastUpdate } = trpc.charts.getLastUpdate.useQuery();
  
  // Get chart-specific timestamps
  const { data: chartTimestamps, refetch: refetchChartTimestamps } = trpc.charts.getChartTimestamps.useQuery();

  // Filter charts based on selected category
  const filteredCharts = selectedCategory
    ? CHART_CATEGORIES.find(cat => cat.id === selectedCategory)?.charts || []
    : CHART_CATEGORIES.flatMap(cat => cat.charts);

  const downloadChartMutation = trpc.charts.downloadChart.useMutation();
  const downloadAllMutation = trpc.charts.downloadAllAsZip.useMutation();
  const updateChartsMutation = trpc.charts.updateCharts.useMutation();
  const [updatingChartId, setUpdatingChartId] = useState<number | null>(null);

  const handleDownloadChart = async (chartId: number) => {
    const chart = getChartById(chartId);
    if (!chart) return;

    try {
      toast.info(`Downloading ${chart.name}...`);
      const result = await downloadChartMutation.mutateAsync({ chartId });
      
      // Download the file using base64 data
      const link = document.createElement('a');
      link.href = result.imageData;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded ${chart.name}`);
    } catch (error) {
      toast.error(`Failed to download ${chart.name}`);
    }
  };

  const handleDownloadAll = async () => {
    try {
      toast.info("Preparing ZIP file with all 14 charts...");
      const result = await downloadAllMutation.mutateAsync();
      
      // Download the ZIP file using base64 data
      const link = document.createElement('a');
      link.href = result.zipData;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloaded all charts as ZIP!");
    } catch (error) {
      toast.error("Failed to create ZIP file");
    }
  };

  const handleUpdateSingleChart = async (chartId: number) => {
    setUpdatingChartId(chartId);
    const chart = getChartById(chartId);
    toast.info(`Updating ${chart?.name}...`);
    
    try {
      const result = await updateChartsMutation.mutateAsync({ chartIds: [chartId] });
      
      if (result.success) {
        setCacheKey(Date.now()); // Force reload image
        toast.success(`${chart?.name} updated successfully`);
        
        // Refetch timestamps
        await refetchLastUpdate();
        await refetchChartTimestamps();
      } else {
        toast.error(`Failed to update ${chart?.name}`);
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to update ${chart?.name}`);
    } finally {
      setUpdatingChartId(null);
    }
  };

  // Get tRPC utils for direct queries
  const utils = trpc.useUtils();

  // Poll update status
  const pollUpdateStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await utils.client.charts.getUpdateStatus.query();
        
        if (!status.isUpdating) {
          // Update completed
          clearInterval(pollInterval);
          setCacheKey(Date.now());
          await refetchLastUpdate();
          await refetchChartTimestamps();
          
          const successCount = status.progress?.successCount || 0;
          const total = status.progress?.total || 0;
          
          if (successCount === total) {
            toast.success(`✅ All ${total} charts updated successfully!`);
          } else if (successCount > 0) {
            toast.warning(`⚠️ Updated ${successCount}/${total} charts`);
          } else {
            toast.error(`❌ Failed to update charts`);
          }
          
          setIsUpdating(false);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    toast.info("Fetching latest charts from StockCharts.co... This may take 3-5 minutes.");
    
    try {
      const result = await updateChartsMutation.mutateAsync({});
      
      if (result.success && result.status === 'processing') {
        // Async mode: update started in background
        toast.info(result.message + " This may take 3-5 minutes.");
        
        // Start polling for status
        pollUpdateStatus();
      } else if (result.success) {
        // Sync mode or immediate success
        setCacheKey(Date.now());
        toast.success(result.message);
        await refetchLastUpdate();
        await refetchChartTimestamps();
        setIsUpdating(false);
      } else {
        toast.error(result.message || "No charts were updated successfully");
        setIsUpdating(false);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update charts");
      setIsUpdating(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CycleScope Delta</h1>
            <p className="text-sm text-muted-foreground">Market Analysis Dashboard - 14 Key Charts</p>
            {lastUpdateData && (
              <div className="mt-1 space-y-0.5">
                {/* Last attempt timestamp */}
                {(lastUpdateData as any).lastAttempt && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Last attempt: {formatTimestamp((lastUpdateData as any).lastAttempt)}
                    </p>
                    {(lastUpdateData as any).lastAttemptSuccess !== undefined && (
                      <Badge 
                        variant={(lastUpdateData as any).lastAttemptSuccess === (lastUpdateData as any).lastAttemptTotal ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {(lastUpdateData as any).lastAttemptSuccess}/{(lastUpdateData as any).lastAttemptTotal} charts
                      </Badge>
                    )}
                  </div>
                )}
                {/* Last full success timestamp */}
                {(lastUpdateData as any).lastFullSuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Last 14/14 success: {formatTimestamp((lastUpdateData as any).lastFullSuccess)}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={handleUpdateAll}
              disabled={isUpdating}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              Update All Charts
            </Button>
            
            <Button
              onClick={handleDownloadAll}
              variant="secondary"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {CHART_CATEGORIES.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.emoji} {category.title} ({category.charts.length})
          </Button>
          ))}
        </div>

        {/* Charts Grid */}
        {CHART_CATEGORIES.map(category => {
          const chartsToShow = selectedCategory === null || selectedCategory === category.id
            ? category.charts
            : [];

          if (chartsToShow.length === 0) return null;

          return (
            <div key={category.id} className="mb-12">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {category.emoji} {category.title}
                <span className="text-sm text-muted-foreground">({chartsToShow.length} Charts)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chartsToShow.map(chart => {
                  if (!chart) return null;

                  return (
                    <Card key={chart.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{chart.name}</CardTitle>
                            <CardDescription>{chart.description}</CardDescription>
                            {chartTimestamps && chartTimestamps[chart.id.toString()] && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last updated: {formatTimestamp(chartTimestamps[chart.id.toString()])}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 h-8"
                            onClick={() => handleUpdateSingleChart(chart.id)}
                            disabled={updatingChartId === chart.id || isUpdating}
                          >
                            <RefreshCw className={`h-3 w-3 ${updatingChartId === chart.id ? 'animate-spin' : ''}`} />
                            {updatingChartId === chart.id ? 'Updating...' : 'Update'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative group">
                          <ChartImage 
                            chartId={chart.id} 
                            chartName={chart.name} 
                            cacheKey={cacheKey}
                          />
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => window.open(chart.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View on StockCharts
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDownloadChart(chart.id)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Manus · Data from StockCharts.co</p>
        </div>
      </footer>
    </div>
  );
}

