const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
const ParticipantRegistration = require('../models/ParticipantRegistration');
const Camp = require('../models/camp');

router.post('/', verifyJWT, async (req, res) => {
  const user = req.user;
  console.log(`POST /participantRegistrations called by ${user.email}, role: ${user.role}`);

  try {
    // 🛑 Block organizers from registering as participant
    if (user.role === 'organizer') {
      console.warn(`Organizer ${user.email} tried to register as participant`);
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

    if (participantEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: "Email mismatch: You can only register yourself" });
    }

    const camp = await Camp.findById(campId);
    if (!camp) {
      console.warn("Camp not found with ID:", campId);
      return res.status(404).json({ error: 'Camp not found' });
    }

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
      organizerEmail,
    });

    await registration.save();
    console.log(`Registration saved for participant ${participantEmail} in camp ${campId}`);

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

module.exports = router;

