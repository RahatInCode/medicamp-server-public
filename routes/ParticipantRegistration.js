const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
const ParticipantRegistration = require('../models/ParticipantRegistration');
const Camp = require('../models/camp');

// Get all registrations for a user (case-insensitive email)
router.get('/user', verifyJWT, async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email in query" });
  }

  if (email.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(403).json({ error: "You can only view your own registrations" });
  }

  try {
    const registrations = await ParticipantRegistration.find({
      participantEmail: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    res.json(registrations);
  } catch (err) {
    console.error("❌ Failed to fetch user registrations:", err.message);
    res.status(500).json({ error: "Server error fetching registrations" });
  }
});

// **NEW ROUTE**: Get all registrations for camps organized by an organizer email
router.get('/organizer/:email', verifyJWT, async (req, res) => {
  try {
    const organizerEmail = req.params.email.toLowerCase();

    // Make sure the requester is the organizer or admin
    if (organizerEmail !== req.user.email.toLowerCase() && req.user.role !== 'organizer') {
      return res.status(403).json({ error: "Unauthorized to view these registrations" });
    }

    // Find registrations where organizerEmail matches
    const registrations = await ParticipantRegistration.find({
      organizerEmail: organizerEmail
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations for organizer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single registration by ID
router.get('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;

  try {
    const registration = await ParticipantRegistration.findById(id);
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    if (registration.participantEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: "You are not allowed to view this registration." });
    }

    res.json(registration);
  } catch (err) {
    console.error("❌ Error fetching registration:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Cancel registration (delete) by participant only
router.delete('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email.toLowerCase();

  try {
    const registration = await ParticipantRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.participantEmail.toLowerCase() !== userEmail) {
      console.warn("🚫 Unauthorized delete attempt by:", userEmail);
      return res.status(403).json({ error: "You can only cancel your own registration" });
    }

    // Check payment made logic (currently mock false)
    const paymentMade = false; // Replace with actual check if needed
    if (paymentMade) {
      return res.status(400).json({
        error: "Cancellation denied: This registration has already been paid. Please contact support if you need assistance.",
      });
    }

    // Decrement participant count on camp
    const camp = await Camp.findById(registration.campId);
    if (camp) {
      camp.participantCount = Math.max(0, camp.participantCount - 1);
      await camp.save();
      console.log(`👥 Updated camp participant count: ${camp.participantCount}`);
    }

    await ParticipantRegistration.findByIdAndDelete(id);
    console.log(`✅ Registration cancelled by ${userEmail} for camp: ${registration.campName}`);

    res.json({ message: "Your registration has been cancelled successfully." });
  } catch (err) {
    console.error("❌ Error cancelling registration:", err.message);
    res.status(500).json({ error: "Server error during cancellation" });
  }
});

// Create new registration
router.post('/', verifyJWT, async (req, res) => {
  const user = req.user;
  console.log(`POST /participantRegistrations called by ${user.email}, role: ${user.role}`);

  try {
    // Block organizers from registering
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



