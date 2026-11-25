import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from typing import Optional, List
from backend.app.schemas.schemas import ComplaintCreateRequest, ComplaintStatusUpdateRequest
from backend.app.database import db
from backend.app.services.storage import storage_service

router = APIRouter(prefix="/complaints", tags=["Citizen Complaints"])

@router.post("")
async def submit_complaint(
    citizen_name: str = Form(...),
    contact_details: Optional[str] = Form(None),
    road_name: str = Form(...),
    state: str = Form("Karnataka"),
    district: str = Form("Davanagere"),
    city: str = Form("Davanagere"),
    damage_type: str = Form(...),
    description: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    language_used: Optional[str] = Form("English"),
    photo: Optional[UploadFile] = File(None)
):
    """Submits a citizen road damage complaint with optional voice transcript and evidence photo."""
    photo_url = None
    if photo:
        saved_img = await storage_service.save_image(photo)
        photo_url = storage_service.get_relative_url(saved_img)

    complaint_id = f"CMP-{datetime.date.today().year}-{uuid.uuid4().hex[:6].upper()}"

    doc = {
        "id": complaint_id,
        "citizen_name": citizen_name.strip(),
        "contact_details": contact_details,
        "road_name": road_name.strip(),
        "state": state,
        "district": district,
        "city": city,
        "damage_type": damage_type,
        "description": description,
        "lat": lat,
        "lng": lng,
        "photo_url": photo_url,
        "language_used": language_used or "English",
        "status": "Submitted",
        "assigned_contractor_id": None,
        "assigned_contractor_name": None,
        "admin_notes": "Awaiting initial authority triage.",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.complaints.insert_one(doc)
    return doc

@router.get("")
async def list_complaints(
    status_filter: Optional[str] = Query(None),
    road_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = {}
    if status_filter:
        query["status"] = status_filter
    if road_name:
        query["road_name"] = road_name
    
    complaints = db.complaints.find(query=query)
    if search:
        s = search.lower()
        complaints = [c for c in complaints if s in c.get("id", "").lower() or s in c.get("citizen_name", "").lower() or s in c.get("road_name", "").lower() or s in c.get("description", "").lower()]
    return complaints

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    doc = db.complaints.find_one({"id": complaint_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint record not found.")
    return doc

@router.put("/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, req: ComplaintStatusUpdateRequest):
    complaint = db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint record not found.")

    valid_statuses = ["Submitted", "Under Review", "Assigned", "Repair in Progress", "Completed", "Rejected"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    update_fields = {"status": req.status}
    if req.admin_notes:
        update_fields["admin_notes"] = req.admin_notes
    if req.assigned_contractor_id:
        update_fields["assigned_contractor_id"] = req.assigned_contractor_id
        contractor = db.contractors.find_one({"id": req.assigned_contractor_id})
        if contractor:
            update_fields["assigned_contractor_name"] = contractor.get("company_name")

    db.complaints.update_one({"id": complaint_id}, {"$set": update_fields})
    return db.complaints.find_one({"id": complaint_id})
