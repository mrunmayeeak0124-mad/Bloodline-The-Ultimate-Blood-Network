const mongoose = require('mongoose');

// Schema for individual donors checked into a camp session
const CampDonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  checkInTime: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
});

// Schema for the Camp Event itself
const CampSchema = new mongoose.Schema({
  conductor: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  targetUnits: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  donors: [CampDonorSchema]
}, { timestamps: true });

module.exports = mongoose.model('Camp', CampSchema);