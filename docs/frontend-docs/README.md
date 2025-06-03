# 🏗️ PodPlay Sanctuary Agent Framework

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-Production-brightgreen.svg)

> **The Ultimate AI-Powered Development Sanctuary**  
> A comprehensive agent framework combining multiple AI models, MCP (Model Context Protocol) integrations, and autonomous development workflows for the modern creator.

## 🌟 Overview

PodPlay Sanctuary is a production-ready multi-agent system designed to be your complete development companion. Built with a "Mama Bear" philosophy of caring, intelligent assistance, it seamlessly integrates cutting-edge AI models, development tools, and workflow automation into one cohesive platform.

### 🎯 Core Philosophy

- **Caring Intelligence**: AI that understands context and provides thoughtful assistance
- **Seamless Integration**: Universal automation hub connecting all your tools
- **Graceful Degradation**: Robust fallbacks when external services are unavailable
- **Production Ready**: Clean architecture, comprehensive error handling, and monitoring

## ✨ Key Features

### 🤖 Multi-Agent System
- **Mama Bear Agent**: Your primary caring AI companion with persistent memory
- **Scout Agent**: Autonomous development workflow automation (Scout.new clone)
- **Discovery Agent**: Proactive tool and resource discovery
- **Enhanced Services**: External AI integrations (Mem0.ai, Together.ai)

### 🧠 Intelligent Model Routing
- **Priority-Based Selection**: Gemini-first routing with cost optimization
- **Quota Management**: Automatic failover between API keys and service accounts
- **Multi-Provider Support**: Gemini, OpenAI, Anthropic, and more
- **Capability Matching**: Automatic model selection based on task requirements

### 🔌 MCP (Model Context Protocol) Marketplace
- **60+ MCP Servers**: Database, search, infrastructure, AI, and productivity tools
- **One-Click Installation**: Streamlined server deployment and configuration
- **Category Organization**: Easy discovery by functionality (AI, DevOps, Database, etc.)
- **Health Monitoring**: Real-time status tracking for all connected services

### 🏗️ Development Workspaces
- **NixOS Environments**: Reproducible, isolated development containers
- **Docker Integration**: Containerized development with full orchestration
- **GitHub Codespaces**: Cloud-based development environment support
- **Oracle Cloud VMs**: Scalable cloud compute integration

### 🎨 Modern Web Interface
- **React 19 + Tailwind V4**: Cutting-edge frontend technology
- **ShadCN UI**: Beautiful, accessible component library
- **Multi-Theme Support**: Light, Dark, and Purple Neon sensory themes
- **Real-Time Communication**: WebSocket integration for live updates

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React 19 + Tailwind V4]
        UI[ShadCN UI Components]
        WS[WebSocket Client]
    end

    subgraph "API Gateway"
        FL[Flask Application]
        BP[API Blueprints]
        SO[SocketIO Server]
    end

    subgraph "Agent Framework"
        MB[Mama Bear Agent]
        SA[Scout Agent]
        DA[Discovery Agent]
        EM[Enhanced Mama Service]
    end

    subgraph "Model Routing"
        MR[Intelligent Model Router]
        GM[Gemini API/Vertex]
        OA[OpenAI]
        AN[Anthropic]
    end

    subgraph "MCP Integration"
        MM[MCP Marketplace]
        MS[MCP Servers]
        MC[MCP Connectors]
    end

    subgraph "External Services"
        M0[Mem0.ai Memory]
        TA[Together.ai Sandbox]
        GH[GitHub Integration]
        DO[Docker/NixOS]
    end

    subgraph "Data Layer"
        DB[(SQLite Database)]
        FS[File Storage]
        CF[Configuration]
    end

    FE --> BP
    UI --> SO
    WS --> SO
    FL --> MB
    BP --> SA
    BP --> DA
    MB --> MR
    SA --> MM
    DA --> MS
    MR --> GM
    MR --> OA
    MR --> AN
    MM --> MC
    EM --> M0
    EM --> TA
    SA --> GH
    SA --> DO
    MB --> DB
    MM --> DB
    CF --> DB
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** with pip
- **Node.js 20+** with bun/npm
- **Docker** (optional, for containerized workspaces)
- **Git** for repository management

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/podplay-sanctuary.git
cd podplay-sanctuary

# Backend setup
pip install -r requirements.txt

# Frontend setup
cd frontend
bun install  # or npm install
cd ..
```

### 2. Environment Configuration

Create `.env` file with your API keys:

```bash
# AI Model Configuration
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google Cloud (for Vertex AI)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
PRIMARY_SERVICE_ACCOUNT_PROJECT_ID=your-gcp-project

# Enhanced Services
MEM0_API_KEY=your-mem0-api-key
MEM0_USER_ID=your-user-id
TOGETHER_AI_API_KEY=your-together-ai-key

