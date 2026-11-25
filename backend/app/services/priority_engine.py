from typing import Dict, Any, List, Optional

class PriorityEngine:
    """
    Transparent Road Repair Priority and Accident Risk Assessment Engine.
    Combines visual damage severity with socioeconomic and infrastructural factors.
    """

    DEFAULT_WEIGHTS = {
        "damage_severity": 0.35,
        "traffic_importance": 0.20,
        "sensitive_zones": 0.20, # schools & hospitals
        "repeat_damage": 0.15,
        "waterlogging": 0.10
    }

    SEVERITY_SCORES = {
        "Critical": 100.0,
        "High": 85.0,
        "Medium": 55.0,
        "Low": 25.0,
        "None": 0.0
    }

    TRAFFIC_SCORES = {
        "Extreme": 100.0,
        "High": 80.0,
        "Medium": 50.0,
        "Low": 20.0
    }

    ROAD_IMPORTANCE = {
        "National Highway": 100.0,
        "State Highway": 85.0,
        "Major District Road": 65.0,
        "City Arterial": 70.0,
        "Residential Street": 40.0
    }

    @classmethod
    def calculate_priority(
        cls,
        damage_severity: str = "Medium",
        road_category: str = "Major District Road",
        traffic_density: str = "Medium",
        has_schools_nearby: bool = False,
        has_hospitals_nearby: bool = False,
        is_repeat_damage: bool = False,
        is_flood_prone: bool = False,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        weights = dict(cls.DEFAULT_WEIGHTS)
        if custom_weights:
            weights.update(custom_weights)

        # Normalize weights to sum to 1.0
        total_w = sum(weights.values()) or 1.0
        norm_weights = {k: v / total_w for k, v in weights.items()}

        # Factor Scores (0-100)
        sev_score = cls.SEVERITY_SCORES.get(damage_severity, 50.0)
        traf_score = cls.TRAFFIC_SCORES.get(traffic_density, 50.0)
        road_score = cls.ROAD_IMPORTANCE.get(road_category, 50.0)
        traffic_combined = (traf_score * 0.6) + (road_score * 0.4)

        # Sensitive zones (schools, hospitals, ambulance corridors)
        sensitive_score = 0.0
        reasons = []
        if has_hospitals_nearby and has_schools_nearby:
            sensitive_score = 100.0
            reasons.append("Critical vicinity: Both school zone and emergency hospital access corridor.")
        elif has_hospitals_nearby:
            sensitive_score = 90.0
            reasons.append("High sensitivity: Primary hospital / emergency vehicle route.")
        elif has_schools_nearby:
            sensitive_score = 80.0
            reasons.append("High sensitivity: School crossing zone with vulnerable pedestrian & student traffic.")
        else:
            sensitive_score = 15.0

        repeat_score = 90.0 if is_repeat_damage else 10.0
        if is_repeat_damage:
            reasons.append("Chronic recurrence: Road section has exhibited repeat structural degradation within past cycle.")

        water_score = 85.0 if is_flood_prone else 15.0
        if is_flood_prone:
            reasons.append("Hydrological hazard: Known waterlogging pocket leading to rapid asphalt erosion.")

        if damage_severity in ("High", "Critical"):
            reasons.append(f"Immediate road defect severity ({damage_severity}) presents wheel rim and stability hazard.")

        # Composite Priority Index (0-100)
        priority_index = (
            (sev_score * norm_weights["damage_severity"]) +
            (traffic_combined * norm_weights["traffic_importance"]) +
            (sensitive_score * norm_weights["sensitive_zones"]) +
            (repeat_score * norm_weights["repeat_damage"]) +
            (water_score * norm_weights["waterlogging"])
        )
        priority_index = round(max(0.0, min(100.0, priority_index)), 1)

        # Priority Level
        if priority_index >= 70.0:
            priority_tier = "High Priority"
            urgency_window = "Immediate action required within 48 to 72 hours"
            color = "rose"
        elif priority_index >= 45.0:
            priority_tier = "Medium Priority"
            urgency_window = "Scheduled repair within 7 to 14 days"
            color = "amber"
        else:
            priority_tier = "Low Priority"
            urgency_window = "Routine cyclical maintenance cycle"
            color = "cyan"

        return {
            "priority_index": priority_index,
            "priority_tier": priority_tier,
            "color": color,
            "urgency_window": urgency_window,
            "reasons": reasons if reasons else ["Standard baseline road maintenance parameters."],
            "factor_scores": {
                "damage_severity": {"score": sev_score, "weight": round(norm_weights["damage_severity"], 2)},
                "traffic_and_road": {"score": round(traffic_combined, 1), "weight": round(norm_weights["traffic_importance"], 2)},
                "sensitive_zones": {"score": sensitive_score, "weight": round(norm_weights["sensitive_zones"], 2)},
                "repeat_damage": {"score": repeat_score, "weight": round(norm_weights["repeat_damage"], 2)},
                "waterlogging": {"score": water_score, "weight": round(norm_weights["waterlogging"], 2)}
            },
            "disclaimer": (
                "Priority scoring is an administrative ranking heuristic for resource triage. "
                "It does not guarantee accident prevention or establish civil liability."
            )
        }

    @classmethod
    def evaluate_accident_risk(
        cls,
        damage_severity: str,
        road_category: str,
        traffic_density: str,
        has_schools: bool = False,
        has_hospitals: bool = False,
        historical_accidents_count: Optional[int] = None,
        weather_condition: str = "Clear"
    ) -> Dict[str, Any]:
        """Assesses accident risk with clear transparency on missing data."""
        base_risk = 30.0
        missing_data = []

        if damage_severity == "High":
            base_risk += 35.0
        elif damage_severity == "Medium":
            base_risk += 20.0
        else:
            base_risk += 5.0

        if traffic_density in ("High", "Extreme"):
            base_risk += 15.0

        if has_schools or has_hospitals:
            base_risk += 12.0

        if weather_condition in ("Rainy", "Wet", "Monsoon"):
            base_risk += 15.0

        if historical_accidents_count is not None:
            base_risk += min(20.0, historical_accidents_count * 4.0)
        else:
            missing_data.append("Local police accident registry integration pending - historical casualty data estimated.")

        missing_data.append("Real-time live telemetry speed radar feed currently unlinked.")

        final_risk = round(min(100.0, max(10.0, base_risk)), 1)
        if final_risk >= 75.0:
            level = "Severe Accident Risk"
            recommendation = "Deploy emergency barricades, signage, and immediate spot-patching crew."
        elif final_risk >= 50.0:
            level = "Moderate Risk"
            recommendation = "Install cautionary rumble strips and schedule priority repair."
        else:
            level = "Low Risk"
            recommendation = "Continue standard speed management and visual inspection."

        return {
            "accident_risk_score": final_risk,
            "risk_level": level,
            "recommended_action": recommendation,
            "missing_data_notices": missing_data,
            "disclaimer": "Risk estimates are algorithmic heuristics and must not be cited as certified accident probabilities."
        }

priority_engine = PriorityEngine()
