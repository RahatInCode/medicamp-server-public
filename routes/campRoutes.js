const express = require("express");
const router = express.Router();
const Camp = require("../models/camp");
const verifyJWT = require("../middlewares/verifyFirebaseJWT");
const {
  getAllCamps,
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
router.get("/:id",  verifyJWT,   async (req, res) => {
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

router.get('/organizer/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;
  const { search = '', sortBy = 'createdAt', page = 1, limit = 10 } = req.query;

  const query = {
    organizerEmail: email,
    campName: { $regex: search, $options: 'i' },
  };

  const sortOptions = {
    campName: 1,
    dateTime: 1,
    createdAt: -1,
  };

  try {
    const camps = await Camp.find(query)
      .sort({ [sortBy]: sortOptions[sortBy] || -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Camp.countDocuments(query);

    res.json({ camps, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizer camps' });
  }
});

router.put('/update-camp/:campId', verifyJWT, async (req, res) => {
  const { campId } = req.params;
  try {
    const updated = await Camp.findByIdAndUpdate(campId, req.body, { new: true });
    res.json({ message: 'Camp updated', updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update camp' });
  }
});

// DELETE /delete-camp/:campId
router.delete('/delete-camp/:campId', verifyJWT, async (req, res) => {
  const { campId } = req.params;
  try {
    await Camp.findByIdAndDelete(campId);
    res.json({ message: 'Camp deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete camp' });
  }
});

router.post('/', async (req, res) => {
  const {
    campName, image, campFees, dateTime,
    location, healthcareProfessional, description, organizerEmail
  } = req.body;

  if (!campName || !image || !campFees || !dateTime || !location || !healthcareProfessional || !description || !organizerEmail) {
    return res.status(400).json({ error: '❌ All fields are required' });
  }

  try {
    const camp = new Camp({
      ...req.body,
      participantCount: 0,
    });
    await camp.save();
    res.status(201).json({ message: '✅ Camp created successfully', camp });
  } catch (error) {
    console.error('Error saving camp:', error.message);
    res.status(500).json({ error: 'Server error while saving camp' });
  }
});

// 🔧 Route - Increment participant count
router.patch("/increment/:id", incrementParticipantCount);

module.exports = router;






