import os
import cv2
import numpy as np
import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.app.ai.model_config import ModelConfig, DAMAGE_CLASSES, CLASS_NAMES
from backend.app.ai.image_processor import ImageProcessor

logger = logging.getLogger("roadguard.ai.detector")

class RoadDamageDetector:
    def __init__(self):
        self.model = None
        self.weights_loaded = False
        self._init_model()

    def _init_model(self):
        if ModelConfig.weights_exist():
            try:
                # Try loading via ultralytics if available
                from ultralytics import YOLO
                self.model = YOLO(ModelConfig.MODEL_PATH)
                self.weights_loaded = True
                logger.info(f"Loaded YOLO weights from: {ModelConfig.MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Could not initialize YOLO model from {ModelConfig.MODEL_PATH}: {e}")
                self.weights_loaded = False
        else:
            logger.info("Custom road damage model weights not detected. Demo mode available.")
            self.weights_loaded = False

    def is_weights_loaded(self) -> bool:
        return self.weights_loaded and self.model is not None

    def detect_in_image(
        self,
        image_path: str,
        allow_demo_fallback: bool = True,
        demo_forced: bool = False
    ) -> Dict[str, Any]:
        """
        Runs object detection on a road damage image.
        If weights are missing, provides transparent diagnostics and optional labeled demo mode.
        """
        img = ImageProcessor.load_image(image_path)
        h, w = img.shape[:2]

        if self.is_weights_loaded() and not demo_forced:
            try:
                results = self.model.predict(
                    source=img,
                    conf=ModelConfig.CONFIDENCE_THRESHOLD,
                    iou=ModelConfig.IOU_THRESHOLD,
                    imgsz=ModelConfig.IMAGE_SIZE,
                    verbose=False
                )
                detections = []
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_idx = int(box.cls[0].item())
                        cls_name = DAMAGE_CLASSES.get(cls_idx, {}).get("name", "Other Road Damage")
                        conf = float(box.conf[0].item())
                        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
                        
                        box_area = (x2 - x1) * (y2 - y1)
                        area_ratio = round((box_area / (h * w)) * 100, 2)
                        
                        # Severity estimation based on area and class multiplier
                        severity_mult = DAMAGE_CLASSES.get(cls_idx, {}).get("severity_multiplier", 0.6)
                        if area_ratio > 4.0 or (area_ratio > 2.0 and "Pothole" in cls_name):
                            sev = "High"
                        elif area_ratio > 1.0:
                            sev = "Medium"
                        else:
                            sev = "Low"

                        detections.append({
                            "class_name": cls_name,
                            "confidence": round(conf, 3),
                            "x1": round(x1, 1),
                            "y1": round(y1, 1),
                            "x2": round(x2, 1),
                            "y2": round(y2, 1),
                            "area_ratio": area_ratio,
                            "estimated_severity": sev
                        })

                annotated_img = ImageProcessor.draw_detections(img, detections, is_demo=False)
                summary = self._summarize_detections(detections)
                return {
                    "success": True,
                    "is_demo_mode": False,
                    "model_source": "YOLO RDD2022 Trained Model",
                    "detections": detections,
                    "summary": summary,
                    "annotated_image": annotated_img
                }
            except Exception as e:
                logger.error(f"Inference error with weights: {e}")
                if not allow_demo_fallback:
                    raise RuntimeError(f"Road damage model inference failed: {e}")

        # If custom YOLO weights are missing and demo is not forced, run real OpenCV road damage analysis
        if not demo_forced:
            detections = self._detect_with_opencv(img)
            annotated_img = ImageProcessor.draw_detections(img, detections, is_demo=False)
            summary = self._summarize_detections(detections)
            return {
                "success": True,
                "is_demo_mode": False,
                "model_source": "OpenCV Computer Vision Road Analyzer",
                "detections": detections,
                "summary": summary,
                "annotated_image": annotated_img
            }

        # Explicit demo mode only when demo_forced=True
        demo_detections = self._generate_labeled_demo_detections(w, h)
        annotated_img = ImageProcessor.draw_detections(img, demo_detections, is_demo=True)
        summary = self._summarize_detections(demo_detections)

        return {
            "success": True,
            "is_demo_mode": True,
            "demo_disclosure": "DEMO SIMULATION: Displaying sample road defect detections.",
            "model_source": "RoadGuard Demo Pipeline",
            "detections": demo_detections,
            "summary": summary,
            "annotated_image": annotated_img
        }

    def _detect_with_opencv(self, img: np.ndarray) -> List[Dict[str, Any]]:
        """
        Real OpenCV computer-vision analyzer for road surface potholes and cracks.
        Analyzes dark depression contours (potholes) and high-gradient edge networks (cracks).
        """
        h, w = img.shape[:2]
        frame_area = float(h * w)
        detections: List[Dict[str, Any]] = []

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)

        # Focus primarily on the road region (lower 80% of frame) to avoid sky/buildings
        roi_top = int(h * 0.20)
        road_gray = blurred[roi_top:, :]

        # 1. Pothole detection: dark depression regions relative to local pavement
        local_mean = cv2.blur(road_gray, (45, 45))
        dark_diff = cv2.subtract(local_mean, road_gray)
        _, pothole_mask = cv2.threshold(dark_diff, 22, 255, cv2.THRESH_BINARY)

        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        pothole_mask = cv2.morphologyEx(pothole_mask, cv2.MORPH_CLOSE, kernel_close)
        pothole_mask = cv2.morphologyEx(pothole_mask, cv2.MORPH_OPEN, kernel_open)

        contours, _ = cv2.findContours(pothole_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            area_ratio = (area / frame_area) * 100.0
            if area_ratio < 0.35 or area_ratio > 35.0:
                continue

            x, y, bw, bh = cv2.boundingRect(cnt)
            y_full = y + roi_top
            aspect = bw / float(max(bh, 1))
            if aspect < 0.25 or aspect > 5.0:
                continue

            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            solidity = area / float(max(hull_area, 1))
            if solidity < 0.45:
                continue

            conf = min(0.95, round(0.62 + (area_ratio * 0.04) + (solidity * 0.15), 3))
            sev = "High" if area_ratio > 2.2 else ("Medium" if area_ratio > 0.8 else "Low")
            detections.append({
                "class_name": "Pothole",
                "confidence": conf,
                "x1": float(x),
                "y1": float(y_full),
                "x2": float(x + bw),
                "y2": float(y_full + bh),
                "area_ratio": round(area_ratio, 2),
                "estimated_severity": sev,
            })

        # 2. Crack detection: sharp high-contrast linear/alligator edge clusters
        edges = cv2.Canny(road_gray, 70, 170)
        crack_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        crack_mask = cv2.dilate(edges, crack_kernel, iterations=1)
        crack_contours, _ = cv2.findContours(crack_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in crack_contours:
            area = cv2.contourArea(cnt)
            area_ratio = (area / frame_area) * 100.0
            if area_ratio < 0.25 or area_ratio > 18.0:
                continue

            x, y, bw, bh = cv2.boundingRect(cnt)
            y_full = y + roi_top

            # Skip if heavily overlapping an already detected pothole
            overlaps_pothole = any(
                not (x + bw < d["x1"] or x > d["x2"] or y_full + bh < d["y1"] or y_full > d["y2"])
                for d in detections if d["class_name"] == "Pothole"
            )
            if overlaps_pothole:
                continue

            aspect = bw / float(max(bh, 1))
            if aspect > 2.4:
                cls_name = "Transverse Crack"
            elif aspect < 0.5:
                cls_name = "Longitudinal Crack"
            else:
                cls_name = "Alligator Crack"

            conf = min(0.91, round(0.58 + (area_ratio * 0.03), 3))
            sev = "Medium" if area_ratio > 1.5 else "Low"
            detections.append({
                "class_name": cls_name,
                "confidence": conf,
                "x1": float(x),
                "y1": float(y_full),
                "x2": float(x + bw),
                "y2": float(y_full + bh),
                "area_ratio": round(area_ratio, 2),
                "estimated_severity": sev,
            })

        # Keep top 8 highest-confidence detections to avoid clutter
        detections.sort(key=lambda d: d["confidence"], reverse=True)
        return detections[:8]

    def _summarize_detections(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        potholes = 0
        cracks = 0
        surface_det = 0
        severities = [d.get("estimated_severity", "Low") for d in detections]

        for d in detections:
            cls = d.get("class_name", "").lower()
            if "pothole" in cls:
                potholes += 1
            elif "crack" in cls:
                cracks += 1
            elif "surface" in cls:
                surface_det += 1

        if "High" in severities:
            highest_sev = "High"
        elif "Medium" in severities:
            highest_sev = "Medium"
        elif "Low" in severities:
            highest_sev = "Low"
        else:
            highest_sev = "None"

        return {
            "total": len(detections),
            "potholes": potholes,
            "cracks": cracks,
            "surface_deterioration": surface_det,
            "highest_severity": highest_sev
        }

    def _generate_labeled_demo_detections(self, w: int, h: int) -> List[Dict[str, Any]]:
        """Generates realistic demo detections scaled to actual image dimensions."""
        # Simulated road damage centered around realistic road perspective
        cx, cy = w // 2, int(h * 0.65)
        
        # Pothole in lower center-right
        x1_p = max(10, int(cx - w * 0.12))
        y1_p = max(10, int(cy - h * 0.08))
        x2_p = min(w - 10, int(cx + w * 0.14))
        y2_p = min(h - 10, int(cy + h * 0.12))

        # Longitudinal crack on left track
        x1_c = max(10, int(w * 0.18))
        y1_c = max(10, int(h * 0.52))
        x2_c = min(w - 10, int(w * 0.36))
        y2_c = min(h - 10, int(h * 0.78))

        # Transverse crack across mid section
        x1_t = max(10, int(w * 0.40))
        y1_t = max(10, int(h * 0.48))
        x2_t = min(w - 10, int(w * 0.75))
        y2_t = min(h - 10, int(h * 0.54))

        return [
            {
                "class_name": "Pothole",
                "confidence": 0.89,
                "x1": x1_p,
                "y1": y1_p,
                "x2": x2_p,
                "y2": y2_p,
                "area_ratio": round(((x2_p - x1_p) * (y2_p - y1_p) / (w * h)) * 100, 2),
                "estimated_severity": "High"
            },
            {
                "class_name": "Alligator Crack",
                "confidence": 0.84,
                "x1": x1_c,
                "y1": y1_c,
                "x2": x2_c,
                "y2": y2_c,
                "area_ratio": round(((x2_c - x1_c) * (y2_c - y1_c) / (w * h)) * 100, 2),
                "estimated_severity": "Medium"
            },
            {
                "class_name": "Transverse Crack",
                "confidence": 0.78,
                "x1": x1_t,
                "y1": y1_t,
                "x2": x2_t,
                "y2": y2_t,
                "area_ratio": round(((x2_t - x1_t) * (y2_t - y1_t) / (w * h)) * 100, 2),
                "estimated_severity": "Low"
            }
        ]

detector = RoadDamageDetector()
