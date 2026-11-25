import os
import uuid
import datetime
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Query, Depends
from typing import Optional, List
from backend.app.database import db
from backend.app.services.storage import storage_service
from backend.app.ai.detector import detector
from backend.app.ai.image_processor import ImageProcessor
from backend.app.ai.video_processor import VideoProcessor
from backend.app.services.gps_matcher import GPSMatcher

router = APIRouter(prefix="/detections", tags=["AI Road Detections"])

@router.post("/image")
async def detect_road_image(
    file: UploadFile = File(...),
    road_name: Optional[str] = Form(None),
    road_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    force_demo: Optional[bool] = Form(False)
):
    """Processes uploaded road photograph with YOLO object detection pipeline."""
    # 1. Save original file securely
    saved_path = await storage_service.save_image(file)
    original_url = storage_service.get_relative_url(saved_path)

    # 2. Run Road Damage Detection
    res = detector.detect_in_image(saved_path, allow_demo_fallback=True, demo_forced=force_demo)
    
    annotated_url = original_url
    if res.get("success") and "annotated_image" in res:
        annotated_dir = os.path.join(storage_service.upload_dir, "annotated")
        annotated_path = ImageProcessor.save_annotated(res["annotated_image"], annotated_dir)
        annotated_url = storage_service.get_relative_url(annotated_path)

    # 3. Store record in database
    det_id = f"DET-{uuid.uuid4().hex[:8].upper()}"
    summary = res.get("summary", {})
    
    detection_doc = {
        "id": det_id,
        "media_type": "image",
        "original_file_url": original_url,
        "annotated_file_url": annotated_url,
        "road_name": road_name or "Unassigned Road Section",
        "road_id": road_id,
        "lat": lat if lat is not None else 12.9716,
        "lng": lng if lng is not None else 77.5946,
        "total_defects": summary.get("total", 0),
        "potholes_count": summary.get("potholes", 0),
        "cracks_count": summary.get("cracks", 0),
        "surface_deterioration_count": summary.get("surface_deterioration", 0),
        "highest_severity": summary.get("highest_severity", "None"),
        "detected_objects": res.get("detections", []),
        "is_demo_mode": res.get("is_demo_mode", False),
        "demo_disclosure": res.get("demo_disclosure"),
        "model_source": res.get("model_source"),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.detections.insert_one(detection_doc)

    # Update road passport stats if road_id provided
    if road_id:
        road = db.roads.find_one({"id": road_id})
        if road:
            new_potholes = road.get("potholes_count", 0) + summary.get("potholes", 0)
            new_cracks = road.get("cracks_count", 0) + summary.get("cracks", 0)
            # Recalculate health score
            from backend.app.services.scoring import scoring_engine
            scored = scoring_engine.calculate_road_score(
                potholes=new_potholes,
                alligator_cracks=int(new_cracks * 0.4),
                linear_cracks=int(new_cracks * 0.6),
                surface_deteriorations=road.get("surface_wear_count", 0) + summary.get("surface_deterioration", 0),
                traffic_density=road.get("traffic_density", "Medium"),
                is_flood_prone=road.get("flood_prone", False),
                is_repeat_damage=road.get("repeat_damage", False)
            )
            db.roads.update_one(
                {"id": road_id},
                {"$set": {
                    "potholes_count": new_potholes,
                    "cracks_count": new_cracks,
                    "health_score": scored["health_score"],
                    "health_status": scored["status"],
                    "last_inspected": datetime.date.today().isoformat()
                }}
            )

    return detection_doc

@router.post("/video")
async def detect_road_video(
    file: UploadFile = File(...),
    gps_csv: Optional[UploadFile] = File(None),
    road_name: Optional[str] = Form(None),
    road_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    frame_interval_seconds: Optional[float] = Form(1.0)
):
    """Processes uploaded inspection video (e.g. from vehicle webcam) with frame-by-frame analysis & GPS correlation."""
    saved_video_path = await storage_service.save_video(file)
    original_video_url = storage_service.get_relative_url(saved_video_path)

    # Parse optional GPS track CSV
    gps_points = []
    if gps_csv:
        content = await gps_csv.read()
        try:
            csv_text = content.decode("utf-8")
            gps_points = GPSMatcher.parse_csv_tracks(csv_text)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse GPS CSV: {e}")

    # Process Video
    video_out_dir = os.path.join(storage_service.upload_dir, "videos")
    proc_result = VideoProcessor.process_video(
        video_path=saved_video_path,
        output_dir=video_out_dir,
        gps_points=gps_points,
        frame_interval_seconds=frame_interval_seconds or 1.0
    )

    fallback_lat = lat if lat is not None else 12.9716
    fallback_lng = lng if lng is not None else 77.5946
    first_keyframe_url = None
    primary_lat = fallback_lat
    primary_lng = fallback_lng

    # Convert local keyframe paths to web relative URLs and ensure GPS coordinates
    for item in proc_result["detections_timeline"]:
        item["keyframe_image_url"] = storage_service.get_relative_url(item["keyframe_image"])
        if not first_keyframe_url:
            first_keyframe_url = item["keyframe_image_url"]
        if item.get("gps") and item["gps"].get("lat") is not None:
            if primary_lat == fallback_lat and primary_lng == fallback_lng:
                primary_lat = item["gps"]["lat"]
                primary_lng = item["gps"]["lng"]
        else:
            item["gps"] = {"lat": fallback_lat, "lng": fallback_lng}

    det_id = f"VID-{uuid.uuid4().hex[:8].upper()}"
    video_doc = {
        "id": det_id,
        "media_type": "video",
        "original_file_url": original_video_url,
        "annotated_file_url": first_keyframe_url,
        "road_name": road_name or "Video Survey Corridor",
        "road_id": road_id,
        "lat": primary_lat,
        "lng": primary_lng,
        "total_defects": proc_result["total_defects_found"],
        "potholes_count": proc_result["total_potholes"],
        "cracks_count": proc_result["total_cracks"],
        "surface_deterioration_count": 0,
        "highest_severity": "High" if proc_result["total_potholes"] > 0 else ("Medium" if proc_result["total_cracks"] > 0 else "None"),
        "video_duration_seconds": proc_result["video_duration_seconds"],
        "processed_duration_seconds": proc_result["processed_duration_seconds"],
        "inspected_frames_count": proc_result["inspected_frames_count"],
        "detections_timeline": proc_result["detections_timeline"],
        "gps_matched_count": proc_result["gps_matched_count"],
        "hardware_notice": proc_result["hardware_notice"],
        "is_demo_mode": any(d.get("is_demo_mode") for d in proc_result["detections_timeline"]),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.detections.insert_one(video_doc)
    return video_doc

@router.get("")
async def list_detections(
    media_type: Optional[str] = Query(None),
    road_id: Optional[str] = Query(None),
    limit: int = Query(50)
):
    query = {}
    if media_type:
        query["media_type"] = media_type
    if road_id:
        query["road_id"] = road_id
    
    return db.detections.find(query=query, limit=limit)

@router.get("/{detection_id}")
async def get_detection(detection_id: str):
    doc = db.detections.find_one({"id": detection_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Detection record not found.")
    return doc

@router.delete("/{detection_id}")
async def delete_detection(detection_id: str):
    res = db.detections.delete_one({"id": detection_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Detection record not found.")
    return {"message": "Detection deleted successfully."}
