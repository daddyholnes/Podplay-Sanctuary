# Complete UI Builder Brief - Podplay Sanctuary
## 5-Section Autonomous Development Platform

---

## 🎯 PROJECT OVERVIEW

**Build a React/Vite application with 5 distinct sections:**
1. **Mama Bear Chat Hub** - Central AI planning interface
2. **Multimodal Vertex Garden** - Advanced multi-model chat
3. **Mini Apps Launcher** - External tools via iframes
4. **Dynamic Workspace Center** - Manual environment management
5. **Scout Agent** - Autonomous production environment creator

**Backend Integration:** All APIs are already built and working at `http://localhost:5000`

---

## 🏗️ TECHNICAL SPECIFICATIONS

### Framework Requirements:
- **React 18+ with TypeScript**
- **Vite for build system**
- **TailwindCSS for styling**
- **Socket.IO client for real-time features**
- **React Router for navigation**
- **Zustand for state management**

### Required Dependencies:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.4.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-dropzone": "^14.2.0",
    "monaco-editor": "^0.44.0",
    "@monaco-editor/react": "^4.6.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## 🎨 DESIGN SYSTEM

### Color Palette:
```css
/* Light Theme */
:root {
  --primary-bg: #ffffff;
  --secondary-bg: #f8fafc;
  --tertiary-bg: #f1f5f9;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --accent-light: #dbeafe;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --border-light: #f1f5f9;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --mama-bear: #8b5cf6;
  --scout: #06b6d4;
}

/* Dark Theme */
[data-theme="dark"] {
  --primary-bg: #0f172a;
  --secondary-bg: #1e293b;
  --tertiary-bg: #334155;
  --accent: #60a5fa;
  --accent-hover: #3b82f6;
  --accent-light: #1e3a8a;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border: #334155;
  --border-light: #475569;
  --success: #34d399;
  --warning: #fbbf24;
  --error: #f87171;
  --mama-bear: #a78bfa;
  --scout: #22d3ee;
}
```

### Typography:
```css
.font-display { font-family: 'Inter', system-ui, sans-serif; font-weight: 600; }
.font-body { font-family: 'Inter', system-ui, sans-serif; font-weight: 400; }
.font-mono { font-family: 'JetBrains Mono', Menlo, monospace; }
```

---

## 📱 LAYOUT STRUCTURE

### Main App Container:
```tsx
// App.tsx structure
<div className="app-container">
  <Navigation /> {/* Top navigation bar */}
  <main className="main-content">
    <Router>
      <Routes>
        <Route path="/" element={<MamaBearHub />} />
        <Route path="/vertex-garden" element={<VertexGarden />} />
        <Route path="/mini-apps" element={<MiniAppsLauncher />} />
        <Route path="/workspaces" element={<DynamicWorkspaceCenter />} />
        <Route path="/scout" element={<ScoutAgent />} />
      </Routes>
    </Router>
  </main>
  <GlobalChatBar /> {/* Fixed bottom chat bar */}
</div>
```

### Navigation Component:
```tsx
// Navigation.tsx specifications
interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

// Design: Horizontal top bar with 5 section buttons
// Each button shows icon + label
// Active section highlighted with accent color
// Dark/light theme toggle on the right
// Company logo on the left
```

---

## 🔧 CORE COMPONENTS SPECIFICATIONS

### 1. Global Chat Bar (Used Across All Sections)

**File:** `src/components/GlobalChatBar.tsx`

```tsx
interface GlobalChatBarProps {
  currentSection: string;
  placeholder?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'mama-bear' | 'scout';
  timestamp: string;
  section: string;
  attachments?: File[];
}

// Features Required:
// - Text input with send button
// - Emoji picker (use emoji-picker-react)
// - File upload (drag & drop + click)
// - Voice recording (use MediaRecorder API)
// - Chat history sidebar (toggleable)
// - Auto-resize input based on content
// - Send on Enter, new line on Shift+Enter
// - Integration with Socket.IO for real-time responses
```

**Design Specifications:**
- Fixed position at bottom of screen
- Height: 80px default, expands to 200px max
- Backdrop blur effect
- Rounded corners on top
- Subtle shadow
- Icons: Use Heroicons
- Animation: Smooth expand/collapse

**API Integration:**
```typescript
// Send message to backend
const sendMessage = async (message: string, files?: File[]) => {
  const response = await fetch('http://localhost:5000/api/chat/mama-bear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      user_id: 'nathan',
      section: currentSection,
      context: getCurrentSectionContext(),
      attachments: files ? await processFiles(files) : undefined
    })
  });
  return response.json();
};
```

### 2. Mama Bear Chat Hub

