# 🐻 Podplay Build Sanctuary - User Guide

## Quick Start Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
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

## 🚀 Main Features Overview

### 💬 **AI Chat Interface**
- **18+ AI Models**: Gemini 2.5, Claude 3.5, Llama 3.2, Mistral Large, and more
- **Enhanced Mama Bear**: Proactive AI development assistant with CORS-optimized chat
- **Persistent Memory**: Conversations and context preserved via Mem0.ai
- **File Processing**: Upload and analyze files with AI assistance
- **MCP Integration**: Access to 500+ development tools

### ❄️ **NixOS Workspaces**
- **Cloud Development Environments**: Reproducible, isolated development spaces
- **One-Click Creation**: Pre-configured environments with custom resource allocation
- **Integrated Terminal**: Browser-based SSH terminal access with xterm.js
- **Real-Time Monitoring**: Live workspace status and resource usage tracking
- **File Management**: Direct workspace file system access and management

### 🤖 **Scout Agent**
- **Project Monitoring**: Real-time development workflow analytics
- **Plan Visualization**: Step-by-step project execution tracking
- **Activity Logging**: Comprehensive development activity recording
- **Intervention Controls**: Pause, resume, and provide feedback to automated processes
- **Status Dashboard**: Visual project health and progress indicators

### 🛠️ **Development Tools**
- **MCP Marketplace**: 500+ Model Context Protocol servers across 12 categories
- **DevSandbox**: Cloud development environment management
- **Code Execution**: Safe Python/JavaScript execution with full output
- **Database Integration**: Built-in project and priority management

## 🎯 Navigation Guide

The application features a unified navigation system with three main areas:

### 💬 **AI Chat** (Chat Bubble Icon)
Your primary interface for AI interactions:
- Switch between 18+ AI models
- Upload and analyze files
- Access MCP tools and capabilities
- Persistent conversation history
- Enhanced Mama Bear assistance

### ❄️ **NixOS Workspaces** (Snowflake Icon)
Cloud development environment management:
- View all your workspaces at a glance
- Create new development environments
- Monitor resource usage and status
- Access integrated terminal sessions
- Manage workspace files

### 🤖 **Scout Agent** (Robot Icon)
Project monitoring and analytics dashboard:
- Monitor active development projects
- View real-time project status
- Analyze development activity logs
- Control automated processes
- Provide feedback to agents

## 📖 Step-by-Step Usage Guides

### 🔄 Getting Started with AI Chat

1. **Select Chat Interface**: Click the chat bubble icon (💬) in the navigation
2. **Choose AI Model**: Select from 18+ available models in the dropdown
3. **Start Conversation**: Type your message and press Enter
4. **Upload Files**: Drag and drop files for AI analysis
5. **Access Tools**: Use MCP tools for enhanced functionality

### ❄️ Creating and Managing NixOS Workspaces

#### Creating a New Workspace
1. **Navigate to Workspaces**: Click the snowflake icon (❄️)
2. **Click "New Workspace"**: Opens the workspace creation modal
3. **Configure Resources**:
   - **Name**: Choose a descriptive name
   - **CPU**: Select CPU cores (1-8)
   - **Memory**: Choose RAM allocation (1-32 GB)
   - **Storage**: Set disk space (10-100 GB)
4. **Select Template**: Choose from development environment templates
5. **Create Workspace**: Click "Create" to deploy

#### Managing Existing Workspaces
1. **View Workspace List**: See all workspaces with status indicators
2. **Monitor Status**: Real-time health and resource usage
3. **Quick Actions**:
   - **Start**: Boot up a stopped workspace
   - **Stop**: Safely shutdown a running workspace
   - **Terminal**: Open browser-based SSH terminal
   - **Files**: Access workspace file system
   - **Delete**: Remove workspace permanently

#### Using the Integrated Terminal
1. **Access Terminal**: Click "Terminal" on any running workspace
2. **SSH Connection**: Automatic SSH session establishment
3. **Full Terminal**: Complete bash/zsh terminal experience
4. **Session Persistence**: Maintains sessions across browser refreshes
5. **Multiple Sessions**: Open multiple terminal tabs per workspace

