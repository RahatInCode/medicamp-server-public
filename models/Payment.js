const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  registeredCampId: String,
  transactionId: String,
  status: String,
  timestamp: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
