const mongoose = require('mongoose');

const EmergencyRequestSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  bloodGroupNeeded: { type: String, required: true },
  unitsRequired: { type: Number, required: true, default: 1 },
  hospitalName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  urgencyContext: { type: String },
  status: { type: String, enum: ['Pending', 'Relayed', 'Fulfilled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);