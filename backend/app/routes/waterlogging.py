import os
import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from typing import Optional
from backend.app.database import db
from backend.app.services.storage import storage_service
from backend.app.ai.image_processor import ImageProcessor

router = APIRouter(prefix="/waterlogging", tags=["Flood & Waterlogging Detection"])

@router.post("/detect")
async def detect_waterlogging_incident(
    image: UploadFile = File(...),
    road_name: Optional[str] = Form("PB Road Inundation Point"),
    road_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(14.4644),
    lng: Optional[float] = Form(75.9218)
):
    """Analyzes road surface for water accumulation, hydroplaning risk, and submerged pavement."""
    saved_img = await storage_service.save_image(image)
    original_url = storage_service.get_relative_url(saved_img)

    water_out_dir = os.path.join(storage_service.upload_dir, "waterlogging")
    result = ImageProcessor.detect_waterlogging(saved_img, water_out_dir)
    annotated_url = storage_service.get_relative_url(result["annotated_image_path"])

    inc_id = f"WLG-{uuid.uuid4().hex[:8].upper()}"
    doc = {
        "id": inc_id,
        "road_name": road_name,
        "road_id": road_id,
        "lat": lat,
        "lng": lng,
        "original_image_url": original_url,
        "annotated_image_url": annotated_url,
        "water_surface_ratio_percent": result["water_surface_ratio_percent"],
        "risk_level": result["risk_level"],
        "alert_status": result["alert_status"],
        "waterlogging_detected": result["waterlogging_detected"],
        "disclaimer": result["disclaimer"],
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.waterlogging.insert_one(doc)
    return doc

@router.get("")
async def list_waterlogging_events():
    return db.waterlogging.find()
