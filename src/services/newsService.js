const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
const NEWS_API_BASE = 'https://newsapi.org/v2';

const MARKET_KEYWORDS = {
  positive: [
    'rate cut', 'dovish', 'bullish', 'rally', 'surge', 'gain', 'boost',
    'growth', 'boom', 'recovery', 'stimulus', 'easing', 'infrastructure',
    'record high', 'beat expectations', 'strong', 'inflow', 'upgrade',
    'trade deal', 'peace', 'ceasefire', 'agreement', 'cooperation',
    'India GDP', 'manufacturing', 'PMI above', 'FII inflow', 'rupee strength'
  ],
  negative: [
    'rate hike', 'hawkish', 'bearish', 'crash', 'plunge', 'slump',
    'recession', 'war', 'sanctions', 'tariff', 'tension', 'crisis',
    'default', 'downgrade', 'weak', 'outflow', 'inflation spike',
    'supply chain', 'disruption', 'geopolitical', 'escalation',
    'oil surge', 'dollar strength', 'capital flight', 'trade war'
  ],
  goldPositive: [
    'safe haven', 'gold', 'uncertainty', 'fear', 'inflation',
    'rate cut', 'dovish', 'central bank buying', 'geopolitical',
    'recession', 'crisis', 'currency weakness', 'debt'
  ],
  goldNegative: [
    'risk on', 'equity rally', 'rate hike', 'hawkish',
    'strong dollar', 'bond yield rise', 'economic growth'
  ],
  silverPositive: [
    'solar', 'EV', 'industrial demand', 'manufacturing',
    'green energy', 'China recovery', 'PMI rise', 'commodity'
  ],
  silverNegative: [
    'China slowdown', 'manufacturing decline', 'industrial weakness',
    'PMI fall', 'commodity sell'
  ]
};

const CATEGORIES = {
  'fed': ['federal reserve', 'fed rate', 'fomc', 'powell', 'interest rate', 'monetary policy'],
  'rbi': ['rbi', 'repo rate', 'reserve bank of india', 'monetary policy committee', 'mpc'],
  'geopolitical': ['war', 'conflict', 'sanctions', 'nato', 'military', 'missile', 'attack', 'tension'],
  'commodity': ['crude oil', 'gold', 'silver', 'copper', 'commodity', 'opec', 'brent'],
  'currency': ['dollar', 'dxy', 'forex', 'currency', 'rupee', 'yen', 'euro', 'exchange rate'],
  'economic-data': ['gdp', 'pmi', 'cpi', 'inflation', 'jobs', 'unemployment', 'nfp', 'payroll', 'retail sales'],
  'china': ['china', 'chinese', 'beijing', 'yuan', 'pboc', 'huawei'],
  'trade': ['tariff', 'trade war', 'trade deal', 'export', 'import', 'supply chain']
};

function categorizeNews(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'general';
}

function analyzeSentiment(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  MARKET_KEYWORDS.positive.forEach(kw => {
    if (text.includes(kw)) score += 2;
  });

  MARKET_KEYWORDS.negative.forEach(kw => {
    if (text.includes(kw)) score -= 2;
  });

  if (score > 3) return { direction: 'positive', magnitude: Math.min(90, 50 + score * 5) };
  if (score < -3) return { direction: 'negative', magnitude: Math.min(90, 50 + Math.abs(score) * 5) };
  return { direction: 'mixed', magnitude: Math.min(70, 30 + Math.abs(score) * 5) };
}

function analyzeMetalImpact(title, description, metal) {
  const text = `${title} ${description}`.toLowerCase();
  const keywords = metal === 'gold'
    ? { pos: MARKET_KEYWORDS.goldPositive, neg: MARKET_KEYWORDS.goldNegative }
    : { pos: MARKET_KEYWORDS.silverPositive, neg: MARKET_KEYWORDS.silverNegative };

  let score = 0;
  keywords.pos.forEach(kw => { if (text.includes(kw)) score += 2; });
  keywords.neg.forEach(kw => { if (text.includes(kw)) score -= 2; });

  if (score > 2) return { direction: 'positive', magnitude: Math.min(85, 50 + score * 6) };
  if (score < -2) return { direction: 'negative', magnitude: Math.min(85, 50 + Math.abs(score) * 6) };
  return { direction: 'neutral', magnitude: 30 };
}

