const express = require('express');
const router = express.Router();
const { venue } = require('../data/venueData');

router.get('/', (req, res) => res.json(venue));
router.get('/zones', (req, res) => res.json(venue.zones));
router.get('/gates', (req, res) => res.json(venue.gates));
router.get('/restrooms', (req, res) => res.json(venue.restrooms));

module.exports = router;