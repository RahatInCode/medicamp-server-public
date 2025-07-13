const mongoose = require("mongoose");

const campSchema = new mongoose.Schema({
  campName: { type: String, required: true },
  image: { type: String, required: true },
  campFees: { type: Number, required: true },
  dateTime: { type: String, required: true },
  location: { type: String, required: true },
  healthcareProfessional: { type: String, required: true },
  participantCount: {
    type: Number,
    default: 0,
  },
  description: { type: String, required: true },

  organizerEmail: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// ⛑️ Prevent OverwriteModelError
const Camp = mongoose.models.Camp || mongoose.model("Camp", campSchema, "availableCamps");

module.exports = Camp;




