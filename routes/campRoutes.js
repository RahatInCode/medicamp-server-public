const express = require("express");
const router = express.Router();
const Camp = require("../models/camp"); // 👈 Add this

const {
  getAllCamps,
  getCampById,
  incrementParticipantCount,
} = require("../controllers/campController");

const verifyFirebaseJWT = require("../middlewares/verifyFirebaseJWT");

// 🟢 Public Route - fetch all camps
router.get("/", getAllCamps);

// 🟢 Public Route - Top 6 most registered camps
router.get('/top', async (req, res) => {
  try {
    const topCamps = await Camp.find()
      .sort({ participantCount: -1 }) // Highest registered first
      .limit(6);
    res.json(topCamps);
  } catch (error) {
    console.error('Error fetching top camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// 🔒 Protected Route - fetch one camp by ID (requires Firebase token)
router.get("/:id", verifyFirebaseJWT, getCampById);



// 🔧 NEW Route - Increment participant count by 1 for a specific camp
router.patch("/increment/:id", incrementParticipantCount);

module.exports = router;





