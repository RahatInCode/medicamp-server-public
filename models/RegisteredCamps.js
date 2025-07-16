const mongoose = require('mongoose');

const RegisteredCampSchema = new mongoose.Schema({
  campName: String,
  email: String,
  campFees: Number,
  paymentStatus: String,
  confirmationStatus: String,
  transactionId: String,
  feedbackGiven: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('RegisteredCamp', RegisteredCampSchema);
