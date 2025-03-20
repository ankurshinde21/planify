from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    priority = Column(Integer, default=0)  # 0: Low, 1: Medium, 2: High
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50), nullable=True)  # daily, weekly, monthly, custom
    recurrence_end_date = Column(DateTime, nullable=True)
    ai_suggested = Column(Boolean, default=False)
    estimated_duration = Column(Integer, nullable=True)  # Duration in minutes
    actual_duration = Column(Integer, nullable=True)  # Duration in minutes
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="tasks")
    subtasks = relationship("Task", backref="parent_task", remote_side=[id])
    tags = relationship("TaskTag", back_populates="task") 