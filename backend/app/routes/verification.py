import os
import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from typing import Optional
from backend.app.database import db
from backend.app.services.storage import storage_service
from backend.app.ai.image_processor import ImageProcessor

router = APIRouter(prefix="/verification", tags=["Repair Verification"])

@router.post("")
async def submit_repair_verification(
    repair_id: Optional[str] = Form(None),
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    inspector_comments: Optional[str] = Form(None),
    human_approved: Optional[bool] = Form(False)
):
    """
    Compares before and after repair images with computer-vision assistance.
    Requires human engineer sign-off to finalize approval.
    """
    # Save both images securely
    before_path = await storage_service.save_image(before_image)
    after_path = await storage_service.save_image(after_image)

    before_url = storage_service.get_relative_url(before_path)
    after_url = storage_service.get_relative_url(after_path)

    # Perform CV difference & residual crack analysis
    verif_out_dir = os.path.join(storage_service.upload_dir, "verification")
    analysis = ImageProcessor.compare_repairs(before_path, after_path, verif_out_dir)
    comparison_url = storage_service.get_relative_url(analysis["comparison_image_path"])

    record_id = f"VRF-{uuid.uuid4().hex[:8].upper()}"
    status_label = "Approved by Inspector" if human_approved else "Pending Human Inspector Approval"

    verification_doc = {
        "id": record_id,
        "repair_id": repair_id,
        "before_image_url": before_url,
        "after_image_url": after_url,
        "comparison_image_url": comparison_url,
        "roughness_reduction_percent": analysis["roughness_reduction_percent"],
        "edge_density_percent": analysis["edge_density_percent"],
        "cv_verdict_suggestion": analysis["suggested_verdict"],
        "human_approved": human_approved,
        "inspector_comments": inspector_comments or "Visual inspection registered.",
        "status": status_label,
        "disclaimer": analysis["verification_disclaimer"],
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.verification_records.insert_one(verification_doc)

    # Update repair record if repair_id provided
    if repair_id:
        repair = db.repairs.find_one({"id": repair_id})
        if repair:
            update_data = {
                "after_image_url": after_url,
                "inspector_approved": human_approved,
                "inspector_comments": inspector_comments,
                "status": "Completed & Verified" if human_approved else "Verification In Review"
            }
            db.repairs.update_one({"id": repair_id}, {"$set": update_data})

    return verification_doc

@router.get("/{record_id}")
async def get_verification_record(record_id: str):
    record = db.verification_records.find_one({"id": record_id})
    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found.")
    return record

@router.put("/{record_id}/approve")
async def approve_verification(record_id: str, payload: dict):
    record = db.verification_records.find_one({"id": record_id})
    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found.")

    approved = bool(payload.get("approved", True))
    comments = payload.get("inspector_comments", record.get("inspector_comments"))

    db.verification_records.update_one(
        {"id": record_id},
        {"$set": {
            "human_approved": approved,
            "inspector_comments": comments,
            "status": "Approved by Inspector" if approved else "Rejected - Remediation Required"
        }}
    )

    if record.get("repair_id"):
        db.repairs.update_one(
            {"id": record["repair_id"]},
            {"$set": {
                "inspector_approved": approved,
                "status": "Completed & Verified" if approved else "Remediation Required"
            }}
        )

    return db.verification_records.find_one({"id": record_id})
