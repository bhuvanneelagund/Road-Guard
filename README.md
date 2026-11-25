# ROADGUARD AI
### Intelligent Road Damage Detection, Prediction and Maintenance Platform

> **"Detect Today. Predict Tomorrow. Protect Every Journey."**

![RoadGuard AI Architecture](https://img.shields.io/badge/ROADGUARD-AI%20PLATFORM-00d4ff?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![YOLO](https://img.shields.io/badge/YOLOv8-RDD2022-FF6F00?style=for-the-badge)
![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Database](https://img.shields.io/badge/Dual%20DB-MongoDB%20%7C%20SQLite-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 1. Project Mission & Identity
**ROADGUARD AI** is an enterprise-grade civil infrastructure intelligence platform engineered specifically for Indian national highways, state highways, and municipal city corridors. The platform bridges the gap between automated visual defect detection (potholes, structural cracking, waterlogging) and real-world administrative maintenance execution.

### Target Stakeholders:
* **Government Road Authorities**: PWD, KSHIP, NHAI, and Municipal Commissioners.
* **Inspection Teams**: Mobile camera survey teams and field civil engineers.
* **Citizens & Commuters**: 5-language voice reporting with unique Complaint ID tracking.
* **Road Maintenance Contractors**: Work orders, repair milestones, and verification sign-offs.

---

## 2. Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts, React Router v7, Leaflet & OpenStreetMap.
* **Backend**: Python 3.14+, FastAPI, Uvicorn, Pydantic v2, PyJWT, Bcrypt, PyMongo.
* **AI & Computer Vision**: YOLO Object Detection Pipeline (RDD2022 taxonomy), OpenCV, NumPy, Pillow.
* **Database**: Dual-Engine Data Architecture (Native MongoDB Atlas support + Automatic Local SQLite Document Engine with identical query APIs).
* **Hardware Telemetry**: USB Vehicle-Mounted Webcam + Android Smartphone GPS Log stream.

---

## 3. Core Capabilities & Architecture

| Module | Core Functionality | Primary Tech |
|---|---|---|
| **Executive Dashboard** | 7 key stats, damage charts, road condition index, live activity feed | Recharts, FastAPI |
| **AI Damage Detection** | YOLO defect bounding boxes, confidence %, area ratio on images & videos | YOLOv8, OpenCV |
| **GPS Hazard Map** | Geospatial OpenStreetMap layers, micro-coordinates, severity filters | Leaflet, OSM |
| **Road Health Passport** | Digital asset records, 0-100 condition scoring formula, history | Custom Heuristic Engine |
| **Priority & Risk Engine** | Transparent weighted priority triage (schools, hospitals, recurrence) | Multi-Factor Decision Matrix |
| **Citizen Voice Reporting** | Speech-to-text reporting in Kannada, Hindi, English, Telugu, Tamil | Web Speech API |
| **Repair Verification** | Side-by-side Before/After comparison, edge density analysis, human sign-off | OpenCV Feature Analysis |
| **AI Cost Estimator** | Volumetric BoQ calculation based on Indian PWD Schedule of Rates (SoR) | Civil Formula Engine |
| **Predictive Maintenance** | Historical decay regression & monsoon stress acceleration projections | Linear Trend Velocity |
| **Waterlogging Detection** | HSV reflective puddle masking and submerged surface area % | OpenCV HSV Segmentation |
| **Contractor Portal** | Agency ratings, active work orders, repeat failure accountability | RBAC Management |

---

## 4. Quick Start (Get Running in 60 Seconds)

### Step 1: Clone or Navigate to the Project Folder
```bash
cd "c:\Users\BHUVAN K NEELAGUND\DVG hackthon"
```

### Step 2: Start the FastAPI Backend
```powershell
# Activate Python Virtual Environment
.\backend\venv\Scripts\Activate.ps1

# Start Uvicorn Server (Dual-Engine SQLite/MongoDB runs automatically!)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check**: Open [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 3: Start the React Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
* **Web Dashboard**: Open [http://localhost:5173](http://localhost:5173)

---

## 5. Pre-Seeded Evaluation Profiles (1-Click Switcher)

| User Role | Pre-Seeded Email | Password | Primary Permissions |
|---|---|---|---|
| **Administrator** | `admin@roadguard.ai` | `Admin@1234` | System diagnostics, weight adjusters, user roles |
| **Government Authority** | `authority@pwd.gov.in` | `Gov@1234` | Municipal budget reviews, contractor assignments |
| **Inspector** | `inspector@roadguard.ai` | `Inspector@1234` | Field surveys, before/after repair sign-off |
| **Citizen** | `citizen@gmail.com` | `Citizen@1234` | Voice reporting, complaint tracking |

*In the web application, you can switch between any of these roles instantly using the dropdown at the bottom of the sidebar!*

---

## 6. Directory Layout
```
├── backend/
│   ├── app/
│   │   ├── ai/               # YOLO detector, video processor, OpenCV image comparisons
│   │   ├── models/           # Data structures
│   │   ├── routes/           # REST endpoints (auth, roads, priority, complaints, etc.)
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── services/         # Scoring formula, GPS matcher, cost estimator, predictions
│   │   ├── utils/            # Security (bcrypt, JWT), seed data generator
│   │   ├── config.py         # Application settings
│   │   ├── database.py       # Dual MongoDB / SQLite Document Engine
│   │   └── main.py           # FastAPI application root
│   ├── uploads/              # Isolated safe storage for images & survey videos
│   ├── tests/                # Automated pytest suite
│   ├── roadguard.db          # Local SQLite document database
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # MapView, StatCard, PriorityBadge, VoiceReporterModal, etc.
│   │   ├── context/          # AuthContext with 1-click role switcher
│   │   ├── layouts/          # DashboardLayout with navigation sidebar
│   │   ├── pages/            # 14 complete operational views
│   │   ├── services/         # Axios API service client
│   │   ├── App.jsx           # React Router v7 routes
│   │   └── index.css         # Tailwind styles + dark Leaflet CSS
│   ├── package.json
│   └── vite.config.js
└── Documentation Guides (README, INSTALLATION, HARDWARE_SETUP, AI_MODEL_SETUP, etc.)
```

---

## 7. Automated Testing
Run the complete automated backend verification test suite:
```powershell
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest backend/tests/test_api.py -v
```
*Tests verify Root & Health, Auth Token Flow, Dashboard Database Queries, Road Passports, Priority Calculations, Cost Estimator BoQ, Complaints Workflow, Deterioration Predictions, and YOLO Image Detections.*

---

## 8. License & Acknowledgments
* Built for student innovation hackathons addressing Indian infrastructure challenges.
* Computer vision defect classes based on the **Global Road Damage Detection Challenge (RDD2022)** dataset (CC BY-SA 4.0).
