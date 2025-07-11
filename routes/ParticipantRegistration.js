const express = require('express');
const router = express.Router();
const ParticipantRegistration = require('../models/ParticipantRegistration');

router.post('/', async (req, res) => {
  try {
    const newRegistration = new ParticipantRegistration(req.body);
    const saved = await newRegistration.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save registration' });
  }
});

module.exports = router;
