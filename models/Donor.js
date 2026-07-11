const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 65 },
  gender: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  weight: { type: Number, required: true, min: 50 },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  lastDonationDate: { type: Date, default: null },
  availability: { type: String, enum: ['Immediate', 'Weekends Only', 'Evenings Only'], required: true },
  emergencyContact: { type: String, required: true },
  isEligible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', DonorSchema);