import { YAHOO_CHART_BASE } from './marketDataService';
import { fetchResilient } from '../utils/fetchResilient';

const YAHOO_BASE = YAHOO_CHART_BASE;

export async function fetchSilverAnalysis() {
  try {
    const [silverWeekly, goldWeekly, usdinr] = await Promise.allSettled([
      fetchResilient(`${YAHOO_BASE}/SI=F?range=5d&interval=1d`).then(r => r.json()),
      fetchResilient(`${YAHOO_BASE}/GC=F?range=5d&interval=1d`).then(r => r.json()),
      fetchResilient(`${YAHOO_BASE}/USDINR=X?range=5d&interval=1d`).then(r => r.json())
    ]);

    const silverData = silverWeekly.status === 'fulfilled' ? silverWeekly.value?.chart?.result?.[0] : null;
    const goldData = goldWeekly.status === 'fulfilled' ? goldWeekly.value?.chart?.result?.[0] : null;
    const usdinrData = usdinr.status === 'fulfilled' ? usdinr.value?.chart?.result?.[0] : null;

    if (!silverData) return null;

    const silverMeta = silverData.meta;
    const silverQuotes = silverData.indicators?.quote?.[0] || {};

    const goldMeta = goldData?.meta;
    const goldQuotes = goldData?.indicators?.quote?.[0] || {};

    const usdinrMeta = usdinrData?.meta;

    const silverPrices = silverQuotes.close?.filter(Boolean) || [];
    const goldPrices = goldQuotes.close?.filter(Boolean) || [];

    const currentSilver = silverMeta.regularMarketPrice;
    const prevSilver = silverMeta.chartPreviousClose || silverMeta.previousClose;
    const silverChange = ((currentSilver - prevSilver) / prevSilver) * 100;

    const currentGold = goldMeta?.regularMarketPrice;
    const prevGold = goldMeta?.chartPreviousClose || goldMeta?.previousClose;
    const goldChange = currentGold && prevGold ? ((currentGold - prevGold) / prevGold) * 100 : 0;

    const currentUSDRate = usdinrMeta?.regularMarketPrice;
    const prevUSDRate = usdinrMeta?.chartPreviousClose || usdinrMeta?.previousClose;
    const usdChange = currentUSDRate && prevUSDRate ? ((currentUSDRate - prevUSDRate) / prevUSDRate) * 100 : 0;

    const goldSilverRatio = currentGold && currentSilver ? currentGold / currentSilver : null;

    let goldSilverRatioChange = 0;
    if (goldSilverRatio && goldPrices.length >= 3 && silverPrices.length >= 3) {
      const pairs = Math.min(goldPrices.length, silverPrices.length);
      const ratioSeries = [];
      for (let i = 1; i <= pairs; i++) {
        const g = goldPrices[goldPrices.length - i];
        const s = silverPrices[silverPrices.length - i];
        if (g && s) ratioSeries.push(g / s);
      }
      if (ratioSeries.length >= 3) {
        const ratioAvg = ratioSeries.reduce((a, b) => a + b, 0) / ratioSeries.length;
        goldSilverRatioChange = ((goldSilverRatio - ratioAvg) / ratioAvg) * 100;
      }
    }

    let momentum3d = 0;
    let momentum5d = 0;
    if (silverPrices.length >= 3) {
      momentum3d = ((silverPrices[silverPrices.length - 1] - silverPrices[silverPrices.length - 3]) / silverPrices[silverPrices.length - 3]) * 100;
    }
    if (silverPrices.length >= 5) {
      momentum5d = ((silverPrices[silverPrices.length - 1] - silverPrices[0]) / silverPrices[0]) * 100;
    }

    let volatility = 0;
    if (silverPrices.length >= 2) {
      const returns = [];
      for (let i = 1; i < silverPrices.length; i++) {
        returns.push((silverPrices[i] - silverPrices[i - 1]) / silverPrices[i - 1]);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
      volatility = Math.sqrt(variance) * 100;
    }

    const trend = calculateTrend(silverPrices);

    return {
      silver: {
        price: currentSilver,
        change: silverChange,
        momentum3d,
        momentum5d,
        trend,
        volatility
      },
      gold: {
        price: currentGold,
        change: goldChange
      },
      goldSilverRatio,
      goldSilverRatioChange,
      usdInr: {
        rate: currentUSDRate,
        change: usdChange
      },
      analysis: generateAnalysis(silverChange, goldChange, goldSilverRatio, goldSilverRatioChange, momentum3d, momentum5d, trend, volatility)
    };
  } catch (error) {
    console.error('Silver analysis failed:', error);
    return null;
  }
}

function calculateTrend(prices) {
  if (prices.length < 3) return { direction: 'neutral', strength: 0, r2: 0 };
  const n = prices.length;
  const xMean = (n - 1) / 2;
  const yMean = prices.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (prices[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  let sse = 0;
  for (let i = 0; i < n; i++) {
    sse += Math.pow(prices[i] - (intercept + slope * i), 2);
  }
  const sst = prices.reduce((s, p) => s + Math.pow(p - yMean, 2), 0);
  const r2 = sst > 0 ? Math.max(0, 1 - sse / sst) : 0;
  const driftPctPerDay = yMean > 0 ? (slope / yMean) * 100 : 0;
  const effectiveDrift = driftPctPerDay * r2;
  return {
    direction: effectiveDrift > 0.08 ? 'up' : effectiveDrift < -0.08 ? 'down' : 'neutral',
    strength: Math.min(100, Math.round(Math.abs(effectiveDrift) * 100)),
    r2: parseFloat(r2.toFixed(2))
  };
}

function generateAnalysis(silverChange, goldChange, goldSilverRatio, goldSilverRatioChange, momentum3d, momentum5d, trend, volatility) {
  const signals = [];
  let bullishScore = 0;
  let bearishScore = 0;

  if (silverChange > 0.5) {
    signals.push('Silver showing positive momentum today');
    bullishScore += 2;
  } else if (silverChange < -0.5) {
    signals.push('Silver under pressure today');
    bearishScore += 2;
  }

  if (goldChange > 0.5) {
    signals.push('Gold rallying supports silver');
    bullishScore += 1;
  } else if (goldChange < -0.5) {
    signals.push('Gold weakness may weigh on silver');
    bearishScore += 1;
  }

  if (goldSilverRatio && goldSilverRatio > 90) {
    signals.push(`Gold/Silver ratio ${goldSilverRatio.toFixed(0)} historically elevated - silver cheap vs gold`);
    bullishScore += 2;
  } else if (goldSilverRatio && goldSilverRatio < 55) {
    signals.push(`Gold/Silver ratio ${goldSilverRatio.toFixed(0)} historically low - silver rich vs gold`);
    bearishScore += 1;
  }

  if (goldSilverRatioChange < -1) {
    signals.push('Silver outperforming gold this week (ratio falling)');
    bullishScore += 1;
  } else if (goldSilverRatioChange > 1) {
    signals.push('Silver underperforming gold this week (ratio rising)');
    bearishScore += 1;
  }

  if (momentum3d > 2) {
    signals.push('Strong 3-day momentum');
    bullishScore += 1;
  } else if (momentum3d < -2) {
    signals.push('Weak 3-day momentum');
    bearishScore += 1;
  }

  if (trend.direction === 'up' && (trend.r2 ?? 0) > 0.3) {
    signals.push(`Uptrend intact (fit quality ${Math.round(trend.r2 * 100)}%)`);
    bullishScore += 1;
  } else if (trend.direction === 'down' && (trend.r2 ?? 0) > 0.3) {
    signals.push(`Downtrend in place (fit quality ${Math.round(trend.r2 * 100)}%)`);
    bearishScore += 1;
  }

  if (volatility > 2.5) {
    signals.push('High volatility - expect larger moves');
  }

  const netScore = bullishScore - bearishScore;
  let outlook;
  if (netScore > 2) outlook = 'bullish';
  else if (netScore > 0) outlook = 'slightly-bullish';
  else if (netScore < -2) outlook = 'bearish';
  else if (netScore < 0) outlook = 'slightly-bearish';
  else outlook = 'neutral';

  return {
    outlook,
    signals,
    bullishScore,
    bearishScore,
    netScore
  };
}

export function predictTataSilverETF(silverAnalysis, marketDepth = null) {
  if (!silverAnalysis || !silverAnalysis.silver) return null;

  const { silver, gold, goldSilverRatio, goldSilverRatioChange, usdInr } = silverAnalysis;

  const votes = [];
  const addVote = (weight, value, reason) => {
    if (!Number.isFinite(value)) return;
    votes.push({ weight, value: Math.max(-1, Math.min(1, value)), reason });
  };

  const trendDir = silver.trend.direction === 'up' ? 1 : silver.trend.direction === 'down' ? -1 : 0;
  if (trendDir !== 0) {
    addVote(2, trendDir * Math.min(1, (silver.trend.r2 ?? 0) + 0.3),
      `${silver.trend.direction}trend with ${Math.round((silver.trend.r2 ?? 0) * 100)}% fit quality`);
  }

  if (Math.abs(silver.momentum3d) > 0.5) {
    addVote(1.5, silver.momentum3d / 3, `${Math.abs(silver.momentum3d).toFixed(1)}% 3-day momentum`);
  }
  if (Math.abs(silver.momentum5d) > 0.8) {
    addVote(1, silver.momentum5d / 5, `${Math.abs(silver.momentum5d).toFixed(1)}% 5-day momentum`);
  }

  if (Math.abs(silver.change) > 0.4) {
    addVote(1.5, silver.change / 2, `today's ${silver.change >= 0 ? '+' : ''}${silver.change.toFixed(1)}% move`);
  }

  if (gold && Number.isFinite(gold.change) && Math.abs(gold.change) > 0.4) {
    addVote(1, gold.change / 2, `gold ${gold.change >= 0 ? '+' : ''}${gold.change.toFixed(1)}% in the same direction`);
  }

  if (usdInr && Number.isFinite(usdInr.change) && Math.abs(usdInr.change) > 0.15) {
    addVote(0.5, usdInr.change > 0 ? 0.7 : -0.7,
      `USD/INR ${usdInr.change >= 0 ? 'up' : 'down'} ${Math.abs(usdInr.change).toFixed(2)}%`);
  }

  if (Number.isFinite(goldSilverRatioChange) && Math.abs(goldSilverRatioChange) > 1) {
    addVote(1, -goldSilverRatioChange / 2,
      `silver ${goldSilverRatioChange < 0 ? 'outperforming' : 'underperforming'} gold this week`);
  }

  if (marketDepth && marketDepth.total > 0 && Number.isFinite(marketDepth.buyPct)) {
    addVote(1.5, (marketDepth.buyPct - 50) / 25, `order book ${marketDepth.buyPct}% buyers`);
  }

  const totalWeight = votes.reduce((s, v) => s + v.weight, 0) || 1;
  const score = votes.reduce((s, v) => s + v.weight * v.value, 0) / totalWeight;
  const agreement = votes.reduce((s, v) => s + Math.sign(v.value) * v.weight, 0) / totalWeight;

  const direction = score > 0.22 ? 'positive' : score < -0.22 ? 'negative' : 'neutral';

  let confidence = Math.round(45 + Math.abs(agreement) * 35);
  if ((silver.volatility || 0) > 2.5) confidence -= 8;
  if (votes.length <= 2) confidence -= 5;
  confidence = Math.max(25, Math.min(88, confidence));

  const dailyVol = Math.max(0.4, silver.volatility || 1);
  const band = dailyVol * Math.sqrt(3);
  const expectedMove = direction === 'positive'
    ? `+${(band * 0.5).toFixed(1)}% to +${(band * 1.2).toFixed(1)}%`
    : direction === 'negative'
      ? `-${(band * 0.5).toFixed(1)}% to -${(band * 1.2).toFixed(1)}%`
      : `±${(band * 0.6).toFixed(1)}%`;

  const topReasons = votes
    .filter(v => Math.sign(v.value) === (direction === 'negative' ? -1 : 1))
    .sort((a, b) => Math.abs(b.weight * b.value) - Math.abs(a.weight * a.value))
    .slice(0, 4)
    .map(v => v.reason);

  const reasoning = direction === 'neutral'
    ? 'Signals are balanced across trend, momentum and order flow - no directional edge right now.'
    : `${direction === 'positive' ? 'Bullish' : 'Bearish'} bias driven by: ${topReasons.join('; ')}.`;

  return {
    prediction: direction,
    confidence,
    expectedMove,
    reasoning,
    analysis: silverAnalysis.analysis,
    silverData: silver,
    goldData: gold,
    goldSilverRatio,
    usdInr,
    timeframe: '1-5 days'
  };
}