function getSeverity(score) {
  if (Math.abs(score) > 60) return 'high';
  if (Math.abs(score) > 40) return 'medium';
  return 'low';
}

function predictIndexImpact(sentiment, category) {
  const impacts = {
    positive: {
      'NIFTY 50': { impact: '+0.5% to +1.2%', direction: 'up' },
      'SENSEX': { impact: '+0.4% to +1.1%', direction: 'up' },
      'BANK NIFTY': category === 'rbi' || category === 'fed'
        ? { impact: '+0.8% to +1.5%', direction: 'up' }
        : { impact: '+0.3% to +0.9%', direction: 'up' },
    },
    negative: {
      'NIFTY 50': { impact: '-0.5% to -1.5%', direction: 'down' },
      'SENSEX': { impact: '-0.4% to -1.4%', direction: 'down' },
      'INDIA VIX': { impact: '+5% to +15%', direction: 'up' },
    },
    mixed: {
      'NIFTY 50': { impact: '-0.2% to +0.3%', direction: 'neutral' },
    }
  };
  return impacts[sentiment.direction] || impacts.mixed;
}

export async function fetchGlobalNews(page = 1, pageSize = 20) {
  try {
    const queries = [
      'India stock market',
      'global economy impact India',
      'Federal Reserve India',
      'crude oil India market',
      'geopolitical market impact',
      'gold silver market news'
    ];

    const allArticles = [];

    for (const query of queries.slice(0, 3)) {
      const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${Math.ceil(pageSize / 3)}&page=${page}&apiKey=${NEWS_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      if (data.articles) {
        allArticles.push(...data.articles);
      }
    }

    const uniqueArticles = allArticles
      .filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
      )
      .slice(0, pageSize);

    return uniqueArticles.map(article => processArticle(article));
  } catch (error) {
    console.error('NewsAPI fetch failed:', error);
    return [];
  }
}

function processArticle(article) {
  const category = categorizeNews(article.title, article.description || '');
  const sentiment = analyzeSentiment(article.title, article.description || '');
  const goldImpact = analyzeMetalImpact(article.title, article.description || '', 'gold');
  const silverImpact = analyzeMetalImpact(article.title, article.description || '', 'silver');
  const indexImpact = predictIndexImpact(sentiment, category);

  return {
    id: article.url,
    title: article.title,
    description: article.description,
    source: article.source?.name || 'Unknown',
    url: article.url,
    publishedAt: article.publishedAt,
    urlToImage: article.urlToImage,
    category,
    sentiment,
    severity: getSeverity(sentiment.magnitude),
    impact: {
      direction: sentiment.direction,
      magnitude: sentiment.magnitude,
      affectedIndices: Object.entries(indexImpact).map(([name, data]) => ({
        name,
        ...data
      })),
      goldETF: goldImpact,
      silverETF: silverImpact,
      description: generateImpactDescription(sentiment, category, article.title)
    }
  };
}

function generateImpactDescription(sentiment, category, title) {
  const descs = {
    positive: {
      fed: 'Dovish Fed signals boost Indian markets. Rate-sensitive sectors (Banking, IT, Real Estate) likely to benefit. FII inflows expected to increase.',
      geopolitical: 'Positive geopolitical development reduces risk premium. Market sentiment improves across sectors.',
      commodity: 'Favorable commodity price movement supports Indian manufacturing and consumer sectors.',
      default: 'Positive global development supports Indian market sentiment. Risk-on mood expected.'
    },
    negative: {
      fed: 'Hawkish Fed stance pressures Indian markets. Higher US rates may trigger FII outflows. USD strength weighs on INR.',
      geopolitical: 'Geopolitical tensions increase risk aversion. Safe-haven flows may trigger FII selling in Indian equities.',
      commodity: 'Rising commodity prices increase input costs for Indian companies. Margin pressure expected in manufacturing.',
      default: 'Negative global development pressures Indian market sentiment. Defensive positioning recommended.'
    },
    mixed: {
      default: 'Mixed signals from global markets. Indian markets may see sector-specific movements rather than broad directional move.'
    }
  };

  return descs[sentiment.direction]?.[category] || descs[sentiment.direction]?.default || descs.mixed.default;
}

export function isNewsAPIConfigured() {
  return NEWS_API_KEY && NEWS_API_KEY !== 'YOUR_NEWSAPI_KEY';
}
