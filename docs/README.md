# 📚 Podplay Build Sanctuary Documentation

Welcome to the comprehensive documentation for Podplay Build Sanctuary - your desktop AI assistant with NixOS Workspaces and Scout Agent monitoring.

## 📋 Documentation Index

### 🏠 **Core Documentation**
- **[Main README](../README.md)** - Overview, quick start, and general information
- **[User Guide](../USER_GUIDE.md)** - Step-by-step user instructions
- **[Mission Statement](../MISSION_STATEMENT.md)** - Project vision and goals

### 🤖 **AI & Agent Systems**
- **[Enhanced Mama Bear](../DEVELOPER_HANDOVER_REPORT.md)** - AI agent capabilities and integration
- **[Multimodal Features](../MULTIMODAL_FEATURES.md)** - File processing and analysis capabilities

### ❄️ **NixOS Workspaces**
- **[NixOS Workspaces Documentation](NIXOS_WORKSPACES.md)** - Complete workspace management guide
- **[NixOS Integration Review](../NIXOS_INTEGRATION_REVIEW.md)** - Integration architecture and review

### 🤖 **Scout Agent**
- **[Scout Agent Documentation](SCOUT_AGENT.md)** - Project monitoring and intervention system

### 🛠️ **Development & Sandbox**
- **[Development Environment Roadmap](../DEV_ENVIRONMENT_ROADMAP.md)** - Development planning
- **[DevSandbox Features](../DEVSANDBOX_FEATURES.md)** - Cloud development capabilities
- **[Developer Handover Report](../DEVELOPER_HANDOVER_REPORT.md)** - Technical implementation details

### 🔧 **Technical Integration**
- **[Mem0 Integration](mem0_integration.py)** - Memory system integration
- **[Memory ID Configuration](mem0_memory_id.txt)** - Memory system configuration

## 🚀 Quick Navigation

### For New Users
1. Start with the **[Main README](../README.md)** for overview and setup
2. Follow the **[User Guide](../USER_GUIDE.md)** for step-by-step instructions
3. Explore **[NixOS Workspaces](NIXOS_WORKSPACES.md)** for cloud development environments

### For Developers
1. Review **[Developer Handover Report](../DEVELOPER_HANDOVER_REPORT.md)** for technical details
2. Study **[NixOS Integration Review](../NIXOS_INTEGRATION_REVIEW.md)** for architecture
3. Check **[Development Environment Roadmap](../DEV_ENVIRONMENT_ROADMAP.md)** for planning

### For System Administrators
1. Review **[NixOS Workspaces Documentation](NIXOS_WORKSPACES.md)** for infrastructure
2. Study **[Scout Agent Documentation](SCOUT_AGENT.md)** for monitoring setup
3. Check **[DevSandbox Features](../DEVSANDBOX_FEATURES.md)** for capabilities

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 Podplay Build Sanctuary                    │
├─────────────────────────────────────────────────────────────┤
│  🖥️ Electron Desktop App                                   │
│  ├─ 💬 AI Chat Interface (18+ Models)                      │
│  ├─ ❄️ NixOS Workspaces Manager                            │
│  └─ 🤖 Scout Agent Dashboard                               │
├─────────────────────────────────────────────────────────────┤
│  🔧 Python Flask Backend                                   │
│  ├─ 🐻 Enhanced Mama Bear AI Agent                         │
│  ├─ ❄️ NixOS Workspace Orchestration                       │
│  ├─ 🤖 Scout Agent Monitoring System                       │
│  ├─ 🧠 Mem0.ai Memory Management                           │
│  └─ 🛠️ MCP Marketplace (500+ Tools)                        │
├─────────────────────────────────────────────────────────────┤
│  ☁️ Cloud Infrastructure                                   │
│  ├─ ❄️ NixOS Development Workspaces                        │
│  ├─ 🔗 SSH Terminal Bridge                                 │
│  ├─ 📊 Real-time Monitoring Services                       │
│  └─ 🗄️ Distributed Storage Systems                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Feature Overview

