// routes/participantRegistrations.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyFirebaseJWT'); // <-- middleware
const ParticipantRegistration = require('../models/ParticipantRegistration');
const Camp = require('../models/camp');

router.post('/', verifyJWT, async (req, res) => {
  try {
    // 🛑 Block organizers
    if (req.user.role === 'organizer') {
      return res.status(403).json({ error: 'Organizers cannot register for camps' });
    }

    const {
      campId,
      campName,
      campFees,
      location,
      healthcareProfessional,
      participantName,
      participantEmail,
      age,
      phone,
      gender,
      emergencyContact,
    } = req.body;

    const camp = await Camp.findById(campId);
    if (!camp) return res.status(404).json({ error: 'Camp not found' });

    const organizerEmail = camp.organizerEmail;

    const registration = new ParticipantRegistration({
      campId,
      campName,
      campFees,
      location,
      healthcareProfessional,
      participantName,
      participantEmail,
      age,
      phone,
      gender,
      emergencyContact,
     organizerEmail: camp.organizerEmail, 
    });

    await registration.save();
    res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

module.exports = router;