**File:** `src/pages/MamaBearHub.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: "🐻 Mama Bear Chat Hub"     │
├─────────────────────────────────────┤
│ Chat History (scrollable)           │
│ ┌─────────────────────────────────┐ │
│ │ User: "Help me build a React app"│ │
│ │ ─────────────────────────────── │ │
│ │ 🐻 Mama Bear: "I can help with │ │
│ │ that! Let me create a plan..."  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Action Buttons:                     │
│ [Plan Project] [Get Briefing]       │
│ [Analyze Code] [Search Memory]      │
└─────────────────────────────────────┘
```

**Features:**
- Full conversation history with Mama Bear
- Message bubbles with timestamps
- Code syntax highlighting for code blocks
- Action buttons for common tasks
- Context-aware suggestions
- Memory search interface
- Daily briefing display

**API Calls:**
```typescript
// Get daily briefing
const briefing = await fetch('http://localhost:5000/api/chat/daily-briefing');

// Search memories
const memories = await fetch('http://localhost:5000/api/chat/memories/search', {
  method: 'POST',
  body: JSON.stringify({ query: searchTerm })
});

// Analyze code
const analysis = await fetch('http://localhost:5000/api/chat/analyze-code', {
  method: 'POST',
  body: JSON.stringify({ code: codeContent, language: 'javascript' })
});
```

### 3. Multimodal Vertex Garden

**File:** `src/pages/VertexGarden.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│ Model Selector: [Gemini] [Claude]   │
├─────────────────────────────────────┤
│ Chat Area with Media Support        │
│ ┌─────────────────────────────────┐ │
│ │ User: [Image] "Analyze this"    │ │
│ │ ─────────────────────────────── │ │
│ │ 🤖 Gemini: "I can see this is  │ │
│ │ a React component diagram..."   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Media Upload Area                   │
│ [📷 Images] [🎥 Videos] [🎵 Audio] │
└─────────────────────────────────────┘
```

**Features:**
- Model switching (Gemini Pro, Claude 3.5, etc.)
- Image/video/audio upload and analysis
- Drag & drop file handling
- Rich media preview
- Model comparison mode
- Session management
- Export conversations

**API Integration:**
```typescript
// Send multimodal message
const response = await fetch('http://localhost:5000/api/chat/vertex-garden', {
  method: 'POST',
  body: formData // includes text + media files
});

// Get available models
const models = await fetch('http://localhost:5000/api/chat/models');

// Create new session
const session = await fetch('http://localhost:5000/api/chat/sessions', {
  method: 'POST',
  body: JSON.stringify({ model: 'gemini-pro' })
});
```

### 4. Mini Apps Launcher

**File:** `src/pages/MiniAppsLauncher.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│ Search: [🔍 Search apps...]         │
├─────────────────────────────────────┤
│ App Grid:                           │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 🐙  │ │ 💬  │ │ 📝  │ │ 🎨  │   │
│ │GitHub│ │Claude│ │Note │ │Figma│   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 💻  │ │ 📊  │ │ 🔧  │ │ 🎯  │   │
│ │VSCode│ │Linear│ │Tools│ │Custom│   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│ Active App: [VS Code Web]           │
│ ┌─────────────────────────────────┐ │
│ │ <iframe src="vscode.dev">       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Grid of available apps with logos
- Search and filter functionality
- Custom iframe containers with consistent theming
- App favorites and recent access
- Context sharing with Mama Bear
- Full-screen mode for apps
- Multiple app tabs

**App Configuration:**
```typescript
interface MiniApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  description: string;
  allowedDomains: string[];
  theme: 'light' | 'dark' | 'auto';
}

const defaultApps: MiniApp[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com', icon: '🐙', category: 'development' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', icon: '💬', category: 'ai' },
  { id: 'vscode', name: 'VS Code', url: 'https://vscode.dev', icon: '💻', category: 'development' },
  { id: 'figma', name: 'Figma', url: 'https://figma.com', icon: '🎨', category: 'design' },
  // ... more apps
];
```

### 5. Dynamic Workspace Center

**File:** `src/pages/DynamicWorkspaceCenter.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│ Create New Environment              │
│ ┌─────────────────────────────────┐ │
│ │ Type: [CodeSpaces] [NixOS] [VM] │ │
│ │ Packages: [Node.js] [Python]    │ │
│ │ MCP Servers: [Web] [Database]   │ │
│ │ Repository: github.com/user/repo│ │
│ │ [🤖 Ask Mama Bear] [🎯 Send to  │ │
│ │      Scout]         [Create]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Active Environments                 │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ 🟢  │ │ 🟡  │ │ 🔴  │           │
│ │Node │ │React│ │Python│           │
│ │Dev  │ │App  │ │API   │           │
│ └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────┘
```

**Features:**
- Environment type selection (CodeSpaces, NixOS, Oracle VM)
- Package and dependency selection
- MCP server configuration
- Repository integration
- Integration with Mama Bear for recommendations
- Environment status monitoring
- Quick access to environments
- Environment templates

**API Integration:**
```typescript
// Create new workspace
const workspace = await fetch('http://localhost:5000/api/workspaces/request', {
  method: 'POST',
  body: JSON.stringify({
    type: 'nixos',
    packages: ['nodejs', 'python'],
    mcpServers: ['web-api', 'database'],
    repositories: ['https://github.com/user/repo'],
    description: 'React development environment'
  })
});

