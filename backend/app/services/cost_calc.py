from typing import Dict, Any

class CostEstimator:
    """
    Calculates estimated civil repair costs based on volumetric defect measurements
    and prevailing Indian municipal schedule of rates (SoR).
    """

    MATERIAL_DENSITIES = {
        "Bituminous Asphalt": 2.4, # tonnes per cubic meter
        "Cold Mix": 2.2,
        "Reinforced Concrete": 2.5,
        "Paver Blocks": 2.1,
        "Gravel/WBM": 1.9
    }

    MATERIAL_UNIT_RATES_INR = {
        "Bituminous Asphalt": 6500.0, # per m3
        "Cold Mix": 7200.0,
        "Reinforced Concrete": 8500.0,
        "Paver Blocks": 4800.0,
        "Gravel/WBM": 2200.0
    }

    @classmethod
    def estimate_repair_cost(
        cls,
        length_m: float,
        width_m: float,
        depth_cm: float,
        material_type: str = "Bituminous Asphalt",
        custom_material_rate: float = 0.0,
        labor_day_rate: float = 1200.0,
        labor_days: float = 1.5,
        machinery_cost: float = 3000.0,
        contingency_percent: float = 15.0
    ) -> Dict[str, Any]:
        # Dimensions
        depth_m = depth_cm / 100.0
        # Add 15% cutting/dressing margin around defect perimeter
        effective_area_m2 = round((length_m + 0.2) * (width_m + 0.2), 3)
        volume_m3 = round(effective_area_m2 * depth_m, 4)

        # Rate
        rate_per_m3 = custom_material_rate if custom_material_rate > 0 else cls.MATERIAL_UNIT_RATES_INR.get(material_type, 6500.0)
        material_cost = round(volume_m3 * rate_per_m3, 2)
        
        # Labor and Machinery
        labor_total = round(labor_day_rate * labor_days * 2, 2) # crew of 2 workers minimum
        equipment_total = round(machinery_cost, 2) # e.g. plate compactor / bitumen tack sprayer
        
        subtotal = material_cost + labor_total + equipment_total
        contingency_amount = round(subtotal * (contingency_percent / 100.0), 2)
        grand_total = round(subtotal + contingency_amount, 2)

        return {
            "dimensions": {
                "length_m": length_m,
                "width_m": width_m,
                "depth_cm": depth_cm,
                "effective_surface_area_m2": effective_area_m2,
                "fill_volume_m3": volume_m3,
            },
            "material": {
                "type": material_type,
                "unit_rate_per_m3_inr": rate_per_m3,
                "estimated_weight_tonnes": round(volume_m3 * cls.MATERIAL_DENSITIES.get(material_type, 2.4), 2),
                "total_material_cost_inr": material_cost
            },
            "labor": {
                "daily_rate_inr": labor_day_rate,
                "estimated_crew_days": labor_days,
                "crew_size": 2,
                "total_labor_cost_inr": labor_total
            },
            "machinery_and_tools_inr": equipment_total,
            "contingency_percent": contingency_percent,
            "contingency_amount_inr": contingency_amount,
            "estimated_grand_total_inr": grand_total,
            "disclaimer": (
                "INDICATIVE ESTIMATE ONLY. Actual expenditure requires formal site inspection, "
                "sub-base soil evaluation, and official validation against state Public Works Department (PWD) Schedule of Rates."
            )
        }

cost_estimator = CostEstimator()
