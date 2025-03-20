from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    frequency = Column(String(50))  # daily, weekly, custom
    target_days = Column(Integer)  # Number of days to complete in frequency period
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    completion_rate = Column(Float, default=0.0)  # Percentage of successful completions
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="habits")
    check_ins = relationship("HabitCheckIn", back_populates="habit")

class HabitCheckIn(Base):
    __tablename__ = "habit_check_ins"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    check_in_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20))  # completed, missed, skipped
    notes = Column(Text, nullable=True)

    # Relationships
    habit = relationship("Habit", back_populates="check_ins") 