// Get active workspaces
const workspaces = await fetch('http://localhost:5000/api/workspaces/active');

// Configure workspace
const config = await fetch(`http://localhost:5000/api/workspaces/${id}/configure`, {
  method: 'POST',
  body: JSON.stringify({ configuration })
});
```

### 6. Scout Agent (Autonomous Environment)

**File:** `src/pages/ScoutAgent.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│ 🎯 Scout Agent - Status: 🟢 Ready   │
├─────────┬─────────────────┬─────────┤
│ Chat    │ Live Environment│Timeline │
│ ┌─────┐ │ ┌─────────────┐ │ ┌─────┐ │
│ │User:│ │ │ Files  Code │ │ │10:30│ │
│ │Build│ │ │ ┌───┐ ┌───┐ │ │ │Plan │ │
│ │React│ │ │ │src│ │app│ │ │ │Done │ │
│ │app  │ │ │ └───┘ └───┘ │ │ └─────┘ │
│ └─────┘ │ │ Terminal:   │ │ ┌─────┐ │
│ ┌─────┐ │ │ $ npm init  │ │ │10:31│ │
│ │🎯: I│ │ │ ✓ Created   │ │ │Env  │ │
│ │will │ │ │   package   │ │ │Built│ │
│ │build│ │ └─────────────┘ │ └─────┘ │
│ │this │ │                 │         │
│ │auto │ │                 │         │
│ └─────┘ │                 │         │
└─────────┴─────────────────┴─────────┘
```

**Features:**
- Three-pane layout: Chat, Environment, Timeline
- Real-time environment creation visualization
- Live file system browser
- Integrated terminal (using xterm.js)
- Code editor (using Monaco Editor)
- Live timeline of Scout's actions
- Autonomous progress tracking
- Production deployment capabilities

**Key Components:**

1. **Scout Chat Interface:**
```typescript
// Handle autonomous requests
const sendToScout = async (message: string) => {
  const response = await fetch('http://localhost:5000/api/scout/autonomous-request', {
    method: 'POST',
    body: JSON.stringify({
      request: message,
      context: getScoutContext()
    })
  });
  return response.json();
};
```

2. **Live Environment View:**
```typescript
// Real-time environment monitoring
const EnvironmentView = ({ environmentId }) => {
  const [environment, setEnvironment] = useState(null);
  const [files, setFiles] = useState([]);
  
  useEffect(() => {
    // WebSocket connection for real-time updates
    const socket = io('http://localhost:5000');
    socket.on(`environment-${environmentId}`, (update) => {
      setEnvironment(update);
    });
    
    return () => socket.disconnect();
  }, [environmentId]);
};
```

3. **Live Timeline:**
```typescript
interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

const Timeline = ({ taskId }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  useEffect(() => {
    // Fetch and update timeline
    const fetchTimeline = async () => {
      const response = await fetch(`http://localhost:5000/api/scout/timeline/${taskId}`);
      const data = await response.json();
      setTimeline(data.timeline);
    };
    
    const interval = setInterval(fetchTimeline, 1000);
    return () => clearInterval(interval);
  }, [taskId]);
};
```

---

## 🔌 STATE MANAGEMENT

### Zustand Store Structure:

```typescript
// src/store/useAppStore.ts
interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Navigation
  currentSection: string;
  setCurrentSection: (section: string) => void;
  
  // Chat
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Environments
  activeEnvironments: Environment[];
  setActiveEnvironments: (envs: Environment[]) => void;
  
  // Scout Agent
  scoutStatus: 'idle' | 'working' | 'error';
  currentTask: Task | null;
  setScoutStatus: (status: 'idle' | 'working' | 'error') => void;
  setCurrentTask: (task: Task | null) => void;
}

