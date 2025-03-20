# Planify - AI-Based Productivity Platform

## Overview
Planify is an AI-powered productivity platform that helps users optimize their time management through intelligent task scheduling and habit tracking. The platform uses AI to provide personalized recommendations while maintaining user control over final decisions.

## Features
- AI-Based Calendar & To-Do List
- Goal & Habit Tracking
- Pomodoro Timer with Focus Analytics
- Google Calendar Integration
- AI-Powered Task Recommendations
- Natural Language Task Input via Chatbot

## Tech Stack
- Frontend: React.js
- Backend: FastAPI
- Database: MySQL
- AI Services: Google Gemini

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MySQL (v8.0+)

## Project Structure
```
planify/
├── frontend/          # React.js frontend application
├── backend/          # FastAPI backend server
└── docs/            # Additional documentation
```

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables
Create `.env` files in both frontend and backend directories with the following variables:

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:8000
```

Backend (.env):
```
DATABASE_URL=mysql://user:password@localhost:3306/planify
GOOGLE_CALENDAR_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
AI_API_KEY=your_ai_api_key
```

## Development
- Frontend runs on http://localhost:3000
- Backend API runs on http://localhost:8000
- API documentation available at http://localhost:8000/docs

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
MIT License
