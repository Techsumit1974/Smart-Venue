import React, { useState, useMemo } from 'react';

const DENSITY_LABEL = { low: '🟢 Low', medium: '🟡 Moderate', high: '🟠 Busy', critical: '🔴 Critical' };

export default function AttendeeView({ venue, crowdData, queueData, concessionData, alerts }) {
  const [selectedZone, setSelectedZone] = useState('Z1');

  const bestGate = useMemo(() => {
    if (!venue) return null;
    const zoneGates = (venue.gates || []).filter(g => g.zone === selectedZone);
    return zoneGates.reduce((best, g) => {
      const wait = queueData[g.id]?.waitMinutes || 99;
      const bestWait = queueData[best?.id]?.waitMinutes || 99;
      return wait < bestWait ? g : best;
    }, zoneGates[0]);
  }, [venue, selectedZone, queueData]);

  const zoneStands = useMemo(() =>
    concessionData.filter(cs => cs.zone === selectedZone && cs.status?.isOpen),
    [concessionData, selectedZone]
  );

  const zoneCrowd = crowdData[selectedZone];

  return (
    <div className="attendee-view">
      <div className="welcome-banner">
        <h2>👋 Welcome to the Venue!</h2>
        <p>Select your zone to get personalised guidance.</p>
      </div>

      {/* Zone Selector */}
      <div className="zone-selector">
        {(venue?.zones || []).map(z => {
          const crowd = crowdData[z.id];
          return (
            <button
              key={z.id}
              className={`zone-btn ${selectedZone === z.id ? 'selected' : ''} ${crowd?.density || 'low'}`}
              onClick={() => setSelectedZone(z.id)}
            >
              <span className="zone-name">{z.name}</span>
              <span className="zone-density">{DENSITY_LABEL[crowd?.density] || '⚪'}</span>
            </button>
          );
        })}
      </div>

      <div className="attendee-grid">
        {/* Zone Status */}
        <div className="info-card">
          <h3>📍 Your Zone</h3>
          {zoneCrowd && (
            <>
              <div className="stat-row">
                <span>Crowd Level</span>
                <span className={`badge ${zoneCrowd.density}`}>{DENSITY_LABEL[zoneCrowd.density]}</span>
              </div>
              <div className="stat-row">
                <span>Occupancy</span>
                <span>{zoneCrowd.current?.toLocaleString()} / {zoneCrowd.capacity?.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Flow</span>
                <span className={`badge ${zoneCrowd.flow === 'blocked' ? 'critical' : zoneCrowd.flow === 'slow' ? 'high' : 'low'}`}>
                  {zoneCrowd.flow === 'blocked' ? '🚫 Blocked' : zoneCrowd.flow === 'slow' ? '🐢 Slow' : '✅ Normal'}
                </span>
              </div>
              <div className="crowd-bar">
                <div
                  className={`crowd-fill ${zoneCrowd.density}`}
                  style={{ width: `${Math.min(100, (zoneCrowd.current / zoneCrowd.capacity) * 100)}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Best Gate Recommendation */}
        <div className="info-card highlight">
          <h3>🚪 Recommended Entry</h3>
          {bestGate ? (
            <>
              <div className="big-gate-name">{bestGate.name}</div>
              <div className="big-wait">{queueData[bestGate.id]?.waitMinutes ?? '--'} min wait</div>
              <div className="queue-length">
                {queueData[bestGate.id]?.queueLength ?? '--'} people in queue
              </div>
              <p className="tip">💡 This is the fastest entry point for your zone right now.</p>
            </>
          ) : <p>Loading...</p>}
        </div>

        {/* Concession Stands */}
        <div className="info-card">
          <h3>🍔 Food & Drinks Nearby</h3>
          {zoneStands.length === 0 ? <p>No open stands in this zone.</p> :
            zoneStands.map(cs => (
              <div key={cs.id} className="stand-row">
                <div>
                  <strong>{cs.name}</strong>
                  <div className="stand-items">{cs.items?.join(', ')}</div>
                </div>
                <div className="stand-right">
                  <span className={`badge ${cs.status.stockLevel === 'out' ? 'critical' : cs.status.stockLevel === 'low' ? 'high' : 'low'}`}>
                    {cs.status.stockLevel === 'out' ? 'Out of Stock' : cs.status.stockLevel === 'low' ? 'Low Stock' : 'Available'}
                  </span>
                  <div className="stand-wait">{cs.status.waitMinutes}m wait</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Active Alerts */}
        <div className="info-card">
          <h3>🔔 Venue Announcements</h3>
          {alerts.slice(0, 5).map(a => (
            <div key={a.id} className={`alert-item ${a.type}`}>
              <span>{a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}