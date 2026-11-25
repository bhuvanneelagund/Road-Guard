import uuid
import datetime
from fastapi import APIRouter, HTTPException, status
from backend.app.database import db

router = APIRouter(prefix="/contractors", tags=["Contractor Accountability"])

@router.get("")
async def list_contractors():
    return db.contractors.find()

@router.post("")
async def register_contractor(payload: dict):
    ctr_id = f"CTR-{uuid.uuid4().hex[:4].upper()}"
    doc = {
        "id": ctr_id,
        "company_name": payload.get("company_name"),
        "lead_engineer": payload.get("lead_engineer"),
        "contact_email": payload.get("contact_email"),
        "phone": payload.get("phone"),
        "license_number": payload.get("license_number"),
        "active_assignments": 0,
        "completed_repairs": 0,
        "repeat_damage_count": 0,
        "on_time_completion_rate": 100.0,
        "rating": 5.0,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db.contractors.insert_one(doc)
    return doc

@router.get("/{contractor_id}/assignments")
async def get_contractor_assignments(contractor_id: str):
    repairs = db.repairs.find({"contractor_id": contractor_id})
    complaints = db.complaints.find({"assigned_contractor_id": contractor_id})
    return {
        "repairs": repairs,
        "complaints": complaints
    }
