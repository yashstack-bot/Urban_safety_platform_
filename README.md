🏙️ Urban Safe: AI-Driven Civic Oversight Ecosystem
Urban Safe is a sophisticated digital bridge designed to close the communication gap between citizens and municipal authorities. By leveraging geospatial intelligence and real-time tracking, it empowers communities to report hazards—such as broken streetlights or damaged roads—while providing officials with a data-driven dashboard for streamlined urban management.

🚀 Key Features

🛡️ For Citizens (The Reporting Portal)
Interactive Geospatial Mapping: Pinpoint exact hazard locations using an integrated Leaflet.js map for high-precision reporting.

Glassmorphism UI: A modern, highly responsive interface designed for seamless user experience across all devices.

Live Status Stepper: Real-time visibility into the issue lifecycle—from 'Reported' to 'Resolved'—using unique tracking IDs.

🏛️ For Authorities (The Analytics Suite)

Authority Analytics Dashboard: A centralized oversight panel where officials monitor city-wide safety trends.

Dynamic Safety Scoring: Automated area-wise safety probability calculations to assist in resource prioritization.

Status Lifecycle Management: One-click updates to transition reports through administrative stages.

🛠️ Technical Stack
Frontend: HTML5, Tailwind CSS (Custom Glassmorphism), JavaScript (ES6+).

Backend: Python (Flask), Flask-CORS for cross-origin resource sharing.

Database: SQLite with SQLAlchemy ORM for structured, relational data management.

Mapping API: Leaflet.js (OpenStreetMap Tiles) for geospatial data visualization.

Animations: Intersection Observer API for scroll-triggered profile components.

🧪 Intelligence & Probability Models

The platform features a simulated intelligence layer that evaluates Area Safety Scores and Expected Resolution Times in real-time. By analyzing hazard density and location-based coordinates, the system provides officials with predictive insights, shifting urban maintenance from a reactive to a proactive model.

🏗️ Project Structure

Urban_safety_platform/
├── app.py              # Flask Backend & Database Models
├── instance/           # Local Database Storage
│   └── urban_safe.db
├── static/             # Assets, CSS, and JS logic
│   ├── assets/         # Personal Branding & Profile Photos
│   ├── css/            # Tailwind Configurations
│   └── js/             # Core Logic & Map Integration
└── templates/          # Jinja2 HTML Templates
    ├── index.html      # Citizen Portal
    └── admin.html      # Authority Dashboard

👨‍💻 Developer & Vision
Yash Gupta Full Stack Developer & AI Enthusiast LinkedIn | GitHub