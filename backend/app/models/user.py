from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum
from bson import ObjectId
from datetime import datetime

class Role(str, Enum):
    ADMIN = "Admin"
    USER = "User"
    DRIVER = "Driver"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Role = Role.USER
    phone: Optional[str] = None
    address: str
    vehicle_number: Optional[str] = None
    employee_id: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False   # Admin must approve drivers/users

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    vehicle_number: Optional[str] = None
    employee_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None

class UserInDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
