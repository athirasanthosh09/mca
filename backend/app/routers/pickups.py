from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core import deps
from app.db.mongodb import get_database
from app.models.pickup import PickupCreate, PickupInDB, PickupUpdate, PickupStatus, PickupFeedback, PickupAssign
from app.models.user import UserResponse, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=PickupInDB)
async def create_pickup(
    pickup_in: PickupCreate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    pickup_data = pickup_in.dict()
    pickup_data["user_id"] = current_user.id
    pickup_data["status"] = PickupStatus.PENDING
    pickup_data["created_at"] = datetime.utcnow()

    new_pickup = await db.pickups.insert_one(pickup_data)
    created_pickup = await db.pickups.find_one({"_id": new_pickup.inserted_id})
    created_pickup["_id"] = str(created_pickup["_id"])
    return PickupInDB(**created_pickup)

@router.get("/", response_model=List[PickupInDB])
async def read_pickups(
    skip: int = 0,
    limit: int = 100,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}
    if current_user.role == Role.USER:
        query["user_id"] = current_user.id
    elif current_user.role == Role.DRIVER:
        query["driver_id"] = current_user.id
    # Admin sees all (empty query)

    pickups = []
    cursor = db.pickups.find(query).sort("created_at", -1).skip(skip).limit(limit)
    async for pickup in cursor:
        pickup["_id"] = str(pickup["_id"])
        pickups.append(PickupInDB(**pickup))
    return pickups

@router.put("/{pickup_id}/assign", response_model=PickupInDB)
async def assign_driver(
    pickup_id: str,
    assignment: PickupAssign,
    current_user: UserResponse = Depends(deps.get_current_active_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Admin assigns a driver to a pickup (Module 3)."""
    pickup = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")

    driver_id = assignment.driver_id
    if not driver_id:
        raise HTTPException(status_code=400, detail="driver_id is required")

    # Verify driver exists
    driver = await db.users.find_one({"_id": ObjectId(driver_id)})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    await db.pickups.update_one(
        {"_id": ObjectId(pickup_id)},
        {"$set": {"driver_id": driver_id, "status": PickupStatus.ASSIGNED}}
    )
    updated = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    updated["_id"] = str(updated["_id"])
    return PickupInDB(**updated)

@router.put("/{pickup_id}", response_model=PickupInDB)
async def update_pickup(
    pickup_id: str,
    pickup_in: PickupUpdate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    pickup = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")

    # Permission check
    if current_user.role == Role.USER and pickup["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == Role.DRIVER and pickup.get("driver_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = pickup_in.dict(exclude_unset=True)

    # Driver can only update status
    if current_user.role == Role.DRIVER:
        allowed_updates = {"status"}
        update_data = {k: v for k, v in update_data.items() if k in allowed_updates}

    # Auto-set completed_at timestamp when status changes to Completed
    if update_data.get("status") == PickupStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()

    if update_data:
        await db.pickups.update_one(
            {"_id": ObjectId(pickup_id)},
            {"$set": update_data}
        )

    updated_pickup = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    updated_pickup["_id"] = str(updated_pickup["_id"])
    return PickupInDB(**updated_pickup)

@router.post("/{pickup_id}/feedback", response_model=PickupInDB)
async def submit_pickup_feedback(
    pickup_id: str,
    feedback_in: PickupFeedback,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """User submits feedback/rating after a completed pickup (Module 2)."""
    pickup = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    if pickup["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if pickup["status"] != PickupStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed pickups")
    if not 1 <= feedback_in.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    await db.pickups.update_one(
        {"_id": ObjectId(pickup_id)},
        {"$set": {"feedback": feedback_in.feedback, "rating": feedback_in.rating}}
    )
    updated = await db.pickups.find_one({"_id": ObjectId(pickup_id)})
    updated["_id"] = str(updated["_id"])
    return PickupInDB(**updated)
