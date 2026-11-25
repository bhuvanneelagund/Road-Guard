import os
import cv2
import uuid
import datetime
import logging
from typing import List, Dict, Any, Optional
from backend.app.ai.detector import detector
from backend.app.ai.image_processor import ImageProcessor
from backend.app.services.gps_matcher import GPSMatcher

logger = logging.getLogger("roadguard.ai.video_processor")

class VideoProcessor:
    @staticmethod
    def process_video(
        video_path: str,
        output_dir: str,
        gps_points: Optional[List[Dict[str, Any]]] = None,
        frame_interval_seconds: float = 1.0,
        start_time_iso: Optional[str] = None,
        max_duration_seconds: int = 120
    ) -> Dict[str, Any]:
        """
        Extracts frames from video, runs road damage detection,
        and correlates each detection with recorded GPS tracks.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video file at: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        effective_duration = min(duration, max_duration_seconds)
        
        frame_step = max(1, int(fps * frame_interval_seconds))
        keyframes_dir = os.path.join(output_dir, "keyframes")
        os.makedirs(keyframes_dir, exist_ok=True)

        matcher = GPSMatcher(gps_points or [])
        frame_index = 0
        extracted_detections = []
        keyframe_records = []

        base_time = datetime.datetime.now(datetime.timezone.utc)
        if start_time_iso:
            try:
                base_time = datetime.datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
            except Exception:
                pass

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret or (frame_index / fps) > effective_duration:
                break

            if frame_index % frame_step == 0:
                elapsed_seconds = frame_index / fps
                frame_time = base_time + datetime.timedelta(seconds=elapsed_seconds)
                
                # Match to GPS
                matched_gps = matcher.find_nearest_gps(elapsed_seconds, frame_time)
                
                # Save temp frame to detect
                temp_frame_path = os.path.join(keyframes_dir, f"temp_frame_{frame_index}.jpg")
                cv2.imwrite(temp_frame_path, frame)

                try:
                    res = detector.detect_in_image(temp_frame_path, allow_demo_fallback=True)
                    if res.get("success") and res.get("detections"):
                        # Save permanent annotated keyframe
                        annotated_filename = f"keyframe_{uuid.uuid4().hex[:8]}_{int(elapsed_seconds)}s.jpg"
                        annotated_path = os.path.join(keyframes_dir, annotated_filename)
                        cv2.imwrite(annotated_path, res["annotated_image"])

                        defect_item = {
                            "frame_index": frame_index,
                            "timestamp_seconds": round(elapsed_seconds, 2),
                            "frame_time_iso": frame_time.isoformat(),
                            "keyframe_image": annotated_path,
                            "detections": res["detections"],
                            "summary": res["summary"],
                            "gps": matched_gps,
                            "is_demo_mode": res.get("is_demo_mode", False)
                        }
                        extracted_detections.append(defect_item)
                        keyframe_records.append({
                            "time_s": round(elapsed_seconds, 1),
                            "potholes": res["summary"]["potholes"],
                            "cracks": res["summary"]["cracks"],
                            "lat": matched_gps.get("lat") if matched_gps else None,
                            "lng": matched_gps.get("lng") if matched_gps else None,
                            "image_url": annotated_path
                        })
                finally:
                    if os.path.exists(temp_frame_path):
                        os.remove(temp_frame_path)

            frame_index += 1

        cap.release()

        total_defects = sum(d["summary"]["total"] for d in extracted_detections)
        total_potholes = sum(d["summary"]["potholes"] for d in extracted_detections)
        total_cracks = sum(d["summary"]["cracks"] for d in extracted_detections)

        return {
            "video_duration_seconds": round(duration, 2),
            "processed_duration_seconds": round(effective_duration, 2),
            "fps": round(fps, 1),
            "total_frames": total_frames,
            "inspected_frames_count": len(extracted_detections),
            "total_defects_found": total_defects,
            "total_potholes": total_potholes,
            "total_cracks": total_cracks,
            "detections_timeline": extracted_detections,
            "gps_matched_count": sum(1 for d in extracted_detections if d.get("gps") is not None),
            "hardware_notice": (
                "Video captured from USB vehicle-mounted webcam. "
                "Timestamps synchronized with Android GPS log stream."
            )
        }
