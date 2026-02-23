from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.core import deps
from app.db.mongodb import get_database
from app.models.complaint import ComplaintCreate, ComplaintInDB, ComplaintUpdate, ComplaintStatus
from app.models.user import UserResponse, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

router = APIRouter()

OVERFLOW_KEYWORDS = {"overflow", "overflowing", "full bin", "bin full"}

@router.post("/", response_model=ComplaintInDB)
async def create_complaint(
    complaint_in: ComplaintCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    complaint_data = complaint_in.dict()
    complaint_data["user_id"] = current_user.id
    complaint_data["status"] = ComplaintStatus.OPEN
    complaint_data["created_at"] = datetime.utcnow()
    complaint_data["updated_at"] = datetime.utcnow()

    # Auto-flag overflow complaints as urgent (Module 5)
    cat = (complaint_data.get("category") or "").lower()
    if cat == "overflow" or any(kw in cat for kw in OVERFLOW_KEYWORDS):
        complaint_data["is_urgent"] = True
        complaint_data["priority"] = "High"

    new_complaint = await db.complaints.insert_one(complaint_data)
    created_complaint = await db.complaints.find_one({"_id": new_complaint.inserted_id})
    created_complaint["_id"] = str(created_complaint["_id"])
    return ComplaintInDB(**created_complaint)

@router.get("/", response_model=List[ComplaintInDB])
async def read_complaints(
    skip: int = 0,
    limit: int = 100,
    urgent_only: Optional[bool] = None,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}
    if current_user.role == Role.USER:
        query["user_id"] = current_user.id
    # Admin sees all

    # Support filtering by urgent (Module 5: Overflow management)
    if urgent_only is True:
        query["is_urgent"] = True

    complaints = []
    cursor = db.complaints.find(query).sort("created_at", -1).skip(skip).limit(limit)
    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(ComplaintInDB(**complaint))
    return complaints

@router.put("/{complaint_id}", response_model=ComplaintInDB)
async def update_complaint(
    complaint_id: str,
    complaint_in: ComplaintUpdate,
    current_user: UserResponse = Depends(deps.get_current_active_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    complaint = await db.complaints.find_one({"_id": ObjectId(complaint_id)})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update_data = complaint_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    # Set resolved_at when resolving for avg resolution time tracking
    if update_data.get("status") == ComplaintStatus.RESOLVED:
        update_data["resolved_at"] = datetime.utcnow()

    if update_data:
        await db.complaints.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$set": update_data}
        )

    updated_complaint = await db.complaints.find_one({"_id": ObjectId(complaint_id)})
    updated_complaint["_id"] = str(updated_complaint["_id"])
    return ComplaintInDB(**updated_complaint)
