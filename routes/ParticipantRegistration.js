const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
const ParticipantRegistration = require('../models/ParticipantRegistration');
const Camp = require('../models/camp');
const Payment = require('../models/Payment');

// Get all participant registrations for an organizer by their email
router.get('/organizer/:email', verifyJWT, async (req, res) => {
  const organizerEmail = req.params.email.toLowerCase();

  if (req.user.role !== 'organizer' || req.user.email.toLowerCase() !== organizerEmail) {
    return res.status(403).json({ error: 'Access denied. Only the matching organizer can view their participants.' });
  }

  try {
    const registrations = await ParticipantRegistration.find({
      organizerEmail: { $regex: new RegExp(`^${organizerEmail}$`, 'i') }
    });
    res.json(registrations);
  } catch (err) {
    console.error('❌ Error fetching registrations for organizer:', err.message);
    res.status(500).json({ error: 'Server error fetching organizer registrations' });
  }
});

// Get all registrations for a user (case-insensitive email)
router.get('/user', verifyJWT, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Missing email in query" });

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

// Cancel registration (delete) by participant only
router.delete('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email.toLowerCase();

  try {
    const registration = await ParticipantRegistration.findById(id);
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    if (registration.participantEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({ error: "You can only cancel your own registration" });
    }

    const paymentMade = await Payment.exists({ participantRegistrationId: registration._id, status: 'Paid' });
    if (paymentMade) {
      return res.status(400).json({
        error: "Cancellation denied: This registration has already been paid. Please contact support if you need assistance.",
      });
    }

    const camp = await Camp.findById(registration.campId);
    if (camp) {
      camp.participantCount = Math.max(0, (camp.participantCount || 1) - 1);
      await camp.save();
    }

    await ParticipantRegistration.findByIdAndDelete(id);
    res.json({ message: "Your registration has been cancelled successfully." });
  } catch (err) {
    console.error("❌ Error cancelling registration:", err.message);
    res.status(500).json({ error: "Server error during cancellation" });
  }
});

// Confirm registration by organizer
router.patch('/:id/confirm', verifyJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await ParticipantRegistration.findByIdAndUpdate(
      id,
      { confirmationStatus: 'Confirmed' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Registration not found' });
    res.json({ message: 'Confirmation updated', updated });
  } catch (err) {
    console.error('❌ Error confirming registration:', err.message);
    res.status(500).json({ error: 'Server error confirming registration' });
  }
});

// PATCH /api/participants/profile
// PATCH /api/participants/profile
router.patch('/profile', verifyJWT, async (req, res) => {
  const userEmail = req.user.email.toLowerCase();
  const { participantName, participantImage } = req.body;

  if (!participantName || participantName.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await ParticipantRegistration.updateMany(
      { participantEmail: userEmail },
      { participantName, participantImage }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "No registrations found for this user" });
    }

    res.json({ message: "Profile updated", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ error: "Server error updating profile" });
  }
});



// Cancel registration by organizer
router.delete('/:id/by-organizer', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;
  try {
    const registration = await ParticipantRegistration.findById(id);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    if (req.user.role !== 'organizer' || req.user.email.toLowerCase() !== registration.organizerEmail.toLowerCase()) {
      return res.status(403).json({ error: 'You can only cancel your own camp registrations' });
    }

    if (registration.paymentStatus === 'Paid' && registration.confirmationStatus === 'Confirmed') {
      return res.status(400).json({ error: 'Cannot cancel a confirmed paid registration' });
    }

    await ParticipantRegistration.findByIdAndDelete(id);
    res.json({ message: 'Registration cancelled by organizer' });
  } catch (err) {
    console.error('❌ Error cancelling registration:', err.message);
    res.status(500).json({ error: 'Server error during cancellation' });
  }
});

// Create new registration
router.post('/', verifyJWT, async (req, res) => {
  const user = req.user;
  if (user.role === 'organizer') {
    return res.status(403).json({ error: 'Organizers cannot register for camps' });
  }

  try {
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
    if (!camp) return res.status(404).json({ error: 'Camp not found' });

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
      paymentStatus: 'Pending',
      confirmationStatus: 'Pending',
      feedbackGiven: false,
    });

    await registration.save();
    camp.participantCount = (camp.participantCount || 0) + 1;
    await camp.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

module.exports = router;



