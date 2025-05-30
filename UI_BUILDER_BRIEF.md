# Podplay Sanctuary UI Builder Brief

## Project Overview
Building a development sanctuary interface that connects to an existing, fully functional Python Flask backend.

## Backend Status: ✅ FULLY WORKING
- All APIs tested and functional
- Socket.IO working
- Database operations working
- Chat AI services operational

## Frontend Issues to Fix
The beautiful UI is built but has connection issues with the backend.

## Critical API Endpoints (ALL WORKING on backend):
```
Backend URL: http://localhost:5000

Core Endpoints:
- POST /api/chat/mama-bear (Chat with AI)
- GET /api/chat/daily-briefing (Daily briefing)
- GET /api/mcp/search (MCP servers)
- GET /health (Health check)
- Socket.IO on port 5000
```

## Frontend Structure:
```
frontend/src/
├── App.tsx (Main app)
├── api/
│   └── api.ts (API configuration - NEEDS FIXING)
├── components/
│   ├── chat/ (Chat components)
│   ├── workspaces/ (Workspace views)
│   └── ui/ (UI components)
└── types/ (TypeScript types)
```

## Key Files to Examine:
1. `frontend/src/api/api.ts` - API URL configuration
2. `frontend/src/App.tsx` - Main component with backend calls
3. `frontend/src/components/chat/` - Chat interface components

## What Needs Fixing:
1. Fix API_BASE_URL in api.ts
2. Add missing endpoints in backend
3. Fix CORS preflight issues
4. Connect Socket.IO properly

## Style Guidelines:
- Modern, clean design (already implemented beautifully)
- Bear theme with warm colors (🐻)
- Calm, sanctuary-like feel
- Productivity-focused layout
- Modern gradients and smooth animations

## Technology Stack:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Python Flask + Socket.IO
- AI: Custom Mama Bear agent
- Database: SQLite

The UI is gorgeous and matches the sanctuary theme perfectly. We just need to connect it to the working backend.
