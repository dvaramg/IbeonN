// models/Participation.js
const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema({
  username: String,
  eventName: String,
  eventId: String,
  location: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Participation", participationSchema);