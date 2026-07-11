const mongoose = require('mongoose');

const BloodBagSchema = new mongoose.Schema({
  bagSerialNumber: { type: String, required: true, unique: true },
  bloodGroup: { type: String, required: true },
  volumeMl: { type: Number, default: 450 }, // Standard whole blood bag unit size
  collectedDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true },
  storageComponent: { type: String, enum: ['Whole Blood', 'Packed Red Cells', 'Plasma', 'Platelets'], default: 'Whole Blood' },
  status: { type: String, enum: ['Available', 'Reserved', 'Dispatched', 'Expired'], default: 'Available' },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  assignedBankFacility: { type: String, required: true }
});

module.exports = mongoose.model('BloodBag', BloodBagSchema);