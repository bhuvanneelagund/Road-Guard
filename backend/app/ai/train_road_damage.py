"""
ROADGUARD AI - RDD2022 Custom YOLO Training Utility
This script automates training or fine-tuning YOLOv8 on Indian road damage datasets.
"""
import os
import sys
import argparse

def train_road_damage(data_yaml: str, epochs: int = 100, batch_size: int = 16, imgsz: int = 640):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] ultralytics package not installed. Run: pip install ultralytics")
        sys.exit(1)

    print("==================================================")
    print("ROADGUARD AI - YOLOv8 RDD2022 Training Pipeline")
    print("==================================================")
    print(f"Data YAML: {data_yaml}")
    print(f"Target Epochs: {epochs}")
    print(f"Batch Size: {batch_size}")
    print(f"Image Size: {imgsz}")
    print("Dataset Taxonomy: Pothole(D40), Longitudinal(D00), Transverse(D10), Alligator(D20), Surface(D44), Other(D99)")
    print("==================================================")

    if not os.path.exists(data_yaml):
        print(f"[ERROR] Dataset configuration file '{data_yaml}' not found.")
        print("Please follow instructions in AI_MODEL_SETUP.md to prepare RDD2022 dataset.")
        sys.exit(1)

    # Load base model
    model = YOLO("yolov8m.pt")
    
    # Train
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        save=True,
        project="backend/app/ai/weights",
        name="road_damage_run"
    )

    print("\nTraining completed successfully!")
    print(f"Model saved to: {results.save_dir}/weights/best.pt")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train RoadGuard AI YOLO on RDD2022")
    parser.add_argument("--data", type=str, default="rdd2022_india.yaml", help="Path to dataset yaml")
    parser.add_argument("--epochs", type=int, default=100, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    args = parser.parse_args()

    train_road_damage(args.data, args.epochs, args.batch)
