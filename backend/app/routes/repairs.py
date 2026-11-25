import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from typing import Optional
from backend.app.schemas.schemas import RepairCreateRequest
from backend.app.database import db
from backend.app.services.storage import storage_service

router = APIRouter(prefix="/repairs", tags=["Road Repairs"])

@router.post("")
async def create_repair_order(req: RepairCreateRequest):
    repair_id = f"REP-{datetime.date.today().year}-{uuid.uuid4().hex[:6].upper()}"

    doc = {
        "id": repair_id,
        "road_id": req.road_id,
        "road_name": req.road_name,
        "damage_description": req.damage_description,
        "severity": req.severity,
        "status": "In Progress",
        "contractor_id": req.contractor_id,
        "contractor_name": req.contractor_name,
        "deadline_date": req.deadline_date,
        "estimated_cost": req.estimated_cost,
        "lat": req.lat,
        "lng": req.lng,
        "before_image_url": req.before_image_url,
        "after_image_url": None,
        "inspector_approved": False,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.repairs.insert_one(doc)
    return doc

@router.get("")
async def list_repairs(road_id: Optional[str] = Query(None), status_filter: Optional[str] = Query(None)):
    query = {}
    if road_id:
        query["road_id"] = road_id
    if status_filter:
        query["status"] = status_filter
    return db.repairs.find(query=query)

@router.put("/{repair_id}")
async def update_repair(repair_id: str, payload: dict):
    existing = db.repairs.find_one({"id": repair_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Repair record not found.")

    db.repairs.update_one({"id": repair_id}, {"$set": payload})
    return db.repairs.find_one({"id": repair_id})
