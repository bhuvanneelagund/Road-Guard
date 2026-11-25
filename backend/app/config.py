import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "ROADGUARD AI"
    TAGLINE: str = "Detect Today. Predict Tomorrow. Protect Every Journey."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "rg-ai-secret-key-super-secure-production-ready-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "roadguard_ai")
    USE_SQLITE_FALLBACK: bool = os.getenv("USE_SQLITE_FALLBACK", "True").lower() in ("true", "1")
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", str(BASE_DIR / "roadguard.db"))
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    MAX_IMAGE_SIZE_MB: int = 25
    MAX_VIDEO_SIZE_MB: int = 200
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/webp"]
    ALLOWED_VIDEO_TYPES: list = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
    
    # AI Detection
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", str(BASE_DIR / "app" / "ai" / "weights" / "road_damage_best.pt"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.35"))
    IOU_THRESHOLD: float = float(os.getenv("IOU_THRESHOLD", "0.45"))
    ENABLE_DEMO_FALLBACK: bool = os.getenv("ENABLE_DEMO_FALLBACK", "True").lower() in ("true", "1")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()
