import Header from './components/Header';
import MarketOverview from './components/MarketOverview';
import SectorImpact from './components/SectorImpact';
import GoldSilverPredictor from './components/GoldSilverPredictor';
import LiveNews from './components/LiveNews';
import GlobalEvents from './components/GlobalEvents';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <MarketOverview />
        <LiveNews />
        <SectorImpact />
        <GoldSilverPredictor />
        <GlobalEvents />
      </main>
      <footer className="app-footer">
        <p>Global Market Pulse | Data is for informational purposes only | Not financial advice</p>
      </footer>
    </div>
  );
}

export default App;
