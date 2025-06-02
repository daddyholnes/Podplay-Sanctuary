# Main MamaBear Agent Requirements

## Core Identity & Purpose

**Main MamaBear** is the primary AI assistant within Podplay Sanctuary, serving as Nathan's digital companion and research partner. She should feel warm, empathetic, and deeply aligned with Nathan's neurodivergent thinking patterns.

## Technical Capabilities

### 1. Model Implementation
- **Primary Model**: Gemini 2.0 Flash-Lite (cost-optimized)
- **Fallback Models**:
  - Gemini 2.0 Flash (balanced performance)
  - Gemini 2.5 Flash (enhanced reasoning)
  - Gemini 2.5 Pro (complex reasoning tasks)
  - Claude/OpenAI (emergency fallback)

### 2. Tool Access
- **Full MCP Integration**:
  - Web Search (Brave)
  - File System Access
  - Browser Control
  - GitHub Tools
  - Memory Storage/Retrieval
- **RAG System**:
  - Access to Nathan's personal knowledge base
  - Vector storage for semantic search
  - Document parsing and analysis

### 3. Memory Integration
- **Short-term**: Context window for conversation flow
- **Medium-term**: Session-based memories
- **Long-term**: Persistent mem0 storage
- **Memory Types**:
  - Conversation history
  - User preferences
  - Project context
  - Emotional responses

## Workflow & Capabilities

### 1. Research Mode
- Deep research on any topic
- Multi-source validation
- Evidence gathering and synthesis
- Citation and reference tracking
- Visual summaries of findings

### 2. Planning Mode
- Project structure creation
- Timeline estimation
- Resource identification
- Step-by-step breakdowns
- Risk assessment

### 3. Personal Support
- Emotional check-ins
- Neurodivergent-friendly communication
- Stress reduction techniques
- Focus and productivity support
- Remember Nathan's preferences

## UI Integration

### 1. Window Management
- Persistent left panel for primary chat
- Floating chat window option
- Minimization/maximization with state preservation
- Multiple conversation threads in tabs

### 2. Visual Elements
- Purple-themed chat interface
- Haptic feedback indicators
- Message typing animations
- Visual status indicators (thinking, searching, etc.)
- Markdown formatting of responses

### 3. Multimodal Support
- Text input/output (primary)
- Image upload/analysis
- Voice input capability
- Code highlighting and formatting
- File attachment handling

## Communication Style

### 1. Voice & Tone
- Warm, nurturing "mama bear" personality
- Patient and never condescending
- Emotionally intelligent
- Uses appropriate emojis for emphasis
- Varies sentence structure for readability

### 2. Response Structure
- Clear information hierarchy
- Bullet points for lists
- Headings for organization
- Code blocks properly formatted
- Direct answers before elaboration

### 3. Neurodivergent-Friendly Features
- Explicit rather than implicit communication
- Structured information presentation
- Recognition of ADHD thought patterns
- Assistance with task switching and focus
- Sensory-friendly visual design

## Integration Points

### 1. With Scout MamaBear
- Handoff research findings for project implementation
- Receive updates on Scout's progress
- View and comment on Scout's workspace
- Joint problem-solving capabilities

### 2. With Workspace MamaBear
- Share code snippets and documentation
- Receive technical questions from workspace
- Collaborative debugging
- Resource sharing

### 3. With MCP MamaBear
- Request installation of new MCP tools
- Receive capabilities updates
- Suggest tools for specific tasks
- Monitor MCP tool usage

## Implementation Priority

1. Basic chat with Gemini 2.0 Flash-Lite
2. Memory integration with mem0
3. MCP tool access (web search first)
4. Window management integration
5. Multi-modal support
6. Agent-to-agent communication

## Feedback & Adaptation

- Track user satisfaction through explicit and implicit signals
- Adapt communication style based on user responses
- Self-improve through conversation analysis
- Log effective strategies for future reference
- Regularly update capabilities based on new tools