# GitHub Integration
GITHUB_PAT=your-github-personal-access-token
GITHUB_TOKEN=your-github-token

# Application Settings
SECRET_KEY=your-secret-key
LOG_LEVEL=INFO
DEBUG_TOOLBAR=True
```

### 3. Database Initialization

```bash
# Initialize the SQLite database
python -c "from models.database import init_database; from app import create_app; app, _ = create_app(); init_database(app)"
```

### 4. Start the Application

```bash
# Terminal 1: Start backend server
python app.py

# Terminal 2: Start frontend development server
cd frontend
bun run dev  # or npm run dev
```

Visit `http://localhost:3000` to access your PodPlay Sanctuary!

## 📚 Core Components

### 🐻 Mama Bear Agent

Your primary AI companion with persistent memory and contextual understanding:

```python
from services.mama_bear_agent import MamaBearAgent

# Initialize with enhanced capabilities
mama_bear = MamaBearAgent()

# Store conversation context
mama_bear.store_memory("User prefers React for frontend development")

# Get contextual response
response = mama_bear.get_response(
    message="Help me build a new component",
    context={"current_project": "React Dashboard"}
)
```

**Features:**
- Persistent memory via Mem0.ai integration
- Context-aware responses
- Proactive assistance and suggestions
- Integration with all platform services

### 🤖 Scout Agent (Autonomous Development)

Automated development workflows inspired by Scout.new:

```python
from services.scout_agent import ScoutAgent

scout = ScoutAgent()

# Create a new project
project = scout.create_project({
    "name": "my-new-app",
    "template": "react-typescript",
    "features": ["authentication", "database", "api"]
})

# Deploy to production
deployment = scout.deploy_project(project.id, "production")
```

**Capabilities:**
- Project scaffolding and generation
- Automated testing and deployment
- Code review and optimization
- Integration with GitHub workflows

### 🧠 Intelligent Model Router

Smart model selection based on task requirements and cost optimization:

```python
from services.model_router import IntelligentModelRouter

router = IntelligentModelRouter()

# Automatic model selection
response = router.route_request({
    "message": "Analyze this image and write Python code",
    "attachments": ["image.jpg"],
    "capabilities_required": ["vision", "code_generation"],
    "cost_preference": "optimize"  # or "performance", "balanced"
})
```

**Features:**
- Gemini-first routing with intelligent fallbacks
- Cost optimization across providers
- Capability-based model matching
- Quota management and monitoring

### 🏪 MCP Marketplace

Comprehensive tool ecosystem with 60+ ready-to-use integrations:

```python
from services.marketplace_service import MCPMarketplaceManager

marketplace = MCPMarketplaceManager()

# Discover available tools
servers = marketplace.search_servers(
    query="database",
    category="database",
    official_only=True
)

# Install a new MCP server
result = marketplace.install_server("postgresql-mcp", {
    "host": "localhost",
    "port": 5432,
    "database": "myapp"
})
```

**Available Categories:**
- **AI**: ChatGPT, Claude, Gemini, Perplexity, HuggingChat
- **Database**: PostgreSQL, MongoDB, Redis, MeiliSearch
- **DevOps**: Docker, GitHub, GitLab, Kubernetes
- **Search**: Brave Search, Google Search, Elasticsearch
- **Productivity**: Notion, Slack, Linear, Asana

## 🛠️ Development

### Project Structure

```
podplay-sanctuary/
├── app.py                     # Main Flask application
├── config/
│   └── settings.py           # Configuration management
├── services/
│   ├── mama_bear_agent.py    # Core AI agent
│   ├── scout_agent.py        # Development automation
│   ├── enhanced_mama_service.py # External integrations
│   ├── marketplace_service.py # MCP marketplace
│   └── agent_framework_enhanced.py # Agent framework
├── api/
│   └── blueprints/           # API route definitions
├── models/
│   ├── database.py           # Database models
│   └── mcp_server.py         # MCP server models
├── data/
│   ├── mcp_servers.json      # MCP server catalog
│   └── models_catalog.json   # AI model definitions
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Application pages
│   │   ├── stores/          # Zustand state management
│   │   └── lib/             # Utilities and API client
│   └── package.json
└── requirements.txt
```

### API Endpoints

#### Agent Interaction
- `POST /api/chat/send` - Send message to Mama Bear
- `GET /api/chat/history` - Get conversation history
- `POST /api/scout/create-project` - Create new project
- `GET /api/scout/projects` - List user projects

#### MCP Marketplace
- `GET /api/mcp/servers` - List available MCP servers
- `POST /api/mcp/install` - Install MCP server
- `DELETE /api/mcp/uninstall/{server_id}` - Uninstall server
- `GET /api/mcp/categories` - Get server categories

