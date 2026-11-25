# ROADGUARD AI - Testing & Verification Protocol

This document details the automated and manual testing procedures executed for **ROADGUARD AI**.

---

## 1. Automated Backend Test Suite

The automated test suite is implemented using `pytest` and FastAPI's `TestClient` in `backend/tests/test_api.py`.

### How to Run Automated Tests:
```powershell
# In PowerShell:
$env:PYTHONPATH="."
.\backend\venv\Scripts\pytest backend/tests/test_api.py -v
```

### Verified Test Cases:

| # | Test Function | Target Feature | Actual Result |
|---|---|---|---|
| 1 | `test_root_and_health` | Root discovery & `/api/health` diagnostics | **PASSED** |
| 2 | `test_auth_flow` | Seeded user login, password hash verification, JWT issuance, `/api/auth/me` | **PASSED** |
| 3 | `test_dashboard_stats` | Live DB record aggregation, defect counts, condition charts | **PASSED** |
| 4 | `test_roads_and_health_passport` | Road listing, passport lookup, scoring formula breakdown (0-100) | **PASSED** |
| 5 | `test_priority_engine` | Multi-factor priority score calculation (schools, hospitals, recurrence) | **PASSED** |
| 6 | `test_cost_estimator` | Volumetric civil BoQ calculation, material/labor breakdown, disclaimer | **PASSED** |
| 7 | `test_complaints_flow` | Citizen complaints queue, multi-status stages | **PASSED** |
| 8 | `test_prediction_endpoint` | Linear degradation velocity & future decay curve calculation | **PASSED** |
| 9 | `test_image_detection_demo_mode` | Image upload, YOLO simulation bounding box generation, annotated image storage | **PASSED** |

---

## 2. Manual End-to-End Testing Verification Checklist

### 1. Backend Server Health
* Command: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
* Check: Open `http://localhost:8000/api/health` -> returns `{"status":"healthy","database":"connected"}`.

### 2. Frontend Build Verification
* Command: `cd frontend; npm run build`
* Result: `✓ built in 4.25s` with 0 syntax or bundling errors.

### 3. Role-Based Access Control (RBAC) Testing
1. Navigate to `http://localhost:5173/login`.
2. Click **Administrator** 1-click demo button -> redirected to Executive Command Dashboard.
3. Switch role to **Citizen** using the bottom sidebar dropdown -> portal adapts to citizen submission views.

### 4. AI Road Damage Detection Testing
1. Navigate to `/detections`.
2. Choose **Road Image** -> upload an image or choose **Live Camera** -> capture a webcam snapshot.
3. Click **Execute YOLO Damage Detection** -> displays annotated image with bounding boxes, confidence score, defect counts, and severity badges.
4. Verify detection is saved in the Detection History Archive.

### 5. Interactive GPS Road Map
1. Navigate to `/map`.
2. Verify OpenStreetMap loads with customized dark CartoDB tiles.
3. Verify pins appear for potholes (red pulsing), cracks (cyan), and waterlogging (blue).
4. Click any pin -> popup reveals road name, coordinates, photo thumbnail, and defect count.
5. Click **My Geolocation** -> requests browser location and places user position marker.

### 6. Multilingual Voice Reporting
1. Click **Voice Report (5 Languages)** in the header.
2. Select **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, or **English**.
3. Click microphone or click **Fill Sample Voice Transcript**.
4. Click **Confirm & Submit Complaint** -> generates unique Complaint ID (e.g. `CMP-2026-XXXX`).

### 7. Citizen Complaint Tracking
1. Navigate to `/citizen-report`.
2. Enter the Complaint ID into the search bar -> displays real-time stepper timeline (`Submitted` -> `Under Review` -> `Assigned` -> `In Progress` -> `Completed`).

### 8. Before & After Repair Verification
1. Navigate to `/verification`.
2. Upload Before and After repair photos.
3. Click **Execute Automated Comparison** -> generates side-by-side comparison canvas, roughness reduction %, and residual edge density.
4. Click **Approve & Certify Repair** -> updates work order status to `Completed & Verified`.

### 9. AI Cost Estimator
1. Navigate to `/cost-estimator`.
2. Enter 2.5m length, 1.2m width, 7.5cm depth with Bituminous Asphalt.
3. Click **Compute Bill of Quantities** -> generates itemized expenditure breakdown and total in INR.
