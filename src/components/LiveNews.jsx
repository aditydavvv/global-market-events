import { useState, useEffect, useCallback } from 'react';
import { fetchGlobalNews, isNewsAPIConfigured } from '../services/newsService';
import { globalEvents } from '../data/events';
import './LiveNews.css';

const CATEGORY_LABELS = {
  'fed': { label: 'US Fed', color: '#3b82f6' },
  'rbi': { label: 'RBI Policy', color: '#8b5cf6' },
  'geopolitical': { label: 'Geopolitics', color: '#ef4444' },
  'commodity': { label: 'Commodity', color: '#f59e0b' },
  'currency': { label: 'Currency', color: '#06b6d4' },
  'economic-data': { label: 'Economic Data', color: '#10b981' },
  'china': { label: 'China', color: '#f97316' },
  'trade': { label: 'Trade', color: '#ec4899' },
  'general': { label: 'General', color: '#64748b' }
};

const SEVERITY_ICONS = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
};

export default function LiveNews() {
  const [liveNews, setLiveNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSetup, setShowSetup] = useState(!isNewsAPIConfigured());

  const fetchNews = useCallback(async () => {
    if (!isNewsAPIConfigured()) return;

    setLoading(true);
    setError(null);

    try {
      const news = await fetchGlobalNews();
      setLiveNews(news);
      setLastFetch(new Date());
      localStorage.setItem('lastNewsFetch', new Date().toISOString());
      localStorage.setItem('cachedNews', JSON.stringify(news));
    } catch (err) {
      setError('Failed to fetch news. Will use cached data.');
      const cached = localStorage.getItem('cachedNews');
      if (cached) setLiveNews(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('cachedNews');
    if (cached) setLiveNews(JSON.parse(cached));

    const lastFetchTime = localStorage.getItem('lastNewsFetch');
    if (lastFetchTime) setLastFetch(new Date(lastFetchTime));

    if (isNewsAPIConfigured()) {
      fetchNews();
      const interval = setInterval(fetchNews, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchNews]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('newsApiKey', apiKey.trim());
      window.location.reload();
    }
  };

  const allEvents = [
    ...liveNews.map(n => ({ ...n, isLive: true })),
    ...globalEvents.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      source: e.region,
      publishedAt: e.timestamp,
      category: e.category,
      sentiment: { direction: e.impact.direction, magnitude: e.impact.magnitude },
      severity: e.severity,
      impact: e.impact,
      isLive: false,
      tags: e.tags
    }))
  ];

  const filtered = filter === 'all' ? allEvents :
    allEvents.filter(e => e.category === filter);

  const positiveCount = allEvents.filter(e => e.sentiment?.direction === 'positive').length;
  const negativeCount = allEvents.filter(e => e.sentiment?.direction === 'negative').length;

  return (
    <section className="live-news-section">
      <div className="section-header">
        <h2>Live Global News & Market Impact</h2>
        <div className="header-actions">
          {lastFetch && (
            <span className="last-fetch">
              Last updated: {lastFetch.toLocaleTimeString('en-IN')}
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={fetchNews}
            disabled={loading || !isNewsAPIConfigured()}
          >
            {loading ? '⏳ Fetching...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {showSetup && (
        <div className="api-setup">
          <div className="setup-card">
            <h3>🔑 Connect Live News</h3>
            <p>Get a free API key from <a href="https://newsapi.org/register" target="_blank" rel="noreferrer">NewsAPI.org</a> (100 requests/day free)</p>
            <div className="setup-form">
              <input
                type="text"
                placeholder="Paste your NewsAPI key here"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="api-input"
              />
              <button onClick={handleSaveApiKey} className="save-btn">Save & Enable</button>
            </div>
            <p className="setup-note">Your key is stored locally in your browser only.</p>
            <button className="skip-btn" onClick={() => setShowSetup(false)}>
              Skip — Use demo data only
            </button>
          </div>
        </div>
      )}

      {error && <div className="news-error">{error}</div>}

      <div className="sentiment-summary">
        <span className="ss-item positive">📈 Bullish: {positiveCount}</span>
        <span className="ss-item negative">📉 Bearish: {negativeCount}</span>
        <span className="ss-item total">📰 Total: {allEvents.length} events</span>
      </div>

      <div className="news-filters">
        <button className={`nf-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({allEvents.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, val]) => {
          const count = allEvents.filter(e => e.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              className={`nf-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
              style={{ '--cat-color': val.color }}
            >
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="news-list">
        {loading && liveNews.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching latest global news...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No news events found. {liveNews.length === 0 ? 'Configure your API key above to fetch live news.' : 'Try a different filter.'}</p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <NewsCard key={item.id || i} item={item} />
          ))
        )}
      </div>
    </section>
  );
}

