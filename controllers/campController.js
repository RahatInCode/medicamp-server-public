const Camp = require("../models/camp");
const mongoose = require("mongoose");

// ✅ Get all camps
const getAllCamps = async (req, res) => {
  console.log("📥 GET /camps called");

  try {
    const camps = await Camp.find();
    console.log(`📦 Found ${camps.length} camps`);
    res.status(200).json(camps);
  } catch (err) {
    console.error("❌ Error fetching all camps:", err.message);
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};

// ✅ Get camp by ID
const getCampById = async (req, res) => {
  const { id } = req.params;
  console.log(`📥 GET /camps/${id} called`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn("⚠️ Invalid ObjectId:", id);
    return res.status(400).json({ message: "Invalid camp ID" });
  }

  try {
    const camp = await Camp.findById(id);
    if (!camp) {
      console.warn("🚫 Camp not found for ID:", id);
      return res.status(404).json({ message: "Camp not found" });
    }

    console.log("✅ Camp found:", camp.campName);
    res.status(200).json(camp);
  } catch (err) {
    console.error("❌ Error fetching camp by ID:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Increment participant count
const incrementParticipantCount = async (req, res) => {
  const { id } = req.params;
  console.log(`🔁 PATCH /camps/increment/${id} called`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn("⚠️ Invalid ObjectId for increment:", id);
    return res.status(400).json({ message: "Invalid camp ID" });
  }

  try {
    const updatedCamp = await Camp.findByIdAndUpdate(
      id,
      { $inc: { participantCount: 1 } },
      { new: true }
    );

    if (!updatedCamp) {
      console.warn("🚫 Camp not found while incrementing:", id);
      return res.status(404).json({ message: "Camp not found" });
    }

    console.log(`✅ Participant count incremented: ${updatedCamp.participantCount}`);
    res.status(200).json({ message: "Participant count updated", updatedCamp });
  } catch (error) {
    console.error("❌ Error incrementing participant count:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCamps,
  getCampById,
  incrementParticipantCount,
};






