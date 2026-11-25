from fastapi import APIRouter
from backend.app.schemas.schemas import PriorityCalculateRequest
from backend.app.services.priority_engine import priority_engine
from backend.app.database import db

router = APIRouter(prefix="/priority", tags=["Repair Priority Engine"])

@router.get("")
async def get_ranked_priorities():
    """Returns all road segments prioritized by the composite repair priority engine."""
    roads = db.roads.find()
    prioritized_list = []

    for r in roads:
        assessment = priority_engine.calculate_priority(
            damage_severity="High" if r.get("health_score", 100) < 50 else ("Medium" if r.get("health_score", 100) < 75 else "Low"),
            road_category=r.get("road_category", "Major District Road"),
            traffic_density=r.get("traffic_density", "Medium"),
            has_schools_nearby=r.get("has_schools_nearby", False),
            has_hospitals_nearby=r.get("has_hospitals_nearby", False),
            is_repeat_damage=r.get("repeat_damage", False),
            is_flood_prone=r.get("flood_prone", False)
        )

        risk_eval = priority_engine.evaluate_accident_risk(
            damage_severity="High" if r.get("health_score", 100) < 50 else "Medium",
            road_category=r.get("road_category", "Major District Road"),
            traffic_density=r.get("traffic_density", "Medium"),
            has_schools=r.get("has_schools_nearby", False),
            has_hospitals=r.get("has_hospitals_nearby", False)
        )

        prioritized_list.append({
            "road_id": r.get("id"),
            "road_name": r.get("road_name"),
            "district": r.get("district"),
            "road_category": r.get("road_category"),
            "health_score": r.get("health_score"),
            "potholes": r.get("potholes_count", 0),
            "cracks": r.get("cracks_count", 0),
            "priority": assessment,
            "accident_risk": risk_eval,
            "coordinates": {"lat": r.get("start_lat"), "lng": r.get("start_lng")}
        })

    # Sort descending by priority index
    prioritized_list.sort(key=lambda x: x["priority"]["priority_index"], reverse=True)
    return {
        "prioritized_roads": prioritized_list,
        "default_weights": priority_engine.DEFAULT_WEIGHTS,
        "disclaimer": "Prioritization rankings are algorithmically generated for municipal maintenance triage."
    }

@router.post("/calculate")
async def recalculate_with_custom_weights(req: PriorityCalculateRequest):
    """Allows administrators to simulate custom weight distributions for priority scoring."""
    custom_w = {
        "damage_severity": req.damage_severity_weight,
        "traffic_importance": req.traffic_importance_weight,
        "sensitive_zones": req.schools_hospitals_weight,
        "repeat_damage": req.repeat_damage_weight,
        "waterlogging": req.waterlogging_weight
    }

    roads = db.roads.find()
    results = []
    for r in roads:
        res = priority_engine.calculate_priority(
            damage_severity="High" if r.get("health_score", 100) < 50 else ("Medium" if r.get("health_score", 100) < 75 else "Low"),
            road_category=r.get("road_category", "Major District Road"),
            traffic_density=r.get("traffic_density", "Medium"),
            has_schools_nearby=r.get("has_schools_nearby", False),
            has_hospitals_nearby=r.get("has_hospitals_nearby", False),
            is_repeat_damage=r.get("repeat_damage", False),
            is_flood_prone=r.get("flood_prone", False),
            custom_weights=custom_w
        )
        results.append({
            "road_id": r.get("id"),
            "road_name": r.get("road_name"),
            "priority": res
        })

    results.sort(key=lambda x: x["priority"]["priority_index"], reverse=True)
    return {
        "applied_weights": custom_w,
        "results": results
    }
