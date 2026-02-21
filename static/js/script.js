/**
 * URBAN SAFE - Integrated Core Logic
 * Bridges the Frontend UI with the Flask Backend API and Interactive Mapping.
 */

// 1. Configuration
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * 2. Map Initialization
 * Renders the interactive map to help citizens pinpoint hazards.
 */
// Initialize Map (Centered on a sample city coordinate)
const map = L.map('map').setView([23.2599, 77.4126], 13); 

setTimeout(() => {
    map.invalidateSize();
}, 100);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

// Capture click location to pinpoint the safety issue
map.on('click', function(e) {
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng, {draggable: true}).addTo(map);
    }
    // Store coordinates in hidden inputs for the backend payload
    document.getElementById('lat').value = e.latlng.lat;
    document.getElementById('lng').value = e.latlng.lng;
});

/**
 * 3. Report Submission Logic
 * Handles the citizen reporting flow: data collection -> API call -> UI feedback
 */
document.getElementById('reportForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Prepare data from form inputs including the new map coordinates
    const payload = {
        issueType: document.getElementById('issueType').value,
        ward: document.getElementById('ward').value,
        areaName: document.getElementById('areaName').value,
        severity: document.getElementById('severity').value,
        lat: document.getElementById('lat').value, // Captured from Map
        lng: document.getElementById('lng').value  // Captured from Map
    };

    // UI Feedback: Disable button while processing
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/submit-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            handleSuccess(result.tracking_id);
            // Reset marker after successful submission
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
        } else {
            throw new Error(result.error || "Server error");
        }
    } catch (error) {
        console.error("Submission Error:", error);
        alert("Server not connected. Make sure app.py is running!");
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});

/**
 * 4. Status Tracking Logic
 * Fetches the current lifecycle stage from the database and updates the visual stepper.
 */
async function trackIssue() {
    const trackId = document.getElementById('trackingInput').value.trim();
    
    if (!trackId) {
        alert("Please enter a Tracking ID.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/track/${trackId}`);
        const data = await response.json();
        
        if (response.ok) {
            // Map backend status strings to stepper steps (1, 2, or 3)
            const statusMap = { 
                "Reported": 1, 
                "Under Review": 2, 
                "Assigned": 3, 
                "Resolved": 3 
            };
            updateStepper(statusMap[data.status] || 1);
        } else {
            alert("Tracking ID not found in the system.");
        }
    } catch (error) {
        console.error("Tracking Error:", error);
        alert("Connection error. Check if the backend is running.");
    }
}

/**
 * 5. UI Helper Functions
 */
function handleSuccess(id) {
    const resultMsg = document.getElementById('submissionResult');
    resultMsg.innerText = "Report Submitted! Tracking ID: " + id;
    resultMsg.classList.remove('hidden');
    
    // Smooth scroll to see the tracking ID message
    resultMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    alert(`Success! Your Safety Report ID is: ${id}\nKeep this ID to track resolution progress.`);
    document.getElementById('reportForm').reset();
}

function updateStepper(stepCount) {
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3')
    ];

    steps.forEach((step, index) => {
        if (!step) return;
        
        const circle = step.querySelector('.step-circle');
        const isActive = (index + 1) <= stepCount;

        if (isActive) {
            step.classList.remove('opacity-40');
            // Colors based on lifecycle stage
            const colors = ['#22c55e', '#2563eb', '#f97316'];
            circle.style.backgroundColor = colors[index];
            circle.style.boxShadow = `0 0 15px ${colors[index]}80`;
        } else {
            step.classList.add('opacity-40');
            circle.style.backgroundColor = "rgba(255,255,255,0.2)";
            circle.style.boxShadow = "none";
        }
    });
}

// 6. Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Connect the track button manually
    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', trackIssue);
    }
});

/**
 * Footer Animation Trigger
 * Uses Intersection Observer to detect when the user scrolls to the bottom
 */
document.addEventListener('DOMContentLoaded', () => {
    const footerProfile = document.getElementById('footerProfile');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footerProfile.classList.add('active');
            }
        });
    }, { threshold: 0.2 });

    observer.observe(footerProfile);
});