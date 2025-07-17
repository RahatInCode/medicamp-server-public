// models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  participantName: { type: String, required: true },
  participantEmail: { type: String, required: true },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
