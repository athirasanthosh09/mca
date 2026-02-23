from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security, deps
from app.core.config import settings
from app.db.mongodb import get_database
from app.models.user import UserCreate, UserResponse, UserInDB, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/login", response_model=dict)
async def login_access_token(
    db: AsyncIOMotorDatabase = Depends(get_database),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = await db.users.find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Block unapproved non-admin users (Module 1: Admin must approve)
    # NOTE: Default True for backward compatibility with existing users who pre-date this field
    if user.get("role") != Role.ADMIN and user.get("is_approved", True) is False:
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. Please wait for activation."
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user["_id"], expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_in: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Any:
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    user_data = user_in.dict(exclude={"password"})
    user_data["hashed_password"] = security.get_password_hash(user_in.password)
    user_data["created_at"] = datetime.utcnow()

    # Admins are auto-approved; Users/Drivers require approval
    if user_data.get("role") == Role.ADMIN:
        user_data["is_approved"] = True
    else:
        user_data["is_approved"] = False

    new_user = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})

    created_user["_id"] = str(created_user["_id"])
    return UserResponse(**created_user)
