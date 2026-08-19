import Header from './components/Header';
import MarketTicker from './components/MarketTicker';
import GoldSilverPredictor from './components/GoldSilverPredictor';
import MarketOverview from './components/MarketOverview';
import EventTimeline from './components/EventTimeline';
import SectorImpact from './components/SectorImpact';
import GlobalEvents from './components/GlobalEvents';
import LiveNews from './components/LiveNews';
import { useMarketData } from './hooks/useMarketData';
import './App.css';

function App() {
  const { marketStatus } = useMarketData();

  return (
    <div className="app">
      <Header marketStatus={marketStatus} />
      <MarketTicker />
      <main className="main-content">
        <GoldSilverPredictor />
        <MarketOverview />
        <EventTimeline />
        <SectorImpact />
        <GlobalEvents />
        <LiveNews />
      </main>
      <footer className="app-footer">
        <p>Tata Silver ETF Predictor | Data is for informational purposes only | Not financial advice</p>
      </footer>
    </div>
  );
}

export default App;
