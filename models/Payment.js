const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  participantRegistrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParticipantRegistration',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Failed'],
    default: 'Paid',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
