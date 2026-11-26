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

@router.post("/live/frame")
async def detect_live_frame(
    file: UploadFile = File(...),
    force_demo: Optional[bool] = Form(False),
    save_detection: Optional[bool] = Form(False),
    road_name: Optional[str] = Form(None),
    road_id: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None)
):
    """
    Lightweight, fast endpoint for real-time video/webcam frame inference.
    Processes a single frame buffer via YOLO/OpenCV without disk writes unless save_detection is True.
    """
    import cv2
    import numpy as np

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame data.")

    h, w = frame.shape[:2]

    # Run inference directly
    if detector.is_weights_loaded() and not force_demo:
        try:
            from backend.app.ai.model_config import ModelConfig, DAMAGE_CLASSES
            results = detector.model.predict(
                source=frame,
                conf=ModelConfig.CONFIDENCE_THRESHOLD,
                iou=ModelConfig.IOU_THRESHOLD,
                imgsz=ModelConfig.IMAGE_SIZE,
                verbose=False
            )
            detections = []
            for r in results:
                for box in r.boxes:
                    cls_idx = int(box.cls[0].item())
                    cls_name = DAMAGE_CLASSES.get(cls_idx, {}).get("name", "Other Road Damage")
                    conf = float(box.conf[0].item())
                    x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                    box_area = (x2 - x1) * (y2 - y1)
                    area_ratio = round((box_area / (h * w)) * 100, 2)
                    severity = "High" if area_ratio > 3.0 or "Pothole" in cls_name else ("Medium" if area_ratio > 1.0 else "Low")
                    detections.append({
                        "class_name": cls_name,
                        "confidence": round(conf, 3),
                        "x1": round(x1, 1),
                        "y1": round(y1, 1),
                        "x2": round(x2, 1),
                        "y2": round(y2, 1),
                        "area_ratio": area_ratio,
                        "estimated_severity": severity
                    })
            summary = detector._summarize_detections(detections)
            is_demo = False
            model_src = "YOLO RDD2022 Trained Model"
        except Exception as e:
            detections = detector._detect_with_opencv(frame)
            summary = detector._summarize_detections(detections)
            is_demo = False
            model_src = f"OpenCV Spatial Edge Fallback ({e})"
    elif not force_demo:
        detections = detector._detect_with_opencv(frame)
        summary = detector._summarize_detections(detections)
        is_demo = False
        model_src = "OpenCV Spatial Vision Pipeline"
    else:
        detections = detector._generate_labeled_demo_detections(w, h)
        summary = detector._summarize_detections(detections)
        is_demo = True
        model_src = "Simulated Road Damage Demo Mode"

    saved_doc = None
    if save_detection and len(detections) > 0:
        det_id = f"LIVE-{uuid.uuid4().hex[:8].upper()}"
        # Save keyframe image to disk
        annotated_dir = os.path.join(storage_service.upload_dir, "annotated")
        os.makedirs(annotated_dir, exist_ok=True)
        img_name = f"{det_id}.jpg"
        img_path = os.path.join(annotated_dir, img_name)
        annotated_img = ImageProcessor.draw_detections(frame, detections, is_demo=is_demo)
        cv2.imwrite(img_path, annotated_img)
        annotated_url = storage_service.get_relative_url(img_path)

        saved_doc = {
            "id": det_id,
            "media_type": "live_video",
            "original_file_url": annotated_url,
            "annotated_file_url": annotated_url,
            "road_name": road_name or "Live Survey Corridor",
            "road_id": road_id,
            "lat": lat if lat is not None else 12.9716,
            "lng": lng if lng is not None else 77.5946,
            "total_defects": summary.get("total", 0),
            "potholes_count": summary.get("potholes", 0),
            "cracks_count": summary.get("cracks", 0),
            "surface_deterioration_count": summary.get("surface_deterioration", 0),
            "highest_severity": summary.get("highest_severity", "None"),
            "detected_objects": detections,
            "is_demo_mode": is_demo,
            "source_type": "live_video",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        db.detections.insert_one(saved_doc)

    return {
        "success": True,
        "width": w,
        "height": h,
        "detections": detections,
        "summary": summary,
        "is_demo_mode": is_demo,
        "model_source": model_src,
        "saved_record": saved_doc,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

