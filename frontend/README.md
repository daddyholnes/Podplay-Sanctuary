# 🏠 PodPlay Build Sanctuary

*Your AI Development Workspace - A calm, empowering environment for Nathan's creative journey*

## 🌟 Overview

PodPlay Build Sanctuary is a comprehensive AI-powered development platform that provides multiple specialized interfaces for AI-assisted development, research, and automation. Built with React, TypeScript, and Tailwind CSS, it integrates seamlessly with a Flask backend to provide real-time AI interactions, workspace management, and multi-modal capabilities.

## ✨ Features

### 💝 Main Chat (Mama Bear)
- **Primary AI companion** with Gemini 2.5 Pro integration
- **Persistent memory** via mem0.ai for context continuity
- **Multi-modal input** - text, voice, images, files, video
- **Shared web browsing** for collaborative research
- **Daily briefings** and proactive assistance
- **Project categorization** and chat history management

### 🤖 Scout Agent Interface
- **4-stage autonomous workflow** (Welcome → Planning → Workspace → Production)
- **Real-time file generation** with live preview
- **Timeline visualization** of project progress
- **Download management** for individual files or complete projects
- **Animated transitions** between development stages

### 🎯 Multi-Modal AI Chat
- **All major AI models** in one interface (Gemini 2.5, Claude 3.5, GPT-4o, etc.)
- **Accurate model information** - real pricing, capabilities, rate limits
- **Multi-modal capabilities** - voice, video, images, documents
- **Model comparison** and switching
- **Usage tracking** and token management

### 🏗️ Dev Workspaces
- **Draggable, resizable workspace windows** for development environments
- **Multiple templates** - NixOS, Docker, GitHub Codespace, Oracle Cloud
- **Integrated Mama Bear chat** as floating assistant
- **GitHub integration** with repository management
- **File upload and management** across workspaces
- **Audio/video recording** capabilities

### 🛒 MCP Marketplace
- **Package discovery** across GitHub, Docker Hub, and custom registries
- **Installation automation** with Mama Bear assistance
- **Category filtering** and search functionality
- **Package ratings and download statistics**
- **Collaborative web browser** for documentation
- **Authentication status** for different marketplaces

### 📱 Mini Apps Hub
- **Chrome-style tabbed interface** for web applications
- **Curated AI tools** - ChatGPT, Claude, Perplexity, HuggingChat, etc.
- **Category organization** and search
- **Session persistence** across app switching
- **Iframe security** and sandboxing
- **Beautiful app grid** with hover animations

## 🎨 Design Philosophy

### Sensory-Friendly Design
- **Multiple themes** - Light, Dark, and Purple Neon for sensory comfort
- **Smooth animations** that don't overwhelm
- **Rounded corners** and soft edges throughout
- **Calming color palettes** with purple gradient branding
- **Accessibility features** for neurodivergent users

### Mama Bear Philosophy
- **Caring, proactive AI partner** that anticipates needs
- **Emotional attunement** and supportive responses
- **Context preservation** across all interactions
- **Daily briefings** and routine management
- **Complexity management** to reduce cognitive load

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript for type safety
- **Vite 6** for lightning-fast development
- **Tailwind CSS V4** for modern styling
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Query** for server state
- **Socket.IO Client** for real-time communication

### Backend Integration
- **Flask backend** with Socket.IO for real-time features
- **Multiple AI providers** - Gemini, OpenAI, Anthropic
- **mem0.ai integration** for persistent memory
- **MCP (Model Context Protocol)** support
- **File upload and processing** capabilities
- **GitHub API integration**

### API Endpoints
```typescript
// Chat & Conversations
POST /api/chat/message          // Send message to Mama Bear
GET  /api/chat/conversations    // Get conversation history
POST /api/chat/conversations    // Create new conversation

// AI Models
POST /api/ai/gemini            // Call Gemini models
POST /api/ai/claude            // Call Claude models  
POST /api/ai/openai            // Call OpenAI models

// File Management
POST /api/files/upload         // Upload files
POST /api/files/transcribe     // Transcribe audio

// Workspaces
POST /api/workspaces           // Create workspace
GET  /api/workspaces           // List workspaces
GET  /api/workspaces/:id/status // Get workspace status

// MCP Integration
GET  /api/mcp/search           // Search MCP packages
POST /api/mcp/install          // Install MCP package
GET  /api/mcp/packages         // List installed packages

// Scout Agent
POST /api/scout/create         // Create Scout project
GET  /api/scout/projects/:id   // Get project status
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (20.19.0 recommended)
- Bun 1.2+ (preferred package manager)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd podplay-sanctuary
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL and API keys
   ```

4. **Start development server**
   ```bash
   bun dev
   ```

5. **Open in browser**
   ```
   http://localhost:8001
   ```

### Backend Setup
Ensure your Flask backend is running on `http://localhost:5000` with the following environment variables:

```bash
# AI API Keys
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key

# Memory & Storage
MEM0_API_KEY=your_mem0_key
MEM0_USER_ID=nathan_sanctuary

# GitHub Integration
GITHUB_PAT=your_github_token

# Other services as needed...
```

## 🎯 Usage Guide

### Getting Started with Mama Bear
1. **Open Main Chat** - Start with a daily briefing and personalized greeting
2. **Ask for help** - Mama Bear can assist with any development task
3. **Upload files** - Share documents, images, or code for analysis
4. **Browse together** - Use shared browser for collaborative research

