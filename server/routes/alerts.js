const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const alerts = [
  { id: uuidv4(), type: 'info',    message: 'Welcome to CloudArena! Enjoy the event.', ts: new Date().toISOString() },
  { id: uuidv4(), type: 'warning', message: 'North parking lot is full — use East Lot P3.', ts: new Date().toISOString() }
];

router.get('/', (req, res) => res.json(alerts));

router.post('/', (req, res) => {
  const { type, message } = req.body;
  if (!type || !message) return res.status(400).json({ error: 'type and message required' });
  const alert = { id: uuidv4(), type, message, ts: new Date().toISOString() };
  alerts.unshift(alert);
  req.app.get('io').emit('venue_alert', alert);
  res.status(201).json(alert);
});

module.exports = router;