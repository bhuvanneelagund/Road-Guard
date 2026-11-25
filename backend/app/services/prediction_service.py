import datetime
from typing import Dict, Any, List, Optional

class PredictiveMaintenanceService:
    """
    Analyzes historical inspection series, recurrence cycles, monsoon weather impact,
    and road traffic to project future surface degradation.
    """

    @classmethod
    def predict_degradation(
        cls,
        road_id: str,
        road_name: str,
        current_health_score: float,
        historical_records: List[Dict[str, Any]],
        traffic_density: str = "Medium",
        is_flood_prone: bool = False,
        monsoon_proximity_months: int = 3
    ) -> Dict[str, Any]:
        # Rule: Only compute regression prediction if there are at least 3 historical inspection records
        if len(historical_records) < 3:
            return {
                "prediction_available": False,
                "road_id": road_id,
                "road_name": road_name,
                "current_health_score": current_health_score,
                "records_count": len(historical_records),
                "minimum_required_records": 3,
                "status_message": (
                    f"Insufficient historical data ({len(historical_records)} of 3 required inspections). "
                    "Predictive trend modeling is disabled to prevent inaccurate projections. "
                    "Conduct at least 3 temporal scans of this road section to unlock deterioration forecasting."
                ),
                "projections": []
            }

        # Calculate historical monthly degradation velocity
        # Sort records by timestamp
        sorted_records = sorted(
            historical_records,
            key=lambda x: x.get("created_at") or x.get("inspection_date") or ""
        )

        scores = [r.get("health_score", 70.0) for r in sorted_records]
        avg_drop_per_cycle = max(0.5, (scores[0] - scores[-1]) / max(1, len(scores) - 1))
        
        # Environmental acceleration factors
        traffic_accel = {"Extreme": 1.4, "High": 1.25, "Medium": 1.0, "Low": 0.8}.get(traffic_density, 1.0)
        flood_accel = 1.35 if is_flood_prone else 1.0
        monsoon_factor = 1.3 if monsoon_proximity_months <= 2 else 1.0

        monthly_decay_rate = round(avg_drop_per_cycle * traffic_accel * flood_accel * monsoon_factor, 2)

        # Projections for 3, 6, and 12 months
        projections = []
        for months_ahead in [3, 6, 9, 12]:
            projected_score = max(5.0, round(current_health_score - (monthly_decay_rate * months_ahead), 1))
            
            if projected_score < 40.0:
                tier = "Critical Failure Risk"
                intervention = "Structural milling and asphalt overlay needed before milestone."
            elif projected_score < 60.0:
                tier = "Moderate Deterioration"
                intervention = "Micro-surfacing and preventative crack sealing recommended."
            else:
                tier = "Stable Condition"
                intervention = "Standard cyclical drainage clearing and monitoring."

            projections.append({
                "months_ahead": months_ahead,
                "projected_score": projected_score,
                "projected_tier": tier,
                "recommended_intervention": intervention
            })

        critical_failure_month = None
        if monthly_decay_rate > 0:
            months_to_crit = max(1, int((current_health_score - 40.0) / monthly_decay_rate))
            if months_to_crit <= 18:
                critical_failure_month = months_to_crit

        return {
            "prediction_available": True,
            "road_id": road_id,
            "road_name": road_name,
            "current_health_score": current_health_score,
            "sample_size": len(historical_records),
            "monthly_decay_rate_points": monthly_decay_rate,
            "critical_threshold_reach_months": critical_failure_month,
            "contributing_stress_factors": {
                "traffic_acceleration": f"{traffic_density} (+{int((traffic_accel - 1)*100)}%)",
                "waterlogging_stress": f"{'Active' if is_flood_prone else 'Normal'} (+{int((flood_accel - 1)*100)}%)",
                "monsoon_proximity_months": monsoon_proximity_months
            },
            "projections": projections,
            "confidence_statement": "Linear degradation baseline calculated from local historical observations. Unscheduled heavy rain or utility trenching may alter degradation rate."
        }

prediction_service = PredictiveMaintenanceService()
