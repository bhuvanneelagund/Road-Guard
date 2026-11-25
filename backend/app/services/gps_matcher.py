import csv
import io
import math
import datetime
from typing import List, Dict, Any, Optional

class GPSMatcher:
    def __init__(self, gps_points: Optional[List[Dict[str, Any]]] = None):
        self.points = gps_points or []

    @staticmethod
    def parse_csv_tracks(csv_text: str) -> List[Dict[str, Any]]:
        """Parses GPS CSV records with columns like: timestamp/time, lat/latitude, lon/lng/longitude, speed, altitude."""
        points = []
        reader = csv.DictReader(io.StringIO(csv_text))
        for row in reader:
            normalized = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            lat = float(normalized.get("lat") or normalized.get("latitude") or 0.0)
            lng = float(normalized.get("lon") or normalized.get("lng") or normalized.get("longitude") or 0.0)
            if lat == 0.0 and lng == 0.0:
                continue
            
            time_str = normalized.get("timestamp") or normalized.get("time") or normalized.get("datetime")
            speed = float(normalized.get("speed") or 0.0)
            alt = float(normalized.get("alt") or normalized.get("altitude") or normalized.get("elevation") or 0.0)

            points.append({
                "lat": lat,
                "lng": lng,
                "speed": speed,
                "altitude": alt,
                "timestamp_str": time_str
            })
        return points

    def find_nearest_gps(self, elapsed_seconds: float, current_time: Optional[datetime.datetime] = None) -> Optional[Dict[str, Any]]:
        if not self.points:
            return None
        
        # If points have index or timestamps, match closest
        if len(self.points) == 1:
            return self.points[0]

        # Check if index proportional matching or timestamp matching
        idx = min(len(self.points) - 1, max(0, int(elapsed_seconds)))
        return self.points[idx]

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Returns distance between two coordinates in kilometers."""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
