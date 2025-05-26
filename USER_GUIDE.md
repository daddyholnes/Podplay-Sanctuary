# 🐻 Podplay Build Sanctuary - User Guide

## Quick Start Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone & Setup
```bash
git clone <repository-url>
cd podplay-build-beta
chmod +x setup-sanctuary.sh
./setup-sanctuary.sh
```

### 2. Environment Configuration
Copy the `.env` file and update these keys:
```bash
# Required API Keys
TOGETHER_AI_API_KEY=your_together_ai_key
MEM0_API_KEY=your_mem0_key
GITHUB_PAT=your_github_token

# Optional
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```

### 3. Start the Application
```bash
./start-sanctuary.sh
```

Access at: http://localhost:5173

## Features

### 🐻 Mama Bear AI Assistant
- Enhanced with Together.ai LLM integration
- Persistent memory via Mem0.ai
- Proactive development assistance
- 500+ MCP server marketplace

### 🛠️ DevSandbox
- Integrated cloud browser
- Container environment management
- Real-time collaboration
- File upload/download

### ☁️ CloudBrowser
- In-app container browsing
- Quick-launch environments (React, Vue, Python, etc.)
- Available in both DevSandbox and Mama Bear chat
- Fullscreen and modal modes

### 🔍 Vertex Garden
- Multi-model AI chat interface
- Model comparison tools
- Advanced conversation management

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python Flask + WebSocket
- **AI**: Together.ai + Mem0.ai + MCP Protocol
- **Database**: SQLite with auto-backup

## Support

This is proprietary software. See LICENSE for usage terms.