### ✅ **Completed Systems**
- **AI Chat Interface**: Multi-model chat with 18+ AI models and CORS optimization
- **NixOS Workspaces**: Complete cloud workspace lifecycle management
- **Scout Agent**: Real-time project monitoring and intervention system
- **MCP Marketplace**: 500+ development tools across 12 categories
- **Desktop Integration**: Unified navigation and system management

### 🔧 **Development Components**
- **Frontend**: 13 new React components with TypeScript integration
- **Backend**: Enhanced Flask API with comprehensive endpoint coverage
- **Database**: SQLite with expanded schema for all systems
- **WebSocket**: Real-time communication for terminals and monitoring
- **Security**: Authentication, encryption, and access control

## 🛠️ API Documentation

### Core API Endpoints

#### AI & Chat
```
POST /api/mama-bear/chat           # Multi-model AI chat with fallback
GET  /api/mama-bear/briefing       # Daily briefing with system status
POST /api/mama-bear/learn          # Learning from user interactions
```

#### NixOS Workspaces
```
GET    /api/nixos/workspaces                    # List all workspaces
POST   /api/nixos/workspaces/create             # Create new workspace
GET    /api/nixos/workspaces/{id}               # Get workspace details
POST   /api/nixos/workspaces/{id}/start         # Start workspace
POST   /api/nixos/workspaces/{id}/stop          # Stop workspace
DELETE /api/nixos/workspaces/{id}               # Delete workspace
WS     /ws/nixos/workspaces/{id}/terminal       # Terminal WebSocket
```

#### Scout Agent
```
GET  /api/scout/projects                        # List monitored projects
GET  /api/scout/projects/{id}/status            # Get project status
GET  /api/scout/projects/{id}/plan              # Get execution plan
GET  /api/scout/projects/{id}/logs              # Get activity logs
POST /api/scout/projects/{id}/pause             # Pause execution
POST /api/scout/projects/{id}/resume            # Resume execution
POST /api/scout/projects/{id}/feedback          # Send agent feedback
```

#### MCP Marketplace
```
GET  /api/mcp/search                           # Search MCP servers
GET  /api/mcp/discover                         # Discover trending tools
GET  /api/mcp/categories                       # Get all categories
POST /api/mcp/install                          # Install MCP server
GET  /api/mcp/manage                           # Manage installed servers
```

## 🎨 Frontend Components Reference

### Core Application
- **App.tsx** - Main application with unified navigation
- **api.ts** - Comprehensive API configuration and helpers

### NixOS Workspaces Components
- **WorkspacesView.tsx** - Main workspace management interface
- **WorkspaceListComponent.tsx** - Workspace listing with filtering
- **WorkspaceItem.tsx** - Individual workspace cards with controls
- **WebTerminalComponent.tsx** - Browser-based SSH terminal
- **WorkspaceCreationModal.tsx** - Workspace configuration interface

### Scout Agent Components
- **ScoutProjectView.tsx** - Main project monitoring dashboard
- **ScoutPlanDisplayComponent.tsx** - Visual project plan tracking
- **ScoutLogViewerComponent.tsx** - Real-time activity log viewer
- **ScoutInterventionControlsComponent.tsx** - Agent control interface

### Styling System
- **WorkspacesView.css** - NixOS workspace styling
- **WorkspaceItem.css** - Individual workspace item styling
- **ScoutProjectView.css** - Scout agent dashboard styling
- **ScoutAgentShared.css** - Shared Scout Agent component styling

## 🔧 Backend Modules Reference

### Core Systems
- **app.py** - Main Flask application with all endpoints
- **enhanced_mama_bear_v2.py** - Enhanced AI agent with multi-model support
- **vertex_integration.py** - Google Vertex AI integration
- **mem0_chat_manager.py** - Persistent memory management

### NixOS Workspaces
- **nixos_sandbox_orchestrator.py** - Workspace lifecycle management
- **ssh_bridge.py** - WebSocket-to-SSH terminal bridge
- **vm_manager.py** - Virtual machine management

### Scout Agent
- **scout_logger.py** - Comprehensive activity logging and monitoring

### Development Tools
- **cloud_dev_sandbox.py** - Cloud development environment management
- **dev_sandbox.py** - Local development sandbox capabilities

## 📊 Database Schema

