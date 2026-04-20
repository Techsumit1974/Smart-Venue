const express = require('express');
const router = express.Router();
const { crowdState, queueState } = require('../data/venueData');

router.get('/', (req, res) => res.json(crowdState));
router.get('/queues', (req, res) => res.json(queueState));
router.get('/zone/:id', (req, res) => {
  const z = crowdState[req.params.id];
  if (!z) return res.status(404).json({ error: 'Zone not found' });
  res.json(z);
});

module.exports = router;