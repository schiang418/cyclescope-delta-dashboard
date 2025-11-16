export interface ChartInfo {
  id: number;
  name: string;
  description: string;
  category: string;
  priority: string;
  url: string;
  symbol?: string;
}

export interface ChartCategory {
  id: string;
  title: string;
  emoji: string;
  count: number;
  charts: ChartInfo[];
}

export const CHART_CATEGORIES: ChartCategory[] = [
  {
    id: "breadth",
    title: "BREADTH",
    emoji: "1️⃣",
    count: 3,
    charts: [
      {
        id: 1,
        name: "SPXA50R",
        description: "S&P 500 % Above 50-day MA (6-month)",
        category: "Breadth",
        priority: "critical",
        url: "https://schrts.co/EcqJFvCr",
        symbol: "$SPXA50R"
      },
      {
        id: 2,
        name: "SPXA150R",
        description: "S&P 500 % Above 150-day MA (6-month)",
        category: "Breadth",
        priority: "high",
        url: "https://schrts.co/twpiWSeJ",
        symbol: "$SPXA150R"
      },
      {
        id: 3,
        name: "SPXA200R",
        description: "S&P 500 % Above 200-day MA (6-month)",
        category: "Breadth",
        priority: "critical",
        url: "https://schrts.co/biIPeUKq",
        symbol: "$SPXA200R"
      }
    ]
  },
  {
    id: "liquidity_credit",
    title: "LIQUIDITY/CREDIT",
    emoji: "2️⃣",
    count: 2,
    charts: [
      {
        id: 4,
        name: "HYG_IEF",
        description: "High Yield vs Treasury (HYG:IEF) 6-month",
        category: "Liquidity/Credit",
        priority: "high",
        url: "https://schrts.co/ycCmkqKZ",
        symbol: "HYG:IEF"
      },
      {
        id: 5,
        name: "LQD_IEF",
        description: "Investment Grade vs Treasury (LQD:IEF) 6-month",
        category: "Liquidity/Credit",
        priority: "high",
        url: "https://schrts.co/sGaxUYIK",
        symbol: "LQD:IEF"
      }
    ]
  },
  {
    id: "volatility",
    title: "VOLATILITY",
    emoji: "3️⃣",
    count: 3,
    charts: [
      {
        id: 6,
        name: "VIX_VXV",
        description: "VIX Term Structure (VIX:VXV) 6-month",
        category: "Volatility",
        priority: "high",
        url: "https://schrts.co/puyphxTJ",
        symbol: "$VIX:$VXV"
      },
      {
        id: 7,
        name: "VVIX",
        description: "Volatility of VIX (VVIX) 6-month",
        category: "Volatility",
        priority: "medium",
        url: "https://schrts.co/xrKsGPYI",
        symbol: "$VVIX"
      },
      {
        id: 8,
        name: "VIX",
        description: "VIX Index 6-month",
        category: "Volatility",
        priority: "critical",
        url: "https://schrts.co/diUcXUiB",
        symbol: "$VIX"
      }
    ]
  },
  {
    id: "leadership",
    title: "LEADERSHIP",
    emoji: "4️⃣",
    count: 2,
    charts: [
      {
        id: 9,
        name: "RSP_SPY",
        description: "Equal Weight vs Market Cap (RSP:SPY) 6-month",
        category: "Leadership",
        priority: "high",
        url: "https://schrts.co/KjztDjXr",
        symbol: "RSP:SPY"
      },
      {
        id: 10,
        name: "SMH_SPY",
        description: "Semiconductors vs S&P 500 (SMH:SPY) 6-month",
        category: "Leadership",
        priority: "high",
        url: "https://schrts.co/RMjAJXpM",
        symbol: "SMH:SPY"
      }
    ]
  },
  {
    id: "helpful_optionals",
    title: "HELPFUL OPTIONALS",
    emoji: "5️⃣",
    count: 4,
    charts: [
      {
        id: 11,
        name: "CPCE",
        description: "Put/Call Ratio (CPCE) 1-year",
        category: "Helpful Optionals",
        priority: "medium",
        url: "https://schrts.co/bKEDqYYJ",
        symbol: "$CPCE"
      },
      {
        id: 12,
        name: "XLY_XLP",
        description: "Consumer Discretionary vs Staples (XLY:XLP) 6-month",
        category: "Helpful Optionals",
        priority: "high",
        url: "https://schrts.co/thJpfmUG",
        symbol: "XLY:XLP"
      },
      {
        id: 13,
        name: "IWFIWDV",
        description: "Growth vs Value (IWF:IWD) 6-month",
        category: "Helpful Optionals",
        priority: "medium",
        url: "https://schrts.co/UMTQAJkV",
        symbol: "IWF:IWD"
      },
      {
        id: 14,
        name: "USD",
        description: "US Dollar Index (USD) 6-month",
        category: "Helpful Optionals",
        priority: "medium",
        url: "https://schrts.co/bmiVsdnZ",
        symbol: "$USD"
      }
    ]
  },
  {
    id: "additional_indicators",
    title: "ADDITIONAL INDICATORS",
    emoji: "6️⃣",
    count: 5,
    charts: [
      {
        id: 15,
        name: "SPX",
        description: "S&P 500 Index 6-month",
        category: "Additional Indicators",
        priority: "critical",
        url: "https://schrts.co/wMTkaqeS",
        symbol: "$SPX"
      },
      {
        id: 16,
        name: "COPPER_GOLD",
        description: "Copper to Gold Ratio 6-month",
        category: "Additional Indicators",
        priority: "medium",
        url: "https://schrts.co/fADItcqz",
        symbol: "$COPPER:$GOLD"
      },
      {
        id: 17,
        name: "JNK_IEF",
        description: "Junk Bonds vs Treasury (JNK:IEF) 6-month",
        category: "Additional Indicators",
        priority: "high",
        url: "https://schrts.co/tYzJxkG5",
        symbol: "JNK:IEF"
      },
      {
        id: 18,
        name: "XLK_XLP",
        description: "Technology vs Consumer Staples (XLK:XLP) 6-month",
        category: "Additional Indicators",
        priority: "high",
        url: "https://schrts.co/SiYGGGFg",
        symbol: "XLK:XLP"
      },
      {
        id: 19,
        name: "TNX",
        description: "10-Year Treasury Yield ($TNX) 6-month",
        category: "Additional Indicators",
        priority: "high",
        url: "https://schrts.co/fuqgkMNr",
        symbol: "$TNX"
      }
    ]
  }
];

export const getAllCharts = (): ChartInfo[] => {
  return CHART_CATEGORIES.flatMap(cat => cat.charts);
};

export const getChartById = (id: number): ChartInfo | undefined => {
  return getAllCharts().find(chart => chart.id === id);
};

export const getChartsByCategory = (categoryId: string): ChartInfo[] => {
  const category = CHART_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.charts || [];
};

