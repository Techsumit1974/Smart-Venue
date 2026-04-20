import React, { useState } from 'react';

export default function OpsView({ venue, crowdData, queueData, concessionData, alerts, socket }) {
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  const sendAlert = async () => {
    if (!alertMsg.trim()) return;
    setSending(true);
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: alertType, message: alertMsg })
      });
      setAlertMsg('');
      setSentOk(true);
      setTimeout(() => setSentOk(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const criticalZones = Object.entries(crowdData)
    .filter(([, z]) => z.density === 'critical' || z.density === 'high')
    .map(([id, z]) => ({ id, ...z }));

  const highWaitGates = Object.entries(queueData)
    .filter(([, q]) => q.waitMinutes > 10)
    .sort((a, b) => b[1].waitMinutes - a[1].waitMinutes);

  return (
    <div className="ops-view">
      <h2>⚙️ Operations Control Centre</h2>

      <div className="ops-grid">
        {/* Critical Zones */}
        <div className="ops-card">
          <h3>🔴 Zones Requiring Attention</h3>
          {criticalZones.length === 0
            ? <p className="ok-msg">✅ All zones operating normally</p>
            : criticalZones.map(z => (
              <div key={z.id} className={`ops-zone-row ${z.density}`}>
                <strong>{z.id}</strong>
                <span>{z.current?.toLocaleString()} attendees</span>
                <span className={`badge ${z.density}`}>{z.density.toUpperCase()}</span>
                <span>{z.flow === 'blocked' ? '🚫 Blocked' : z.flow === 'slow' ? '🐢 Slow' : '✅ Normal'}</span>
              </div>
            ))
          }
        </div>

        {/* High-Wait Gates */}
        <div className="ops-card">
          <h3>🚪 High Wait Gates</h3>
          {highWaitGates.length === 0
            ? <p className="ok-msg">✅ All gates within normal wait times</p>
            : highWaitGates.map(([gateId, q]) => (
              <div key={gateId} className="ops-zone-row">
                <strong>{gateId}</strong>
                <span>{q.queueLength} in queue</span>
                <span className={`badge ${q.waitMinutes > 20 ? 'critical' : 'high'}`}>{q.waitMinutes} min</span>
              </div>
            ))
          }
        </div>

        {/* Concession Overview */}
        <div className="ops-card">
          <h3>🍔 Concession Status</h3>
          <div className="ops-concession-list">
            {concessionData.map(cs => (
              <div key={cs.id} className="ops-concession-row">
                <div>
                  <strong>{cs.name}</strong>
                  <span className="zone-tag">{cs.zone}</span>
                </div>
                <div className="concession-right">
                  <span className={`badge ${cs.status?.stockLevel === 'out' ? 'critical' : cs.status?.stockLevel === 'low' ? 'high' : 'low'}`}>
                    {cs.status?.stockLevel || 'unknown'}
                  </span>
                  <span className="wait-tag">{cs.status?.waitMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Alert */}
        <div className="ops-card">
          <h3>📢 Broadcast Alert</h3>
          <div className="alert-composer">
            <select
              className="alert-type-select"
              value={alertType}
              onChange={e => setAlertType(e.target.value)}
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✅ Success</option>
            </select>
            <textarea
              className="alert-textarea"
              placeholder="Type your announcement here..."
              value={alertMsg}
              onChange={e => setAlertMsg(e.target.value)}
              rows={4}
            />
            <button
              className={`send-btn ${sending ? 'loading' : ''} ${sentOk ? 'sent' : ''}`}
              onClick={sendAlert}
              disabled={sending}
            >
              {sending ? 'Sending...' : sentOk ? '✅ Sent!' : '📢 Broadcast to All Attendees'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}