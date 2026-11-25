import os
from pathlib import Path

# Road Damage Classes aligned with global RDD (Road Damage Detection) benchmark
DAMAGE_CLASSES = {
    0: {"name": "Pothole", "code": "D40", "color": (0, 0, 255), "severity_multiplier": 1.0}, # Red
    1: {"name": "Longitudinal Crack", "code": "D00", "color": (255, 165, 0), "severity_multiplier": 0.6}, # Orange
    2: {"name": "Transverse Crack", "code": "D10", "color": (255, 215, 0), "severity_multiplier": 0.6}, # Gold
    3: {"name": "Alligator Crack", "code": "D20", "color": (0, 215, 255), "severity_multiplier": 0.8}, # Cyan
    4: {"name": "Surface Deterioration", "code": "D44", "color": (147, 112, 219), "severity_multiplier": 0.5}, # Purple
    5: {"name": "Other Road Damage", "code": "D99", "color": (255, 105, 180), "severity_multiplier": 0.5} # Pink
}

CLASS_NAMES = [v["name"] for v in DAMAGE_CLASSES.values()]

class ModelConfig:
    MODEL_PATH = os.getenv("YOLO_MODEL_PATH", str(Path(__file__).parent / "weights" / "road_damage_best.pt"))
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.35"))
    IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.45"))
    IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "640"))
    
    DATASET_SOURCE = "Global Road Damage Detection Challenge (RDD2022) - India Subset"
    LICENSE = "CC BY-SA 4.0 - Academic and Research Use"
    TRAINING_GUIDE_URL = "https://github.com/sekilab/RoadDamageDetector"
    
    @classmethod
    def weights_exist(cls) -> bool:
        return os.path.exists(cls.MODEL_PATH) and os.path.getsize(cls.MODEL_PATH) > 1000

    @classmethod
    def get_info(cls) -> dict:
        return {
            "model_path": cls.MODEL_PATH,
            "weights_found": cls.weights_exist(),
            "confidence_threshold": cls.CONFIDENCE_THRESHOLD,
            "iou_threshold": cls.IOU_THRESHOLD,
            "supported_classes": CLASS_NAMES,
            "dataset_origin": cls.DATASET_SOURCE,
            "training_documentation": "See AI_MODEL_SETUP.md for steps to download trained RDD2022 weights or train custom YOLOv8/v11 on Indian roads"
        }
