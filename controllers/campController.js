const Camp = require("../models/camp");

const getAllCamps = async (req, res) => {
  try {
    // Fetch all camps, sorted by participantCount descending
    const camps = await Camp.find().sort({ participantCount: -1 });
    res.status(200).json(camps);
  } catch (error) {
    console.error("Error fetching camps:", error);  // fixed error logging here
    res.status(500).json({ error: "Failed to fetch camps" });
  }
};

module.exports = { getAllCamps };



