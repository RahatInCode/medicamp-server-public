const express = require("express");
const router = express.Router();
const Camp = require("../models/camp");
const ParticipantRegistration = require("../models/ParticipantRegistration");
const verifyJWT = require("../middlewares/verifyFirebaseJWT");
const { getAllCamps, incrementParticipantCount } = require("../controllers/campController");

// Public route: get all camps
router.get("/", getAllCamps);

// Public route: get top 6 camps by participant count
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

// Protected route: get camp by ID
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
    console.error("Error fetching camp:", err.message);
    res.status(500).json({ error: "Server error fetching camp" });
  }
});

// Organizer-only: create a new camp
router.post("/", verifyJWT, async (req, res) => {
  const user = req.user;
  console.log(`POST /camps called by user: ${user.email}, role: ${user.role}`);

  if (user.role !== "organizer") {
    return res.status(403).json({ error: "Only organizers can create camps" });
  }

  const {
    campName,
    image,
    campFees,
    dateTime,
    location,
    healthcareProfessional,
    description,
  } = req.body;

  const camp = new Camp({
    campName,
    image,
    campFees,
    dateTime,
    location,
    healthcareProfessional,
    description,
    organizerEmail: user.email,
    participantCount: 0,
  });

  try {
    await camp.save();
    console.log("Camp created:", camp._id);
    res.status(201).json({ message: "Camp created successfully", camp });
  } catch (error) {
    console.error("Error saving camp:", error.message);
    res.status(500).json({ error: "Server error while saving camp" });
  }
});

// Organizer-only: update a camp
router.put("/update-camp/:campId", verifyJWT, async (req, res) => {
  const { campId } = req.params;
  const user = req.user;

  console.log(`PUT /camps/update-camp/${campId} called by user: ${user.email}`);

  if (user.role !== "organizer") {
    return res.status(403).json({ error: "Only organizers can update camps" });
  }

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    if (camp.organizerEmail.toLowerCase() !== user.email.toLowerCase()) {
      console.log("Organizer mismatch:", camp.organizerEmail, user.email);
      return res.status(403).json({ error: "You can only update your own camps" });
    }

    const updated = await Camp.findByIdAndUpdate(campId, req.body, { new: true });
    console.log("Camp updated:", updated._id);
    res.json({ message: "Camp updated", updated });
  } catch (err) {
    console.error("Failed to update camp:", err.message);
    res.status(500).json({ error: "Failed to update camp" });
  }
});

// Organizer-only: delete a camp
router.delete("/delete-camp/:campId", verifyJWT, async (req, res) => {
  const { campId } = req.params;
  const user = req.user;

  console.log(`DELETE /camps/delete-camp/${campId} called by user: ${user.email}`);

  if (user.role !== "organizer") {
    return res.status(403).json({ error: "Only organizers can delete camps" });
  }

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    if (camp.organizerEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: "You can only delete your own camps" });
    }

    await Camp.findByIdAndDelete(campId);
    console.log("Camp deleted:", campId);
    res.json({ message: "Camp deleted" });
  } catch (err) {
    console.error("Failed to delete camp:", err.message);
    res.status(500).json({ error: "Failed to delete camp" });
  }
});

// Increment participant count
router.patch("/increment/:id", incrementParticipantCount);

module.exports = router;








