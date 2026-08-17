export const globalEvents = [
  {
    id: 1,
    title: "US Federal Reserve Rate Decision",
    category: "monetary-policy",
    region: "United States",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "Federal Reserve maintains interest rates at 5.25-5.50%, signals potential rate cuts in upcoming meetings based on cooling inflation data.",
    impact: {
      direction: "positive",
      magnitude: 55,
      description: "Dovish stance weakens USD, boosts FII inflows into Indian equities. Rate-sensitive sectors like IT, Banking likely to benefit.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "+0.4%", direction: "up" },
        { name: "SENSEX", impact: "+0.35%", direction: "up" },
        { name: "BANK NIFTY", impact: "+0.6%", direction: "up" },
        { name: "NIFTY IT", impact: "+0.8%", direction: "up" }
      ],
      affectedSectors: ["Banking", "IT", "Real Estate", "Auto"],
      fiiImpact: "Positive - Increased FII buying expected",
      currencyImpact: "INR likely to appreciate against USD"
    },
    tags: ["fed", "interest-rates", "monetary-policy", "USD"]
  },
  {
    id: 2,
    title: "China Manufacturing PMI Decline",
    category: "economic-data",
    region: "China",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    severity: "medium",
    description: "China's Caixin Manufacturing PMI falls to 48.3, indicating continued contraction in the world's second-largest economy for the third consecutive month.",
    impact: {
      direction: "negative",
      magnitude: 30,
      description: "Weak China demand hurts commodity prices and export-oriented Indian companies. Metal and mining sectors face headwinds.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "-0.15%", direction: "down" },
        { name: "SENSEX", impact: "-0.2%", direction: "down" },
        { name: "NIFTY METAL", impact: "-1.0%", direction: "down" },
        { name: "NIFTY COMMODITIES", impact: "-0.7%", direction: "down" }
      ],
      affectedSectors: ["Metal", "Mining", "Commodities"],
      fiiImpact: "Neutral to Negative - Reduced commodity-linked investments",
      currencyImpact: "INR may weaken slightly on global growth concerns"
    },
    tags: ["china", "PMI", "manufacturing", "commodities"]
  },
  {
    id: 3,
    title: "Crude Oil Prices Surge on Middle East Tensions",
    category: "commodity",
    region: "Middle East",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "Brent crude jumps to $89/barrel after escalation in Middle East geopolitical tensions disrupt supply chain expectations through Strait of Hormuz.",
    impact: {
      direction: "negative",
      magnitude: 45,
      description: "Higher crude oil prices increase India's import bill, widen trade deficit, and raise inflationary pressures. However, impact is moderated if no actual supply disruption occurs. Defensive sectors (Pharma, IT) may outperform.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "-0.3% to -0.5%", direction: "down" },
        { name: "SENSEX", impact: "-0.4% to -0.6%", direction: "down" },
        { name: "BANK NIFTY", impact: "-0.3% to -0.5%", direction: "down" },
        { name: "NIFTY IT", impact: "-0.5% to -1.0%", direction: "down" },
        { name: "NIFTY PHARMA", impact: "+0.2% to +0.5%", direction: "up" }
      ],
      affectedSectors: ["Aviation (negative)", "OMCs (negative)", "FMCG (negative)", "Paints (negative)", "Pharma (defensive)", "IT (mixed)"],
      fiiImpact: "Mild negative - FII cautious but not panicking unless supply actually disrupted",
      currencyImpact: "INR under mild pressure - higher oil increases import costs but RBI support expected"
    },
    tags: ["crude-oil", "geopolitics", "energy", "inflation", "strait-of-hormuz"]
  },
  {
    id: 4,
    title: "European Central Bank Cuts Rates by 25bps",
    category: "monetary-policy",
    region: "Europe",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    severity: "medium",
    description: "ECB reduces main refinancing rate to 4.15% as Eurozone inflation cools to 2.3%. Markets price in further easing through 2026.",
    impact: {
      direction: "positive",
      magnitude: 35,
      description: "European rate cuts increase global liquidity, making emerging markets like India more attractive for carry trades and FII flows.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "+0.3%", direction: "up" },
        { name: "SENSEX", impact: "+0.25%", direction: "up" },
        { name: "NIFTY BANK", impact: "+0.35%", direction: "up" }
      ],
      affectedSectors: ["Banking", "Financial Services", "IT"],
      fiiImpact: "Positive - Global liquidity boost for Indian markets",
      currencyImpact: "INR stable to slightly stronger"
    },
    tags: ["ECB", "europe", "interest-rates", "liquidity"]
  },
  {
    id: 5,
    title: "US Jobs Report Beats Expectations",
    category: "economic-data",
    region: "United States",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    severity: "medium",
    description: "US Non-Farm Payrolls add 275K jobs vs expected 200K. Unemployment holds at 3.7%. Strong labor market signals delayed Fed rate cuts.",
    impact: {
      direction: "mixed",
      magnitude: 25,
      description: "Strong US economy is a double-edged sword: indicates global demand but may delay rate cuts, strengthening USD and pressuring EM currencies.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "-0.1%", direction: "down" },
        { name: "SENSEX", impact: "-0.15%", direction: "down" },
        { name: "NIFTY IT", impact: "+0.4%", direction: "up" },
        { name: "NIFTY BANK", impact: "-0.2%", direction: "down" }
      ],
      affectedSectors: ["IT (positive)", "Banking (negative)", "Export"],
      fiiImpact: "Mixed - Strong US may delay rate cut hopes, but healthy global economy supports earnings",
      currencyImpact: "USD strengthens, INR may face mild pressure"
    },
    tags: ["US", "employment", "NFP", "economy"]
  },
  {
    id: 6,
    title: "Gold Hits All-Time High",
    category: "commodity",
    region: "Global",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    severity: "medium",
    description: "Gold surges to record highs driven by central bank buying, geopolitical uncertainty, and expectations of global rate cuts.",
    impact: {
      direction: "mixed",
      magnitude: 20,
      description: "Rising gold benefits Indian gold companies and ETFs but signals risk-off sentiment. Jewelry sector faces input cost pressure.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "-0.05%", direction: "down" },
        { name: "SENSEX", impact: "-0.05%", direction: "down" },
        { name: "NIFTY Commodities", impact: "+0.8%", direction: "up" }
      ],
      affectedSectors: ["Gold ETFs", "Mining", "Jewelry", "Finance"],
      fiiImpact: "Slight negative - Risk-off sentiment",
      currencyImpact: "INR may benefit marginally from gold rally"
    },
    tags: ["gold", "precious-metals", "safe-haven", "commodities"]
  },
  {
    id: 7,
    title: "Japan Yen Weakens Past 160 Against USD",
    category: "currency",
    region: "Japan",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "Japanese Yen breaches 160 per USD level, raising concerns of currency intervention. BOJ maintains ultra-loose monetary policy stance.",
    impact: {
      direction: "negative",
      magnitude: 35,
      description: "Weak Yen triggers competitive devaluation fears across Asia. Indian exports to Japan become expensive. FII unwinding of Japan carry trades may cause temporary outflows from India.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "-0.3%", direction: "down" },
        { name: "SENSEX", impact: "-0.25%", direction: "down" },
        { name: "NIFTY IT", impact: "-0.15%", direction: "down" }
      ],
      affectedSectors: ["IT", "Auto (Exports)", "Chemicals", "Pharma"],
      fiiImpact: "Negative - Carry trade unwind risks",
      currencyImpact: "INR under pressure as Asian currencies weaken"
    },
    tags: ["yen", "japan", "currency", "BOJ", "forex"]
  },
  {
    id: 8,
    title: "India Q4 GDP Growth at 7.8%",
    category: "economic-data",
    region: "India",
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "India's GDP grows 7.8% in Q4 FY2024, beating street estimates of 6.5%. Manufacturing and services sectors lead the growth.",
    impact: {
      direction: "positive",
      magnitude: 65,
      description: "Strong GDP data reinforces India's position as the fastest-growing major economy. Boosts domestic consumption themes and infrastructure story.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "+0.8%", direction: "up" },
        { name: "SENSEX", impact: "+0.7%", direction: "up" },
        { name: "BANK NIFTY", impact: "+1.0%", direction: "up" },
        { name: "NIFTY INFRA", impact: "+1.2%", direction: "up" }
      ],
      affectedSectors: ["Banking", "Infrastructure", "Consumer", "Auto", "Real Estate"],
      fiiImpact: "Very Positive - India story strengthens",
      currencyImpact: "INR strengthens on strong economic fundamentals"
    },
    tags: ["india", "GDP", "economy", "growth", "domestic"]
  },
  {
    id: 9,
    title: "US-China Trade Tensions Escalate",
    category: "geopolitical",
    region: "Global",
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "US announces new 25% tariffs on Chinese semiconductors and EVs. China vows retaliation. Global supply chain disruption fears mount.",
    impact: {
      direction: "mixed",
      magnitude: 40,
      description: "Beneficial for Indian IT and pharma as companies diversify supply chains away from China (China+1). However, overall global trade uncertainty weighs on sentiment.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "+0.15%", direction: "up" },
        { name: "SENSEX", impact: "+0.1%", direction: "up" },
        { name: "NIFTY IT", impact: "+1.0%", direction: "up" },
        { name: "NIFTY PHARMA", impact: "+0.6%", direction: "up" }
      ],
      affectedSectors: ["IT (positive)", "Pharma (positive)", "Chemicals (positive)", "Metal (negative)"],
      fiiImpact: "Positive for India - China+1 narrative strengthens",
      currencyImpact: "INR resilient - India benefits from supply chain shift"
    },
    tags: ["trade-war", "tariffs", "supply-chain", "China+1"]
  },
  {
    id: 10,
    title: "RBI Holds Repo Rate at 6.50%",
    category: "monetary-policy",
    region: "India",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    severity: "high",
    description: "RBI maintains repo rate at 6.50% for the eighth consecutive meeting. Maintains accommodative stance while watching inflation trajectory closely.",
    impact: {
      direction: "positive",
      magnitude: 40,
      description: "Stable rates support borrowing and investment activity. Combined with strong GDP, signals a supportive policy environment for growth.",
      affectedIndices: [
        { name: "NIFTY 50", impact: "+0.3%", direction: "up" },
        { name: "SENSEX", impact: "+0.25%", direction: "up" },
        { name: "BANK NIFTY", impact: "+0.5%", direction: "up" },
        { name: "NIFTY REALTY", impact: "+0.7%", direction: "up" }
      ],
      affectedSectors: ["Banking", "Real Estate", "Auto", "Infrastructure", "NBFC"],
      fiiImpact: "Positive - Stable policy environment attracts long-term capital",
      currencyImpact: "INR stable - RBI's credibility supports currency"
    },
    tags: ["RBI", "repo-rate", "monetary-policy", "India"]
  }
];

