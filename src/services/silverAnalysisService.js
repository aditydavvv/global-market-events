const YAHOO_BASE = '/yahoo/v8/finance/chart';

export async function fetchSilverAnalysis() {
  try {
    const [silverWeekly, goldWeekly, usdinr] = await Promise.allSettled([
      fetch(`${YAHOO_BASE}/SI=F?range=5d&interval=1d`).then(r => r.json()),
      fetch(`${YAHOO_BASE}/GC=F?range=5d&interval=1d`).then(r => r.json()),
      fetch(`${YAHOO_BASE}/USDINR=X?range=5d&interval=1d`).then(r => r.json())
    ]);

    const silverData = silverWeekly.status === 'fulfilled' ? silverWeekly.value?.chart?.result?.[0] : null;
    const goldData = goldWeekly.status === 'fulfilled' ? goldWeekly.value?.chart?.result?.[0] : null;
    const usdinrData = usdinr.status === 'fulfilled' ? usdinr.value?.chart?.result?.[0] : null;

    if (!silverData) return null;

    const silverMeta = silverData.meta;
    const silverQuotes = silverData.indicators?.quote?.[0] || {};

    const goldMeta = goldData?.meta;

    const usdinrMeta = usdinrData?.meta;

    const silverPrices = silverQuotes.close?.filter(Boolean) || [];

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
      usdInr: {
        rate: currentUSDRate,
        change: usdChange
      },
      analysis: generateAnalysis(silverChange, goldChange, goldSilverRatio, momentum3d, momentum5d, trend, volatility)
    };
  } catch (error) {
    console.error('Silver analysis failed:', error);
    return null;
  }
}

function calculateTrend(prices) {
  if (prices.length < 2) return { direction: 'neutral', strength: 0 };
  const n = prices.length;
  const xMean = (n - 1) / 2;
  const yMean = prices.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (prices[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }
  const slope = den !== 0 ? num / den : 0;
  return {
    direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'neutral',
    strength: Math.min(100, Math.round(Math.abs(slope) / yMean * 10000))
  };
}

function generateAnalysis(silverChange, goldChange, goldSilverRatio, momentum3d, momentum5d, trend, volatility) {
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

  if (goldSilverRatio && goldSilverRatio > 85) {
    signals.push('Gold/Silver ratio elevated - silver undervalued');
    bullishScore += 2;
  } else if (goldSilverRatio && goldSilverRatio < 60) {
    signals.push('Gold/Silver ratio low - silver overvalued');
    bearishScore += 1;
  }

  if (momentum3d > 2) {
    signals.push('Strong 3-day momentum');
    bullishScore += 1;
  } else if (momentum3d < -2) {
    signals.push('Weak 3-day momentum');
    bearishScore += 1;
  }

  if (trend.direction === 'up') {
    signals.push('Uptrend intact');
    bullishScore += 1;
  } else if (trend.direction === 'down') {
    signals.push('Downtrend in place');
    bearishScore += 1;
  }

  if (volatility > 3) {
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
  if (!silverAnalysis) return null;

  const { silver, gold, goldSilverRatio, usdInr, analysis } = silverAnalysis;

  let direction = 'neutral';
  let confidence = 50;
  const reasons = [];

  if (silver.trend.direction === 'up') {
    direction = 'positive';
    confidence += 15;
    reasons.push('Global silver in uptrend');
  } else if (silver.trend.direction === 'down') {
    direction = 'negative';
    confidence += 15;
    reasons.push('Global silver in downtrend');
  }

  if (silver.change > 1) {
    if (direction === 'positive') confidence += 10;
    else { direction = 'positive'; confidence = 55; }
    reasons.push(`Silver up ${silver.change.toFixed(1)}% today`);
  } else if (silver.change < -1) {
    if (direction === 'negative') confidence += 10;
    else { direction = 'negative'; confidence = 55; }
    reasons.push(`Silver down ${Math.abs(silver.change).toFixed(1)}% today`);
  }

  if (goldSilverRatio && goldSilverRatio > 85) {
    if (direction === 'positive') confidence += 5;
    reasons.push(`Gold/Silver ratio ${goldSilverRatio.toFixed(0)} - silver undervalued`);
  }

  if (usdInr.change > 0.3) {
    if (direction === 'positive') confidence += 5;
    reasons.push('USD/INR rising supports Indian ETF');
  } else if (usdInr.change < -0.3) {
    if (direction === 'negative') confidence += 5;
    reasons.push('USD/INR falling pressures Indian ETF');
  }

  if (marketDepth && marketDepth.total > 0) {
    const ratio = marketDepth.ratio;
    if (ratio > 1.2) {
      if (direction === 'negative') {
        direction = 'mixed';
        confidence = Math.max(30, confidence - 20);
      } else if (direction === 'positive') {
        confidence += 8;
      }
      reasons.push(`Strong buyer presence (${(ratio * 100).toFixed(0)}% buy ratio)`);
    } else if (ratio < 0.8) {
      if (direction === 'positive') {
        direction = 'mixed';
        confidence = Math.max(30, confidence - 20);
      } else if (direction === 'negative') {
        confidence += 8;
      }
      reasons.push(`Strong seller pressure (${((1 - ratio) * 100).toFixed(0)}% sell ratio)`);
    }
  }

  confidence = Math.min(92, Math.max(25, confidence));

  const expectedMove = direction === 'positive'
    ? `+${(silver.trend.strength * 0.03 + 0.5).toFixed(1)}% to +${(silver.trend.strength * 0.06 + 1).toFixed(1)}%`
    : direction === 'negative'
      ? `-${(silver.trend.strength * 0.02 + 0.3).toFixed(1)}% to -${(silver.trend.strength * 0.05 + 0.8).toFixed(1)}%`
      : '±0.3% to ±0.8%';

  return {
    prediction: direction,
    confidence,
    expectedMove,
    reasoning: reasons.join('. ') + '.',
    analysis: analysis,
    silverData: silver,
    goldData: gold,
    goldSilverRatio,
    usdInr,
    timeframe: '1-5 days'
  };
}
