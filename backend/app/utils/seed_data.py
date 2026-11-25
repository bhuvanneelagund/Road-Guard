import datetime
import logging
from backend.app.database import db
from backend.app.utils.security import hash_password

logger = logging.getLogger("roadguard.seed")

def seed_initial_data():
    """Seeds only the foundational login accounts. All road, detection, and complaint data comes from real AI scans and user reports."""
    if db.users.count_documents() == 0:
        users = [
            {
                "id": "usr-admin-01",
                "name": "Super Administrator",
                "email": "admin@roadguard.ai",
                "password_hash": hash_password("Admin@1234"),
                "role": "Administrator",
                "department": "Karnataka State Highway Authority",
                "phone": "+91 98450 11223",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            },
            {
                "id": "usr-gov-01",
                "name": "Executive Engineer (PWD)",
                "email": "authority@pwd.gov.in",
                "password_hash": hash_password("Gov@1234"),
                "role": "Government Authority",
                "department": "Public Works Department, Bengaluru Division",
                "phone": "+91 98450 44556",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            },
            {
                "id": "usr-insp-01",
                "name": "Ramesh Kumar (Chief Inspector)",
                "email": "inspector@roadguard.ai",
                "password_hash": hash_password("Inspector@1234"),
                "role": "Inspector",
                "department": "Bengaluru City Road Inspection",
                "phone": "+91 98450 77889",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            },
            {
                "id": "usr-cit-01",
                "name": "Ananya Sharma",
                "email": "citizen@gmail.com",
                "password_hash": hash_password("Citizen@1234"),
                "role": "Citizen",
                "department": "Resident",
                "phone": "+91 98450 99001",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]
        db.users.insert_many(users)
        logger.info(f"Seeded {len(users)} login users (no example/trial road data).")
