from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class VehicleBase(BaseModel):
    driver_id: Optional[str] = None
    vehicle_number: str
    vehicle_type: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    driver_id: Optional[str] = None
    vehicle_type: Optional[str] = None

class VehicleInDB(VehicleBase):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
