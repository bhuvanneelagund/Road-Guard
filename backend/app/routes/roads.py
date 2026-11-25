import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import Optional, List
from backend.app.schemas.schemas import RoadCreateRequest, RoadUpdateRequest
from backend.app.database import db
from backend.app.services.scoring import scoring_engine
from backend.app.services.priority_engine import priority_engine

router = APIRouter(prefix="/roads", tags=["Road Health Passport"])

@router.post("")
async def create_road(req: RoadCreateRequest):
    road_id = req.road_id or f"RD-DVG-{uuid.uuid4().hex[:4].upper()}"
    
    # Initial health score calculation (fresh road starts at 100 or baseline)
    scored = scoring_engine.calculate_road_score(
        potholes=0,
        alligator_cracks=0,
        linear_cracks=0,
        surface_deteriorations=0,
        traffic_density=req.traffic_density,
        is_flood_prone=req.flood_prone,
        is_repeat_damage=False
    )

    today_str = datetime.date.today().isoformat()
    next_insp = (datetime.date.today() + datetime.timedelta(days=scored["next_inspection_days"])).isoformat()

    road_doc = {
        "id": road_id,
        "road_name": req.road_name,
        "state": req.state,
        "district": req.district,
        "city": req.city,
        "road_category": req.road_category,
        "start_lat": req.start_lat,
        "start_lng": req.start_lng,
        "end_lat": req.end_lat,
        "end_lng": req.end_lng,
        "traffic_density": req.traffic_density,
        "has_schools_nearby": req.has_schools_nearby,
        "has_hospitals_nearby": req.has_hospitals_nearby,
        "flood_prone": req.flood_prone,
        "length_km": req.length_km,
        "health_score": scored["health_score"],
        "health_status": scored["status"],
        "potholes_count": 0,
        "cracks_count": 0,
        "surface_wear_count": 0,
        "last_inspected": today_str,
        "next_recommended_inspection": next_insp,
        "repeat_damage": False,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.roads.insert_one(road_doc)
    
    # Insert initial historical snapshot
    db.road_health_history.insert_one({
        "road_id": road_id,
        "health_score": scored["health_score"],
        "inspection_date": today_str,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

    return road_doc

@router.get("")
async def list_roads(category: Optional[str] = Query(None), district: Optional[str] = Query(None)):
    query = {}
    if category:
        query["road_category"] = category
    if district:
        query["district"] = district
    return db.roads.find(query=query)

@router.get("/{road_id}")
async def get_road(road_id: str):
    road = db.roads.find_one({"id": road_id})
    if not road:
        raise HTTPException(status_code=404, detail="Road record not found.")

    # Calculate live priority evaluation
    priority_info = priority_engine.calculate_priority(
        damage_severity="High" if road.get("health_score", 100) < 50 else ("Medium" if road.get("health_score", 100) < 75 else "Low"),
        road_category=road.get("road_category", "Major District Road"),
        traffic_density=road.get("traffic_density", "Medium"),
        has_schools_nearby=road.get("has_schools_nearby", False),
        has_hospitals_nearby=road.get("has_hospitals_nearby", False),
        is_repeat_damage=road.get("repeat_damage", False),
        is_flood_prone=road.get("flood_prone", False)
    )

    # Fetch associated complaints and repairs
    complaints = db.complaints.find({"road_name": road.get("road_name")})
    repairs = db.repairs.find({"road_id": road_id})
    history = db.road_health_history.find({"road_id": road_id})

    return {
        "road": road,
        "priority_assessment": priority_info,
        "complaints": complaints,
        "repairs": repairs,
        "history": history
    }

@router.put("/{road_id}")
async def update_road(road_id: str, req: RoadUpdateRequest):
    existing = db.roads.find_one({"id": road_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Road record not found.")

    update_fields = {k: v for k, v in req.model_dump().items() if v is not None}
    if update_fields:
        db.roads.update_one({"id": road_id}, {"$set": update_fields})
    
    return db.roads.find_one({"id": road_id})

@router.get("/{road_id}/health")
async def get_road_health_passport(road_id: str):
    road = db.roads.find_one({"id": road_id})
    if not road:
        raise HTTPException(status_code=404, detail="Road record not found.")

    pending_comp = db.complaints.count_documents({
        "road_name": road.get("road_name"),
        "status": {"$in": ["Submitted", "Under Review", "Assigned", "Repair in Progress"]}
    })

    scored = scoring_engine.calculate_road_score(
        potholes=road.get("potholes_count", 0),
        alligator_cracks=int(road.get("cracks_count", 0) * 0.45),
        linear_cracks=int(road.get("cracks_count", 0) * 0.55),
        surface_deteriorations=road.get("surface_wear_count", 0),
        pending_complaints=pending_comp,
        traffic_density=road.get("traffic_density", "Medium"),
        is_flood_prone=road.get("flood_prone", False),
        is_repeat_damage=road.get("repeat_damage", False)
    )

    return {
        "road_id": road_id,
        "road_name": road.get("road_name"),
        "category": road.get("road_category"),
        "location": {
            "city": road.get("city"),
            "district": road.get("district"),
            "state": road.get("state"),
            "coordinates": [
                {"lat": road.get("start_lat"), "lng": road.get("start_lng")},
                {"lat": road.get("end_lat"), "lng": road.get("end_lng")}
            ]
        },
        "health_score": scored["health_score"],
        "status": scored["status"],
        "badge_color": scored["badge_color"],
        "last_inspection": road.get("last_inspected"),
        "next_recommended_inspection": road.get("next_recommended_inspection"),
        "defect_summary": {
            "potholes": road.get("potholes_count", 0),
            "cracks": road.get("cracks_count", 0),
            "surface_deteriorations": road.get("surface_wear_count", 0),
            "pending_citizen_complaints": pending_comp,
            "repeat_damage_history": road.get("repeat_damage", False)
        },
        "scoring_breakdown": scored["deductions_breakdown"],
        "recommended_action": scored["recommended_action"],
        "official_disclaimer": scored["disclaimer"]
    }

@router.get("/{road_id}/history")
async def get_road_history(road_id: str):
    return db.road_health_history.find({"road_id": road_id})
