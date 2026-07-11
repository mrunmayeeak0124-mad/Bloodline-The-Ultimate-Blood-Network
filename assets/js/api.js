// --- CENTRAL BLOODLINE NETWORK GATEWAY ---
const API_BASE_URL = 'http://localhost:5000/api';

const BloodLineAPI = {
  
  /** 1. Pushes new donor registrations into MongoDB */
  registerDonor: async (donorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/donors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
      });
      return await response.json();
    } catch (error) {
      console.error("Donor signup network error:", error);
      return { success: false, error: "Network disconnect" };
    }
  },

  /** 2. Dispatches priority alert tickets */
  broadcastEmergency: async (requestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      return await response.json();
    } catch (error) {
      console.error("Emergency broadcast network error:", error);
      return { success: false, error: "Network disconnect" };
    }
  },

  /** 3. Queries active matching pools */
  queryMatchmaker: async (bloodGroup) => {
    try {
      const response = await fetch(`${API_BASE_URL}/matchmaker/query?bloodGroup=${encodeURIComponent(bloodGroup)}`);
      return await response.json();
    } catch (error) {
      console.error("Matchmaker engine query error:", error);
      return { success: false, error: "Network disconnect" };
    }
  }, // 🔴 Kept the comma here to continue the object!

  /** 4. Pushes new patient intake data profiles into MongoDB */
  registerPatient: async (patientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      return await response.json();
    } catch (error) {
      console.error("Patient signup network error:", error);
      return { success: false, error: "Network disconnect" };
    }
  }, // 🔴 Changed semicolon to a comma here

  /** 5. Commits new container serial numbers to repository arrays */
  addNewBloodBag: async (bagPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/add-bag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bagPayload)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Network communication error loop link" };
    }
  },

  /** 6. Retrieves central telemetry stock data metrics profiles */
  fetchInventoryAudit: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/audit`);
      return await response.json();
    } catch (error) {
      return { success: false, error: "Network communication error loop link" };
    }
  },

  /** 7. Locks dynamic donor-to-receiver ledger links permanently */
  executeChainTransaction: async (txPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/dispatch-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txPayload)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Network communication error loop link" };
    }
  }
}; // 🟢 The object safely closes at the absolute bottom now!