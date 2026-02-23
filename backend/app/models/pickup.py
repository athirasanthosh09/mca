from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId

class WasteType(str, Enum):
    ORGANIC = "organic"
    RECYCLABLE = "recyclable"
    HAZARDOUS = "hazardous"
    ELECTRONIC = "electronic"

class PickupStatus(str, Enum):
    PENDING = "Pending"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    MISSED = "Missed"

class PickupBase(BaseModel):
    address: str
    scheduled_date: datetime
    waste_type: WasteType
    quantity: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_overflow: bool = False          # Overflow bin report flag

class PickupCreate(PickupBase):
    pass

class PickupUpdate(BaseModel):
    driver_id: Optional[str] = None
    pickup_time: Optional[datetime] = None
    status: Optional[PickupStatus] = None
    completed_at: Optional[datetime] = None

class PickupFeedback(BaseModel):
    feedback: str
    rating: int  # 1-5

class PickupAssign(BaseModel):
    driver_id: str

class PickupInDB(PickupBase):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    driver_id: Optional[str] = None
    pickup_time: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: PickupStatus = PickupStatus.PENDING
    feedback: Optional[str] = None
    rating: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
