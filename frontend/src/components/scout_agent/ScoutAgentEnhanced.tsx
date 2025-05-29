// Enhanced Scout Agent with Chat-to-Workspace Transition
// Inspired by www.scout.new interface design

import React, { useState, useEffect, useRef } from 'react';
import { buildDynamicApiUrl, API_ENDPOINTS } from '../../config/api';
import EnhancedChatBar, { ChatAttachment } from '../EnhancedChatBar';
import { MediaAttachment } from '../../ModelRegistry';
import '../../styles/unified-scout-sanctuary.css';
import './ScoutAgentEnhanced.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
  attachments?: MediaAttachment[];
}

interface WorkspaceData {
  files: FileNode[];
  timeline: TimelineEvent[];
  preview: PreviewData;
  plan: ProjectPlan;
}

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  metadata?: any;
}

interface PreviewData {
  type: 'plan' | 'file' | 'output';
  content: string;
  title: string;
}

interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  steps: PlanStep[];
  status: string;
}

interface PlanStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
}

interface ScoutAgentEnhancedProps {
  onProjectCreated?: (projectId: string) => void;
  onWorkspaceRequested?: () => void;
  agentType?: 'scout' | 'mama-bear';
}

const ScoutAgentEnhanced: React.FC<ScoutAgentEnhancedProps> = ({
  onProjectCreated,
  onWorkspaceRequested,
  agentType = 'scout'
}) => {
  // State Management
  const [mode, setMode] = useState<'chat' | 'workspace'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [projectId] = useState<string>('test-project-alpha');
  const [activePanel, setActivePanel] = useState<'files' | 'preview' | 'timeline'>('preview');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Action buttons like scout.new
  const actionButtons = [
    { id: 'research', label: 'Research', icon: '🔍', color: '#3B82F6' },
    { id: 'create', label: 'Create', icon: '✨', color: '#10B981' },
    { id: 'plan', label: 'Plan', icon: '📋', color: '#F59E0B' },
    { id: 'analyze', label: 'Analyze', icon: '📊', color: '#8B5CF6' },
    { id: 'learn', label: 'Learn', icon: '🧠', color: '#EF4444' }
  ];

  // Use props to avoid unused variable warnings
  React.useEffect(() => {
    if (onProjectCreated) {
      // Future implementation for project creation callback
    }
    if (onWorkspaceRequested) {
      // Future implementation for workspace request callback
    }
  }, [onProjectCreated, onWorkspaceRequested]);



  useEffect(() => {
    // Initialize with welcome message based on agent type
    const welcomeContent = agentType === 'scout' 
      ? "Hey there! 👋\n\nGot work? Let's jam! I'm your Scout Agent ready to help with autonomous research, creation, planning, analysis, and learning. I can work independently to bring your ideas to life. What would you like to work on today?"
      : "Hello! 🐻\n\nI'm Mama Bear, your collaborative partner for research, planning, and development. I love working together to explore ideas, create amazing projects, and learn new things. Let's build something wonderful together! What's on your mind?";
    
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: welcomeContent,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [agentType]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleActionClick = (actionId: string) => {
    const scoutPrompts = {
      research: "Let's research something! What topic would you like me to investigate autonomously?",
      create: "Time to create! What would you like me to help you build from start to finish?",
      plan: "Let's make a plan! Describe your project and I'll create a complete roadmap.",
      analyze: "Let's analyze! What data or information would you like me to examine?",
      learn: "Learning time! What would you like to understand better?"
    };
    
    const mamaPrompts = {
      research: "Let's research together! What topic shall we explore?",
      create: "Time to create! What would you like us to build collaboratively?",
      plan: "Let's plan together! Tell me about your project vision.",
      analyze: "Let's analyze together! What would you like us to examine?",
      learn: "Learning adventure! What shall we discover together?"
    };

    const actionPrompts = agentType === 'scout' ? scoutPrompts : mamaPrompts;
    const prompt = actionPrompts[actionId as keyof typeof actionPrompts];
    if (prompt) {
      handleSubmit(prompt);
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, metadata?: any, attachments?: MediaAttachment[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata,
      attachments
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (message: string, files?: MediaAttachment[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;

    // Add user message with attachments
    addMessage('user', message, undefined, files);
    setCurrentInput('');
    setAttachments([]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('project_id', projectId);
      formData.append('mode', 'scout_agent');
      formData.append('context', JSON.stringify({ 
        workspace_active: mode === 'workspace',
        activePanel 
      }));

      // Add attachments to form data
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          if (file.file) {
            formData.append(`file_${index}`, file.file);
            formData.append(`file_${index}_type`, file.type);
          }
        });
      }

      // Send to Scout Agent backend - use relative URL to work in Codespaces
      const response = await fetch('/api/mama-bear/chat', {
        method: 'POST',
        body: formData,
        // Add CORS headers
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      setIsTyping(false);
      addMessage('assistant', data.response || 'I received your message!');

      // Check if response indicates we should transition to workspace
      if (data.action === 'create_workspace' || data.workspace_ready || message.toLowerCase().includes('plan')) {
        await transitionToWorkspace();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addMessage('system', 'Sorry, there was an error processing your message.');
    } finally {
      setIsLoading(false);
    }
  };

  const transitionToWorkspace = async () => {
    try {
      setIsLoading(true);
      
      // Fetch workspace data
      const [projectStatus, /* files */, /* timeline */] = await Promise.all([
        fetch(buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_PROJECT, { id: projectId })),
        fetch('/api/files/list'), // You'll need to implement this
        fetch('/api/timeline/recent') // You'll need to implement this
      ]);

      const projectData = await projectStatus.json();
      
      const mockWorkspaceData: WorkspaceData = {
        files: [
          { id: '1', name: 'Project Files', type: 'folder', path: '/', children: [
            { id: '2', name: 'plan.md', type: 'file', path: '/plan.md' },
            { id: '3', name: 'requirements.txt', type: 'file', path: '/requirements.txt' }
          ]},
        ],
        timeline: [
          { id: '1', timestamp: new Date().toISOString(), type: 'plan', message: 'Project plan created' },
          { id: '2', timestamp: new Date().toISOString(), type: 'chat', message: 'Chat conversation started' }
        ],
        preview: {
          type: 'plan',
          title: 'Project Plan',
          content: 'Your project plan will appear here...'
        },
        plan: projectData.success ? projectData.status_summary?.plan || {} : {
          id: projectId,
          title: 'Project Plan',
          description: 'AI-generated project plan',
          steps: [],
          status: 'active'
        }
      };

      setWorkspaceData(mockWorkspaceData);
      setMode('workspace');
      
      addMessage('system', '🚀 Workspace activated! You can now see your files, timeline, and project preview.');
      
    } catch (error) {
      console.error('Error transitioning to workspace:', error);
      addMessage('system', 'There was an error setting up the workspace. Using chat mode for now.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChatMode = () => (
    <div className="scout-chat-mode">
      <div className="scout-hero">
        <div className="scout-logo">
          <span className="scout-icon">🤖</span>
          <h1>Scout Agent</h1>
        </div>
        <p className="scout-tagline">Your AI-powered development companion</p>
      </div>

      <div className="scout-messages">
        {messages.map((message) => (
          <div key={message.id} className={`scout-message scout-message-${message.type}`}>
            <div className="scout-message-header">
              <span className="scout-message-icon">
                {message.type === 'user' ? '👤' : message.type === 'assistant' ? '🤖' : '⚙️'}
              </span>
              <span className="scout-message-sender">
                {message.type === 'user' ? 'You' : message.type === 'assistant' ? 'Scout Agent' : 'System'}
              </span>
              <span className="scout-message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="scout-message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              {message.attachments && message.attachments.length > 0 && (
                <div className="scout-message-attachments">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="scout-attachment-preview">
                      {attachment.type === 'image' && attachment.url && (
                        <img src={attachment.url} alt="Uploaded image" className="scout-attachment-image" />
                      )}
                      {attachment.type === 'file' && (
                        <div className="scout-attachment-file">
                          📄 {attachment.file?.name || 'File'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="scout-message scout-message-assistant">
            <div className="scout-message-header">
              <span className="scout-message-icon">🤖</span>
              <span className="scout-message-sender">Scout Agent</span>
              <span className="scout-message-time">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="scout-message-content">
              <div className="scout-typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="scout-actions">
        {actionButtons.map((action) => (
          <button
            key={action.id}
            className="scout-action-btn"
            style={{ '--action-color': action.color } as React.CSSProperties}
            onClick={() => handleActionClick(action.id)}
          >
            <span className="scout-action-icon">{action.icon}</span>
            <span className="scout-action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderWorkspaceMode = () => (
    <div className="scout-workspace-mode">
      <div className="scout-workspace-header">
        <div className="scout-workspace-title">
          <h2>🚀 Project Workspace</h2>
          <button 
            className="scout-back-btn"
            onClick={() => setMode('chat')}
          >
            ← Back to Chat
          </button>
        </div>
        <div className="scout-workspace-tabs">
          {(['files', 'preview', 'timeline'] as const).map((panel) => (
            <button
              key={panel}
              className={`scout-tab ${activePanel === panel ? 'active' : ''}`}
              onClick={() => setActivePanel(panel)}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="scout-workspace-content">
        <div className="scout-workspace-main">
          {activePanel === 'files' && renderFilesPanel()}
          {activePanel === 'preview' && renderPreviewPanel()}
          {activePanel === 'timeline' && renderTimelinePanel()}
        </div>
        
        <div className="scout-workspace-chat">
          <div className="scout-workspace-messages">
            {messages.slice(-5).map((message) => (
              <div key={message.id} className={`scout-message scout-message-${message.type}`}>
                <div className="scout-message-content">
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilesPanel = () => (
    <div className="scout-files-panel">
      <h3>📁 Project Files</h3>
      {workspaceData?.files.map((file) => (
        <div key={file.id} className="scout-file-item">
          <span className="scout-file-icon">{file.type === 'folder' ? '📁' : '📄'}</span>
          <span className="scout-file-name">{file.name}</span>
        </div>
      ))}
    </div>
  );

  const renderPreviewPanel = () => (
    <div className="scout-preview-panel">
      <h3>👁️ Preview</h3>
      <div className="scout-preview-content">
        <h4>{workspaceData?.preview.title}</h4>
        <p>{workspaceData?.preview.content}</p>
      </div>
    </div>
  );

  const renderTimelinePanel = () => (
    <div className="scout-timeline-panel">
      <h3>⏱️ Timeline</h3>
      {workspaceData?.timeline.map((event) => (
        <div key={event.id} className="scout-timeline-item">
          <div className="scout-timeline-time">
            {new Date(event.timestamp).toLocaleTimeString()}
          </div>
          <div className="scout-timeline-message">{event.message}</div>
        </div>
      ))}
    </div>
  );

  const renderChatInput = () => (
    <div className="scout-chat-input-container">
      <div className="scout-enhanced-chat-wrapper">
        <EnhancedChatBar
          value={currentInput}
          onChange={setCurrentInput}
          onSend={(message: string, chatAttachments: ChatAttachment[]) => {
            // Convert ChatAttachment[] to MediaAttachment[] for compatibility
            const mediaAttachments: MediaAttachment[] = chatAttachments.map(attachment => ({
              id: attachment.id,
              name: attachment.name,
              type: attachment.type,
              mimeType: attachment.mimeType,
              size: attachment.size,
              url: attachment.url,
              file: attachment.file,
              blob: attachment.blob
            }));
            handleSubmit(message, mediaAttachments);
          }}
          onAttachmentsChange={(chatAttachments: ChatAttachment[]) => {
            // Convert to MediaAttachment[] for state compatibility
            const mediaAttachments: MediaAttachment[] = chatAttachments.map(attachment => ({
              id: attachment.id,
              name: attachment.name,
              type: attachment.type,
              mimeType: attachment.mimeType,
              size: attachment.size,
              url: attachment.url,
              file: attachment.file,
              blob: attachment.blob
            }));
            setAttachments(mediaAttachments);
          }}
          attachments={attachments.map(attachment => ({
            ...attachment,
            preview: attachment.type === 'image' ? attachment.url : undefined
          }))}
          disabled={isLoading}
          placeholder="💬 Tell Scout what you want to build, research, or create..."
          showQuickActions={true}
          theme="sanctuary"
          allowFileUpload={true}
          allowImageUpload={true}
          allowAudioRecording={true}
          allowVideoRecording={true}
          allowScreenCapture={true}
          className="scout-enhanced-chat-input"
        />
      </div>
    </div>
  );

  return (
    <div className="scout-agent-enhanced">
      <div className="scout-main-content">
        {mode === 'chat' ? renderChatMode() : renderWorkspaceMode()}
      </div>
      {renderChatInput()}
    </div>
  );
};

export default ScoutAgentEnhanced;
