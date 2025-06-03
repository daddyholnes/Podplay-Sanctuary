import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee,
  Heart,
  Monitor,
  Plus,
  X,
  Minimize2,
  Maximize2,
  Terminal,
  Folder,
  GitBranch,
  Play,
  Pause,
  Settings,
  Upload,
  Paperclip,
  Mic,
  Video,
  Github,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smile,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore, useWorkspaceStore } from '@/stores';
import { Workspace } from '@/types';

interface FloatingWindow {
  id: string;
  title: string;
  type: 'workspace' | 'chat';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
}

const DevWorkspaces: React.FC = () => {
  const { theme } = useThemeStore();
  const { workspaces, setWorkspaces, addWorkspace } = useWorkspaceStore();
  
  const [windows, setWindows] = useState<FloatingWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('default');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji options for chat
  const commonEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥',
    '💯', '🎉', '🚀', '💡', '⚡', '🌟', '🎯', '🏆', '💪', '🙌',
    '👏', '🤝', '🙏', '✨', '🌈', '🎈', '🎊', '🥳', '😎', '🤩'
  ];

  // Text color options for better readability
  const textColors = [
    { name: 'Default', value: 'default', class: '' },
    { name: 'Purple', value: 'purple', class: 'text-purple-600 dark:text-purple-400' },
    { name: 'Blue', value: 'blue', class: 'text-blue-600 dark:text-blue-400' },
    { name: 'Green', value: 'green', class: 'text-green-600 dark:text-green-400' },
    { name: 'Orange', value: 'orange', class: 'text-orange-600 dark:text-orange-400' },
    { name: 'Red', value: 'red', class: 'text-red-600 dark:text-red-400' },
    { name: 'Pink', value: 'pink', class: 'text-pink-600 dark:text-pink-400' }
  ];

  const workspaceTemplates = [
    {
      id: 'nixos',
      name: 'NixOS Environment',
      description: 'Reproducible development environment',
      icon: Monitor,
      color: 'blue'
    },
    {
      id: 'docker',
      name: 'Docker Container',
      description: 'Containerized development setup',
      icon: Terminal,
      color: 'green'
    },
    {
      id: 'codespace',
      name: 'GitHub Codespace',
      description: 'Cloud-based development environment',
      icon: Github,
      color: 'purple'
    },
    {
      id: 'oracle',
      name: 'Oracle Cloud VM',
      description: 'Cloud virtual machine instance',
      icon: Settings,
      color: 'orange'
    }
  ];

  const dailyBriefing = {
    greeting: "Good morning, Nathan! ☕",
    status: "Your Sanctuary Status",
    updates: [
      "3 active workspaces running smoothly",
      "GitHub integration ready for version control",
      "Multi-modal chat available for assistance",
      "All development tools synchronized"
    ],
    mood: "Ready to build something amazing today? I'm here to help with any workspace management or development tasks!"
  };

  const bringToFront = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, zIndex: nextZIndex }
        : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const updateWindow = useCallback((windowId: string, updates: Partial<FloatingWindow>) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, ...updates } : w
    ));
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const createWorkspace = async (templateId: string) => {
    const template = workspaceTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: `${template.name} ${workspaces.length + 1}`,
      template_type: templateId as any,
      status: 'creating',
      configuration: {},
      created_at: new Date().toISOString()
    };

    addWorkspace(newWorkspace);

    // Create floating window for the workspace
    const newWindow: FloatingWindow = {
      id: newWorkspace.id,
      title: newWorkspace.name,
      type: 'workspace',
      content: newWorkspace,
      position: { 
        x: 100 + (windows.length * 30), 
        y: 100 + (windows.length * 30) 
      },
      size: { width: 600, height: 400 },
      isMinimized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);

    // Simulate workspace creation
    setTimeout(() => {
      const updatedWorkspace = { ...newWorkspace, status: 'running' as const };
      setWorkspaces(workspaces.map(w => w.id === newWorkspace.id ? updatedWorkspace : w));
      updateWindow(newWorkspace.id, { content: updatedWorkspace });
    }, 3000);
  };

  const openMamaBearChat = () => {
    const existingChat = windows.find(w => w.type === 'chat');
    if (existingChat) {
      bringToFront(existingChat.id);
      return;
    }

    const chatWindow: FloatingWindow = {
      id: 'mama-bear-chat',
      title: 'Mama Bear Chat',
      type: 'chat',
      content: null,
      position: { x: 50, y: 50 },
      size: { width: 400, height: 500 },
      isMinimized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, chatWindow]);
    setNextZIndex(prev => prev + 1);
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    // Handle chat message sending
    setChatMessage('');
  };

  const insertEmoji = (emoji: string) => {
    setChatMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getTextColorClass = () => {
    const color = textColors.find(c => c.value === selectedTextColor);
    return color?.class || '';
  };

  const DraggableWindow: React.FC<{ window: FloatingWindow }> = ({ window }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y
      });
      bringToFront(window.id);
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeOffset({
        x: e.clientX,
        y: e.clientY
      });
      bringToFront(window.id);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(globalThis.innerWidth - window.size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(globalThis.innerHeight - window.size.height, e.clientY - dragOffset.y));
        
        updateWindow(window.id, {
          position: { x: newX, y: newY }
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeOffset.x;
        const deltaY = e.clientY - resizeOffset.y;
        
        const newWidth = Math.max(300, window.size.width + deltaX);
        const newHeight = Math.max(200, window.size.height + deltaY);
        
        updateWindow(window.id, {
          size: { width: newWidth, height: newHeight }
        });
        
        setResizeOffset({ x: e.clientX, y: e.clientY });
      }
    }, [isDragging, isResizing, dragOffset, resizeOffset, window.id, window.size]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setIsResizing(false);
    }, []);

    useEffect(() => {
      if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    if (window.isMinimized) {
      return (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`fixed bottom-4 left-4 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${
            window.type === 'chat' 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-green-500'
          }`}
          style={{ zIndex: window.zIndex }}
          onClick={() => updateWindow(window.id, { isMinimized: false })}
        >
          {window.type === 'chat' ? (
            <Heart className="w-5 h-5 text-white" />
          ) : (
            <Monitor className="w-5 h-5 text-white" />
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`fixed rounded-lg shadow-xl overflow-hidden ${
          theme === 'light'
            ? 'bg-white border border-gray-200'
            : 'bg-slate-800 border border-slate-600'
        }`}
        style={{
          left: window.position.x,
          top: window.position.y,
          width: window.size.width,
          height: window.size.height,
          zIndex: window.zIndex
        }}
      >
        {/* Window Header */}
        <div
          className={`p-2 flex items-center justify-between cursor-move ${
            window.type === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-gradient-to-r from-blue-600 to-green-600'
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            {window.type === 'chat' ? (
              <Heart className="w-4 h-4 text-white" />
            ) : (
              <Monitor className="w-4 h-4 text-white" />
            )}
            <span className="text-white font-medium text-sm">{window.title}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => updateWindow(window.id, { isMinimized: true })}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => closeWindow(window.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {window.type === 'workspace' ? (
            <WorkspaceContent workspace={window.content} />
          ) : (
            <ChatContent 
              message={chatMessage}
              setMessage={setChatMessage}
              onSendMessage={sendChatMessage}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="w-full h-full bg-gray-400 dark:bg-gray-600" 
               style={{
                 clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
               }}
          />
        </div>
      </motion.div>
    );
  };

  const WorkspaceContent: React.FC<{ workspace: Workspace }> = ({ workspace }) => (
    <div className="h-full flex flex-col">
      <div className={`p-3 border-b ${
        theme === 'light' ? 'border-gray-200' : 'border-slate-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={
              workspace.status === 'running' ? 'default' :
              workspace.status === 'creating' ? 'secondary' :
              'destructive'
            }>
              {workspace.status}
            </Badge>
            <span className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {workspace.template_type}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost">
              <GitBranch className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Folder className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Terminal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        {workspace.status === 'creating' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Setting up your {workspace.template_type} environment...
              </p>
            </div>
          </div>
        ) : (
          <div className={`h-full rounded-lg border-2 border-dashed ${
            theme === 'light' ? 'border-gray-300' : 'border-slate-600'
          } flex items-center justify-center`}>
            <div className="text-center">
              <Monitor className={`w-12 h-12 mx-auto mb-2 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Workspace interface would render here
              </p>
              <p className={`text-xs ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Terminal, file browser, and IDE integration
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ChatContent: React.FC<{
    message: string;
    setMessage: (msg: string) => void;
    onSendMessage: () => void;
    isRecording: boolean;
    setIsRecording: (recording: boolean) => void;
  }> = ({ message, setMessage, onSendMessage, isRecording, setIsRecording }) => (
    <div className="h-full flex flex-col">
      {/* Daily Briefing */}
      <div className="p-3 border-b border-purple-200 dark:border-slate-600">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
            {dailyBriefing.greeting}
          </h4>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            {dailyBriefing.status}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            theme === 'light' 
              ? 'bg-purple-50 border border-purple-200' 
              : 'bg-purple-900/20 border border-purple-600/30'
          }`}>
            <div className="space-y-1">
              {dailyBriefing.updates.map((update, index) => (
                <p key={index} className="text-xs text-purple-600 dark:text-purple-300">
                  • {update}
                </p>
              ))}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-200 font-medium mt-2">
              {dailyBriefing.mood}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-purple-200 dark:border-slate-600">
        <div className="flex items-end space-x-2 relative">
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="text-purple-600"
              title="Attach file"
            >
              <Paperclip className="w-3 h-3" />
            </Button>
            
            {/* Emoji Picker */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-purple-600"
                title="Add emoji"
              >
                <Smile className="w-3 h-3" />
              </Button>
              
              {showEmojiPicker && (
                <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg border shadow-lg z-50 w-48 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-200' 
                    : 'bg-slate-800 border-slate-600'
                }`}>
                  <div className="grid grid-cols-6 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded text-sm transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRecording(!isRecording)}
              className={`${isRecording ? 'text-red-600' : 'text-purple-600'}`}
              title="Voice recording"
            >
              <Mic className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-purple-600"
              title="Video recording"
            >
              <Video className="w-3 h-3" />
            </Button>
          </div>
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Mama Bear for help..."
            className={`min-h-[32px] text-sm resize-none font-medium leading-relaxed ${getTextColorClass()}`}
            rows={1}
            style={{ 
              fontSize: '14px', 
              lineHeight: '1.5',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          
          <Button
            size="sm"
            onClick={onSendMessage}
            disabled={!message.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Send message"
          >
            <Heart className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 border-b ${
          theme === 'light'
            ? 'bg-white/50 border-purple-200'
            : 'bg-slate-800/50 border-slate-700'
        } backdrop-blur-md`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Dev Workspaces
            </h1>
            <p className={`${
              theme === 'light' ? 'text-purple-600' : 'text-purple-300'
            }`}>
              Your development sanctuary with Mama Bear's assistance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={openMamaBearChat}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Chat with Mama Bear
            </Button>
            
            <div className="flex items-center space-x-2">
              <Badge variant={githubConnected ? 'default' : 'outline'} className="flex items-center space-x-1">
                <Github className="w-3 h-3" />
                <span>{githubConnected ? 'Connected' : 'Connect GitHub'}</span>
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Workspace Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className={`text-lg font-semibold mb-4 ${
            theme === 'light' ? 'text-purple-800' : 'text-purple-100'
          }`}>
            Create New Workspace
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workspaceTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    theme === 'light'
                      ? 'hover:border-purple-300'
                      : 'hover:border-purple-600'
                  }`}
                  onClick={() => createWorkspace(template.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-${template.color}-100 dark:bg-${template.color}-900/30`}>
                      <template.icon className={`w-6 h-6 text-${template.color}-600`} />
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      {template.name}
                    </h3>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Workspaces */}
        {workspaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              Active Workspaces
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${
                          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                        }`}>
                          {workspace.name}
                        </h3>
                        <Badge variant={
                          workspace.status === 'running' ? 'default' :
                          workspace.status === 'creating' ? 'secondary' :
                          'destructive'
                        }>
                          {workspace.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm mb-3 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {workspace.template_type} environment
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Terminal className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Config
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Windows */}
      <AnimatePresence>
        {windows.map((window) => (
          <DraggableWindow key={window.id} window={window} />
        ))}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default DevWorkspaces;