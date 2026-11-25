from fastapi import APIRouter, HTTPException
from backend.app.database import db
from backend.app.services.prediction_service import prediction_service

router = APIRouter(prefix="/prediction", tags=["Predictive Maintenance"])

@router.get("/{road_id}")
async def get_road_prediction(road_id: str):
    road = db.roads.find_one({"id": road_id})
    if not road:
        raise HTTPException(status_code=404, detail="Road record not found.")

    historical_scans = db.road_health_history.find({"road_id": road_id})

    return prediction_service.predict_degradation(
        road_id=road_id,
        road_name=road.get("road_name", "Unknown Road"),
        current_health_score=road.get("health_score", 70.0),
        historical_records=historical_scans,
        traffic_density=road.get("traffic_density", "Medium"),
        is_flood_prone=road.get("flood_prone", False),
        monsoon_proximity_months=3
    )
