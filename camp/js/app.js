document.addEventListener("DOMContentLoaded", () => {
    // DATABASE & GLOBAL STATE VARIABLES
    let campsHistory = [];
    let currentCamp = null;
    let donorsArray = [];

    // Helper function to fetch initial camp state from MongoDB
    async function loadCampsFromDatabase() {
        try {
            const response = await fetch("http://localhost:5000/api/camps");
            const result = await response.json();
            
            if (result.success) {
                currentCamp = result.activeCamp || null;
                donorsArray = currentCamp ? currentCamp.donors : [];
                campsHistory = result.archives || [];
                
                initializeLiveTrackerUI();
                recalculateDashboardMetrics();
            }
        } catch (error) {
            console.error("Error fetching camp data:", error);
        }
    }

    // SELECTORS
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".page-section");
    const scheduleForm = document.getElementById("camp-schedule-form");
    const donorForm = document.getElementById("donor-log-form");
    const toast = document.getElementById("toast");
    const endDriveBtn = document.getElementById("end-drive-btn");

    // WELCOME SPLASH
    const welcomeScreen = document.getElementById("welcome-screen");
    const enterSystemBtn = document.getElementById("enter-system-btn");

    if (enterSystemBtn && welcomeScreen) {
        enterSystemBtn.addEventListener("click", () => {
            welcomeScreen.classList.add("fade-out");
        });
    }

    // DASHBOARD STAT COUNTERS
    const dashTotalCollected = document.getElementById("dash-total-collected");
    const dashScheduledCount = document.getElementById("dash-scheduled-count");
    const dashSuccessRate = document.getElementById("dash-success-rate");

    // ACTIVE CAMP LIVE ELEMENTS
    const noCampWarning = document.getElementById("no-camp-warning");
    const activeCampDashboard = document.getElementById("active-camp-dashboard");
    const activeCampBadge = document.getElementById("active-camp-badge");

    const liveVenueDisplay = document.getElementById("live-venue-display");
    const liveConductorDisplay = document.getElementById("live-conductor-display");
    const liveTimeDisplay = document.getElementById("live-time-display");
    const liveTargetDisplay = document.getElementById("live-target-display");

    const liveProgressBar = document.getElementById("live-progress-bar");
    const liveProgressText = document.getElementById("live-progress-text");
    const liveProgressPercentage = document.getElementById("live-progress-percentage");
    const liveLogCount = document.getElementById("live-log-count");
    const donorListBody = document.getElementById("donor-list-body");

    // MODALS
    const infoModal = document.getElementById("info-modal");
    const modalText = document.getElementById("modal-text");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const modalOkBtn = document.getElementById("modal-ok-btn");
    const popTriggers = document.querySelectorAll(".pop-trigger");

    // ARCHIVE SYSTEM CONTAINER
    const historyContainer = document.getElementById("history-container");

    /* ================= 1. SYSTEM ROUTING SWITCHER ================= */
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const target = button.getAttribute("data-target");
            navButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            sections.forEach(sec => {
                sec.classList.remove("active");
                if(sec.id === target) {
                    setTimeout(() => { sec.classList.add("active"); }, 50);
                }
            });

            // If history tab is opened, draw history dynamically
            if (target === "history") {
                renderHistory();
            }
        });
    });

    /* ================= 2. MODAL & ALERTS SYSTEM ================= */
    function showModal(message) {
        modalText.textContent = message;
        infoModal.classList.add("active");
    }

    function closeModal() { infoModal.classList.remove("active"); }

    popTriggers.forEach(card => {
        card.addEventListener("click", () => {
            showModal(card.getAttribute("data-info"));
        });
    });

    closeModalBtn.addEventListener("click", closeModal);
    modalOkBtn.addEventListener("click", closeModal);
    infoModal.addEventListener("click", (e) => { if(e.target === infoModal) closeModal(); });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }

    /* ================= 3. SYSTEM METRICS CALCULATIONS ================= */
    function recalculateDashboardMetrics() {
        let totalCollectedSum = 0;
        let totalSuccessRatesSum = 0;

        campsHistory.forEach(camp => {
            const actual = camp.donors ? camp.donors.length : 0;
            const target = camp.targetUnits || 1;
            totalCollectedSum += actual;
            
            const targetRate = Math.min(Math.round((actual / target) * 100), 100);
            totalSuccessRatesSum += targetRate;
        });

        const successRateAverage = campsHistory.length > 0 
            ? Math.round(totalSuccessRatesSum / campsHistory.length) 
            : 0;

        dashTotalCollected.textContent = `${totalCollectedSum} Units`;
        dashSuccessRate.textContent = `${successRateAverage}%`;
        dashScheduledCount.textContent = currentCamp ? "1 Active Camp" : "0 Camps";
    }

    /* ================= 4. CAMP INITIALIZER / SCHEDULER ================= */
    scheduleForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (currentCamp) {
            showModal("You have an ongoing active camp. Please complete the current camp's session before scheduling a new one.");
            return;
        }

        const campData = {
            conductor: document.getElementById("conductor").value,
            venue: document.getElementById("venue").value,
            date: document.getElementById("camp-date").value,
            time: `${document.getElementById("start-time").value} - ${document.getElementById("end-time").value}`,
            targetUnits: parseInt(document.getElementById("target-donors").value),
            notes: document.getElementById("camp-notes").value
        };

        try {
            const response = await fetch("http://localhost:5000/api/camps/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campData)
            });
            const result = await response.json();

            if (result.success) {
                showToast("Camp registered and loaded into Database!");
                scheduleForm.reset();
                await loadCampsFromDatabase();
                
                // Redirect automatically to live tracker
                setTimeout(() => { document.querySelector('[data-target="live-tracker"]').click(); }, 800);
            } else {
                showModal(result.message);
            }
        } catch (error) {
            showModal("Failed to connect to backend server.");
        }
    });

    function initializeLiveTrackerUI() {
        if (!currentCamp) {
            noCampWarning.style.display = "flex";
            activeCampDashboard.style.display = "none";
            activeCampBadge.classList.remove("active");
            activeCampBadge.classList.add("inactive");
            activeCampBadge.textContent = "System Idle (No Active Camp)";
            return;
        }

        noCampWarning.style.display = "none";
        activeCampDashboard.style.display = "block";
        activeCampBadge.classList.remove("inactive");
        activeCampBadge.classList.add("active");
        activeCampBadge.innerHTML = `<i class="fa-solid fa-circle"></i> Live Active Camp`;

        liveVenueDisplay.textContent = currentCamp.venue;
        liveConductorDisplay.textContent = currentCamp.conductor;
        liveTimeDisplay.textContent = `${currentCamp.date} (${currentCamp.time})`;
        liveTargetDisplay.textContent = `${currentCamp.targetUnits} Units`;

        updateLiveProgress();
        renderLiveDonorsTable();
    }

    /* ================= 5. DONOR INGESTION OPERATIONS ================= */
    donorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!currentCamp) {
            showModal("An active scheduled session is required before checking in donors.");
            return;
        }

        const donorData = {
            name: document.getElementById("donor-name").value,
            phone: document.getElementById("donor-phone").value,
            address: document.getElementById("donor-address").value,
            bloodGroup: document.getElementById("blood-group").value
        };

        try {
            const response = await fetch(`http://localhost:5000/api/camps/${currentCamp._id}/donor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(donorData)
            });
            const result = await response.json();

            if (result.success) {
                showToast(`Registered unit: ${donorData.name} (${donorData.bloodGroup})`);
                donorForm.reset();
                await loadCampsFromDatabase();
            } else {
                showModal(result.message);
            }
        } catch (error) {
            showModal("Error saving donor entry to cloud database.");
        }
    });

    function renderLiveDonorsTable() {
        if (donorsArray.length === 0) {
            donorListBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted)">No donors checked-in yet.</td></tr>`;
            return;
        }

        donorListBody.innerHTML = "";
        for (let i = donorsArray.length - 1; i >= 0; i--) {
            const donor = donorsArray[i];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${donor.name}</strong></td>
                <td>${donor.phone}</td>
                <td><span class="history-badge">${donor.bloodGroup}</span></td>
                <td>${donor.checkInTime || 'N/A'}</td>
            `;
            donorListBody.appendChild(row);
        }
    }

    function updateLiveProgress() {
        if (!currentCamp) return;

        const count = donorsArray.length;
        const target = currentCamp.targetUnits;
        const percent = Math.min(Math.round((count / target) * 100), 100);

        liveLogCount.textContent = count;
        liveProgressText.textContent = `${count} / ${target} Units Logged`;
        liveProgressPercentage.textContent = `${percent}%`;
        liveProgressBar.style.width = `${percent}%`;

        if (count === target && count > 0) {
            showModal(`Success! You have completed the scheduled target profile of ${target} blood collection bags successfully!`);
        }
    }

    /* ================= 6. SESSION ARCHIVAL ENGINE ================= */
    endDriveBtn.addEventListener("click", async () => {
        if (!currentCamp) return;

        if (confirm("Are you sure you want to end this drive? This session will be completed and archived.")) {
            try {
                const response = await fetch(`http://localhost:5000/api/camps/${currentCamp._id}/end`, {
                    method: "PUT"
                });
                const result = await response.json();

                if (result.success) {
                    await loadCampsFromDatabase();
                    showModal(`Drive successfully finalized! All blood units collected in this camp have been locked and saved.`);
                    showToast("Session safely archived.");
                    document.querySelector('[data-target="dashboard"]').click();
                }
            } catch (error) {
                showModal("Error closing drive session on server.");
            }
        }
    });

    /* ================= 7. DYNAMIC HISTORY VIEW RENDERING ================= */
    function renderHistory() {
        if (campsHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-history-view">
                    <i class="fa-solid fa-folder-open"></i>
                    <h2>No Session Logs Found</h2>
                    <p>Complete and finalize an active tracking session in order to build secure physical archives.</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = "";

        campsHistory.forEach(camp => {
            const card = document.createElement("div");
            card.className = "history-card";
            
            let donorRows = "";
            if (!camp.donors || camp.donors.length === 0) {
                donorRows = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No donors were logged in this camp session.</td></tr>`;
            } else {
                camp.donors.forEach((donor, idx) => {
                    donorRows += `
                        <tr>
                            <td><strong>${idx + 1}</strong></td>
                            <td><strong>${donor.name}</strong></td>
                            <td>${donor.phone}</td>
                            <td>${donor.address}</td>
                            <td><span class="history-badge">${donor.bloodGroup}</span></td>
                        </tr>
                    `;
                });
            }

            const actualCount = camp.donors ? camp.donors.length : 0;
            const successPct = Math.min(Math.round((actualCount / camp.targetUnits) * 100), 100);

            card.innerHTML = `
                <div class="history-card-header">
                    <div class="history-card-info">
                        <h3>${camp.venue}</h3>
                        <p><i class="fa-solid fa-user-doctor"></i> Conductor: ${camp.conductor} &bull; <i class="fa-solid fa-calendar"></i> Date: ${camp.date} (${camp.time})</p>
                    </div>
                    <div class="history-card-meta">
                        <span class="history-badge">Target Met: ${successPct}%</span>
                        <span class="history-badge" style="background-color: var(--primary-red-light); color: var(--primary-red);"><i class="fa-solid fa-droplet"></i> ${actualCount} / ${camp.targetUnits} Units</span>
                        <i class="fa-solid fa-chevron-down toggle-arrow"></i>
                    </div>
                </div>
                <div class="history-card-details">
                    <h4 style="margin-bottom: 1rem; color: var(--dark-slate); font-size:1.1rem;"><i class="fa-solid fa-users"></i> Session Donor Roster</h4>
                    <div class="donor-log-wrapper" style="max-height: none;">
                        <table class="donor-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Donor Name</th>
                                    <th>Phone Number</th>
                                    <th>Home Address</th>
                                    <th>Blood Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${donorRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            const header = card.querySelector(".history-card-header");
            header.addEventListener("click", () => {
                card.classList.toggle("open");
            });

            historyContainer.appendChild(card);
        });
    }

    // RUN ON LOAD
    loadCampsFromDatabase();
});