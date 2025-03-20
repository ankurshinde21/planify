from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, Task, Habit
from ..utils.auth import get_current_active_user
from ..services.ai_service import generate_task_recommendations, generate_productivity_insights

router = APIRouter()

@router.get("/recommendations", response_model=List[Dict[str, Any]])
async def get_task_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-generated task recommendations."""
    # Get user's completed tasks from last 30 days
    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed",
        Task.completed_at >= datetime.utcnow() - timedelta(days=30)
    ).all()
    
    # Get user's habits
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True
    ).all()
    
    recommendations = generate_task_recommendations(
        db,
        current_user.id,
        completed_tasks,
        habits
    )
    
    return recommendations

@router.get("/insights", response_model=Dict[str, Any])
async def get_productivity_insights(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-generated productivity insights."""
    insights = generate_productivity_insights(
        db,
        current_user.id,
        start_date,
        end_date
    )
    
    return insights

@router.post("/create-suggested-task")
async def create_suggested_task(
    suggestion_index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a task from an AI suggestion."""
    # Get recommendations
    recommendations = await get_task_recommendations(db, current_user)
    
    if suggestion_index < 0 or suggestion_index >= len(recommendations):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid suggestion index"
        )
    
    suggestion = recommendations[suggestion_index]
    
    # Create task from suggestion
    task = Task(
        title=suggestion["title"],
        description=suggestion["description"],
        estimated_duration=suggestion["estimated_duration"],
        priority=suggestion["priority"],
        user_id=current_user.id,
        ai_suggested=True
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task 