from fastapi import APIRouter, Depends
from app.core import deps
from app.db.mongodb import get_database
from app.models.user import UserResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats", dependencies=[Depends(deps.get_current_active_admin)])
async def get_admin_stats(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    total_users = await db.users.count_documents({})
    total_pickups = await db.pickups.count_documents({})
    pending_pickups = await db.pickups.count_documents({"status": "Pending"})
    assigned_pickups = await db.pickups.count_documents({"status": "Assigned"})
    completed_pickups = await db.pickups.count_documents({"status": "Completed"})
    total_complaints = await db.complaints.count_documents({})
    open_complaints = await db.complaints.count_documents({"status": "Open"})
    urgent_complaints = await db.complaints.count_documents({"is_urgent": True, "status": {"$ne": "Resolved"}})
    pending_approvals = await db.users.count_documents({"is_approved": False})

    return {
        "total_users": total_users,
        "total_pickups": total_pickups,
        "pending_pickups": pending_pickups,
        "assigned_pickups": assigned_pickups,
        "completed_pickups": completed_pickups,
        "total_complaints": total_complaints,
        "open_complaints": open_complaints,
        "urgent_complaints": urgent_complaints,
        "pending_approvals": pending_approvals,
    }

@router.get("/reports/daily-pickups", dependencies=[Depends(deps.get_current_active_admin)])
async def daily_pickup_report(
    days: int = 30,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Daily Pickup Report: pickups per day for the last N days (Module 6)."""
    since = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {
            "_id": {
                "year":  {"$year":  "$created_at"},
                "month": {"$month": "$created_at"},
                "day":   {"$dayOfMonth": "$created_at"},
                "status": "$status",
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
    ]
    results = []
    async for doc in db.pickups.aggregate(pipeline):
        results.append({
            "date": f"{doc['_id']['year']}-{doc['_id']['month']:02d}-{doc['_id']['day']:02d}",
            "status": doc["_id"]["status"],
            "count": doc["count"],
        })
    return results

@router.get("/reports/complaints", dependencies=[Depends(deps.get_current_active_admin)])
async def complaint_resolution_report(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Complaint Resolution Report: breakdown by status, category, priority (Module 6)."""
    # Status breakdown
    pipeline_status = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    by_status = {}
    async for doc in db.complaints.aggregate(pipeline_status):
        by_status[doc["_id"]] = doc["count"]

    # Category breakdown
    pipeline_cat = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    by_category = {}
    async for doc in db.complaints.aggregate(pipeline_cat):
        by_category[doc["_id"]] = doc["count"]

    # Priority breakdown
    pipeline_pri = [
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
    ]
    by_priority = {}
    async for doc in db.complaints.aggregate(pipeline_pri):
        by_priority[doc["_id"]] = doc["count"]

    # Average resolution time (for resolved complaints)
    resolved = []
    async for c in db.complaints.find({"status": "Resolved", "resolved_at": {"$exists": True}}):
        if c.get("resolved_at") and c.get("created_at"):
            delta = (c["resolved_at"] - c["created_at"]).total_seconds() / 3600
            resolved.append(delta)
    avg_resolution_hours = round(sum(resolved) / len(resolved), 1) if resolved else None

    return {
        "by_status": by_status,
        "by_category": by_category,
        "by_priority": by_priority,
        "avg_resolution_hours": avg_resolution_hours,
        "total": sum(by_status.values()),
    }

@router.get("/reports/driver-performance", dependencies=[Depends(deps.get_current_active_admin)])
async def driver_performance_report(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Driver Performance Report: tasks, completion rate, delays per driver (Module 6)."""
    pipeline = [
        {"$match": {"driver_id": {"$exists": True, "$ne": None}}},
        {"$group": {
            "_id": "$driver_id",
            "total_assigned": {"$sum": 1},
            "completed":      {"$sum": {"$cond": [{"$eq": ["$status", "Completed"]}, 1, 0]}},
            "missed":         {"$sum": {"$cond": [{"$eq": ["$status", "Missed"]},    1, 0]}},
            "pending":        {"$sum": {"$cond": [{"$eq": ["$status", "Pending"]},   1, 0]}},
            "avg_rating":     {"$avg": "$rating"},
        }},
    ]
    rows = []
    async for doc in db.pickups.aggregate(pipeline):
        driver_id = doc["_id"]
        driver = await db.users.find_one({"_id": __import__("bson").ObjectId(driver_id)})
        driver_name = driver["name"] if driver else "Unknown"
        vehicle = driver.get("vehicle_number", "N/A") if driver else "N/A"
        total = doc["total_assigned"]
        completed = doc["completed"]
        efficiency = round((completed / total) * 100, 1) if total > 0 else 0
        rows.append({
            "driver_id":      driver_id,
            "driver_name":    driver_name,
            "vehicle_number": vehicle,
            "total_assigned": total,
            "completed":      completed,
            "missed":         doc["missed"],
            "pending":        doc["pending"],
            "efficiency_pct": efficiency,
            "avg_rating":     round(doc["avg_rating"], 1) if doc["avg_rating"] else None,
        })
    rows.sort(key=lambda r: r["efficiency_pct"], reverse=True)
    return rows
