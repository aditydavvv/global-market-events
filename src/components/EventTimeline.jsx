import { useState, useMemo } from 'react';
import { historicalEvents, eventCategories } from '../data/historicalEvents';
import './EventTimeline.css';

export default function EventTimeline() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return historicalEvents;
    return historicalEvents.filter(e => e.category === filter);
  }, [filter]);

  const stats = useMemo(() => {
    const events = historicalEvents;
    const goldUp = events.filter(e => e.gold.direction === 'positive').length;
    const goldDown = events.filter(e => e.gold.direction === 'negative').length;
    const silverUp = events.filter(e => e.silver.direction === 'positive').length;
    const silverDown = events.filter(e => e.silver.direction === 'negative').length;

    const avgGoldReaction = events.reduce((sum, e) => {
      const val = parseFloat(e.gold.reaction);
      return sum + val;
    }, 0) / events.length;

    const avgSilverReaction = events.reduce((sum, e) => {
      const val = parseFloat(e.silver.reaction);
      return sum + val;
    }, 0) / events.length;

    return { goldUp, goldDown, silverUp, silverDown, avgGoldReaction, avgSilverReaction, total: events.length };
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="event-timeline-section">
      <div className="section-header">
        <h2>📊 Gold & Silver Reaction History</h2>
        <p className="section-subtitle">How precious metals reacted to {stats.total} major global events in the past year</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🥇</span>
          <span className="stat-label">Gold Avg Reaction</span>
          <span className={`stat-value ${stats.avgGoldReaction >= 0 ? 'positive' : 'negative'}`}>
            {stats.avgGoldReaction >= 0 ? '+' : ''}{stats.avgGoldReaction.toFixed(1)}%
          </span>
          <span className="stat-detail">{stats.goldUp} up / {stats.goldDown} down</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🥈</span>
          <span className="stat-label">Silver Avg Reaction</span>
          <span className={`stat-value ${stats.avgSilverReaction >= 0 ? 'positive' : 'negative'}`}>
            {stats.avgSilverReaction >= 0 ? '+' : ''}{stats.avgSilverReaction.toFixed(1)}%
          </span>
          <span className="stat-detail">{stats.silverUp} up / {stats.silverDown} down</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <span className="stat-label">Gold Win Rate</span>
          <span className="stat-value positive">
            {((stats.goldUp / stats.total) * 100).toFixed(0)}%
          </span>
          <span className="stat-detail">of events were bullish</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚡</span>
          <span className="stat-label">Silver Volatility</span>
          <span className="stat-value neutral">
            {Math.abs(stats.avgSilverReaction) > Math.abs(stats.avgGoldReaction) ? 'Higher' : 'Lower'}
          </span>
          <span className="stat-detail">than gold</span>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({historicalEvents.length})
        </button>
        {Object.entries(eventCategories).map(([key, { label, color, icon }]) => {
          const count = historicalEvents.filter(e => e.category === key).length;
          return (
            <button
              key={key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
              style={{ '--cat-color': color }}
            >
              {icon} {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="timeline">
        {filtered.map((event) => {
          const cat = eventCategories[event.category];
          const isExpanded = expanded === event.id;

          return (
            <div
              key={event.id}
              className={`timeline-item ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpanded(isExpanded ? null : event.id)}
            >
              <div className="timeline-dot" style={{ background: cat.color }}></div>
              <div className="timeline-content">
                <div className="tl-header">
                  <span className="tl-date">{formatDate(event.date)}</span>
                  <span className="tl-category" style={{ background: cat.color + '20', color: cat.color, borderColor: cat.color + '40' }}>
                    {cat.icon} {cat.label}
                  </span>
                  <span className={`tl-severity ${event.severity}`}>{event.severity}</span>
                </div>

                <h3 className="tl-title">{event.title}</h3>
                <p className="tl-desc">{event.description}</p>

                <div className="reaction-cards">
                  <div className={`reaction-card ${event.gold.direction}`}>
                    <span className="rc-icon">🥇</span>
                    <div className="rc-info">
                      <span className="rc-label">Gold</span>
                      <span className={`rc-reaction ${event.gold.direction}`}>{event.gold.reaction}</span>
                      <span className="rc-detail">${event.gold.priceBefore} → ${event.gold.priceAfter}</span>
                      <span className="rc-timeframe">{event.gold.timeframe}</span>
                    </div>
                  </div>
                  <div className={`reaction-card ${event.silver.direction}`}>
                    <span className="rc-icon">🥈</span>
                    <div className="rc-info">
                      <span className="rc-label">Silver</span>
                      <span className={`rc-reaction ${event.silver.direction}`}>{event.silver.reaction}</span>
                      <span className="rc-detail">${event.silver.priceBefore} → ${event.silver.priceAfter}</span>
                      <span className="rc-timeframe">{event.silver.timeframe}</span>
                    </div>
                  </div>
                  <div className={`reaction-card ${event.nifty.direction}`}>
                    <span className="rc-icon">🇮🇳</span>
                    <div className="rc-info">
                      <span className="rc-label">NIFTY 50</span>
                      <span className={`rc-reaction ${event.nifty.direction}`}>{event.nifty.reaction}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="tl-expanded">
                    <div className="reasoning-box">
                      <h4>Why did this happen?</h4>
                      <p>{event.reasoning}</p>
                    </div>
                  </div>
                )}

                <span className="expand-hint">{isExpanded ? 'Click to collapse' : 'Click for analysis →'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
