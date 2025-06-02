# Scout MamaBear Agent Requirements

## Core Identity & Purpose

**Scout MamaBear** is the project implementation agent within Podplay Sanctuary, transforming plans into production-ready code with full autonomy. She embodies methodical, structured thinking, and operates with a calm determination to bring Nathan's visions to life.

## Technical Capabilities

### 1. Model Implementation
- **Primary Model**: Gemini 2.0 Flash (balanced performance)
- **Fallback Models**:
  - Gemini 2.5 Flash (enhanced reasoning for complex planning)
  - Gemini 2.5 Pro (for advanced code generation)
  - Claude/OpenAI (emergency fallback for specialized code tasks)

### 2. Tool Access
- **Full MCP Integration**:
  - File System Access (creation, modification, deletion)
  - Git/GitHub Tools (repos, branches, PRs)
  - Code Search and Analysis
  - Terminal Command Execution
  - Browser Control for research and testing
- **Workspace Management**:
  - File structure creation
  - Project scaffolding
  - Environment setup (package management)
  - Build and deployment management

### 3. Memory Integration
- **Project-specific Knowledge**: Retain project requirements and architecture
- **Technical Patterns**: Remember previous solutions and implementations
- **User Preferences**: Store Nathan's coding style and project structure preferences
- **Persistent Memory**: Access to mem0 for cross-session project continuity

## Workflow & Capabilities

### 1. Four-Stage Workflow
- **Welcome Stage**: Project scope definition, requirements gathering
- **Planning Stage**: Architecture design, technology selection, task breakdown
- **Workspace Stage**: File structure creation, code generation, testing
- **Production Stage**: Deployment preparation, documentation, final review

### 2. Code Generation Capabilities
- Full project scaffolding from scratch
- High-quality code implementation following best practices
- Adherence to Nathan's coding style and preferences
- Built-in error handling and edge case consideration
- Comprehensive documentation generation

### 3. Project Management
- Visual timeline of project progress
- Task prioritization and dependency tracking
- Real-time status updates during implementation
- Blockers identification and resolution
- Resource requirement calculation

## UI Integration

### 1. Window Management
- Multiple coordinated windows showing different project aspects:
  - TaskBoard window (kanban-style workflow visualization)
  - Code Editor window (implementation and review)
  - Preview window (real-time output rendering)
  - ResourcePanel window (managing project assets)
- Smooth transitions between stages with animation

### 2. Visual Elements
- Progress indicators for ongoing tasks
- Color-coded status for different components
- File generation animations
- Interactive timeline visualization
- Live preview rendering

### 3. Interaction Model
- Drag and drop for resource management
- Context-specific tool availability
- Snapshot feature for progress tracking
- Interactive feedback system on generated code
- One-click implementation adjustments

## Communication Style

### 1. Voice & Tone
- Clear, structured, and methodical
- Process-oriented communication
- Calm confidence in technical implementation
- Precise technical terminology
- Visual organization of complex information

### 2. Progress Communication
- Regular status updates with completion percentages
- Clear indicators of current focus and next steps
- Immediate notification of blockers or questions
- Preview snippets of important implementations
- Summaries of completed work at stage transitions

### 3. Technical Documentation
- Automated documentation generation
- Architecture diagrams and flowcharts
- Code commenting and explanation
- Testing coverage reporting
- Implementation rationale for key decisions

## Integration Points

### 1. With Main MamaBear
- Receive project vision and requirements
- Transfer completed projects for review
- Seek clarification on ambiguous requirements
- Provide technical updates during implementation

### 2. With Workspace MamaBear
- Coordinate on development environment setup
- Share generated code for collaborative refinement
- Request optimization advice for complex implementations
- Integrate with external development tools

### 3. With MCP MamaBear
- Request specific tools needed for project implementation
- Get guidance on optimal tool configuration
- Report tool effectiveness and performance
- Suggest new tool capabilities based on project needs

## Implementation Priority

1. Basic Scout workflow (4-stage progress system)
2. TaskBoard component for tracking progress
3. File generation capability
4. Window management integration
5. Timeline visualization
6. Live preview rendering

## Autonomous Operation

- Independent decision-making within project scope
- Self-correction and code refinement
- Proactive problem identification
- Automatic workspace organization
- Zero-touch implementation (no intervention needed)

## Visual Animation System

- File generation with visual feedback
- Code typing animation
- Task completion celebrations
- Stage transition effects
- Timeline progress visualization