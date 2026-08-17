import { useState } from 'react';
import { categoryColors } from '../data/events';
import './EventCard.css';

export default function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const category = categoryColors[event.category];

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const severityConfig = {
    high: { color: '#ef4444', label: 'HIGH IMPACT', glow: 'rgba(239, 68, 68, 0.2)' },
    medium: { color: '#f59e0b', label: 'MEDIUM IMPACT', glow: 'rgba(245, 158, 11, 0.2)' },
    low: { color: '#3b82f6', label: 'LOW IMPACT', glow: 'rgba(59, 130, 246, 0.2)' }
  };

  const severity = severityConfig[event.severity];

  return (
    <div className={`event-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="event-card-header">
        <div className="event-meta">
          <span className="category-badge" style={{ background: category.bg, color: category.text }}>
            {category.label}
          </span>
          <span className="region-tag">{event.region}</span>
          <span className="severity-badge" style={{ color: severity.color, background: severity.glow }}>
            {severity.label}
          </span>
        </div>
        <span className="time-ago">{timeAgo(event.timestamp)}</span>
      </div>

      <h3 className="event-title">{event.title}</h3>
      <p className="event-description">{event.description}</p>

      <div className="impact-summary">
        <div className={`impact-direction ${event.impact.direction}`}>
          <span className="impact-icon">
            {event.impact.direction === 'positive' ? '📈' : event.impact.direction === 'negative' ? '📉' : '↔️'}
          </span>
          <span className="impact-text">
            {event.impact.direction === 'positive' ? 'Bullish' : event.impact.direction === 'negative' ? 'Bearish' : 'Mixed'} Impact
          </span>
          <div className="impact-meter">
            <div
              className="impact-fill"
              style={{
                width: `${event.impact.magnitude}%`,
                background: event.impact.direction === 'positive'
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : event.impact.direction === 'negative'
                    ? 'linear-gradient(90deg, #ef4444, #f87171)'
                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              }}
            ></div>
          </div>
          <span className="impact-magnitude">{event.impact.magnitude}%</span>
        </div>
      </div>

      {expanded && (
        <div className="event-expanded">
          <div className="impact-detail">
            <h4>Impact Analysis</h4>
            <p>{event.impact.description}</p>
          </div>

          <div className="indices-impact">
            <h4>Index Impact</h4>
            <div className="indices-list">
              {event.impact.affectedIndices.map((idx, i) => (
                <div key={i} className={`idx-impact-item ${idx.direction}`}>
                  <span className="idx-name">{idx.name}</span>
                  <span className={`idx-change ${idx.direction}`}>{idx.impact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sectors-impact">
            <h4>Affected Sectors</h4>
            <div className="sectors-tags">
              {event.impact.affectedSectors.map((sector, i) => (
                <span key={i} className="sector-tag">{sector}</span>
              ))}
            </div>
          </div>

          <div className="additional-info">
            <div className="info-block">
              <span className="info-label">FII Impact</span>
              <span className="info-value">{event.impact.fiiImpact}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Currency Impact</span>
              <span className="info-value">{event.impact.currencyImpact}</span>
            </div>
          </div>

          <div className="event-tags">
            {event.tags.map((tag, i) => (
              <span key={i} className="tag">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="expand-indicator">
        {expanded ? 'Click to collapse' : 'Click for full analysis →'}
      </div>
    </div>
  );
}
