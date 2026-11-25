# ROADGUARD AI - Database Architecture & Setup Guide

## 1. Dual-Engine Architecture Overview

RoadGuard AI features a resilient, dual-engine data architecture designed for both seamless zero-configuration local hackathon demonstrations and high-availability cloud deployments.

```
                  ┌──────────────────────────────────────────────┐
                  │           RoadGuard Data Manager             │
                  │        (backend/app/database.py)             │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │     MongoDB Atlas     │                       │ Local SQLite Document │
     │ (Production / Cloud)  │                       │ Mode (Zero-Config Dev)│
     └───────────────────────┘                       └───────────────────────┘
```

### Key Architectural Strengths:
1. **Identical Query API**: Both engines support `find()`, `find_one()`, `insert_one()`, `update_one()`, `delete_one()`, and `count_documents()`. The application routes do not require any code modifications when switching databases.
2. **Zero-Setup Guarantee**: If MongoDB is not installed or running locally, the system falls back to `backend/roadguard.db` without crashing or throwing database connection errors.

---

## 2. Option A: Using Local SQLite Document Mode (Default)

No setup is required!
* Simply leave `MONGODB_URI` empty in `.env`.
* RoadGuard AI will store JSON document collections in `backend/roadguard.db`.
* On startup, the database is automatically seeded with initial sample data.

---

## 3. Option B: Connecting MongoDB Atlas (Cloud)

### Step 3.1: Create a Free MongoDB Atlas Cluster
1. Sign up for a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster (choose Mumbai / AWS ap-south-1 for lowest latency in India).
3. Under **Security** -> **Database Access**:
   * Create a database user (e.g. `roadguard_admin`) with a secure password.
4. Under **Security** -> **Network Access**:
   * Add IP Address: `0.0.0.0/0` (Allow access from anywhere) so your cloud deployment or local machine can connect.

### Step 3.2: Get Your Connection String
Click **Connect** -> **Drivers** -> **Python (3.12+)** and copy the URI:
```
mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

### Step 3.3: Configure in RoadGuard AI
In `backend/.env`, set:
```env
MONGODB_URI=mongodb+srv://roadguard_admin:YourPassword@cluster0.abcde.mongodb.net/roadguard_ai?retryWrites=true&w=majority
DATABASE_NAME=roadguard_ai
```
Restart the backend server. The startup log will display:
`Successfully connected to MongoDB.`

---

## 4. Database Collections Schema

RoadGuard AI manages 10 core document collections:

1. `users`: Stores user profiles, hashed passwords, roles (`Administrator`, `Government Authority`, `Inspector`, `Citizen`).
2. `roads`: Digital Road Passports with coordinates, category, traffic density, and health score (0-100).
3. `detections`: Image & video detection records, defect counts, bounding boxes, and camera telemetry.
4. `complaints`: Citizen damage submissions with tracking IDs, voice transcripts, and status lifecycles.
5. `repairs`: Civil work orders assigned to contractors with deadlines and budget figures.
6. `contractors`: Registered civil engineering firms, active jobs, on-time rates, and repeat defect counts.
7. `inspections`: Field survey records.
8. `verification_records`: Before and After comparison evidence, CV metrics, and inspector sign-off status.
9. `road_health_history`: Historical scan series used to calibrate linear deterioration rate models.
10. `waterlogging`: Surface inundation events with HSV water ratio % and alert levels.
