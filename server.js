require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- 🟢 ALL MODELS CONSOLIDATED UNIFIED AT THE TOP ---
const Donor = require('./models/Donor');
const EmergencyRequest = require('./models/EmergencyRequest');
const Patient = require('./models/Patient'); 
const BloodBag = require('./models/BloodBag');
const Transaction = require('./models/Transaction');
const Camp = require('./models/Camp'); // Cleanly imported here

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares Processing Engine Layers ---
app.use(cors());
app.use(bodyParser.json());

// --- Database Connectivity Gateway Handshake ---
const DB_URL = process.env.MONGO_URI;
mongoose.connect(DB_URL)
  .then(() => console.log('🚀 BloodLine Matrix Securely Connected to MongoDB Cloud Atlas Layer.'))
  .catch(err => console.error('Database connection breakdown error string:', err));

// --- Biological Matrix Cross-Reference Mapping Configuration ---
const compatibilityMap = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-']
};

// ==========================================
// 🛠️ API ENDPOINTS & LOGIC TRAFFIC HANDLERS
// ==========================================

/**
 * Endpoint 1: Register Donor & Save Profile Record
 */
app.post('/api/donors/register', async (req, res) => {
  try {
    const newDonor = new Donor(req.body);
    const savedDonor = await newDonor.save();
    res.status(201).json({ success: true, message: 'Donor registered successfully', data: savedDonor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 2: Dispatch Emergency Request ticket
 */
app.post('/api/requests/broadcast', async (req, res) => {
  try {
    const ticketCode = "EM-" + Math.floor(10000 + Math.random() * 90000);
    const requestData = { ...req.body, ticketId: ticketCode };
    
    const newRequest = new EmergencyRequest(requestData);
    const savedRequest = await newRequest.save();
    res.status(201).json({ success: true, ticketId: ticketCode, data: savedRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 3: Main Algorithmic AI Search Engine API Point
 */
app.get('/api/matchmaker/query', async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    if (!bloodGroup) {
      return res.status(400).json({ success: false, message: 'Required parameter target bloodGroup missing.' });
    }

    const matchingBloodGroups = compatibilityMap[bloodGroup];
    if (!matchingBloodGroups) {
      return res.status(400).json({ success: false, message: 'Invalid target blood group parameter typed.' });
    }

    const optimizedMatches = await Donor.find({
      bloodGroup: { $in: matchingBloodGroups },
      isEligible: true
    }).select('-email -emergencyContact');

    res.status(200).json({ success: true, matchesLocatedCount: optimizedMatches.length, matches: optimizedMatches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 4: Register Patient & Save to Database Layer
 */
app.post('/api/patients/register', async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json({ success: true, message: 'Patient registered successfully', patientId: savedPatient._id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 5: INTAKE - Add New Blood Bag to Stock
 */
app.post('/api/inventory/add-bag', async (req, res) => {
  try {
    const { bloodGroup, donorId, assignedBankFacility, volumeMl, storageComponent, collectedDate } = req.body;
    const serialCode = "BB-" + Math.floor(100000 + Math.random() * 900000);
    const collection = collectedDate ? new Date(collectedDate) : new Date();
    
    const expiry = new Date(collection);
    expiry.setDate(collection.getDate() + 42);

    const newBag = new BloodBag({
      bagSerialNumber: serialCode,
      bloodGroup,
      volumeMl,
      storageComponent,
      collectedDate: collection,
      expiryDate: expiry,
      donorId,
      assignedBankFacility
    });

    const savedBag = await newBag.save();
    res.status(201).json({ success: true, message: 'Blood Bag logged successfully.', data: savedBag });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 6: DIAGNOSTICS - Check Stock Analytics
 */
app.get('/api/inventory/audit', async (req, res) => {
  try {
    const today = new Date();

    await BloodBag.updateMany(
      { expiryDate: { $lt: today }, status: 'Available' },
      { $set: { status: 'Expired' } }
    );

    const availableReserves = await BloodBag.find({ status: 'Available' }).sort({ expiryDate: 1 });
    const rareGroupsList = ['O-', 'AB-', 'A-', 'B-'];
    const rareReservesCount = await BloodBag.countDocuments({ bloodGroup: { $in: rareGroupsList }, status: 'Available' });

    res.status(200).json({
      success: true,
      totalActiveBags: availableReserves.length,
      rareAlertStockCount: rareReservesCount,
      inventory: availableReserves
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 7: TRANSFER - Finalize Donor-to-Receiver Transaction Hook
 */
app.post('/api/inventory/dispatch-transaction', async (req, res) => {
  try {
    const { donorId, patientId, bagSerialNumberUsed, receivingHospital, medicalSupervisorSign } = req.body;

    const targetBag = await BloodBag.findOne({ bagSerialNumber: bagSerialNumberUsed, status: 'Available' });
    if (!targetBag) {
      return res.status(404).json({ success: false, message: 'Target serial code bag unavailable, allocated, or expired.' });
    }

    targetBag.status = 'Dispatched';
    await targetBag.save();

    const transactionCode = "TX-" + Math.floor(10000 + Math.random() * 90000);
    const logEntry = new Transaction({
      transactionId: transactionCode,
      donorId,
      patientId,
      bagSerialNumberUsed,
      receivingHospital,
      medicalSupervisorSign
    });

    const savedTransaction = await logEntry.save();
    res.status(201).json({ success: true, message: 'Chain-of-Custody logged successfully.', transaction: savedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 8: REMOVE - Delete Expired/Discarded Container From Database
 */
app.delete('/api/inventory/bag/:id', async (req, res) => {
  try {
    const deletedBag = await BloodBag.findByIdAndDelete(req.params.id);
    if (!deletedBag) {
      return res.status(404).json({ success: false, message: "Specified blood container item record not located." });
    }
    res.status(200).json({ success: true, message: "Blood unit package successfully purged from database array stock permanently." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🎪 HEMOFLOW CAMP MANAGEMENT ENDPOINTS
// ==========================================

/**
 * Endpoint 9: Get active camp or archives
 */
app.get('/api/camps', async (req, res) => {
  try {
    const activeCamp = await Camp.findOne({ status: 'Active' });
    const completedCamps = await Camp.find({ status: 'Completed' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, activeCamp, archives: completedCamps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 10: Schedule & Initialize a new Blood Camp
 */
app.post('/api/camps/schedule', async (req, res) => {
  try {
    const existingActive = await Camp.findOne({ status: 'Active' });
    if (existingActive) {
      return res.status(400).json({ success: false, message: 'An active camp session is already running.' });
    }
    const newCamp = new Camp(req.body);
    const savedCamp = await newCamp.save();
    res.status(201).json({ success: true, camp: savedCamp });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 11: Log a Donor into the Active Camp Session
 */
app.post('/api/camps/:campId/donor', async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.campId);
    if (!camp || camp.status !== 'Active') {
      return res.status(404).json({ success: false, message: 'No active camp session found.' });
    }
    
    camp.donors.push(req.body);
    await camp.save();

    res.status(200).json({ success: true, camp });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint 12: Complete & Archive the Active Camp
 */
app.put('/api/camps/:campId/end', async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.campId);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp record not located.' });

    camp.status = 'Completed';
    await camp.save();

    res.status(200).json({ success: true, message: 'Camp drive finalized and archived securely.', camp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 🔵 THE APPLISTEN TUNNEL SECURED AT THE ABSOLUTE BOTTOM ---
app.listen(PORT, () => {
  console.log(`📡 BloodLine Operational Base running across network entry port: ${PORT}`);
});