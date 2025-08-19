const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyFirebaseJWT");
const Feedback = require("../models/feedback");

// ✅ Submit feedback (participants only)
router.post("/", verifyJWT, async (req, res) => {
  const user = req.user;
  if (user.role !== "participant") {
    return res.status(403).json({ error: "Only participants can submit feedback" });
  }

  const { campId, rating, feedback } = req.body;
  if (!campId || !rating || !feedback) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Prevent duplicate feedback for same camp
    const existing = await Feedback.findOne({
      campId,
      participantEmail: user.email.toLowerCase(),
    });
    if (existing) {
      return res.status(400).json({ error: "Feedback already submitted for this camp" });
    }

    const newFeedback = new Feedback({
      participantName: user.name || user.email,
      participantEmail: user.email.toLowerCase(),
      campId,
      rating,
      feedback,
      approved: false, // pending by default
    });

    await newFeedback.save();
    res.json({ message: "Feedback submitted successfully, pending organizer approval" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get feedbacks for a participant (by email)
router.get("/", verifyJWT, async (req, res) => {
  try {
    const userEmail = req.query.participantEmail?.toLowerCase();
    if (!userEmail) return res.status(400).json({ error: "Email is required" });

    const feedbacks = await Feedback.find({ participantEmail: userEmail }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get ALL feedbacks (organizer dashboard) - pending + approved
router.get("/manage", verifyJWT, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "organizer") return res.status(403).json({ error: "Unauthorized" });

    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get only pending feedbacks (organizer dashboard)
router.get("/pending", verifyJWT, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "organizer") return res.status(403).json({ error: "Unauthorized" });

    const feedbacks = await Feedback.find({ approved: false }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Approve feedback (organizer only)
router.patch("/approve/:id", verifyJWT, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "organizer") {
      return res.status(403).json({ error: "Only organizers can approve feedbacks" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });

    feedback.approved = true;
    await feedback.save();

    res.json({ message: "Feedback approved", feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete feedback (organizer only)
router.delete("/:id", verifyJWT, async (req, res) => {
  const user = req.user;
  if (user.role !== "organizer") {
    return res.status(403).json({ error: "Only organizers can delete feedbacks" });
  }

  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Get both approved and pending feedbacks (public or restricted based on your choice)
router.get("/approved-pending", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      approved: { $in: [true, false] }  // basically both
    }).sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching approved + pending feedbacks:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;


