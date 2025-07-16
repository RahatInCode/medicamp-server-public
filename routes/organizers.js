const express = require('express');
const router = express.Router();
const Organizer = require('../models/organizer');
const verifyJWT = require('../middlewares/verifyFirebaseJWT'); // Make sure path is correct

// 🔐 Protect this route with JWT
router.get('/', verifyJWT, async (req, res) => {
  try {
    const emailParam = req.query.email;
    if (!emailParam) return res.status(400).json({ message: 'Email query param required' });

    const organizer = await Organizer.findOne({ email: { $regex: `^${emailParam}$`, $options: 'i' } });
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    res.json(organizer);
  } catch (err) {
    console.error('Organizer fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT update organizer by ID
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrganizer) return res.status(404).json({ message: 'Organizer not found' });
    res.json(updatedOrganizer);
  } catch (err) {
    console.error('Organizer update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



