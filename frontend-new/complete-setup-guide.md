# 🐻 Podplay Build Sanctuary - Complete Setup Guide

A professional, accessible development environment designed specifically for neurodiverse developers and creators.

## 🌟 Features Overview

### ✨ Core Features
- **Mama Bear AI Agent**: Your caring, intelligent development companion
- **Unified Workspace**: Seamless transition from chat to full development environment
- **MCP Marketplace**: Discover and install Model Context Protocol servers
- **Real-time Collaboration**: Socket.IO powered live communication
- **Professional UI**: Beautiful, accessible interface with multiple themes

### 🎯 Accessibility & Neurodiversity Support
- **Multiple Themes**: Light, Dark, and Sensory Calm options
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Reduced Motion**: Respects user motion preferences
- **Screen Reader Friendly**: Complete ARIA support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear visual focus indicators

### 🔧 Technical Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python Flask + Socket.IO
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Integration**: OpenAI, Anthropic, Google AI, Mem0.ai, Together.ai
- **Deployment**: Docker + Docker Compose

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+ and **pip**
- **Git** for cloning the repository
- **Docker** (optional, for containerized deployment)

### 1. Clone and Setup
```bash
# Clone your repository
git clone <your-repo-url>
cd podplay-sanctuary

# Make scripts executable (Linux/Mac)
chmod +x scripts/*.sh

# Install all dependencies
npm run install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

**Required API Keys (get free tiers):**
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://makersuite.google.com/app/apikey
- **Mem0.ai**: https://app.mem0.ai/ (optional, for persistent memory)
- **Together.ai**: https://api.together.xyz/ (optional, for code execution)

### 3. Start Development Environment
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run backend   # Starts on http://localhost:5000
npm run frontend  # Starts on http://localhost:3000
```

### 4. Open Your Sanctuary
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 📁 Project Structure

```
podplay-sanctuary/
├── 📱 frontend/                 # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── services/           # API and Socket.IO services
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Accessibility & theme utilities
│   │   ├── config/             # Configuration files
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── 🐻 backend/                  # Python Flask API
│   ├── api/blueprints/         # API endpoint modules
│   ├── services/               # Business logic services
│   ├── models/                 # Database models
│   ├── utils/                  # Utility functions
│   ├── config/                 # Configuration management
│   ├── data/                   # MCP server data
│   ├── app.py                  # Main application
│   ├── requirements.txt
│   └── Dockerfile
├── 🐳 docker-compose.yml        # Development containers
├── 📜 scripts/                  # Automation scripts
│   ├── start-development.sh
│   └── build-production.sh
├── .env.example                # Environment template
├── package.json                # Root project config
└── README.md
```

---

## 🔧 Development Workflow

### Daily Development
```bash
# Start your development environment
npm run dev

# View logs in real-time
npm run logs

# Stop all services
npm run stop
```

### Code Quality
```bash
# Lint frontend code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Backend Development
```bash
# Access backend directly
cd backend
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install new Python packages
pip install package-name
pip freeze > requirements.txt

# Database operations
python -c "from models.database import init_database; init_database()"
```

### Frontend Development
```bash
# Access frontend directly
cd frontend

# Install new packages
npm install package-name

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Theme & Accessibility Configuration

### Available Themes
1. **Light Theme**: Clean, bright interface for well-lit environments
2. **Dark Theme**: Easy on the eyes for low-light coding sessions  
3. **Sensory Calm**: Specially designed for sensory sensitivities

### Accessibility Features
- **Screen Reader Support**: Complete ARIA implementation
- **Keyboard Navigation**: Full keyboard-only operation
- **High Contrast Mode**: Automatic detection and support
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Focus Management**: Clear visual focus indicators
- **Live Regions**: Screen reader announcements for dynamic content

### Customization
Edit `frontend/src/utils/themes.js` to modify themes:
```javascript
const customTheme = {
  name: 'Custom',
  primary: 'from-blue-50 to-indigo-100',
  secondary: 'bg-white',
  accent: 'bg-blue-500',
  // ... other properties
}
```

---

## 🚀 Production Deployment

### Option 1: Docker Compose (Recommended)
```bash
# Build production images
npm run build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f
```

### Option 2: Manual Deployment

#### Backend Deployment
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/sanctuary

# Run with gunicorn
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

#### Frontend Deployment
```bash
cd frontend

# Build production bundle
npm run build

# Serve with nginx or upload to CDN
# dist/ folder contains production-ready files
```

### Option 3: Cloud Deployment

#### Google Cloud Run
```bash
# Build and deploy backend
gcloud run deploy podplay-sanctuary \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend to Firebase Hosting
firebase deploy --only hosting
```

#### AWS
```bash
# Deploy backend to Elastic Beanstalk
eb init
eb create podplay-sanctuary-prod
eb deploy

# Deploy frontend to S3 + CloudFront
aws s3 sync frontend/dist/ s3://your-bucket-name/
```

