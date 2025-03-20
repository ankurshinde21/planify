from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: str
    target_days: int
    start_date: datetime = datetime.utcnow()
    end_date: Optional[datetime] = None

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    target_days: Optional[int] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class HabitCheckInCreate(BaseModel):
    status: str
    notes: Optional[str] = None

class HabitCheckInResponse(HabitCheckInCreate):
    id: int
    habit_id: int
    check_in_date: datetime

    class Config:
        from_attributes = True

class HabitResponse(HabitBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool
    completion_rate: float
    current_streak: int
    longest_streak: int
    user_id: int
    check_ins: List[HabitCheckInResponse] = []

    class Config:
        from_attributes = True 