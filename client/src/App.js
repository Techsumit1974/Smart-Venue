import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import AttendeView from './pages/AttendeeView';
import OpsView from './pages/OpsView';
import './App.css';

const socket = io(window.location.origin, { transports: ['websocket', 'polling'] });

export default function App() {
  const [activeTab, setActiveTab] = useState('attendee');
  const [crowdData, setCrowdData] = useState({});
  const [queueData, setQueueData] = useState({});
  const [concessionData, setConcessionData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [venue, setVenue] = useState(null);
  const [connected, setConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [venueRes, crowdRes, queueRes, concRes, alertRes] = await Promise.all([
        fetch('/api/venue'),
        fetch('/api/crowd'),
        fetch('/api/crowd/queues'),
        fetch('/api/concessions'),
        fetch('/api/alerts')
      ]);
      setVenue(await venueRes.json());
      setCrowdData(await crowdRes.json());
      setQueueData(await queueRes.json());
      setConcessionData(await concRes.json());
      setAlerts(await alertRes.json());
    } catch (e) {
      console.error('Failed to fetch initial data:', e);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('crowd_update', setCrowdData);
    socket.on('queue_update', setQueueData);
    socket.on('concession_update', (updates) => {
      setConcessionData(prev =>
        prev.map(cs => ({
          ...cs,
          status: updates[cs.id] || cs.status
        }))
      );
    });
    socket.on('venue_alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));
    });

    return () => socket.removeAllListeners();
  }, [fetchInitialData]);

  const sharedProps = { venue, crowdData, queueData, concessionData, alerts, socket };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="logo">🏟️</span>
          <span className="brand-name">SmartVenue</span>
          {venue && <span className="venue-name">{venue.name}</span>}
        </div>
        <nav className="header-nav">
          {['attendee', 'dashboard', 'ops'].map(tab => (
            <button
              key={tab}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'attendee' ? '👤 Attendee' : tab === 'dashboard' ? '📊 Dashboard' : '⚙️ Ops'}
            </button>
          ))}
        </nav>
        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? '● Live' : '○ Offline'}
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'attendee'  && <AttendeView  {...sharedProps} />}
        {activeTab === 'dashboard' && <Dashboard    {...sharedProps} />}
        {activeTab === 'ops'       && <OpsView      {...sharedProps} />}
      </main>
    </div>
  );
}