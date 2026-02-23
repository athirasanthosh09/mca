from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId

class ComplaintStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

class ComplaintPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class ComplaintCategory(str, Enum):
    MISSED_PICKUP = "Missed Pickup"
    DAMAGED_BIN = "Damaged Bin"
    SPILLAGE = "Spillage Issue"
    OVERFLOW = "Overflow"                # Module 5: Overflow bin management
    IMPROPER_DISPOSAL = "Improper Disposal"
    DRIVER_COMPLAINT = "Driver Complaint"
    OTHER = "Other"

class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    priority: ComplaintPriority = ComplaintPriority.MEDIUM
    is_urgent: bool = False             # True for Overflow reports

class ComplaintCreate(ComplaintBase):
    pickup_id: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    assigned_to: Optional[str] = None
    admin_response: Optional[str] = None
    is_urgent: Optional[bool] = None

class ComplaintInDB(ComplaintBase):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    pickup_id: Optional[str] = None
    status: ComplaintStatus = ComplaintStatus.OPEN
    assigned_to: Optional[str] = None
    admin_response: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
