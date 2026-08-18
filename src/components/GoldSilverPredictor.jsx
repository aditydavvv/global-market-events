import { useState, useEffect } from 'react';
import { metalETFs, predictETFReaction } from '../data/metals';
import { globalEvents } from '../data/events';
import { fetchCommodityPrices } from '../services/marketDataService';
import MetalPriceChart from './MetalPriceChart';
import './GoldSilverPredictor.css';

export default function GoldSilverPredictor() {
  const [selectedEvent, setSelectedEvent] = useState(globalEvents[0]);
  const [activeTab, setActiveTab] = useState('both');
  const [activeChart, setActiveChart] = useState('gold-etf');
  const [priceChanges, setPriceChanges] = useState({ gold: null, silver: null });

  useEffect(() => {
    const loadPrices = async () => {
      const prices = await fetchCommodityPrices();
      if (prices.silver) setPriceChanges(prev => ({ ...prev, silver: prices.silver.changePercent }));
      if (prices.gold) setPriceChanges(prev => ({ ...prev, gold: prices.gold.changePercent }));
    };
    loadPrices();
    const interval = setInterval(loadPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  const goldPrediction = predictETFReaction(selectedEvent, 'gold', priceChanges.gold);
  const silverPrediction = predictETFReaction(selectedEvent, 'silver', priceChanges.silver);

  const goldData = metalETFs.gold;
  const silverData = metalETFs.silver;

  const renderPrediction = (prediction, metal, data) => {
    if (!prediction) return null;

    const dirColor = prediction.prediction === 'positive' ? 'positive' :
                     prediction.prediction === 'negative' ? 'negative' : 'neutral';

    return (
      <div className={`prediction-card ${dirColor}`}>
        <div className="pred-header">
          <div className="pred-metal-icon">
            {metal === 'gold' ? '🥇' : '🥈'}
          </div>
          <div>
            <h3 className="pred-metal-name">{data.name} ETF Prediction</h3>
            <p className="pred-etf">{data.etfIndia}</p>
          </div>
          <div className={`pred-direction-badge ${dirColor}`}>
            {prediction.prediction === 'positive' ? '📈 BULLISH' :
             prediction.prediction === 'negative' ? '📉 BEARISH' : '↔️ NEUTRAL'}
          </div>
        </div>

        <div className="pred-stats">
          <div className="pred-stat">
            <span className="pred-stat-label">Expected Move</span>
            <span className={`pred-stat-value ${dirColor}`}>{prediction.expectedMove}</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-label">Confidence</span>
            <div className="confidence-bar-wrapper">
              <div className="confidence-bar" style={{ width: `${prediction.confidence}%` }}></div>
              <span className="confidence-text">{prediction.confidence}%</span>
            </div>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-label">Timeframe</span>
            <span className="pred-stat-value timeframe">{prediction.timeframe}</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-label">Avg Historical Reaction</span>
            <span className={`pred-stat-value ${dirColor}`}>{prediction.avgReaction}</span>
          </div>
        </div>

        <div className="pred-reasoning">
          <h4>Why This Prediction?</h4>
          <p>{prediction.reasoning}</p>
        </div>

        {prediction.historicalPattern && (
          <div className="pred-pattern">
            <h4>Historical Pattern</h4>
            <p>{prediction.historicalPattern}</p>
          </div>
        )}

        {prediction.pastInstances && prediction.pastInstances.length > 0 && (
          <div className="past-instances">
            <h4>Past Instances</h4>
            <div className="instances-grid">
              {prediction.pastInstances.map((inst, i) => (
                <div key={i} className="instance-item">
                  <span className="inst-date">{inst.date}</span>
                  <span className={`inst-reaction ${inst.reaction.startsWith('+') ? 'positive' : 'negative'}`}>
                    {inst.reaction}
                  </span>
                  <span className="inst-timeframe">{inst.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {prediction.relatedEvents && prediction.relatedEvents.length > 1 && (
          <div className="related-events">
            <h4>Similar Historical Events</h4>
            <div className="related-tags">
              {prediction.relatedEvents.map((evt, i) => (
                <span key={i} className="related-tag">{evt}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="gold-silver-section">
      <div className="section-header">
        <h2>Gold & Silver ETF Predictions</h2>
        <span className="subtitle">AI-driven predictions based on historical event reactions</span>
      </div>

      <div className="current-prices">
        <div className="price-card gold">
          <span className="price-icon">🥇</span>
          <div className="price-info">
            <span className="price-label">Gold (Spot)</span>
            <span className="price-value">₹{goldData.currentPrice.toLocaleString('en-IN')}</span>
            <span className="price-unit">{goldData.unit}</span>
          </div>
        </div>
        <div className="price-card silver">
          <span className="price-icon">🥈</span>
          <div className="price-info">
            <span className="price-label">Silver (Spot)</span>
            <span className="price-value">₹{silverData.currentPrice.toLocaleString('en-IN')}</span>
            <span className="price-unit">{silverData.unit}</span>
          </div>
        </div>
        <div className="price-card ratio">
          <span className="price-icon">⚖️</span>
          <div className="price-info">
            <span className="price-label">Gold/Silver Ratio</span>
            <span className="price-value">{(goldData.currentPrice * 10 / silverData.currentPrice).toFixed(1)}</span>
            <span className="price-unit">Silver {85 > (goldData.currentPrice * 10 / silverData.currentPrice) ? 'undervalued' : 'near fair'}</span>
          </div>
        </div>
      </div>

      <div className="event-selector">
        <label>Select a Global Event to Predict Impact:</label>
        <div className="event-buttons">
          {globalEvents.map(event => (
            <button
              key={event.id}
              className={`event-btn ${selectedEvent.id === event.id ? 'active' : ''}`}
              onClick={() => setSelectedEvent(event)}
            >
              {event.title.length > 40 ? event.title.substring(0, 40) + '...' : event.title}
            </button>
          ))}
        </div>
      </div>

      <div className="selected-event-preview">
        <h4>Selected Event:</h4>
        <div className="event-preview-card">
          <span className="ep-title">{selectedEvent.title}</span>
          <span className="ep-desc">{selectedEvent.description}</span>
        </div>
      </div>

      <div className="chart-tabs">
        <button className={`chart-tab ${activeChart === 'gold-etf' ? 'active gold' : ''}`} onClick={() => setActiveChart('gold-etf')}>🥇 Gold ETF</button>
        <button className={`chart-tab ${activeChart === 'silver-etf' ? 'active silver' : ''}`} onClick={() => setActiveChart('silver-etf')}>🥈 Silver ETF</button>
        <button className={`chart-tab ${activeChart === 'tata-silver-etf' ? 'active tata' : ''}`} onClick={() => setActiveChart('tata-silver-etf')}>🏆 Tata Silver ETF</button>
      </div>

      <MetalPriceChart etfType={activeChart} />

      <div className="metal-tabs">
        <button className={`metal-tab ${activeTab === 'both' ? 'active' : ''}`} onClick={() => setActiveTab('both')}>Both</button>
        <button className={`metal-tab gold ${activeTab === 'gold' ? 'active' : ''}`} onClick={() => setActiveTab('gold')}>🥇 Gold Only</button>
        <button className={`metal-tab silver ${activeTab === 'silver' ? 'active' : ''}`} onClick={() => setActiveTab('silver')}>🥈 Silver Only</button>
      </div>

      <div className="predictions-container">
        {(activeTab === 'both' || activeTab === 'gold') && renderPrediction(goldPrediction, 'gold', goldData)}
        {(activeTab === 'both' || activeTab === 'silver') && renderPrediction(silverPrediction, 'silver', silverData)}
      </div>

      <div className="historical-reference">
        <h3>📚 Historical Event-Reaction Reference</h3>
        <p className="ref-subtitle">How Gold & Silver ETFs typically react to major global events</p>

        <div className="reference-grid">
          <div className="ref-column">
            <h4>🥇 Gold Reactions</h4>
            {goldData.historicalReactions.map((reaction, i) => (
              <div key={i} className="ref-item">
                <div className="ref-event-name">{reaction.event}</div>
                <div className={`ref-direction ${reaction.direction}`}>
                  {reaction.direction === 'positive' ? '▲' : '▼'} {reaction.avgReaction}
                </div>
                <div className="ref-pattern">{reaction.pattern}</div>
              </div>
            ))}
          </div>
          <div className="ref-column">
            <h4>🥈 Silver Reactions</h4>
            {silverData.historicalReactions.map((reaction, i) => (
              <div key={i} className="ref-item">
                <div className="ref-event-name">{reaction.event}</div>
                <div className={`ref-direction ${reaction.direction}`}>
                  {reaction.direction === 'positive' ? '▲' : reaction.direction === 'negative' ? '▼' : '↔'} {reaction.avgReaction}
                </div>
                <div className="ref-pattern">{reaction.pattern}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
