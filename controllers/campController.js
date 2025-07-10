const Camp = require("../models/camp");
const mongoose = require("mongoose");

// ✅ Get all camps
const getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find();
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};

// ✅ Get camp by ID
const getCampById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid camp ID" });
  }

  try {
    const camp = await Camp.findById(id);
    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }
    res.json(camp);
  } catch (err) {
    console.error("❌ Error getting camp by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllCamps, getCampById };





