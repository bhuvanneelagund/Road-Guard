import pytest
import os
import cv2
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.utils.seed_data import seed_initial_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_seed():
    seed_initial_data()

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert "ROADGUARD AI" in res.json()["project"]

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    data = health_res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_auth_flow():
    # Login with seeded user
    res = client.post("/api/auth/login", json={
        "email": "admin@roadguard.ai",
        "password": "Admin@1234"
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify /me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "Administrator"

def test_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "stats" in data
    assert data["stats"]["total_inspected_roads"] >= 5
    assert data["stats"]["total_potholes"] >= 5
    assert "charts" in data

def test_roads_and_health_passport():
    res = client.get("/api/roads")
    assert res.status_code == 200
    roads = res.json()
    assert len(roads) >= 5

    road_id = roads[0]["id"]
    health_res = client.get(f"/api/roads/{road_id}/health")
    assert health_res.status_code == 200
    passport = health_res.json()
    assert "health_score" in passport
    assert "scoring_breakdown" in passport
    assert "official_disclaimer" in passport

def test_priority_engine():
    res = client.get("/api/priority")
    assert res.status_code == 200
    data = res.json()
    assert "prioritized_roads" in data
    assert len(data["prioritized_roads"]) > 0

def test_cost_estimator():
    payload = {
        "damage_length_m": 2.5,
        "damage_width_m": 1.2,
        "estimated_depth_cm": 8.0,
        "material_type": "Bituminous Asphalt"
    }
    res = client.post("/api/cost-estimator", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_grand_total_inr"] > 0
    assert "disclaimer" in data

def test_complaints_flow():
    # Fetch list
    res = client.get("/api/complaints")
    assert res.status_code == 200
    assert len(res.json()) >= 4

def test_prediction_endpoint():
    res = client.get("/api/prediction/RD-DVG-001")
    assert res.status_code == 200
    data = res.json()
    assert "current_health_score" in data
    assert "projections" in data

def test_image_detection_demo_mode():
    # Create temporary dummy image
    temp_img_path = "backend/tests/temp_test_road.jpg"
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, "TEST ROAD SURFACE", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (200, 200, 200), 2)
    cv2.imwrite(temp_img_path, img)

    try:
        with open(temp_img_path, "rb") as f:
            res = client.post(
                "/api/detections/image",
                files={"file": ("test_road.jpg", f, "image/jpeg")},
                data={"road_name": "PB Road Test Section", "force_demo": "true"}
            )
        assert res.status_code == 200
        det_data = res.json()
        assert det_data["total_defects"] > 0
        assert det_data["is_demo_mode"] is True
        assert "annotated_file_url" in det_data
    finally:
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)
