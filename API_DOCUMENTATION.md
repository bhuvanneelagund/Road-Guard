# ROADGUARD AI - REST API Documentation

Base URL: `http://localhost:8000/api`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc Specifications: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user profile with hashed password and generates a JWT bearer token.
* **Request Body** (`application/json`):
  ```json
  {
    "name": "Ananya Sharma",
    "email": "ananya@gmail.com",
    "password": "Password@123",
    "role": "Citizen",
    "department": "Resident",
    "phone": "+91 98450 11223"
  }
  ```
* **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "usr-uuid",
      "name": "Ananya Sharma",
      "email": "ananya@gmail.com",
      "role": "Citizen"
    }
  }
  ```

### `POST /auth/login`
Authenticates user email and password; returns JWT token.
* **Request Body**:
  ```json
  {
    "email": "admin@roadguard.ai",
    "password": "Admin@1234"
  }
  ```

### `GET /auth/me`
Returns current user profile authenticated via `Authorization: Bearer <token>`.

---

## 2. Dashboard Endpoints

### `GET /dashboard/stats`
Retrieves aggregated statistics computed directly from active database records.
* **Response**:
  ```json
  {
    "stats": {
      "total_detected_defects": 9,
      "total_potholes": 5,
      "total_cracks": 4,
      "high_priority_locations": 2,
      "pending_complaints": 3,
      "repaired_road_sections": 1,
      "total_inspected_roads": 5
    },
    "charts": {
      "road_condition": [...],
      "damage_categories": [...],
      "repair_status": [...]
    }
  }
  ```

### `GET /dashboard/activity`
Returns latest detections feed, recent citizen complaints, and top high-risk roads.

---

## 3. AI Road Damage Detections

### `POST /detections/image`
Uploads a road image file and runs YOLO inference with bounding boxes.
* **Form Data**:
  * `file`: Binary image file (JPEG, PNG, WebP)
  * `road_name`: Optional string
  * `road_id`: Optional string linking to a road passport
  * `lat`, `lng`: Optional GPS coordinates
  * `force_demo`: Boolean flag to test simulated annotations
* **Response**:
  ```json
  {
    "id": "DET-A1B2C3D4",
    "media_type": "image",
    "original_file_url": "/api/uploads/images/abc.jpg",
    "annotated_file_url": "/api/uploads/annotated/annotated_xyz.jpg",
    "total_defects": 3,
    "potholes_count": 2,
    "cracks_count": 1,
    "highest_severity": "High",
    "detected_objects": [
      {
        "class_name": "Pothole",
        "confidence": 0.89,
        "x1": 120, "y1": 240, "x2": 280, "y2": 390,
        "area_ratio": 2.4,
        "estimated_severity": "High"
      }
    ],
    "is_demo_mode": false
  }
  ```

### `POST /detections/video`
Processes uploaded inspection video (e.g. from vehicle webcam) frame-by-frame with optional Android GPS CSV track timestamp matching.

### `GET /detections`
Lists past cataloged detections with optional query parameters: `media_type`, `road_id`, `limit`.

---

## 4. Road Health Passport

### `GET /roads`
Returns all registered road assets with health scores and telemetry.

### `GET /roads/{id}`
Returns complete road profile including previous damage history, repairs, complaints, and live priority ranking.

### `GET /roads/{id}/health`
Returns documented 0-100 condition scoring formula deductions breakdown:
```json
{
  "road_id": "RD-DVG-001",
  "road_name": "PB Road (Old NH4 Arterial)",
  "health_score": 48.5,
  "status": "Poor / Substandard",
  "scoring_breakdown": {
    "potholes_deduction": 96.0,
    "alligator_cracks_deduction": 42.0,
    "linear_cracks_deduction": 32.0,
    "complaints_deduction": 10.5,
    "traffic_multiplier": 1.1,
    "total_penalty": 51.5
  },
  "recommended_action": "Priority Resurfacing & Pothole Repair"
}
```

---

## 5. Priority & Accident Risk

### `GET /priority`
Returns all road sections ranked by composite priority index (0-100), considering schools, hospitals, repeat failures, and drainage waterlogging.

### `POST /priority/calculate`
Accepts custom weights to simulate administrative priority re-ranking:
```json
{
  "damage_severity_weight": 0.35,
  "traffic_importance_weight": 0.20,
  "schools_hospitals_weight": 0.20,
  "repeat_damage_weight": 0.15,
  "waterlogging_weight": 0.10
}
```

---

## 6. Citizen Complaints

### `POST /complaints`
Registers citizen damage report with photo and geolocation.
* Supports speech transcript upload from Kannada, Hindi, English, Telugu, Tamil.

### `GET /complaints/{id}`
Tracks complaint status across the municipal lifecycle (`Submitted`, `Under Review`, `Assigned`, `Repair in Progress`, `Completed`).

### `PUT /complaints/{id}/status`
Allows authorized administrators to update progress notes and assign contractors.

---

## 7. Repair Verification

### `POST /verification`
Uploads Before and After repair photos. Executes OpenCV difference computation and returns roughness reduction % and remaining edge density.

### `PUT /verification/{id}/approve`
Records certified human inspector sign-off to finalize repair status.

---

## 8. AI Repair Cost Estimator

### `POST /cost-estimator`
Computes indicative civil Bill of Quantities (BoQ) based on volumetric measurements:
* **Request**:
  ```json
  {
    "damage_length_m": 2.5,
    "damage_width_m": 1.2,
    "estimated_depth_cm": 7.5,
    "material_type": "Bituminous Asphalt"
  }
  ```
* **Response**: Returns surface area, fill volume in m³, material weight in tonnes, labor man-days, equipment rental, and grand total in INR.

---

## 9. Future Deterioration Prediction

### `GET /prediction/{road_id}`
Computes linear decay velocity and projects 3, 6, 9, and 12-month surface scores when at least 3 historical scans exist.

---

## 10. Flood & Waterlogging

### `POST /waterlogging/detect`
Uploads a surface scene to generate an HSV reflective puddle segmentation mask and compute submerged surface ratio %.
