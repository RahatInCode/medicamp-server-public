const express = require("express");
const router = express.Router();
const Camp = require("../models/camp");
const ParticipantRegistration = require("../models/ParticipantRegistration");
const verifyJWT = require("../middlewares/verifyFirebaseJWT");
const {
  getAllCamps,
  incrementParticipantCount,
} = require("../controllers/campController");

// ✅ Fixed: Use controller directly (don't call it as a function)
router.get("/", getAllCamps);

// 🟢 Top 6 most registered camps
router.get("/top", async (req, res) => {
  console.log("GET /camps/top called");
  try {
    const topCamps = await Camp.find().sort({ participantCount: -1 }).limit(6);
    res.json(topCamps);
  } catch (error) {
    console.error("Error fetching top camps:", error);
    res.status(500).json({ message: "Server error fetching top camps" });
  }
});

// 🔒 Protected Route - fetch one camp by ID
router.get("/:id", verifyJWT, async (req, res) => {
  console.log(`GET /camps/${req.params.id} called by user:`, req.user.email);
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      console.warn("Camp not found with ID:", req.params.id);
      return res.status(404).json({ error: "Camp not found" });
    }
    res.json(camp);
  } catch (err) {
    console.error("❌ Error fetching camp:", err.message);
    res.status(500).json({ error: "Server error fetching camp" });
  }
});

// 🔒 Protected GET all registrations for an organizer (secure!)
router.get('/organizer/:email', verifyJWT, async (req, res) => {
  const requestedEmail = req.params.email.toLowerCase();
  const loggedInEmail = req.user.email.toLowerCase();

  console.log(`GET /participantRegistrations/organizer/${requestedEmail} called by:`, loggedInEmail);

  if (requestedEmail !== loggedInEmail) {
    console.warn("Email mismatch! Access denied.");
    return res.status(403).json({ error: "Forbidden: You can only view your own registrations" });
  }

  try {
    const registrations = await ParticipantRegistration.find({ organizerEmail: requestedEmail });
    console.log(`Found ${registrations.length} registrations for organizer ${requestedEmail}`);
    res.json(registrations);
  } catch (err) {
    console.error("❌ Error fetching registrations:", err.message);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// 🔒 Organizer-only: Create a camp
router.post('/', verifyJWT, async (req, res) => {
  const user = req.user;
  console.log(`POST /camps called by user: ${user.email}, role: ${user.role}`);

  if (user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can create camps' });
  }

  const {
    campName, image, campFees, dateTime,
    location, healthcareProfessional, description, organizerEmail
  } = req.body;

  if (!campName || !image || !campFees || !dateTime || !location || !healthcareProfessional || !description || !organizerEmail) {
    return res.status(400).json({ error: '❌ All fields are required' });
  }

  if (organizerEmail.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({ error: 'Organizer email mismatch' });
  }

  try {
    const camp = new Camp({
      ...req.body,
      participantCount: 0,
    });
    await camp.save();
    console.log('Camp created:', camp._id);
    res.status(201).json({ message: '✅ Camp created successfully', camp });
  } catch (error) {
    console.error('Error saving camp:', error.message);
    res.status(500).json({ error: 'Server error while saving camp' });
  }
});

// 🔒 Organizer-only: Update a camp
router.put('/update-camp/:campId', verifyJWT, async (req, res) => {
  const { campId } = req.params;
  const user = req.user;
  console.log(`PUT /camps/update-camp/${campId} called by user: ${user.email}`);

  if (user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can update camps' });
  }

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ error: 'Camp not found' });
    }
    if (camp.organizerEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'You can only update your own camps' });
    }

    const updated = await Camp.findByIdAndUpdate(campId, req.body, { new: true });
    console.log('Camp updated:', updated._id);
    res.json({ message: 'Camp updated', updated });
  } catch (err) {
    console.error('Failed to update camp:', err.message);
    res.status(500).json({ error: 'Failed to update camp' });
  }
});

// 🔒 Organizer-only: Delete a camp
router.delete('/delete-camp/:campId', verifyJWT, async (req, res) => {
  const { campId } = req.params;
  const user = req.user;
  console.log(`DELETE /camps/delete-camp/${campId} called by user: ${user.email}`);

  if (user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only organizers can delete camps' });
  }

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ error: 'Camp not found' });
    }
    if (camp.organizerEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'You can only delete your own camps' });
    }

    await Camp.findByIdAndDelete(campId);
    console.log('Camp deleted:', campId);
    res.json({ message: 'Camp deleted' });
  } catch (err) {
    console.error('Failed to delete camp:', err.message);
    res.status(500).json({ error: 'Failed to delete camp' });
  }
});

// 🔧 Route - Increment participant count (leave as is)
router.patch("/increment/:id", incrementParticipantCount);

module.exports = router;







