const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

const SYMBOLS = {
  nifty50: '^NSEI',
  sensex: '^BSESN',
  bankNifty: '^NSEBANK',
  niftyIT: '^CNXIT',
  niftyPharma: '^CNXPHARMA',
  gold: 'GC=F',
  silver: 'SI=F',
  crudeOil: 'CL=F',
  brentCrude: 'BZ=F',
  usdInr: 'USDINR=X',
  goldETF: 'GLD',
  silverETF: 'SLV'
};

async function fetchYahooData(symbol, range = '1d', interval = '5m') {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.chart?.result?.[0] || null;
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

function formatQuote(result, name, sector) {
  if (!result) return null;
  const meta = result.meta;
  const currentPrice = meta.regularMarketPrice;
  const previousClose = meta.chartPreviousClose || meta.previousClose;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  return {
    name,
    value: currentPrice,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    dayHigh: meta.regularMarketDayHigh || currentPrice,
    dayLow: meta.regularMarketDayLow || currentPrice,
    prevClose: previousClose,
    volume: meta.regularMarketVolume ? formatVolume(meta.regularMarketVolume) : 'N/A',
    sector,
    currency: meta.currency || 'USD',
    lastUpdated: new Date().toISOString()
  };
}

function formatVolume(vol) {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
  return vol.toString();
}

export async function fetchMarketIndices() {
  const [nifty, sensex, bankNifty, niftyIT, niftyPharma] = await Promise.all([
    fetchYahooData(SYMBOLS.nifty50),
    fetchYahooData(SYMBOLS.sensex),
    fetchYahooData(SYMBOLS.bankNifty),
    fetchYahooData(SYMBOLS.niftyIT),
    fetchYahooData(SYMBOLS.niftyPharma)
  ]);
  return [
    formatQuote(nifty, 'NIFTY 50', 'Benchmark'),
    formatQuote(sensex, 'SENSEX', 'Benchmark'),
    formatQuote(bankNifty, 'BANK NIFTY', 'Banking'),
    formatQuote(niftyIT, 'NIFTY IT', 'IT'),
    formatQuote(niftyPharma, 'NIFTY PHARMA', 'Pharma')
  ].filter(Boolean);
}

export async function fetchCommodityPrices() {
  const [gold, silver, crudeOil, brentCrude] = await Promise.all([
    fetchYahooData(SYMBOLS.gold),
    fetchYahooData(SYMBOLS.silver),
    fetchYahooData(SYMBOLS.crudeOil),
    fetchYahooData(SYMBOLS.brentCrude)
  ]);
  const toCommodity = (result, unit, type) => {
    if (!result) return null;
    return {
      price: result.meta.regularMarketPrice,
      currency: result.meta.currency || 'USD',
      change: result.meta.regularMarketPrice - (result.meta.chartPreviousClose || result.meta.previousClose),
      unit,
      type
    };
  };
  return {
    gold: toCommodity(gold, 'per oz', 'Gold'),
    silver: toCommodity(silver, 'per oz', 'Silver'),
    crudeOil: toCommodity(crudeOil, 'per barrel', 'WTI'),
    brentCrude: toCommodity(brentCrude, 'per barrel', 'Brent')
  };
}

export async function fetchCurrencyRates() {
  const usdInr = await fetchYahooData(SYMBOLS.usdInr);
  return {
    usdInr: usdInr ? {
      rate: usdInr.meta.regularMarketPrice,
      change: usdInr.meta.regularMarketPrice - (usdInr.meta.chartPreviousClose || usdInr.meta.previousClose),
      lastUpdated: new Date().toISOString()
    } : null
  };
}

export async function fetchMetalETFs() {
  const [goldETF, silverETF] = await Promise.all([
    fetchYahooData(SYMBOLS.goldETF),
    fetchYahooData(SYMBOLS.silverETF)
  ]);
  const toETF = (result, symbol, name) => {
    if (!result) return null;
    const prev = result.meta.chartPreviousClose || result.meta.previousClose;
    return {
      symbol,
      name,
      price: result.meta.regularMarketPrice,
      change: result.meta.regularMarketPrice - prev,
      changePercent: ((result.meta.regularMarketPrice - prev) / prev) * 100
    };
  };
  return {
    goldETF: toETF(goldETF, 'GLD', 'SPDR Gold Shares'),
    silverETF: toETF(silverETF, 'SLV', 'iShares Silver Trust')
  };
}

export async function fetchHistoricalData(symbol, range = '1mo', interval = '1d') {
  const result = await fetchYahooData(symbol, range, interval);
  if (!result || !result.indicators) return [];
  const timestamps = result.timestamp || [];
  const quotes = result.indicators.quote[0];
  return timestamps.map((time, i) => ({
    date: new Date(time * 1000),
    open: quotes.open[i],
    high: quotes.high[i],
    low: quotes.low[i],
    close: quotes.close[i],
    volume: quotes.volume[i]
  })).filter(q => q.close !== null);
}
