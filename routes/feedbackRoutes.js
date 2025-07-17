const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyFirebaseJWT');
const Feedback = require('../models/feedback');

router.post('/', verifyJWT, async (req, res) => {
  const user = req.user;
  if (user.role !== 'participant') {
    return res.status(403).json({ error: "Only participants can submit feedback" });
  }

  const { campId, rating, feedback } = req.body;
  if (!campId || !rating || !feedback) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Check if participant already gave feedback for this camp
    const existing = await Feedback.findOne({
      campId,
      participantEmail: user.email.toLowerCase(),
    });
    if (existing) {
      return res.status(400).json({ error: "Feedback already submitted for this camp" });
    }

    const newFeedback = new Feedback({
      participantName: user.name || user.email, // adjust if name available in user
      participantEmail: user.email.toLowerCase(),
      campId,
      rating,
      feedback,
    });

    await newFeedback.save();

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.participantEmail) {
      query.participantEmail = req.query.participantEmail.toLowerCase();
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
