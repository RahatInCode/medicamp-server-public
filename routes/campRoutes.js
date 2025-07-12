const express = require("express");
const router = express.Router();
const Camp = require("../models/camp");
const verifyJWT = require("../middlewares/verifyFirebaseJWT");
const {
  getAllCamps,
  getCampById,
  incrementParticipantCount,
} = require("../controllers/campController");

// 🟢 Public Route - fetch all camps
router.get("/", getAllCamps);

// 🟢 Public Route - Top 6 most registered camps
router.get("/top", async (req, res) => {
  try {
    const topCamps = await Camp.find().sort({ participantCount: -1 }).limit(6);
    res.json(topCamps);
  } catch (error) {
    console.error("Error fetching top camps:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔒 Optionally Protected Route - fetch one camp by ID
// 👉 Change this to match frontend: /availableCamps/:id
router.get("/:id", getCampById, verifyJWT,   async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    res.json(camp);
  } catch (err) {
    console.error("❌ Error fetching camp:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔧 Route - Increment participant count
router.patch("/increment/:id", incrementParticipantCount);

module.exports = router;