const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  currentSection: 'mama-bear',
  setCurrentSection: (section) => set({ currentSection: section }),
  
  chatHistory: [],
  addMessage: (message) => set((state) => ({ 
    chatHistory: [...state.chatHistory, message] 
  })),
  clearChat: () => set({ chatHistory: [] }),
  
  activeEnvironments: [],
  setActiveEnvironments: (envs) => set({ activeEnvironments: envs }),
  
  scoutStatus: 'idle',
  currentTask: null,
  setScoutStatus: (status) => set({ scoutStatus: status }),
  setCurrentTask: (task) => set({ currentTask: task }),
}));
```

---

## 🎨 COMPONENT STYLING GUIDELINES

### Button Components:
```css
/* Primary Button */
.btn-primary {
  @apply bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-secondary-bg hover:bg-tertiary-bg text-text-primary px-4 py-2 rounded-lg font-medium transition-colors border border-border;
}

/* Icon Button */
.btn-icon {
  @apply w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors;
}
```

### Card Components:
```css
.card {
  @apply bg-primary-bg border border-border rounded-lg shadow-sm;
}

.card-header {
  @apply p-4 border-b border-border;
}

.card-content {
  @apply p-4;
}
```

### Input Components:
```css
.input {
  @apply w-full px-3 py-2 border border-border rounded-lg bg-primary-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent;
}

.input-group {
  @apply flex items-center gap-2;
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Mobile Adaptations:
- Navigation becomes bottom tab bar
- Chat bar collapses to floating button
- Three-pane layouts stack vertically
- Touch-friendly button sizes (min 44px)

---

## 🔄 REAL-TIME FEATURES

### Socket.IO Integration:
```typescript
// src/hooks/useSocket.ts
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    // Listen for Mama Bear responses
    newSocket.on('mama-bear-response', (data) => {
      // Handle response
    });
    
    // Listen for Scout updates
    newSocket.on('scout-update', (data) => {
      // Handle Scout progress updates
    });
    
    // Listen for environment updates
    newSocket.on('environment-update', (data) => {
      // Handle environment status changes
    });
    
    return () => newSocket.close();
  }, []);
  
  return socket;
};
```

---

## 🎯 INTEGRATION CHECKLIST

### API Endpoints to Integrate:
- [ ] `POST /api/chat/mama-bear` - Main chat
- [ ] `GET /api/chat/daily-briefing` - Daily briefing
- [ ] `POST /api/chat/vertex-garden` - Multi-model chat
- [ ] `POST /api/chat/analyze-code` - Code analysis
- [ ] `POST /api/chat/memories/search` - Memory search
- [ ] `POST /api/workspaces/request` - Create workspace
- [ ] `GET /api/workspaces/active` - Get active workspaces
- [ ] `POST /api/scout/autonomous-request` - Scout requests
- [ ] `GET /api/scout/timeline/{id}` - Scout timeline
- [ ] `GET /api/mcp/search` - MCP servers

### Socket.IO Events:
- [ ] `mama-bear-response` - Chat responses
- [ ] `scout-update` - Scout progress
- [ ] `environment-update` - Environment changes
- [ ] `timeline-update` - Timeline events

### File Upload Support:
- [ ] Images (PNG, JPG, GIF, WebP)
- [ ] Videos (MP4, WebM, MOV)
- [ ] Audio (MP3, WAV, OGG)
- [ ] Documents (PDF, TXT, MD)
- [ ] Code files (JS, TS, PY, etc.)

---

## 🚀 BUILD AND DEPLOYMENT

### Vite Configuration:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  }
});
```

### Environment Variables:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_TITLE=Podplay Sanctuary
VITE_APP_VERSION=1.0.0
```

---

## 📋 SUCCESS CRITERIA

### Must-Have Features:
1. **Global Chat Bar** - Works across all 5 sections
2. **Theme Switching** - Light/dark mode
3. **File Upload** - Drag & drop support
4. **Real-time Updates** - Socket.IO integration
5. **Responsive Design** - Mobile-friendly
6. **Error Handling** - Graceful error states
7. **Loading States** - Clear progress indicators

### Nice-to-Have Features:
1. **Keyboard Shortcuts** - Power user features
2. **Offline Support** - Basic functionality when offline
3. **Accessibility** - Screen reader support
4. **Animations** - Smooth transitions
5. **Search** - Global search functionality

---

## 🎉 FINAL NOTES

This UI should plug directly into the existing backend APIs. All endpoints are functional and tested. The key is to:

1. **Follow the exact API contract** specified above
2. **Use Socket.IO** for real-time features
3. **Handle errors gracefully** with fallbacks
4. **Make it responsive** for all screen sizes
5. **Keep it performant** with proper state management

The backend is solid - this UI will bring it to life with the exact experience Nathan envisions!
