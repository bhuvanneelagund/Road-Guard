import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.utils.seed_data import seed_initial_data
from backend.app.routes import (
    auth,
    dashboard,
    detections,
    roads,
    complaints,
    repairs,
    verification,
    priority,
    cost_estimator,
    prediction,
    contractors,
    waterlogging
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Intelligent Road Damage Detection, Prediction and Maintenance Platform. "
        "A full-stack AI-powered solution for Indian municipal road infrastructure."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount static uploads endpoint
upload_path = Path(settings.UPLOAD_DIR)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(detections.router, prefix="/api")
app.include_router(roads.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(repairs.router, prefix="/api")
app.include_router(verification.router, prefix="/api")
app.include_router(priority.router, prefix="/api")
app.include_router(cost_estimator.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(contractors.router, prefix="/api")
app.include_router(waterlogging.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    # Seed initial data for smooth hackathon demonstration
    try:
        seed_initial_data()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "OPERATIONAL",
        "version": settings.VERSION,
        "api_docs": "/docs",
        "database_engine": "MongoDB" if hasattr(app, "db") and getattr(app, "db", None) else "SQLite Document DB (Active)",
        "target_region": "Indian Roads Infrastructure"
    }

@app.get("/api/health")
def health_check():
    from backend.app.database import db
    from backend.app.ai.model_config import ModelConfig
    return {
        "status": "healthy",
        "api_version": settings.VERSION,
        "database": "connected",
        "database_type": "MongoDB" if db.is_mongodb else "SQLite Document Mode",
        "ai_weights_available": ModelConfig.weights_exist(),
        "ai_model_path": ModelConfig.MODEL_PATH,
        "demo_mode_enabled": settings.ENABLE_DEMO_FALLBACK
    }