#### Development Workspaces
- `POST /api/workspaces/create` - Create new workspace
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces/{id}/start` - Start workspace
- `DELETE /api/workspaces/{id}` - Delete workspace

#### Model Management
- `GET /api/models` - List available AI models
- `POST /api/models/route` - Route request to optimal model
- `GET /api/models/usage` - Get usage statistics

### WebSocket Events

Real-time communication for live updates:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Agent responses
socket.on('agent_response', (data) => {
    console.log('Agent says:', data.message);
});

// Workspace status updates
socket.on('workspace_status', (data) => {
    console.log('Workspace status:', data.status);
});

// MCP server events
socket.on('mcp_server_installed', (data) => {
    console.log('New MCP server available:', data.server_name);
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT models | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `MEM0_API_KEY` | Mem0.ai API key for persistent memory | No |
| `TOGETHER_AI_API_KEY` | Together.ai API key for code execution | No |
| `GITHUB_PAT` | GitHub Personal Access Token | No |
| `SECRET_KEY` | Flask secret key | Yes |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | No |

### Model Configuration

Models are automatically configured based on available API keys. Priority order:

1. **Gemini 2.0 Flash** (Primary - fastest, cheapest)
2. **Gemini 1.5 Pro** (High reasoning tasks)
3. **GPT-4o** (Multimodal tasks)
4. **Claude 3.5 Sonnet** (Creative and analytical tasks)

### MCP Server Configuration

MCP servers are configured in `data/mcp_servers.json`:

```json
{
  "version": 1,
  "servers": [
    {
      "name": "github-mcp",
      "type": "github",
      "url": "https://api.github.com",
      "api_key": "${GITHUB_PAT}",
      "description": "GitHub repository management",
      "category": "devops"
    }
  ]
}
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
python -m pytest tests/ -v

# Frontend tests
cd frontend
bun test  # or npm test

# Integration tests
python -m pytest tests/integration/ -v
```

### Health Checks

Monitor system health:

```bash
# Check all services
curl http://localhost:5000/api/health

# Check specific service
curl http://localhost:5000/api/health/mama-bear
curl http://localhost:5000/api/health/mcp-marketplace
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
```bash
# Set production environment
export FLASK_ENV=production
export DEBUG=False

# Configure production database
export DATABASE_URL=postgresql://user:pass@host:5432/podplay
```

2. **Build Frontend**:
```bash
cd frontend
bun run build
```

3. **Start Production Server**:
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or using Docker
docker-compose up -d
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  podplay-backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://...
    
  podplay-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - podplay-backend
```

## 📊 Monitoring & Analytics

### Logging

Comprehensive logging with structured output:

```python
import logging
from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Structured logging
logger.info("Agent request processed", extra={
    "user_id": "nathan_sanctuary",
    "model_used": "gemini-2.0-flash",
    "response_time": 1.2,
    "cost": 0.001
})
```

### Metrics

Built-in metrics collection:

- Agent response times
- Model usage and costs
- MCP server health
- User engagement metrics
- System resource usage

### Health Monitoring

Real-time health dashboard available at `/api/health`:

```json
{
  "status": "healthy",
  "services": {
    "mama_bear": "online",
    "model_router": "online", 
    "mcp_marketplace": "online",
    "database": "online"
  },
  "metrics": {
    "uptime": "2d 4h 30m",
    "total_requests": 15420,
    "avg_response_time": "0.8s",
    "active_workspaces": 3
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Set up development environment: `pip install -r requirements-dev.txt`
4. Make your changes and add tests
5. Run the test suite: `pytest`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📋 Roadmap

### Version 1.1 (Next Release)
- [ ] Advanced workflow automation
- [ ] Custom MCP server creation wizard
- [ ] Enhanced multi-modal capabilities
- [ ] Advanced analytics dashboard

### Version 1.2
- [ ] Kubernetes integration
- [ ] Advanced security features
- [ ] Multi-tenant support
- [ ] Plugin marketplace

### Long Term
- [ ] Mobile application
- [ ] Enterprise features
- [ ] Advanced AI model fine-tuning
- [ ] Distributed agent orchestration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude AI capabilities
- **Google** for Gemini model access
- **OpenAI** for GPT model integration
- **Model Context Protocol** community for standardization
- **Mem0.ai** for persistent memory services
- **Together.ai** for code execution sandbox

## 📞 Support

- **Documentation**: [https://docs.podplay-sanctuary.dev](https://docs.podplay-sanctuary.dev)
- **Discord Community**: [https://discord.gg/podplay](https://discord.gg/podplay)
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/podplay-sanctuary/issues)
- **Email Support**: support@podplay-sanctuary.dev

---

<div align="center">

**Built with ❤️ by the PodPlay Team**

[Website](https://podplay-sanctuary.dev) • [Documentation](https://docs.podplay-sanctuary.dev) • [Community](https://discord.gg/podplay)

</div>