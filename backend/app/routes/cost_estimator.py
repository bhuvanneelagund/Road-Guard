from fastapi import APIRouter
from backend.app.schemas.schemas import CostEstimateRequest
from backend.app.services.cost_calc import cost_estimator

router = APIRouter(prefix="/cost-estimator", tags=["Repair Cost Estimator"])

@router.post("")
async def estimate_cost(req: CostEstimateRequest):
    depth_val = req.estimated_depth_cm if req.estimated_depth_cm is not None else (req.damage_depth_cm if req.damage_depth_cm is not None else 5.0)
    return cost_estimator.estimate_repair_cost(
        length_m=req.damage_length_m,
        width_m=req.damage_width_m,
        depth_cm=depth_val,
        material_type=req.material_type,
        custom_material_rate=req.material_cost_per_m3 or 0.0,
        labor_day_rate=req.labour_cost_per_day or 1200.0,
        labor_days=req.number_of_labour_days or 1.5,
        machinery_cost=req.machinery_rental_cost or 3000.0,
        contingency_percent=req.overhead_and_contingency_percent or 15.0
    )
