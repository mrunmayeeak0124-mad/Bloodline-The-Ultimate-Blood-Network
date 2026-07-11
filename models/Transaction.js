const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  bagSerialNumberUsed: { type: String, required: true },
  dispatchDate: { type: Date, default: Date.now },
  receivingHospital: { type: String, required: true },
  medicalSupervisorSign: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', TransactionSchema);