### 🤖 Monitoring Projects with Scout Agent

#### Setting Up Project Monitoring
1. **Navigate to Scout Agent**: Click the robot icon (🤖)
2. **Select Project**: Choose from available projects or add new ones
3. **Configure Monitoring**: Set monitoring preferences and alerts
4. **Start Monitoring**: Begin real-time project tracking

#### Using the Monitoring Dashboard
1. **Status Overview**: View overall project health and progress
2. **Plan Visualization**: See step-by-step project execution
3. **Activity Logs**: Monitor real-time development activities
4. **Performance Metrics**: Track execution times and resource usage

#### Intervention and Control
1. **Pause Execution**: Click "Pause" to halt automated processes
2. **Resume Execution**: Click "Resume" to continue paused processes
3. **Provide Feedback**: Send guidance to automated agents
4. **Manual Override**: Take manual control when needed

## 🔧 Advanced Configuration

### Workspace Templates
Create custom templates for specific development needs:
- **Frontend Development**: Node.js, React, TypeScript pre-installed
- **Backend Development**: Python, PostgreSQL, Redis configured
- **Full-Stack**: Complete development environment
- **Data Science**: Jupyter, pandas, scikit-learn ready
- **DevOps**: Docker, Kubernetes, Terraform available

### Scout Agent Settings
Customize monitoring and intervention behavior:
- **Auto-Refresh Intervals**: Set how often status updates
- **Alert Thresholds**: Configure when to notify about issues
- **Intervention Triggers**: Set conditions for automatic pauses
- **Log Retention**: Configure how long to keep activity logs

### Performance Optimization
- **Resource Allocation**: Right-size workspace resources
- **Monitoring Frequency**: Balance real-time updates with performance
- **Log Management**: Configure log levels and retention
- **Network Settings**: Optimize for your network conditions

## 🛠️ Troubleshooting

### Common Issues

#### Chat Not Working
- **Problem**: CORS errors or connection issues
- **Solution**: Backend should auto-restart; refresh if needed
- **Check**: Verify backend is running on localhost:5000

#### Workspace Won't Start
- **Problem**: Workspace shows "error" status
- **Solution**: Check resource availability and try restarting
- **Check**: Review workspace configuration and logs

#### Terminal Connection Failed
- **Problem**: Can't access workspace terminal
- **Solution**: Verify workspace is running and SSH service is active
- **Check**: WebSocket connections and network settings

#### Scout Agent Not Monitoring
- **Problem**: No project data or logs appearing
- **Solution**: Verify project is properly configured and registered
- **Check**: API connectivity and authentication

### Debug Tools
- **Backend Health**: Visit http://localhost:5000/health
- **API Testing**: Use browser developer tools Network tab
- **WebSocket Testing**: Check console for connection errors
- **Log Analysis**: Review browser console and backend logs

### Getting Help
- **Documentation**: See [docs/README.md](docs/README.md) for comprehensive guides
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions and get community support

---

## 🎉 Tips for Success

### Best Practices
- **Regular Backups**: Export important workspace data regularly
- **Resource Monitoring**: Keep an eye on resource usage to optimize costs
- **Template Usage**: Create and share workspace templates for common setups
- **Log Review**: Regularly review Scout Agent logs for insights
- **Intervention Wisdom**: Use pause/resume controls judiciously

### Power User Features
- **Multiple Workspaces**: Run different environments simultaneously
- **Advanced Terminal**: Use tmux/screen for persistent sessions
- **Custom Scripts**: Automate common tasks within workspaces
- **Integration APIs**: Connect with external tools and services
- **Performance Tuning**: Optimize settings for your specific workflows

---

<div align="center">

**🐻❄️🤖 Your complete guide to AI-powered development with cloud workspaces**

*Happy coding in your sanctuary!*

</div>
- Advanced conversation management

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python Flask + WebSocket
- **AI**: Together.ai + Mem0.ai + MCP Protocol
- **Database**: SQLite with auto-backup

## Support

This is proprietary software. See LICENSE for usage terms.
