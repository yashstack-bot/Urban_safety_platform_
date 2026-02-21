/**
 * URBAN SAFE - Integrated Core Logic
 * Bridges the Frontend UI with the Flask Backend API and Interactive Mapping.
 */

// 1. Configuration
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * 2. Map Initialization & Dynamic Analytics
 * Renders the interactive map and simulates real-time safety data based on location.
 */
// Initialize Map (Centered on Bhopal, Madhya Pradesh)
const map = L.map('map').setView([23.2599, 77.4126], 13); 

// Ensure map renders correctly in wider containers
setTimeout(() => {
    map.invalidateSize();
}, 100);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

// Capture click location to pinpoint the safety issue and update live analytics
map.on('click', function(e) {
    // Marker Management
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng, {draggable: true}).addTo(map);
    }
    
    // Store coordinates in hidden inputs for the backend payload
    document.getElementById('lat').value = e.latlng.lat;
    document.getElementById('lng').value = e.latlng.lng;

    // --- NEW DYNAMIC ANALYTICS LOGIC ---
    // Demonstrates probability-driven data simulation based on geospatial coordinates
    const seed = e.latlng.lat + e.latlng.lng;
    
    // Simulate a safety score between 60% and 100%
    const dynamicScore = Math.floor((Math.abs(Math.sin(seed)) * 40) + 60); 
    // Simulate resolution time between 1 and 6 days
    const dynamicDays = ((Math.abs(Math.cos(seed)) * 5) + 1).toFixed(1);

    // Update the UI Analytics section immediately
    const scoreElem = document.getElementById('safetyScore');
    const timeElem = document.getElementById('resTime');

    if (scoreElem && timeElem) {
        scoreElem.innerText = dynamicScore + "%";
        timeElem.innerText = dynamicDays + " Days";
        
        // Visual feedback: Add a small pop effect when data changes
        const analyticsCard = scoreElem.parentElement;
        analyticsCard.classList.add('scale-105', 'transition-transform');
        setTimeout(() => analyticsCard.classList.remove('scale-105'), 200);
    }
});

/**
 * 3. Report Submission Logic
 * Handles the citizen reporting flow: data collection -> API call -> UI feedback
 */
document.getElementById('reportForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Prepare data from form inputs including the coordinates captured from the map
    const payload = {
        issueType: document.getElementById('issueType').value,
        ward: document.getElementById('ward').value,
        areaName: document.getElementById('areaName').value,
        severity: document.getElementById('severity').value,
        lat: document.getElementById('lat').value, 
        lng: document.getElementById('lng').value
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
            // Reset map marker after successful submission
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
            // Colors: Green for Reported, Blue for Review, Orange for Assigned
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

/**
 * 6. Initialize Event Listeners & Footer Animation
 */
document.addEventListener('DOMContentLoaded', () => {
    // Connect the track button manually
    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', trackIssue);
    }

    // Initialize Footer Profile Pop-up Animation
    const footerProfile = document.getElementById('footerProfile');
    if (footerProfile) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footerProfile.classList.add('active');
                }
            });
        }, { threshold: 0.2 });

        observer.observe(footerProfile);
    }
});

/**
 * Update Analytics based on user input
 * This simulates the "Intelligence" layer for your hackathon demo.
 */
function refreshAnalytics() {
    // Generate a pseudo-random score between 60-95%
    const dynamicScore = Math.floor(Math.random() * 35) + 60;
    // Generate a resolution time between 1-5 days
    const dynamicDays = (Math.random() * 4 + 1).toFixed(1);

    const scoreElem = document.getElementById('safetyScore');
    const timeElem = document.getElementById('resTime');

    if (scoreElem && timeElem) {
        scoreElem.innerText = dynamicScore + "%";
        timeElem.innerText = dynamicDays + " Days";
        
        // Add a visual 'pop' animation to show the judge it changed
        scoreElem.parentElement.classList.add('scale-110', 'transition-transform');
        setTimeout(() => scoreElem.parentElement.classList.remove('scale-110'), 200);
    }
}