export const marketIndices = [
  {
    name: "NIFTY 50",
    value: 24278.80,
    change: -87.20,
    changePercent: -0.36,
    dayHigh: 24343.45,
    dayLow: 24278.80,
    prevClose: 24366.00,
    volume: "1.82B",
    sector: "Benchmark"
  },
  {
    name: "SENSEX",
    value: 77631.77,
    change: -377.48,
    changePercent: -0.48,
    dayHigh: 77892.92,
    dayLow: 77631.77,
    prevClose: 78009.25,
    volume: "1.45B",
    sector: "Benchmark"
  },
  {
    name: "BANK NIFTY",
    value: 57270.40,
    change: -220.70,
    changePercent: -0.38,
    dayHigh: 57491.00,
    dayLow: 57270.40,
    prevClose: 57491.10,
    volume: "0.95B",
    sector: "Banking"
  },
  {
    name: "NIFTY IT",
    value: 30938.25,
    change: -419.50,
    changePercent: -1.34,
    dayHigh: 31357.75,
    dayLow: 30938.25,
    prevClose: 31357.75,
    volume: "0.42B",
    sector: "IT"
  },
  {
    name: "NIFTY PHARMA",
    value: 18199.22,
    change: +94.03,
    changePercent: +0.52,
    dayHigh: 18199.22,
    dayLow: 18050.00,
    prevClose: 18105.19,
    volume: "0.18B",
    sector: "Pharma"
  },
  {
    name: "INDIA VIX",
    value: 11.54,
    change: +0.25,
    changePercent: +2.21,
    dayHigh: 11.80,
    dayLow: 11.20,
    prevClose: 11.29,
    volume: "N/A",
    sector: "Volatility"
  }
];

