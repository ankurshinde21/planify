from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, Habit, HabitCheckIn
from ..schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitCheckInCreate,
    HabitCheckInResponse
)
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.post("", response_model=HabitResponse)
async def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new habit."""
    db_habit = Habit(**habit.model_dump(), user_id=current_user.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.get("", response_model=List[HabitResponse])
async def get_habits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all habits for the current user."""
    habits = db.query(Habit).filter(Habit.user_id == current_user.id)\
        .offset(skip).limit(limit).all()
    return habits

@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific habit."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: int,
    habit_update: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a habit."""
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Update habit fields
    for field, value in habit_update.model_dump(exclude_unset=True).items():
        setattr(db_habit, field, value)
    
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a habit."""
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    db.delete(db_habit)
    db.commit()

@router.post("/{habit_id}/check-in", response_model=HabitCheckInResponse)
async def create_check_in(
    habit_id: int,
    check_in: HabitCheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a check-in for a habit."""
    # Verify habit exists and belongs to user
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Create check-in
    db_check_in = HabitCheckIn(
        habit_id=habit_id,
        status=check_in.status,
        notes=check_in.notes
    )
    db.add(db_check_in)
    
    # Update habit statistics
    if check_in.status == "completed":
        # Update streak
        last_check_in = db.query(HabitCheckIn)\
            .filter(HabitCheckIn.habit_id == habit_id)\
            .order_by(HabitCheckIn.check_in_date.desc())\
            .first()
        
        if last_check_in and \
           last_check_in.check_in_date > datetime.utcnow() - timedelta(days=2) and \
           last_check_in.status == "completed":
            db_habit.current_streak += 1
        else:
            db_habit.current_streak = 1
        
        # Update longest streak
        if db_habit.current_streak > db_habit.longest_streak:
            db_habit.longest_streak = db_habit.current_streak
        
        # Update completion rate
        total_check_ins = db.query(HabitCheckIn)\
            .filter(HabitCheckIn.habit_id == habit_id).count()
        completed_check_ins = db.query(HabitCheckIn)\
            .filter(
                HabitCheckIn.habit_id == habit_id,
                HabitCheckIn.status == "completed"
            ).count()
        
        db_habit.completion_rate = (completed_check_ins / total_check_ins) * 100 \
            if total_check_ins > 0 else 0
    
    db.commit()
    db.refresh(db_check_in)
    return db_check_in

@router.get("/{habit_id}/check-ins", response_model=List[HabitCheckInResponse])
async def get_check_ins(
    habit_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all check-ins for a habit."""
    # Verify habit exists and belongs to user
    db_habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user.id
    ).first()
    if not db_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    check_ins = db.query(HabitCheckIn)\
        .filter(HabitCheckIn.habit_id == habit_id)\
        .order_by(HabitCheckIn.check_in_date.desc())\
        .offset(skip).limit(limit).all()
    
    return check_ins 