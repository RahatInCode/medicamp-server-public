const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  image: String,
});

module.exports = mongoose.model("Organizer", organizerSchema);