### Using Scout Agent
1. **Describe your project** - Enter a natural language description
2. **Watch the magic** - Scout progresses through 4 automated stages
3. **Download results** - Get individual files or complete projects
4. **Iterate and refine** - Make changes and regenerate as needed

### Managing Workspaces
1. **Choose a template** - NixOS, Docker, Codespace, or Oracle Cloud
2. **Drag and resize** - Arrange workspace windows as needed
3. **Chat with Mama Bear** - Get help with configuration and setup
4. **Connect GitHub** - Integrate version control seamlessly

### Exploring MCP Marketplace
1. **Browse packages** - Filter by category or search by name
2. **Read descriptions** - See capabilities, ratings, and download stats
3. **Ask Mama Bear** - Get installation and configuration help
4. **Install with one click** - Automated setup and integration

### Using Mini Apps
1. **Browse the grid** - See all available AI tools and applications
2. **Click to open** - Apps load in Chrome-style tabs
3. **Switch between apps** - Seamless multitasking
4. **Return to grid** - Add more apps as needed

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN UI components
│   ├── Layout.tsx      # Main layout wrapper
│   └── Sidebar.tsx     # Navigation sidebar
├── pages/              # Main application pages
│   ├── MainChat.tsx    # Mama Bear primary interface
│   ├── ScoutAgent.tsx  # Autonomous development workflow
│   ├── MultiModalChat.tsx # Multi-model AI chat
│   ├── DevWorkspaces.tsx # Development environments
│   ├── MCPMarketplace.tsx # MCP package discovery
│   └── MiniApps.tsx    # Embedded applications hub
├── stores/             # Zustand state management
├── lib/                # Utilities and API client
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

### State Management
```typescript
// Theme and user preferences
useThemeStore()         // Theme switching and sensory mode
useUserStore()          // User data and preferences

// Feature-specific stores
useChatStore()          // Chat messages and conversations
useWorkspaceStore()     // Development workspaces
useMCPStore()          // MCP packages and marketplace
useMiniAppStore()      // Mini apps and tabs
useScoutStore()        // Scout agent workflow
```

### Custom Hooks
```typescript
// API integration
useConversations()     // Chat history management
useWorkspaces()        // Workspace lifecycle
useMCPPackages()       // Package discovery and installation

// Real-time features
useSocket()            // WebSocket connection
useTypingIndicator()   // Live typing status
useFileUpload()        // File upload progress
```

## 🎨 Theming

### Available Themes
- **Light Theme** - Clean, minimal with purple accents
- **Dark Theme** - Sophisticated slate with purple highlights  
- **Purple Neon** - Vibrant sensory experience with neon gradients

### Sensory-Friendly Features
- **Reduced motion** support for animations
- **High contrast** options for accessibility
- **Focus indicators** for keyboard navigation
- **Screen reader** compatibility

### Custom Styling
```css
/* Theme variables in index.css */
--color-purple-500: #a855f7;
--color-purple-600: #9333ea;
--color-purple-700: #7c3aed;

/* Responsive breakpoints */
@media (max-width: 768px) { /* Mobile styles */ }
@media (max-width: 1024px) { /* Tablet styles */ }
```

## 🚀 Deployment

### Build for Production
```bash
bun run build
```

### Environment Variables for Production
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com
VITE_ENABLE_MOCK_DATA=false
```

### Deployment Options
- **Vercel** (recommended for React apps)
- **Netlify** 
- **AWS S3 + CloudFront**
- **Docker container**

## 🔧 Configuration

### API Client Configuration
```typescript
// lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Socket.IO configuration
const socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

### Theme Configuration
```typescript
// stores/index.ts
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      sensoryMode: false,
      setSensoryMode: (sensoryMode) => set({ sensoryMode }),
    }),
    { name: 'podplay-theme' }
  )
);
```

## 🤝 Contributing

This is Nathan's personal development sanctuary, built to support his unique needs and creative process. The codebase reflects careful consideration for neurodivergent-friendly design and sensory-aware interfaces.

### Development Guidelines
- **Accessibility first** - Always consider sensory and cognitive needs
- **Smooth animations** - No jarring movements or sudden changes
- **Consistent theming** - Maintain the purple sanctuary aesthetic
- **TypeScript strict** - Full type safety for reliability
- **Component isolation** - Each feature is self-contained

---

## 🧪 Running Frontend Tests

The PodPlay frontend uses **Jest** and **React Testing Library** for unit and integration tests.

**To run all tests:**
```bash
npm test
# or
npx jest
```

**Test files live in:**
- `src/__tests__/` for unit/component tests

**What to expect:**
- All logo components and UI elements are tested for rendering and accessibility
- Test output will show pass/fail for each component

**Troubleshooting:**
- If a test fails, check the error message for missing images or import issues
- Ensure all dependencies are installed with `npm install`

---

## 📄 License

Private project - All rights reserved.

## 🙏 Acknowledgments

- **Mama Bear Philosophy** - Inspired by caring, supportive AI interaction
- **Scout.new** - Reference for autonomous development workflows  
- **Cherry Studio** - Inspiration for mini apps interface
- **Google AI Studio** - Design patterns for multi-modal chat
- **ShadCN UI** - Component library foundation
- **Lucide Icons** - Beautiful, consistent iconography

---

*Built with 💝 for Nathan's creative journey - A sanctuary for calm, empowered development*