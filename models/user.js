// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ['user', 'organizer'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
