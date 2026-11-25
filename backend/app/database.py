import os
import json
import sqlite3
import uuid
import datetime
import logging
from typing import Dict, Any, List, Optional
from backend.app.config import settings

logger = logging.getLogger("roadguard.database")

class SQLiteCollection:
    """Provides a MongoDB-compatible collection API over a local SQLite JSON document table."""
    def __init__(self, db_path: str, collection_name: str):
        self.db_path = db_path
        self.name = collection_name
        self._init_table()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=15)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_table(self):
        with self._get_connection() as conn:
            conn.execute(f"""
                CREATE TABLE IF NOT EXISTS {self.name} (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, val in query.items():
            if key == "_id" or key == "id":
                doc_val = doc.get("id") or doc.get("_id")
                if isinstance(val, dict):
                    if "$in" in val and doc_val not in val["$in"]:
                        return False
                elif str(doc_val) != str(val):
                    return False
            elif isinstance(val, dict):
                doc_val = doc.get(key)
                if "$in" in val and doc_val not in val["$in"]:
                    return False
                if "$ne" in val and doc_val == val["$ne"]:
                    return False
                if "$gte" in val and (doc_val is None or doc_val < val["$gte"]):
                    return False
                if "$lte" in val and (doc_val is None or doc_val > val["$lte"]):
                    return False
                if "$regex" in val and (doc_val is None or not str(val["$regex"]).lower() in str(doc_val).lower()):
                    return False
            else:
                if doc.get(key) != val:
                    return False
        return True

    def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        doc_id = str(doc.get("id") or doc.get("_id") or uuid.uuid4())
        doc["id"] = doc_id
        doc["_id"] = doc_id
        if "created_at" not in doc:
            doc["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if "updated_at" not in doc:
            doc["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        with self._get_connection() as conn:
            conn.execute(
                f"INSERT OR REPLACE INTO {self.name} (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
                (doc_id, json.dumps(doc), doc.get("created_at"), doc.get("updated_at"))
            )
            conn.commit()
            
        class InsertResult:
            inserted_id = doc_id
        return InsertResult()

    def insert_many(self, documents: List[Dict[str, Any]]):
        results = []
        for doc in documents:
            results.append(self.insert_one(doc).inserted_id)
        class InsertManyResult:
            inserted_ids = results
        return InsertManyResult()

    def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        with self._get_connection() as conn:
            if "_id" in query or "id" in query:
                target_id = str(query.get("_id") or query.get("id"))
                cursor = conn.execute(f"SELECT data FROM {self.name} WHERE id = ?", (target_id,))
                row = cursor.fetchone()
                if row:
                    doc = json.loads(row["data"])
                    if self._matches(doc, query):
                        return doc
                return None

            cursor = conn.execute(f"SELECT data FROM {self.name} ORDER BY created_at DESC")
            for row in cursor.fetchall():
                doc = json.loads(row["data"])
                if self._matches(doc, query):
                    return doc
        return None

    def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, limit: Optional[int] = None, skip: Optional[int] = 0) -> List[Dict[str, Any]]:
        query = query or {}
        results = []
        with self._get_connection() as conn:
            cursor = conn.execute(f"SELECT data FROM {self.name} ORDER BY created_at DESC")
            for row in cursor.fetchall():
                doc = json.loads(row["data"])
                if self._matches(doc, query):
                    results.append(doc)

        if sort:
            for field, direction in reversed(sort):
                results.sort(key=lambda x: (x.get(field) is None, x.get(field)), reverse=(direction == -1))

        if skip:
            results = results[skip:]
        if limit is not None:
            results = results[:limit]
        return results

    def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        doc = self.find_one(filter)
        if not doc:
            if upsert:
                new_doc = dict(filter)
                if "$set" in update:
                    new_doc.update(update["$set"])
                return self.insert_one(new_doc)
            return None

        updated_doc = dict(doc)
        if "$set" in update:
            updated_doc.update(update["$set"])
        else:
            updated_doc.update(update)

        updated_doc["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        doc_id = str(doc.get("id") or doc.get("_id"))
        with self._get_connection() as conn:
            conn.execute(
                f"UPDATE {self.name} SET data = ?, updated_at = ? WHERE id = ?",
                (json.dumps(updated_doc), updated_doc["updated_at"], doc_id)
            )
            conn.commit()
            
        class UpdateResult:
            modified_count = 1
        return UpdateResult()

    def delete_one(self, filter: Dict[str, Any]):
        doc = self.find_one(filter)
        if not doc:
            class DeleteResult:
                deleted_count = 0
            return DeleteResult()

        doc_id = str(doc.get("id") or doc.get("_id"))
        with self._get_connection() as conn:
            conn.execute(f"DELETE FROM {self.name} WHERE id = ?", (doc_id,))
            conn.commit()
        class DeleteResult:
            deleted_count = 1
        return DeleteResult()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))


class DatabaseManager:
    def __init__(self):
        self.is_mongodb = False
        self.client = None
        self.db = None
        self._collections = {}
        self.init_db()

    def init_db(self):
        if settings.MONGODB_URI:
            try:
                from pymongo import MongoClient
                logger.info(f"Attempting MongoDB connection: {settings.MONGODB_URI}")
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2500)
                # verify connection
                self.client.server_info()
                self.db = self.client[settings.DATABASE_NAME]
                self.is_mongodb = True
                logger.info("Successfully connected to MongoDB.")
                return
            except Exception as e:
                logger.warning(f"MongoDB connection failed: {e}. Falling back to SQLite.")
                self.is_mongodb = False

        # SQLite fallback
        self.is_mongodb = False
        db_path = settings.SQLITE_DB_PATH
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        logger.info(f"Using SQLite document database at: {db_path}")

    def get_collection(self, name: str):
        if self.is_mongodb and self.db is not None:
            return self.db[name]
        if name not in self._collections:
            self._collections[name] = SQLiteCollection(settings.SQLITE_DB_PATH, name)
        return self._collections[name]

    @property
    def users(self):
        return self.get_collection("users")

    @property
    def roads(self):
        return self.get_collection("roads")

    @property
    def detections(self):
        return self.get_collection("detections")

    @property
    def complaints(self):
        return self.get_collection("complaints")

    @property
    def repairs(self):
        return self.get_collection("repairs")

    @property
    def contractors(self):
        return self.get_collection("contractors")

    @property
    def inspections(self):
        return self.get_collection("inspections")

    @property
    def verification_records(self):
        return self.get_collection("verification_records")

    @property
    def road_health_history(self):
        return self.get_collection("road_health_history")

    @property
    def notifications(self):
        return self.get_collection("notifications")

    @property
    def waterlogging(self):
        return self.get_collection("waterlogging")

    @property
    def priority_rules(self):
        return self.get_collection("priority_rules")


db = DatabaseManager()
