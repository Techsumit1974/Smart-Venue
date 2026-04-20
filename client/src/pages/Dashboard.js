import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const DENSITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function Dashboard({ venue, crowdData, queueData, concessionData, alerts }) {
  const crowdChartData = useMemo(() => {
    if (!venue) return [];
    return venue.zones.map(z => ({
      name: z.name.replace(' Stand', ''),
      current: crowdData[z.id]?.current || 0,
      capacity: z.capacity,
      pct: Math.round(((crowdData[z.id]?.current || 0) / z.capacity) * 100)
    }));
  }, [venue, crowdData]);

  const densityPieData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    Object.values(crowdData).forEach(z => { if (z.density) counts[z.density]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [crowdData]);

  const avgWait = useMemo(() => {
    const vals = Object.values(queueData).map(q => q.waitMinutes);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [queueData]);

  const totalAttendees = useMemo(() => {
    return Object.values(crowdData).reduce((sum, z) => sum + (z.current || 0), 0);
  }, [crowdData]);

  const openConcessions = concessionData.filter(cs => cs.status?.isOpen).length;

  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-value">{totalAttendees.toLocaleString()}</div>
          <div className="kpi-label">Total Attendees</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-value">{avgWait} min</div>
          <div className="kpi-label">Avg Gate Wait</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-value">{openConcessions}</div>
          <div className="kpi-label">Open Stands</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-value">{alerts.length}</div>
          <div className="kpi-label">Active Alerts</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Crowd by Zone */}
        <div className="chart-card wide">
          <h3>Zone Occupancy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={crowdChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="current" name="Attendees" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="capacity" name="Capacity" fill="#1e3a5f" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Density Distribution */}
        <div className="chart-card">
          <h3>Density Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={densityPieData} cx="50%" cy="50%" outerRadius={90}
                dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {densityPieData.map((entry) => (
                  <Cell key={entry.name} fill={DENSITY_COLORS[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gate Queues */}
        <div className="chart-card wide">
          <h3>Gate Wait Times (minutes)</h3>
          <div className="gate-grid">
            {Object.entries(queueData).map(([gateId, q]) => (
              <div key={gateId} className={`gate-card ${q.waitMinutes > 15 ? 'bad' : q.waitMinutes > 8 ? 'warn' : 'good'}`}>
                <div className="gate-id">{gateId}</div>
                <div className="gate-wait">{q.waitMinutes}m</div>
                <div className="gate-queue">{q.queueLength} in queue</div>
                <div className={`gate-status ${q.isOpen ? 'open' : 'closed'}`}>
                  {q.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="chart-card">
          <h3>Recent Alerts</h3>
          <div className="alerts-feed">
            {alerts.slice(0, 8).map(a => (
              <div key={a.id} className={`alert-item ${a.type}`}>
                <span className="alert-icon">
                  {a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : 'ℹ️'}
                </span>
                <span className="alert-msg">{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}