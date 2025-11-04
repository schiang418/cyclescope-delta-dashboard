import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { callDataApi } from "./_core/dataApi";

/**
 * API-based chart data router
 * Fetches real-time data from Yahoo Finance API for chart generation
 */

export const apiChartRouter = router({
  /**
   * Get S&P 500 (SPX) historical data
   */
  getSPXData: publicProcedure
    .input(z.object({
      range: z.enum(['1mo', '3mo', '6mo', '1y', '2y', '5y']).default('1y'),
      interval: z.enum(['1d', '1wk', '1mo']).default('1d')
    }))
    .query(async ({ input }) => {
      try {
        const response = await callDataApi("YahooFinance/get_stock_chart", {
          query: {
            symbol: '^GSPC',
            region: 'US',
            interval: input.interval,
            range: input.range,
            includeAdjustedClose: true
          }
        });

        if (response && (response as any).chart && (response as any).chart.result) {
          const result = (response as any).chart.result[0];
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];

          return {
            success: true,
            symbol: result.meta.symbol,
            timestamps,
            prices: quotes.close,
            currentPrice: result.meta.regularMarketPrice
          };
        }

        return { success: false, error: 'No data found' };
      } catch (error) {
        console.error('Error fetching SPX data:', error);
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get ratio chart data (e.g., XLY:XLP)
   */
  getRatioData: publicProcedure
    .input(z.object({
      symbol1: z.string(),
      symbol2: z.string(),
      range: z.enum(['1mo', '3mo', '6mo', '1y', '2y', '5y']).default('1y'),
      interval: z.enum(['1d', '1wk', '1mo']).default('1d')
    }))
    .query(async ({ input }) => {
      try {
        // Fetch both symbols
        const [response1, response2] = await Promise.all([
          callDataApi("YahooFinance/get_stock_chart", {
            query: {
              symbol: input.symbol1,
              region: 'US',
              interval: input.interval,
              range: input.range,
              includeAdjustedClose: true
            }
          }),
          callDataApi("YahooFinance/get_stock_chart", {
            query: {
              symbol: input.symbol2,
              region: 'US',
              interval: input.interval,
              range: input.range,
              includeAdjustedClose: true
            }
          })
        ]);

        if (response1 && (response1 as any).chart && (response1 as any).chart.result &&
            response2 && (response2 as any).chart && (response2 as any).chart.result) {
          
          const result1 = (response1 as any).chart.result[0];
          const result2 = (response2 as any).chart.result[0];

          const timestamps1 = result1.timestamp;
          const timestamps2 = result2.timestamp;

          const prices1 = result1.indicators.quote[0].close;
          const prices2 = result2.indicators.quote[0].close;

          // Calculate ratio for matching timestamps
          const ratios: number[] = [];
          const matchingTimestamps: number[] = [];

          timestamps1.forEach((ts: number, i: number) => {
            const idx2 = timestamps2.indexOf(ts);
            if (idx2 !== -1 && prices1[i] && prices2[idx2]) {
              ratios.push(prices1[i] / prices2[idx2]);
              matchingTimestamps.push(ts);
            }
          });

          return {
            success: true,
            symbol: `${input.symbol1}:${input.symbol2}`,
            timestamps: matchingTimestamps,
            ratios,
            currentRatio: ratios[ratios.length - 1]
          };
        }

        return { success: false, error: 'No data found' };
      } catch (error) {
        console.error('Error fetching ratio data:', error);
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get single symbol data (for simple price charts)
   */
  getSymbolData: publicProcedure
    .input(z.object({
      symbol: z.string(),
      range: z.enum(['1mo', '3mo', '6mo', '1y', '2y', '5y']).default('1y'),
      interval: z.enum(['1d', '1wk', '1mo']).default('1d')
    }))
    .query(async ({ input }) => {
      try {
        const response = await callDataApi("YahooFinance/get_stock_chart", {
          query: {
            symbol: input.symbol,
            region: 'US',
            interval: input.interval,
            range: input.range,
            includeAdjustedClose: true
          }
        });

        if (response && (response as any).chart && (response as any).chart.result) {
          const result = (response as any).chart.result[0];
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];

          return {
            success: true,
            symbol: result.meta.symbol,
            timestamps,
            prices: quotes.close,
            currentPrice: result.meta.regularMarketPrice,
            meta: {
              currency: result.meta.currency,
              exchangeName: result.meta.exchangeName
            }
          };
        }

        return { success: false, error: 'No data found' };
      } catch (error) {
        console.error('Error fetching symbol data:', error);
        return { success: false, error: String(error) };
      }
    })
});

