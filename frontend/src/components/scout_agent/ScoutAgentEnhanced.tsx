// Enhanced Scout Agent with Chat-to-Workspace Transition
// Inspired by www.scout.new interface design

import React, { useState, useEffect, useRef } from 'react';
import { buildDynamicApiUrl, API_ENDPOINTS } from '../../config/api';
import './ScoutAgentEnhanced.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
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

const ScoutAgentEnhanced: React.FC = () => {
  // State Management
  const [mode, setMode] = useState<'chat' | 'workspace'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [projectId, /* setProjectId */] = useState<string>('test-project-alpha');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activePanel, setActivePanel] = useState<'files' | 'preview' | 'timeline'>('preview');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Action buttons like scout.new
  const actionButtons = [
    { id: 'research', label: 'Research', icon: '🔍', color: '#3B82F6' },
    { id: 'create', label: 'Create', icon: '✨', color: '#10B981' },
    { id: 'plan', label: 'Plan', icon: '📋', color: '#F59E0B' },
    { id: 'analyze', label: 'Analyze', icon: '📊', color: '#8B5CF6' },
    { id: 'learn', label: 'Learn', icon: '🧠', color: '#EF4444' }
  ];

  // Emoji categories
  const emojiCategories = {
    recent: ['😊', '👍', '❤️', '😂', '🤔', '👋', '🚀', '💡'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
    objects: ['💻', '📱', '⌨️', '🖱️', '🖥️', '⚡', '🔧', '⚙️', '🛠️', '📊'],
    symbols: ['✅', '❌', '⚠️', '📝', '🔍', '💡', '🚀', '⭐', '🎯', '📌']
  };

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: "Hey there! 👋\n\nGot work? Let's jam! I'm your Scout Agent ready to help with research, creation, planning, analysis, and learning. What would you like to work on today?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleActionClick = (actionId: string) => {
    const actionPrompts = {
      research: "Let's research something! What topic would you like me to investigate?",
      create: "Time to create! What would you like me to help you build?",
      plan: "Let's make a plan! Describe your project and I'll help you break it down.",
      analyze: "Let's analyze! What data or information would you like me to examine?",
      learn: "Learning time! What would you like to understand better?"
    };

    const prompt = actionPrompts[actionId as keyof typeof actionPrompts];
    if (prompt) {
      addMessage('user', prompt);
      handleSubmit(null, prompt);
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, metadata?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent | null, customMessage?: string) => {
    if (e) e.preventDefault();
    
    const message = customMessage || inputValue.trim();
    if (!message && !customMessage) return;

    if (!customMessage) {
      addMessage('user', message);
      setInputValue('');
    }
    setIsLoading(true);

    try {
      // Send to Scout Agent backend
      const response = await fetch('/api/mama-bear/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          project_id: projectId,
          mode: 'scout_agent',
          context: { workspace_active: mode === 'workspace' }
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      addMessage('assistant', data.response || 'I received your message!');

      // Check if response indicates we should transition to workspace
      if (data.action === 'create_workspace' || data.workspace_ready || message.toLowerCase().includes('plan')) {
        await transitionToWorkspace();
      }

    } catch (error) {
      console.error('Error sending message:', error);
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

  const insertEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
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
            <div className="scout-message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="scout-message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="scout-message scout-message-assistant">
            <div className="scout-loading">
              <span></span><span></span><span></span>
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
      <form onSubmit={handleSubmit} className="scout-chat-form">
        <div className="scout-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="scout-chat-input"
            disabled={isLoading}
          />
          <div className="scout-input-controls">
            <button
              type="button"
              className="scout-emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            <button
              type="submit"
              className="scout-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </form>

      {showEmojiPicker && (
        <div className="scout-emoji-picker">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category} className="scout-emoji-category">
              <div className="scout-emoji-category-title">{category}</div>
              <div className="scout-emoji-grid">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="scout-emoji-item"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
