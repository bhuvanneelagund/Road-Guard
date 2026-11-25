import cv2
import numpy as np
import os
import uuid
from typing import List, Dict, Any, Tuple
from backend.app.ai.model_config import DAMAGE_CLASSES, CLASS_NAMES

class ImageProcessor:
    @staticmethod
    def load_image(image_path: str) -> np.ndarray:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"OpenCV could not decode image at: {image_path}")
        return img

    @staticmethod
    def draw_detections(image: np.ndarray, detections: List[Dict[str, Any]], is_demo: bool = False) -> np.ndarray:
        annotated = image.copy()
        h, w = annotated.shape[:2]

        for det in detections:
            x1, y1, x2, y2 = int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])
            class_name = det.get("class_name", "Road Defect")
            confidence = det.get("confidence", 0.85)

            # Find matching class color
            color = (0, 140, 255) # default orange-blue in BGR
            for c_id, c_data in DAMAGE_CLASSES.items():
                if c_data["name"].lower() == class_name.lower():
                    # cv2 uses BGR
                    r, g, b = c_data["color"]
                    color = (b, g, r)
                    break

            # Draw glowing bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)
            
            # Corner accents
            corner_len = min(20, max(5, int((x2 - x1) * 0.2)))
            cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), (255, 255, 255), 2)
            cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), (255, 255, 255), 2)
            cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), (255, 255, 255), 2)
            cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), (255, 255, 255), 2)

            # Label banner
            label = f"{class_name} {int(confidence * 100)}%"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.55
            thickness = 2
            (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)
            
            label_y = max(y1 - 6, text_h + 10)
            cv2.rectangle(annotated, (x1, label_y - text_h - 6), (x1 + text_w + 10, label_y + baseline - 2), color, -1)
            cv2.putText(annotated, label, (x1 + 5, label_y - 4), font, font_scale, (0, 0, 0), thickness, cv2.LINE_AA)
            cv2.putText(annotated, label, (x1 + 5, label_y - 4), font, font_scale, (255, 255, 255), 1, cv2.LINE_AA)

        # Draw watermarking header
        banner_h = 36
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, banner_h), (10, 18, 38), -1)
        cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)
        
        status_tag = "[DEMO SIMULATION]" if is_demo else "[AI INFERENCE ACTIVE]"
        header_text = f"ROADGUARD AI - RDD2022 {status_tag} | Defect Count: {len(detections)}"
        cv2.putText(annotated, header_text, (15, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 212, 255), 2, cv2.LINE_AA)

        return annotated

    @staticmethod
    def save_annotated(image: np.ndarray, output_dir: str, prefix: str = "annotated_") -> str:
        os.makedirs(output_dir, exist_ok=True)
        filename = f"{prefix}{uuid.uuid4().hex[:10]}.jpg"
        filepath = os.path.join(output_dir, filename)
        cv2.imwrite(filepath, image, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        return filepath

    @staticmethod
    def compare_repairs(before_path: str, after_path: str, output_dir: str) -> Dict[str, Any]:
        """Performs computer-vision assisted repair verification between before and after images."""
        img_before = cv2.imread(before_path)
        img_after = cv2.imread(after_path)

        if img_before is None or img_after is None:
            raise ValueError("Unable to read before or after repair images for verification.")

        # Resize after image to match before image dimensions
        h, w = img_before.shape[:2]
        img_after_resized = cv2.resize(img_after, (w, h))

        # Convert to grayscale
        gray_before = cv2.cvtColor(img_before, cv2.COLOR_BGR2GRAY)
        gray_after = cv2.cvtColor(img_after_resized, cv2.COLOR_BGR2GRAY)

        # Smooth to reduce sensor noise
        blur_before = cv2.GaussianBlur(gray_before, (5, 5), 0)
        blur_after = cv2.GaussianBlur(gray_after, (5, 5), 0)

        # Compute Absolute Difference & Structural Contrast
        diff = cv2.absdiff(blur_before, blur_after)
        _, thresh = cv2.threshold(diff, 35, 255, cv2.THRESH_BINARY)

        # Find remaining sharp edges in 'after' image that might indicate persistent cracks
        edges_after = cv2.Canny(blur_after, 50, 150)
        crack_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        dilated_edges = cv2.dilate(edges_after, crack_kernel)

        # Calculate defect reduction metric
        variance_before = np.var(blur_before)
        variance_after = np.var(blur_after)
        roughness_reduction = max(0.0, min(100.0, (1.0 - (variance_after / (variance_before + 1e-5))) * 100))

        # Create side-by-side comparison canvas
        diff_color = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
        diff_color[thresh > 0] = [0, 212, 255] # Highlight modified regions in Cyan

        comparison_canvas = np.hstack([img_before, img_after_resized, diff_color])
        
        # Save comparison
        os.makedirs(output_dir, exist_ok=True)
        comparison_filename = f"comparison_{uuid.uuid4().hex[:10]}.jpg"
        comparison_path = os.path.join(output_dir, comparison_filename)
        cv2.imwrite(comparison_path, comparison_canvas)

        # Residual anomaly score (0-100)
        remaining_edge_pixels = np.count_nonzero(dilated_edges)
        total_pixels = h * w
        edge_density = (remaining_edge_pixels / total_pixels) * 100

        suggested_pass = (roughness_reduction > 25.0) and (edge_density < 18.0)

        return {
            "comparison_image_path": comparison_path,
            "roughness_reduction_percent": round(roughness_reduction, 1),
            "edge_density_percent": round(edge_density, 2),
            "suggested_verdict": "Likely Repaired - Human Review Advised" if suggested_pass else "Possible Residual Cracks/Irregularities - Human Inspection Required",
            "requires_human_approval": True,
            "verification_disclaimer": "Automated CV assistance is indicative and does not replace certified civil engineering sign-off."
        }

    @staticmethod
    def detect_waterlogging(image_path: str, output_dir: str) -> Dict[str, Any]:
        """Detects surface ponding, water accumulation, and reflection patches."""
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image at {image_path}")

        h, w = img.shape[:2]
        # Focus on lower 70% of frame (road surface)
        road_roi = img[int(h * 0.3):, :]
        hsv = cv2.cvtColor(road_roi, cv2.COLOR_BGR2HSV)

        # Water in typical road scenes shows low saturation, moderate-high value, or muddy brown
        # Dark puddle / sky reflection mask
        lower_water = np.array([0, 0, 40])
        upper_water = np.array([180, 75, 190])
        mask1 = cv2.inRange(hsv, lower_water, upper_water)

        # Muddy water mask
        lower_muddy = np.array([10, 50, 40])
        upper_muddy = np.array([30, 200, 180])
        mask2 = cv2.inRange(hsv, lower_muddy, upper_muddy)

        water_mask = cv2.bitwise_or(mask1, mask2)
        
        # Morphological cleanup
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        cleaned_mask = cv2.morphologyEx(water_mask, cv2.MORPH_CLOSE, kernel)
        cleaned_mask = cv2.morphologyEx(cleaned_mask, cv2.MORPH_OPEN, kernel)

        water_pixels = np.count_nonzero(cleaned_mask)
        roi_pixels = road_roi.shape[0] * road_roi.shape[1]
        water_ratio = (water_pixels / roi_pixels) * 100

        # Annotate
        annotated = img.copy()
        color_mask = np.zeros_like(road_roi)
        color_mask[cleaned_mask > 0] = [255, 140, 0] # Electric blue highlight in BGR
        
        annotated[int(h * 0.3):, :] = cv2.addWeighted(road_roi, 0.7, color_mask, 0.3, 0)
        
        # Risk assessment
        if water_ratio > 35:
            risk_level = "Severe Flood / Submerged Road"
            alert_status = "CRITICAL_HAZARD"
        elif water_ratio > 15:
            risk_level = "Significant Waterlogging / Hydroplaning Risk"
            alert_status = "WARNING"
        elif water_ratio > 4:
            risk_level = "Minor Puddles / Surface Wetness"
            alert_status = "MONITORING"
        else:
            risk_level = "Dry / Normal Road Surface"
            alert_status = "NORMAL"

        os.makedirs(output_dir, exist_ok=True)
        annotated_filename = f"waterlog_{uuid.uuid4().hex[:10]}.jpg"
        out_path = os.path.join(output_dir, annotated_filename)
        cv2.imwrite(out_path, annotated)

        return {
            "water_surface_ratio_percent": round(water_ratio, 2),
            "risk_level": risk_level,
            "alert_status": alert_status,
            "annotated_image_path": out_path,
            "waterlogging_detected": water_ratio > 8.0,
            "disclaimer": "Optical waterlogging detection is based on surface reflection and color contrast; not an official hydrological gauge."
        }
