const mongoose = require("mongoose");

const campSchema = new mongoose.Schema({
  campName: String,
  image: String,
  campFees: Number,
  dateTime: String,
  location: String,
  healthcareProfessional: String,
  participantCount: {
    type: Number,
    default: 0,
  },
  description: String,
}, { timestamps: true });

// 3rd param "available-camps" binds model to the exact collection name in MongoDB
const Camp = mongoose.model("Camp", campSchema, "availableCamps");

module.exports = Camp;


