const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
  campName: String,
  campFees: Number,
  location: String,
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

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ParticipantRegistration', registrationSchema);

