from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..database import Base

# Association table for many-to-many relationship between tasks and tags
task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id")),
    Column("tag_id", Integer, ForeignKey("tags.id")),
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    color = Column(String(7), default="#808080")  # Hex color code
    
    # Relationships
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")

class TaskTag(Base):
    __tablename__ = "task_tag_relations"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    tag_id = Column(Integer, ForeignKey("tags.id"))

    # Relationships
    task = relationship("Task", back_populates="tags")
    tag = relationship("Tag") 