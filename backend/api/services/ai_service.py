from typing import List, Dict, Any
import google.generativeai as genai
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import Task, Habit, HabitCheckIn
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_AI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

def generate_task_recommendations(
    db: Session,
    user_id: int,
    completed_tasks: List[Task],
    habits: List[Habit]
) -> List[Dict[str, Any]]:
    """Generate AI-based task recommendations."""
    # Prepare context for AI
    context = {
        "completed_tasks": [
            {
                "title": task.title,
                "description": task.description,
                "completed_at": task.completed_at,
                "actual_duration": task.actual_duration
            }
            for task in completed_tasks
        ],
        "habits": [
            {
                "title": habit.title,
                "frequency": habit.frequency,
                "completion_rate": habit.completion_rate,
                "current_streak": habit.current_streak
            }
            for habit in habits
        ]
    }

    # Generate prompt for AI
    prompt = f"""
    Based on the user's completed tasks and habits:
    Completed Tasks:
    {context['completed_tasks']}
    
    Habits:
    {context['habits']}
    
    Please suggest 3 new tasks that would help the user maintain productivity and achieve their goals.
    Consider:
    1. Task patterns and completion times
    2. Habit performance and areas for improvement
    3. Balance between different types of tasks
    
    Format each task as a dictionary with:
    - title
    - description
    - estimated_duration (in minutes)
    - priority (0-2)
    """

    # Get AI response
    response = model.generate_content(prompt)
    
    try:
        # Parse and format AI suggestions
        suggestions = eval(response.text)  # Assuming AI returns properly formatted Python list
        return suggestions
    except:
        # Fallback suggestions if AI response parsing fails
        return [
            {
                "title": "Review and Plan Weekly Goals",
                "description": "Take time to review your progress and plan next week's priorities",
                "estimated_duration": 30,
                "priority": 1
            },
            {
                "title": "Task Organization",
                "description": "Organize and prioritize your task list",
                "estimated_duration": 20,
                "priority": 1
            },
            {
                "title": "Habit Review",
                "description": "Review your habits and identify areas for improvement",
                "estimated_duration": 15,
                "priority": 0
            }
        ]

def generate_productivity_insights(
    db: Session,
    user_id: int,
    start_date: datetime,
    end_date: datetime
) -> Dict[str, Any]:
    """Generate AI-based productivity insights."""
    # Get user's tasks and habits for the period
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.created_at >= start_date,
        Task.created_at <= end_date
    ).all()
    
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.created_at >= start_date
    ).all()
    
    # Calculate basic metrics
    completed_tasks = [t for t in tasks if t.status == "completed"]
    completion_rate = len(completed_tasks) / len(tasks) if tasks else 0
    
    avg_task_duration = sum(
        t.actual_duration for t in completed_tasks if t.actual_duration
    ) / len(completed_tasks) if completed_tasks else 0
    
    habit_completion_rates = [h.completion_rate for h in habits]
    avg_habit_rate = sum(habit_completion_rates) / len(habits) if habits else 0
    
    # Prepare context for AI
    context = {
        "metrics": {
            "task_completion_rate": completion_rate,
            "avg_task_duration": avg_task_duration,
            "avg_habit_completion": avg_habit_rate
        },
        "tasks": [
            {
                "title": task.title,
                "status": task.status,
                "priority": task.priority,
                "actual_duration": task.actual_duration
            }
            for task in tasks
        ],
        "habits": [
            {
                "title": habit.title,
                "completion_rate": habit.completion_rate,
                "current_streak": habit.current_streak
            }
            for habit in habits
        ]
    }
    
    # Generate prompt for AI
    prompt = f"""
    Based on the user's productivity data:
    Metrics:
    {context['metrics']}
    
    Tasks:
    {context['tasks']}
    
    Habits:
    {context['habits']}
    
    Please provide insights and recommendations for improving productivity.
    Consider:
    1. Task completion patterns
    2. Time management
    3. Habit consistency
    4. Areas for improvement
    
    Format the response as a dictionary with:
    - summary (overall performance summary)
    - strengths (list of strong areas)
    - improvements (list of areas to improve)
    - recommendations (list of specific actionable recommendations)
    """
    
    # Get AI response
    response = model.generate_content(prompt)
    
    try:
        # Parse and format AI insights
        insights = eval(response.text)  # Assuming AI returns properly formatted Python dict
        return insights
    except:
        # Fallback insights if AI response parsing fails
        return {
            "summary": "You're making progress in your tasks and habits.",
            "strengths": [
                "Regular task completion",
                "Habit tracking"
            ],
            "improvements": [
                "Task time estimation",
                "Habit consistency"
            ],
            "recommendations": [
                "Break down large tasks into smaller ones",
                "Set specific times for habit activities",
                "Review and adjust priorities regularly"
            ]
        } 