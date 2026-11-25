# ROADGUARD AI - AI Model Architecture & Training Guide

## 1. Why Generic Object Models (COCO) Cannot Detect Road Damage

A common mistake in beginner student projects is taking a general-purpose pre-trained YOLO model (trained on the standard COCO 80 dataset: person, car, dog, chair) and claiming it detects potholes. 

**Standard COCO models have never seen road distress patterns and cannot detect potholes or cracks.** 

RoadGuard AI uses a dedicated civil infrastructure computer vision pipeline designed for the **Road Damage Detection (RDD)** benchmark.

---

## 2. Damage Classification Taxonomy

RoadGuard AI aligns with the international **RDD2022 (Road Damage Detection Challenge)** taxonomy:

| Class Code | Category Name | Description & Visual Characteristics | Severity Multiplier |
|---|---|---|---|
| **D40** | **Pothole** | Bowl-shaped cavity in the road surface of varying depth. Severe hazard to 2-wheelers and autos. | **1.0x (Highest)** |
| **D20** | **Alligator Crack** | Interconnected polygon fatigue cracks resembling crocodile skin, indicating structural sub-base failure. | **0.8x** |
| **D00** | **Longitudinal Crack** | Cracks parallel to the road centerline caused by pavement joint failure or heavy wheelpath rutting. | **0.6x** |
| **D10** | **Transverse Crack** | Cracks perpendicular to the road centerline caused by thermal contraction and asphalt shrinkage. | **0.6x** |
| **D44** | **Surface Deterioration** | Surface ravelling, aggregate stripping, loose gravel, and asphalt peeling. | **0.5x** |
| **D99** | **Other Road Damage** | Manhole subsidence, edge drop-offs, and construction trenching defects. | **0.5x** |

---

## 3. Obtaining the RDD2022 Dataset (India Subset)

The **RDD2022 dataset** was released by the Sekilab research group and contains annotated images collected across multiple countries, including a large dedicated **India subset** collected across Indian urban and rural highways.

* **Dataset Paper**: *Crowdsensing-based Road Damage Detection Challenge (IEEE Big Data)*
* **License**: **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
* **Official Repository**: [https://github.com/sekilab/RoadDamageDetector](https://github.com/sekilab/RoadDamageDetector)

### Dataset Structure:
```
RDD2022/
  ├── India/
  │   ├── images/
  │   │   ├── train/
  │   │   └── val/
  │   └── annotations/
  │       └── xmls/
```

---

## 4. How to Train a Custom YOLOv8 / YOLOv11 Model

### Step 4.1: Convert Pascal VOC XML Annotations to YOLO TXT Format
```python
# Convert bounding boxes from [xmin, ymin, xmax, ymax] to normalized [x_center, y_center, width, height]
# Classes:
# 0: Pothole (D40)
# 1: Longitudinal Crack (D00)
# 2: Transverse Crack (D10)
# 3: Alligator Crack (D20)
# 4: Surface Deterioration (D44)
# 5: Other Road Damage (D99)
```

### Step 4.2: Create Dataset YAML (`rdd2022_india.yaml`)
```yaml
path: /path/to/RDD2022_India
train: images/train
val: images/val

names:
  0: Pothole
  1: Longitudinal Crack
  2: Transverse Crack
  3: Alligator Crack
  4: Surface Deterioration
  5: Other Road Damage
```

### Step 4.3: Train with Ultralytics
Run training on a machine with an NVIDIA GPU (or Google Colab T4 / A100):
```python
from ultralytics import YOLO

# Load base architecture
model = YOLO('yolov8m.pt') # or yolov11m.pt

# Train on Indian road damage dataset
results = model.train(
    data='rdd2022_india.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    lr0=0.01,
    device=0, # GPU
    save=True
)
```

### Step 4.4: Export Weights
The best model checkpoint will be generated at:
`runs/detect/train/weights/best.pt`

Copy `best.pt` into the RoadGuard AI backend weights directory:
`backend/app/ai/weights/road_damage_best.pt`

---

## 5. Configuring Model Path in RoadGuard AI

Set the environment variable in `backend/.env` or in your system environment:
```env
YOLO_MODEL_PATH=backend/app/ai/weights/road_damage_best.pt
CONFIDENCE_THRESHOLD=0.35
IOU_THRESHOLD=0.45
ENABLE_DEMO_FALLBACK=True
```

---

## 6. How Missing Weights & Demo Mode Operate

If `road_damage_best.pt` is not present at the configured path:
1. RoadGuard AI **does not crash or invent false detections**.
2. It detects `ModelConfig.weights_exist() == False` and reports this transparently on the `/api/health` endpoint and in the UI.
3. If the user uploads a road image with **Demo Mode enabled**:
   * The pipeline returns labeled simulation detections clearly marked with `"is_demo_mode": true`.
   * The banner on the annotated image clearly indicates: `[DEMO SIMULATION]`.
4. If Demo Mode is disabled and weights are missing:
   * The system returns an informative error code `ROAD_DAMAGE_WEIGHTS_MISSING` with step-by-step instructions on obtaining or training weights.
