require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const venueRoutes = require('./routes/venue');
const alertRoutes = require('./routes/alerts');
const crowdRoutes = require('./routes/crowd');
const concessionRoutes = require('./routes/concessions');
const { initSimulator } = require('./services/simulator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/venue', venueRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/concessions', concessionRoutes);

// Health check for Cloud Run
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Serve React frontend
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Socket.IO real-time events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_zone', (zoneId) => {
    socket.join(`zone_${zoneId}`);
    console.log(`Socket ${socket.id} joined zone ${zoneId}`);
  });

  socket.on('report_crowd', ({ zoneId, density }) => {
    io.to(`zone_${zoneId}`).emit('crowd_update', { zoneId, density, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Attach io to app for use in routes/services
app.set('io', io);

// Start crowd/queue simulator
initSimulator(io);

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartVenue server running on port ${PORT}`);
});