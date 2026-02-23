from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.core import deps
from app.db.mongodb import get_database
from app.models.user import UserResponse, UserUpdate, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: UserResponse = Depends(deps.get_current_active_user),
) -> UserResponse:
    return current_user

@router.get("/", response_model=List[UserResponse], dependencies=[Depends(deps.get_current_active_admin)])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}
    if role:
        query["role"] = role

    users = []
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(UserResponse(**user))
    return users

@router.get("/pending", response_model=List[UserResponse], dependencies=[Depends(deps.get_current_active_admin)])
async def read_pending_users(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List users/drivers awaiting admin approval (Module 1)."""
    users = []
    cursor = db.users.find({"is_approved": False, "role": {"$ne": Role.ADMIN}}).sort("created_at", -1)
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(UserResponse(**user))
    return users

@router.get("/drivers", response_model=List[UserResponse], dependencies=[Depends(deps.get_current_active_admin)])
async def read_drivers(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List all drivers with vehicle info (Module 3)."""
    drivers = []
    cursor = db.users.find({"role": Role.DRIVER}).sort("name", 1)
    async for driver in cursor:
        driver["_id"] = str(driver["_id"])
        drivers.append(UserResponse(**driver))
    return drivers

@router.put("/{user_id}/approve", response_model=UserResponse, dependencies=[Depends(deps.get_current_active_admin)])
async def approve_user(
    user_id: str,
    approved: bool = True,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Admin approves or rejects a user registration (Module 1)."""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_approved": approved, "is_active": approved}}
    )
    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    updated["_id"] = str(updated["_id"])
    return UserResponse(**updated)

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: UserResponse = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = user_in.dict(exclude_unset=True)
    # Strip approval/active fields — only admin can change those
    update_data.pop("is_approved", None)
    update_data.pop("is_active", None)
    if update_data:
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_data}
        )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return UserResponse(**updated_user)

@router.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(deps.get_current_active_admin)])
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Admin updates any user (activate/deactivate, etc.)."""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = user_in.dict(exclude_unset=True)
    if update_data:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    updated["_id"] = str(updated["_id"])
    return UserResponse(**updated)
