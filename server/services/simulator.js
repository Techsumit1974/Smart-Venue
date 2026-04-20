const { crowdState, queueState, concessionState, venue } = require('../data/venueData');

// Simulates real-time crowd changes, queue waits, and concession updates
function initSimulator(io) {
  console.log('Real-time simulator started');

  // Crowd density simulation every 5s
  setInterval(() => {
    venue.zones.forEach(zone => {
      const state = crowdState[zone.id];
      const delta = Math.floor(Math.random() * 800) - 400;
      state.current = Math.max(0, Math.min(zone.capacity, state.current + delta));

      const ratio = state.current / zone.capacity;
      if (ratio < 0.4)       state.density = 'low';
      else if (ratio < 0.65) state.density = 'medium';
      else if (ratio < 0.85) state.density = 'high';
      else                   state.density = 'critical';

      state.flow = ratio > 0.9 ? 'blocked' : ratio > 0.7 ? 'slow' : 'normal';
    });

    io.emit('crowd_update', crowdState);
  }, 5000);

  // Gate queue simulation every 8s
  setInterval(() => {
    venue.gates.forEach(gate => {
      const q = queueState[gate.id];
      if (!q.isOpen) return;
      q.waitMinutes = Math.max(1, q.waitMinutes + Math.floor(Math.random() * 6) - 3);
      q.queueLength = Math.max(0, q.queueLength + Math.floor(Math.random() * 40) - 20);
    });

    io.emit('queue_update', queueState);
  }, 8000);

  // Concession simulation every 10s
  setInterval(() => {
    venue.concessionStands.forEach(cs => {
      const c = concessionState[cs.id];
      if (!c.isOpen) return;
      c.waitMinutes = Math.max(1, c.waitMinutes + Math.floor(Math.random() * 4) - 2);
      const r = Math.random();
      c.stockLevel = r < 0.1 ? 'out' : r < 0.3 ? 'low' : 'full';
    });

    io.emit('concession_update', concessionState);
  }, 10000);

  // Random venue alerts every 30s
  setInterval(() => {
    const alertTypes = [
      { type: 'info',    message: 'Halftime show starting in 5 minutes at Main Stage' },
      { type: 'warning', message: 'Gate 3 experiencing high volume — consider Gate 4' },
      { type: 'info',    message: 'Free shuttle buses departing from South Lot in 10 min' },
      { type: 'warning', message: 'North Stand Section 12 reaching capacity' },
      { type: 'info',    message: 'Food voucher redemption available at East Kiosks' },
      { type: 'success', message: 'Gate 1 queue cleared — fast entry now available' }
    ];
    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    io.emit('venue_alert', { ...alert, id: Date.now(), ts: new Date().toISOString() });
  }, 30000);
}

module.exports = { initSimulator };