function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.general;
  const timeAgo = getTimeAgo(item.publishedAt);

  return (
    <div className={`news-card ${item.sentiment?.direction || 'mixed'} ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}>
      <div className="nc-header">
        <div className="nc-meta">
          {item.isLive && <span className="live-badge">LIVE</span>}
          <span className="nc-category" style={{ background: cat.color + '20', color: cat.color, borderColor: cat.color + '40' }}>
            {cat.label}
          </span>
          <span className="nc-severity">{SEVERITY_ICONS[item.severity || 'low']}</span>
          <span className="nc-source">{item.source}</span>
        </div>
        <span className="nc-time">{timeAgo}</span>
      </div>

      <h3 className="nc-title">{item.title}</h3>

      {item.description && (
        <p className="nc-desc">{item.description.substring(0, 200)}{item.description.length > 200 ? '...' : ''}</p>
      )}

      <div className="nc-sentiment">
        <span className={`sentiment-badge ${item.sentiment?.direction || 'mixed'}`}>
          {item.sentiment?.direction === 'positive' ? '📈 Bullish' :
           item.sentiment?.direction === 'negative' ? '📉 Bearish' : '↔️ Mixed'}
        </span>
        <div className="sentiment-bar-mini">
          <div className="sentiment-fill" style={{
            width: `${item.sentiment?.magnitude || 30}%`,
            background: item.sentiment?.direction === 'positive' ? '#10b981' :
                        item.sentiment?.direction === 'negative' ? '#ef4444' : '#f59e0b'
          }}></div>
        </div>
        <span className="sentiment-mag">{item.sentiment?.magnitude || 0}%</span>
      </div>

      {expanded && (
        <div className="nc-expanded">
          {item.impact?.description && (
            <div className="impact-analysis">
              <h4>Market Impact Analysis</h4>
              <p>{item.impact.description}</p>
            </div>
          )}

          {item.impact?.affectedIndices?.length > 0 && (
            <div className="affected-indices">
              <h4>Predicted Index Impact</h4>
              <div className="ai-grid">
                {item.impact.affectedIndices.map((idx, i) => (
                  <div key={i} className={`ai-item ${idx.direction}`}>
                    <span className="ai-name">{idx.name}</span>
                    <span className={`ai-impact ${idx.direction}`}>{idx.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.impact?.goldETF && (
            <div className="metal-impacts">
              <h4>Metal ETF Predictions</h4>
              <div className="metal-grid">
                <div className={`metal-item ${item.impact.goldETF.direction}`}>
                  <span className="metal-icon">🥇</span>
                  <span className="metal-name">Gold ETF</span>
                  <span className={`metal-impact ${item.impact.goldETF.direction}`}>
                    {item.impact.goldETF.direction === 'positive' ? '📈' : item.impact.goldETF.direction === 'negative' ? '📉' : '↔️'}
                    {item.impact.goldETF.magnitude}%
                  </span>
                </div>
                <div className={`metal-item ${item.impact.silverETF.direction}`}>
                  <span className="metal-icon">🥈</span>
                  <span className="metal-name">Silver ETF</span>
                  <span className={`metal-impact ${item.impact.silverETF.direction}`}>
                    {item.impact.silverETF.direction === 'positive' ? '📈' : item.impact.silverETF.direction === 'negative' ? '📉' : '↔️'}
                    {item.impact.silverETF.magnitude}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="read-more" onClick={(e) => e.stopPropagation()}>
              Read full article →
            </a>
          )}
        </div>
      )}

      <div className="expand-hint">
        {expanded ? 'Click to collapse' : 'Click for full analysis →'}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
