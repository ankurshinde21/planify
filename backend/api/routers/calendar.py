from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from ..database import get_db
from ..models import User, Task
from ..utils.auth import get_current_active_user
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Google Calendar API configuration
SCOPES = ['https://www.googleapis.com/auth/calendar']
CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CALENDAR_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CALENDAR_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost:3000/auth/google/callback"]
    }
}

@router.get("/auth-url")
async def get_auth_url():
    """Get Google Calendar authorization URL."""
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=CLIENT_CONFIG["web"]["redirect_uris"][0]
    )
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    return {"auth_url": auth_url}

@router.post("/callback")
async def calendar_callback(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Handle Google Calendar OAuth callback."""
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=CLIENT_CONFIG["web"]["redirect_uris"][0]
    )
    
    # Exchange code for tokens
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Store token in database
    current_user.google_calendar_token = credentials.to_json()
    db.commit()
    
    return {"message": "Calendar connected successfully"}

@router.get("/events")
async def get_calendar_events(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's calendar events."""
    if not current_user.google_calendar_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Calendar not connected"
        )
    
    # Build calendar service
    credentials = Credentials.from_authorized_user_info(
        eval(current_user.google_calendar_token)
    )
    service = build('calendar', 'v3', credentials=credentials)
    
    # Get events
    events_result = service.events().list(
        calendarId='primary',
        timeMin=start_date.isoformat() + 'Z',
        timeMax=end_date.isoformat() + 'Z',
        maxResults=100,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    return events_result.get('items', [])

@router.post("/sync-task")
async def sync_task_to_calendar(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Sync a task to Google Calendar."""
    if not current_user.google_calendar_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Calendar not connected"
        )
    
    # Get task
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Build calendar service
    credentials = Credentials.from_authorized_user_info(
        eval(current_user.google_calendar_token)
    )
    service = build('calendar', 'v3', credentials=credentials)
    
    # Create calendar event
    event = {
        'summary': task.title,
        'description': task.description or '',
        'start': {
            'dateTime': task.due_date.isoformat(),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': (task.due_date + timedelta(hours=1)).isoformat(),
            'timeZone': 'UTC',
        },
    }
    
    event = service.events().insert(
        calendarId='primary',
        body=event
    ).execute()
    
    return event 