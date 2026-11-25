# ROADGUARD AI - Installation & Local Setup Guide

This guide will walk you through setting up and running **ROADGUARD AI** on your development machine.

---

## 1. System Requirements

* **Operating System**: Windows 10/11, macOS, or Ubuntu 20.04+
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **Python**: v3.10 to v3.14
* **Storage**: At least 2GB free disk space

---

## 2. Backend Setup (FastAPI & AI Services)

### Step 2.1: Open PowerShell or Terminal
Navigate to the project root directory:
```powershell
cd "c:\Users\BHUVAN K NEELAGUND\DVG hackthon"
```

### Step 2.2: Virtual Environment & Dependency Installation
A dedicated virtual environment has been created in `backend/venv`. To create or reinstall:
```powershell
# Create virtualenv if not already created
python -m venv backend/venv

# Activate the virtual environment
# Windows PowerShell:
.\backend\venv\Scripts\Activate.ps1

# Windows CMD:
.\backend\venv\Scripts\activate.bat

# Linux / macOS:
source backend/venv/bin/activate
```

Install the backend Python dependencies:
```powershell
pip install -r backend/requirements.txt
```

### Step 2.3: Database Configuration (Dual-Engine Mode)
RoadGuard AI is engineered with a **zero-configuration dual database engine**:
1. **Local SQLite Document Mode (Default)**:
   * Requires **no setup**! If no MongoDB URI is provided, the backend automatically initializes `backend/roadguard.db` and provides identical document collection queries.
2. **MongoDB Atlas Mode (Optional)**:
   * To connect to a live MongoDB Atlas cluster, create a `.env` file inside `backend/` or set the environment variable:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/roadguard_ai?retryWrites=true&w=majority
     DATABASE_NAME=roadguard_ai
     ```

### Step 2.4: Launch the Backend Server
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
* The backend server will start on [http://localhost:8000](http://localhost:8000)
* Interactive Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs)
* Health endpoint check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 3. Frontend Setup (React & Vite Dashboard)

### Step 3.1: Open a New Terminal
Navigate to the `frontend/` directory:
```bash
cd frontend
```

### Step 3.2: Install NPM Packages
```bash
npm install
```

### Step 3.3: Configure Environment Variables
Verify or create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### Step 3.4: Launch the Frontend Development Server
```bash
npm run dev
```
* Open your browser and navigate to [http://localhost:5173](http://localhost:5173)
* You will be greeted by the **RoadGuard AI Landing Page** and Executive Dashboard.

---

## 4. Verifying Installation & Initial Seed Data

Upon first start, RoadGuard AI automatically seeds:
* 4 Authenticated Users across all administrative and citizen roles.
* 5 Registered Road Passports in Davanagere, Karnataka with health scores and telemetry.
* 3 Licensed PWD Contractors with historical performance ratings.
* 4 Multilingual Citizen Complaints with voice transcripts.
* Multiple sample AI detection records with GPS coordinates.

### Testing Authentication:
1. Navigate to [http://localhost:5173/login](http://localhost:5173/login)
2. Use the **1-Click Demo Profiles** at the bottom of the login card, or enter:
   * Email: `admin@roadguard.ai`
   * Password: `Admin@1234`
3. Click **Sign In** to access the Executive Command Dashboard.

---

## 5. Running Automated Tests

Run the PyTest test suite to verify all backend REST endpoints and AI logic:
```powershell
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest backend/tests/test_api.py -v
```
All 9 test cases will run and confirm health, auth, roads, priority calculation, cost estimation, complaints, and image detection.

---

## 6. Building for Production

### Frontend:
```bash
cd frontend
npm run build
```
This generates the optimized production bundles inside `frontend/dist/`.

### Backend:
Run Uvicorn in production mode without `--reload` behind a reverse proxy (e.g. Nginx or Render):
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
