from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("Citizen", description="Administrator, Government Authority, Inspector, Citizen")
    department: Optional[str] = None
    phone: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Road Schemas
class GPSCoordinate(BaseModel):
    lat: float
    lng: float
    elevation: Optional[float] = None
    timestamp: Optional[str] = None

class RoadCreateRequest(BaseModel):
    road_id: Optional[str] = None
    road_name: str
    state: str = "Karnataka"
    district: str = "Davanagere"
    city: str = "Davanagere"
    road_category: str = Field("Major District Road", description="National Highway, State Highway, Major District Road, City Arterial, Residential Street")
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    traffic_density: str = Field("Medium", description="Low, Medium, High, Extreme")
    has_schools_nearby: bool = False
    has_hospitals_nearby: bool = False
    flood_prone: bool = False
    length_km: float = 1.0

class RoadUpdateRequest(BaseModel):
    road_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    road_category: Optional[str] = None
    traffic_density: Optional[str] = None
    has_schools_nearby: Optional[bool] = None
    has_hospitals_nearby: Optional[bool] = None
    flood_prone: Optional[bool] = None
    length_km: Optional[float] = None

# Detection Schemas
class BoundingBox(BaseModel):
    class_name: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float
    area_ratio: Optional[float] = 0.0
    estimated_severity: Optional[str] = "Medium"

class DetectionResponse(BaseModel):
    id: str
    media_type: str = "image" # image or video
    original_file_url: str
    annotated_file_url: Optional[str] = None
    detected_objects: List[Dict[str, Any]] = []
    total_defects: int = 0
    potholes_count: int = 0
    cracks_count: int = 0
    surface_deterioration_count: int = 0
    highest_severity: str = "Low"
    lat: Optional[float] = None
    lng: Optional[float] = None
    road_name: Optional[str] = None
    road_id: Optional[str] = None
    is_demo_mode: bool = False
    model_version: str = "YOLOv8-RDD2022-India"
    created_at: Optional[str] = None

# Complaint Schemas
class ComplaintCreateRequest(BaseModel):
    citizen_name: str
    contact_details: Optional[str] = None
    road_name: str
    state: str = "Karnataka"
    district: str = "Davanagere"
    city: str = "Davanagere"
    damage_type: str
    description: str
    lat: float
    lng: float
    photo_url: Optional[str] = None
    language_used: Optional[str] = "English"

class ComplaintStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Submitted, Under Review, Assigned, Repair in Progress, Completed, Rejected")
    admin_notes: Optional[str] = None
    assigned_contractor_id: Optional[str] = None

# Repair & Verification Schemas
class RepairCreateRequest(BaseModel):
    road_id: str
    road_name: str
    damage_description: str
    severity: str = "High"
    contractor_id: Optional[str] = None
    contractor_name: Optional[str] = None
    deadline_date: Optional[str] = None
    estimated_cost: Optional[float] = None
    lat: float
    lng: float
    before_image_url: Optional[str] = None

class VerificationSubmitRequest(BaseModel):
    repair_id: str
    after_image_url: str
    inspector_comments: Optional[str] = None
    human_approved: bool = False

# Cost Estimator
class CostEstimateRequest(BaseModel):
    damage_length_m: float
    damage_width_m: float
    estimated_depth_cm: Optional[float] = None
    damage_depth_cm: Optional[float] = None
    material_type: str = Field("Bituminous Asphalt", description="Bituminous Asphalt, Cold Mix, Reinforced Concrete, Paver Blocks, Gravel/WBM")
    material_cost_per_m3: Optional[float] = 6500.0
    labour_cost_per_day: Optional[float] = 1200.0
    number_of_labour_days: Optional[float] = 1.5
    machinery_rental_cost: Optional[float] = 3000.0
    overhead_and_contingency_percent: Optional[float] = 15.0

# Priority Weights
class PriorityCalculateRequest(BaseModel):
    damage_severity_weight: float = 0.35
    traffic_importance_weight: float = 0.20
    schools_hospitals_weight: float = 0.20
    repeat_damage_weight: float = 0.15
    waterlogging_weight: float = 0.10