### Core Tables
- **mcp_servers** - MCP marketplace server metadata
- **daily_briefings** - Mama Bear daily briefing history
- **project_priorities** - User project priorities and tasks
- **agent_learning** - AI agent learning and adaptation data

### NixOS Workspaces Tables
- **nixos_workspaces** - Workspace configurations and status
- **workspace_metrics** - Resource usage and performance data
- **workspace_sessions** - Terminal session management

### Scout Agent Tables
- **scout_projects** - Monitored project configurations
- **scout_logs** - Development activity logs
- **scout_interventions** - Human intervention records
- **scout_metrics** - Project performance analytics

## 🔐 Security Documentation

### Authentication & Authorization
- JWT-based session management
- Role-based access control (RBAC)
- API key authentication for external integrations

### Data Protection
- Encryption at rest for sensitive data
- TLS encryption for all API communications
- Secure WebSocket connections for real-time features

### Infrastructure Security
- NixOS workspace isolation
- SSH key-based authentication
- Network security and firewall rules
- Audit logging for all system operations

## 🚀 Deployment Guide

### Development Environment
```bash
# Quick setup
git clone <repository>
cd podplay-build-beta
./setup-sanctuary.sh

# Start development servers
npm run backend         # Python Flask (localhost:5000)
npm run frontend        # React + Vite (localhost:5173)
npm run electron        # Desktop app
```

### Production Deployment
```bash
# Setup production infrastructure
./setup-nixos-infrastructure.sh

# Configure environment variables
cp .env.example .env
# Edit .env with production settings

# Deploy application
npm run build
npm run start:prod
```

## 🧪 Testing Documentation

### Backend Testing
```bash
# Run comprehensive test suite
python backend_master_test.py

# Quick health check
python backend_master_test.py --quick

# Test specific components
python -m pytest tests/test_nixos_workspaces.py
python -m pytest tests/test_scout_agent.py
```

### Frontend Testing
```bash
# Run React component tests
npm test

# Run E2E tests
npm run test:e2e

# Test specific components
npm test -- WorkspacesView
npm test -- ScoutAgent
```

## 📈 Performance Monitoring

### System Metrics
- Backend response times and throughput
- Frontend rendering performance
- WebSocket connection stability
- Database query performance

### Resource Usage
- CPU and memory utilization
- Network bandwidth consumption
- Storage usage and growth
- NixOS workspace resource allocation

### User Experience
- Page load times
- Component rendering performance
- Real-time update latency
- Terminal responsiveness

## 🤝 Contributing Guidelines

### Code Standards
- Follow TypeScript best practices for frontend
- Use Python PEP 8 standards for backend
- Implement comprehensive error handling
- Include unit tests for new features

### Documentation Standards
- Update relevant documentation for new features
- Include API documentation for new endpoints
- Provide examples and usage instructions
- Maintain architectural diagrams

### Review Process
- All changes require code review
- Include tests for new functionality
- Update documentation as needed
- Verify performance impact

## 🆘 Troubleshooting Resources

### Common Issues
- **[CORS Errors](../README.md#cors-resolution)** - Chat functionality issues
- **[Workspace Connection Problems](NIXOS_WORKSPACES.md#troubleshooting)** - NixOS workspace access
- **[Scout Agent Not Monitoring](SCOUT_AGENT.md#troubleshooting)** - Project monitoring issues
- **[Performance Issues](../README.md#performance-optimization)** - System optimization

### Debug Tools
- Backend test suite for system validation
- Browser developer tools for frontend debugging
- WebSocket connection testing utilities
- Log analysis tools and commands

### Support Channels
- GitHub Issues for bug reports
- GitHub Discussions for feature requests
- Documentation feedback and improvements
- Community contributions and extensions

---

## 📞 Getting Help

For specific questions about different systems:

- **General Questions**: See [Main README](../README.md)
- **NixOS Workspaces**: See [NixOS Workspaces Documentation](NIXOS_WORKSPACES.md)
- **Scout Agent**: See [Scout Agent Documentation](SCOUT_AGENT.md)
- **Development**: See [Developer Handover Report](../DEVELOPER_HANDOVER_REPORT.md)

---

<div align="center">

**🐻❄️🤖 Comprehensive documentation for your AI-powered development sanctuary**

*Last updated: May 26, 2025*

</div>
