const express = require('express');
const router = express.Router();
const { concessionState, venue } = require('../data/venueData');

router.get('/', (req, res) => {
  const enriched = venue.concessionStands.map(cs => ({
    ...cs,
    status: concessionState[cs.id]
  }));
  res.json(enriched);
});

router.get('/zone/:zoneId', (req, res) => {
  const stands = venue.concessionStands
    .filter(cs => cs.zone === req.params.zoneId)
    .map(cs => ({ ...cs, status: concessionState[cs.id] }));
  res.json(stands);
});

module.exports = router;