---

## 🔒 Security Configuration

### Environment Variables
Never commit these to git:
```bash
# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# Security
SECRET_KEY=your-secret-key-here

# Database (Production)
DATABASE_URL=postgresql://user:pass@host:5432/sanctuary
```

### Production Security Checklist
- [ ] Change default `SECRET_KEY`
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database authentication
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Set up monitoring and logging

---

## 🧪 Testing & Quality Assurance

### Frontend Testing
```bash
cd frontend

# Unit tests
npm test

# Accessibility testing
npm run test:a11y

# Visual regression testing
npm run test:visual
```

### Backend Testing
```bash
cd backend

# Install test dependencies
pip install pytest pytest-flask

# Run tests
python -m pytest

# Coverage report
python -m pytest --cov=.
```

### Accessibility Testing
1. **Automated**: Uses axe-core for automated a11y testing
2. **Manual**: Test with screen readers (NVDA, JAWS, VoiceOver)
3. **Keyboard**: Ensure full keyboard navigation
4. **Color**: Verify color contrast ratios

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r requirements.txt

# Check database
python -c "from models.database import get_database_stats; print(get_database_stats())"
```

#### Frontend Won't Connect
```bash
# Check backend is running
curl http://localhost:5000/health

# Check CORS configuration
# Verify VITE_API_BASE_URL in .env

# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

#### Socket.IO Connection Issues
1. Verify backend Socket.IO is running
2. Check CORS configuration
3. Ensure port 5000 is accessible
4. Check browser console for errors

#### API Key Issues
```bash
# Test API keys
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Debug Mode
```bash
# Enable debug logging
export FLASK_DEBUG=True
export LOG_LEVEL=DEBUG

# Frontend debug
export VITE_DEBUG=true
```

### Health Checks
- **Backend**: http://localhost:5000/health
- **Frontend**: Built-in health monitoring
- **Database**: http://localhost:5000/api/dev/database/info
- **Services**: http://localhost:5000/api/dev/services/status

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install development dependencies: `npm run install`
4. Make your changes
5. Test thoroughly: `npm run test`
6. Commit with descriptive messages
7. Push and create a Pull Request

### Accessibility Guidelines
- Follow WCAG 2.1 AA standards
- Test with screen readers
- Ensure keyboard navigation works
- Maintain semantic HTML structure
- Provide alt text for images
- Use proper heading hierarchy

### Code Style
- **Frontend**: Prettier + ESLint configuration
- **Backend**: Black + Flake8 formatting
- **Git**: Conventional commit messages

---

## 📚 API Documentation

### Chat Endpoints
```bash
# Chat with Mama Bear
POST /api/chat/mama-bear
Content-Type: application/json

{
  "message": "Hello Mama Bear!",
  "user_id": "sanctuary_user",
  "session_id": "main_session"
}
```

### MCP Marketplace
```bash
# Search MCP servers
GET /api/mcp/search?query=database&limit=10

# Install MCP server
POST /api/mcp/install/postgresql-mcp-server
```

### System Information
```bash
# System metrics
GET /api/v1/scout_agent/system/metrics

# Service status
GET /api/v1/scout_agent/services/status
```

---

## 🌍 Community & Support

### Getting Help
- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support
- **Discord**: Join our accessibility-focused community

### Reporting Bugs
Please include:
1. **Environment**: OS, browser, versions
2. **Steps to reproduce**: Detailed reproduction steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Accessibility impact**: How it affects accessibility

### Feature Requests
We especially welcome:
- Accessibility improvements
- Neurodiversity support features
- UI/UX enhancements
- Performance optimizations
- Integration suggestions

---

## 📄 License

MIT License - Built with ❤️ for the neurodiverse community

```
Copyright (c) 2024 Podplay Sanctuary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

Special thanks to:
- **The neurodiverse community** for inspiration and feedback
- **Accessibility advocates** for guidelines and best practices
- **Open source contributors** who make this possible
- **Anthropic** for Claude and MCP protocol
- **The React and Flask communities** for excellent tools

---

## 🗺️ Roadmap

### Version 1.1
- [ ] Advanced code editor with syntax highlighting
- [ ] Integrated terminal with full Shell support
- [ ] File manager with drag-and-drop
- [ ] Project templates and scaffolding

### Version 1.2
- [ ] Multi-user collaboration
- [ ] Advanced AI model switching
- [ ] Custom theme builder
- [ ] Plugin system for extensions

### Version 2.0
- [ ] Mobile responsive design
- [ ] Offline capability
- [ ] Advanced accessibility features
- [ ] Performance optimizations

---

**Welcome to your Podplay Build Sanctuary! 🐻✨**

*A calm, empowering space where neurodivergent minds thrive and create amazing things.*