export const categoryColors = {
  "monetary-policy": { bg: "#3b82f6", text: "#dbeafe", label: "Monetary Policy" },
  "economic-data": { bg: "#10b981", text: "#d1fae5", label: "Economic Data" },
  "commodity": { bg: "#f59e0b", text: "#fef3c7", label: "Commodity" },
  "currency": { bg: "#8b5cf6", text: "#ede9fe", label: "Currency" },
  "geopolitical": { bg: "#ef4444", text: "#fee2e2", label: "Geopolitical" }
};

export const sectorImpactData = [
  { name: "Banking", impact: 55, direction: "positive", events: ["Fed rate signals", "RBI policy", "India GDP"] },
  { name: "IT", impact: 45, direction: "negative", events: ["US jobs data", "Crude oil impact", "Global uncertainty"] },
  { name: "Pharma", impact: 60, direction: "positive", events: ["Defensive rotation", "US healthcare demand", "China+1"] },
  { name: "Oil & Gas", impact: 40, direction: "negative", events: ["Crude oil surge", "Middle East tensions"] },
  { name: "Metal", impact: 35, direction: "negative", events: ["China PMI decline", "Global slowdown fears"] },
  { name: "Auto", impact: 25, direction: "neutral", events: ["India GDP growth", "RBI stable rates", "Crude pressure"] },
  { name: "Real Estate", impact: 45, direction: "positive", events: ["RBI policy stability", "Low interest rate expectations"] },
  { name: "Infrastructure", impact: 55, direction: "positive", events: ["India GDP beat", "Government capex push", "Defence spending"] },
  { name: "FMCG", impact: 30, direction: "negative", events: ["Higher crude oil", "Inflationary pressure"] },
  { name: "Chemicals", impact: 35, direction: "positive", events: ["China+1 narrative", "Export diversification"] }
];

