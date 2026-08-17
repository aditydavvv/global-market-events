import './Header.css';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-symbol">📊</span>
          </div>
          <div className="logo-text">
            <h1>Global Market Pulse</h1>
            <p className="tagline">Global Events → Indian Stock Market Impact</p>
          </div>
        </div>
        <div className="header-info">
          <div className="market-status">
            <span className={`status-dot open`}></span>
            <span className="status-text">Market Open</span>
          </div>
          <div className="date-display">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
