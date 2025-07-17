const mongoose = require('mongoose');

const RegisteredCampSchema = new mongoose.Schema({
  campName: { type: String, required: true },
  email: { type: String, required: true }, // user email or userId if preferred
  campFees: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  confirmationStatus: {
    type: String,
    enum: ['Pending', 'Confirmed'],
    default: 'Pending',
  },
  transactionId: { type: String },

  feedbackGiven: { type: Boolean, default: false },

  cancelled: { type: Boolean, default: false },  // ADD cancellation flag

}, { timestamps: true });

module.exports = mongoose.model('RegisteredCamp', RegisteredCampSchema);