export const crudeOilSensitivity = {
  description: "For every $1 increase in Brent crude above $75, NIFTY impacts as follows:",
  thresholds: [
    { range: "$70-75", niftyImpact: "+0.1%", note: "Comfortable zone for India" },
    { range: "$75-80", niftyImpact: "-0.1%", note: "Mild pressure" },
    { range: "$80-85", niftyImpact: "-0.2%", note: "Moderate pressure, FII cautious" },
    { range: "$85-90", niftyImpact: "-0.3%", note: "Significant pressure, defensive rotation" },
    { range: "$90-95", niftyImpact: "-0.5%", note: "High pressure, FII outflows likely" },
    { range: "$95-100", niftyImpact: "-0.7%", note: "Crisis territory, broad sell-off" },
    { range: "$100+", niftyImpact: "-1.0%+", note: "Panic selling, recession fears" }
  ],
  currentPrice: 88.88,
  currentImpact: "-0.3%"
};

export const fiiFlowImpact = {
  description: "FII flows have a 2-3x multiplier effect on market direction",
  thresholds: [
    { flow: "Buy > ₹1000cr", impact: "+0.5% to +0.8%", note: "Strong bullish signal" },
    { flow: "Buy ₹500-1000cr", impact: "+0.2% to +0.5%", note: "Moderate positive" },
    { flow: "Buy ₹0-500cr", impact: "+0.05% to +0.2%", note: "Mild positive" },
    { flow: "Sell ₹0-500cr", impact: "-0.05% to -0.2%", note: "Mild negative" },
    { flow: "Sell ₹500-1000cr", impact: "-0.2% to -0.5%", note: "Moderate negative" },
    { flow: "Sell > ₹1000cr", impact: "-0.5% to -1.0%", note: "Strong bearish signal" }
  ],
  todayFlow: "Buy ₹508cr",
  todayImpact: "+0.15%"
};

export const defensiveRotation = {
  description: "When NIFTY falls > 0.3%, defensive sectors tend to outperform",
  sectors: ["Pharma", "IT (defensive mode)", "FMCG", "Gold ETFs"],
  historicalPattern: "During market corrections of 0.3-0.5%, Pharma gains 0.2-0.5% as investors rotate to defensives. IT may still fall but less than NIFTY."
};
