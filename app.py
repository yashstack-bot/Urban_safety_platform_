from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
import random

app = Flask(__name__)
CORS(app) # Enables cross-origin requests for your frontend

# 1. Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///urban_safe.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. Database Model
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    issue_type = db.Column(db.String(100))
    ward = db.Column(db.String(50))
    area = db.Column(db.String(100))
    severity = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Reported")
    tracking_id = db.Column(db.String(20), unique=True)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    # New fields for geo-location mapping
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

# 3. Initialize Database
with app.app_context():
    db.create_all()

# --- ROUTES FOR CITIZENS ---

@app.route('/')
def index():
    """Main landing page for citizens to report safety issues."""
    return render_template('index.html')

@app.route('/submit-report', methods=['POST'])
def submit_report():
    """Handles submission of new urban safety hazards."""
    data = request.json
    # Generate a unique tracking ID for transparency
    t_id = f"US-2026-{random.randint(1000, 9999)}"
    
    new_report = Report(
        issue_type=data.get('issueType'),
        ward=data.get('ward'),
        area=data.get('areaName'),
        severity=data.get('severity'),
        tracking_id=t_id,
        # Capturing coordinates from the Leaflet map
        latitude=data.get('lat'),
        longitude=data.get('lng')
    )
    
    db.session.add(new_report)
    db.session.commit()
    
    return jsonify({"success": True, "tracking_id": t_id})

@app.route('/track/<tracking_id>', methods=['GET'])
def track_report(tracking_id):
    """Provides live status tracking for reported issues."""
    report = Report.query.filter_by(tracking_id=tracking_id).first()
    if report:
        return jsonify({
            "status": report.status,
            "issue": report.issue_type,
            "area": report.area,
            "lat": report.latitude,
            "lng": report.longitude,
            "date": report.date_created.strftime("%Y-%m-%d")
        })
    return jsonify({"error": "ID not found"}), 404

# --- ROUTES FOR AUTHORITIES ---

@app.route('/admin-panel')
def admin_panel():
    """Dashboard for officials to perform authority analytics."""
    # Fetching all reports for oversight and evaluation
    all_reports = Report.query.all()
    return render_template('admin.html', reports=all_reports)

@app.route('/api/update-status/<int:id>', methods=['POST'])
def update_status(id):
    """Allows officials to update issue lifecycle status."""
    data = request.json
    report = Report.query.get(id)
    if report:
        # Update status to 'Under Review', 'Assigned', or 'Resolved'
        report.status = data['new_status']
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

if __name__ == '__main__':
    # Start the server to bridge citizens and city officials
    app.run(debug=True)