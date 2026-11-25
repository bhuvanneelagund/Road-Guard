from typing import Dict, Any, List

class RoadScoringEngine:
    """
    Computes an indicative Road Health Score from 0 to 100 based on visible structural defects,
    traffic severity factors, complaints, and recurrence rates.

    SCORING FORMULA DOCUMENTATION:
    Base Health: 100 points
    Deductions:
      - Potholes: -12.0 points per confirmed pothole (high hazard to 2-wheelers and autos)
      - Alligator / Severe Cracks: -7.0 points per crack segment
      - Longitudinal / Transverse Cracks: -4.0 points per crack segment
      - Surface Deterioration / Ravelling: -3.0 points per instance
      - Waterlogging / Drainage failure: -10.0 points if flood-prone
      - Unresolved Citizen Complaints: -3.5 points per pending complaint
      - Repeat Damage Multiplier: 1.25x penalty if section has been repaired within last 12 months
      - Traffic Density Factor:
          Extreme: 1.20x penalty multiplier
          High: 1.10x penalty multiplier
          Medium: 1.00x multiplier
          Low: 0.90x multiplier

    Formula:
      Total Penalty = (Sum of Damage Penalties) * Traffic Multiplier * Repeat Multiplier
      Road Health Score = max(5.0, min(100.0, 100.0 - Total Penalty))

    DISCLAIMER:
    This algorithm produces a rapid data-driven diagnostic index (0-100) for municipal resource
    allocation. It is not an official PWD/IRC (Indian Roads Congress) certified structural pavement test.
    """

    TRAFFIC_MULTIPLIERS = {
        "Extreme": 1.20,
        "High": 1.10,
        "Medium": 1.0,
        "Low": 0.90
    }

    @classmethod
    def calculate_road_score(
        cls,
        potholes: int,
        alligator_cracks: int,
        linear_cracks: int,
        surface_deteriorations: int,
        pending_complaints: int = 0,
        traffic_density: str = "Medium",
        is_flood_prone: bool = False,
        is_repeat_damage: bool = False
    ) -> Dict[str, Any]:
        raw_penalty = (
            (potholes * 12.0) +
            (alligator_cracks * 7.0) +
            (linear_cracks * 4.0) +
            (surface_deteriorations * 3.0) +
            (pending_complaints * 3.5) +
            (10.0 if is_flood_prone else 0.0)
        )

        traffic_mult = cls.TRAFFIC_MULTIPLIERS.get(traffic_density, 1.0)
        repeat_mult = 1.25 if is_repeat_damage else 1.00

        total_penalty = raw_penalty * traffic_mult * repeat_mult
        score = max(5.0, min(100.0, 100.0 - total_penalty))
        rounded_score = round(score, 1)

        # Classification
        if rounded_score >= 80.0:
            status = "Good Condition"
            badge_color = "emerald"
            inspection_interval_days = 90
            action = "Routine Monitoring"
        elif rounded_score >= 60.0:
            status = "Moderate Wear"
            badge_color = "amber"
            inspection_interval_days = 45
            action = "Preventative Patching & Crack Sealing"
        elif rounded_score >= 35.0:
            status = "Poor / Substandard"
            badge_color = "orange"
            inspection_interval_days = 20
            action = "Priority Resurfacing & Pothole Repair"
        else:
            status = "Critical / Dangerous"
            badge_color = "rose"
            inspection_interval_days = 7
            action = "Emergency Structural Overhaul & Traffic Advisory"

        return {
            "health_score": rounded_score,
            "status": status,
            "badge_color": badge_color,
            "next_inspection_days": inspection_interval_days,
            "recommended_action": action,
            "deductions_breakdown": {
                "potholes_deduction": round(potholes * 12.0, 1),
                "alligator_cracks_deduction": round(alligator_cracks * 7.0, 1),
                "linear_cracks_deduction": round(linear_cracks * 4.0, 1),
                "surface_wear_deduction": round(surface_deteriorations * 3.0, 1),
                "complaints_deduction": round(pending_complaints * 3.5, 1),
                "flood_prone_deduction": 10.0 if is_flood_prone else 0.0,
                "traffic_multiplier": traffic_mult,
                "repeat_damage_multiplier": repeat_mult,
                "total_penalty": round(total_penalty, 1)
            },
            "disclaimer": (
                "The Road Health Score is an indicative heuristic calculation designed for municipal prioritization. "
                "It does not represent a certified engineering structural audit."
            )
        }

scoring_engine = RoadScoringEngine()
