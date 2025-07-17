const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
  campName: String,
  campFees: Number,
  location: String,
  participantImage: String,
  healthcareProfessional: String,

  participantName: String,
  participantEmail: String,
  age: Number,
  phone: String,
  gender: String,
  emergencyContact: String,

  organizerEmail: {
    type: String,
    required: true,
  },

  // 🔥 Add these fields for payment tracking
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
  transactionId: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  feedback: String,
rating: Number,
feedbackGiven: {
  type: Boolean,
  default: false,
}

});

module.exports = mongoose.model('ParticipantRegistration', registrationSchema);


