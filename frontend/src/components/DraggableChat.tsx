/**
 * Draggable Chat Component
 * 
 * A fully functional draggable, resizable, and collapsible chat window
 * for Mama Bear AI assistant. Provides consistent behavior across all pages
 * with proper close functionality and accessibility.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  X,
  Minimize2,
  Maximize2,
  Paperclip,
  Mic,
  Video,
  Send,
  Smile,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore } from '@/stores';

interface DraggableChatProps {
  id: string;
  title?: string;
  isVisible: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex?: number;
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mama-bear';
  content: string;
  timestamp: Date;
  type?: 'text' | 'system';
}

const DraggableChat: React.FC<DraggableChatProps> = ({
  id,
  title = "Mama Bear Assistant",
  isVisible,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 400, height: 500 },
  zIndex = 1000,
  className = ""
}) => {
  const { theme } = useThemeStore();
  
  // Window state
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Chat state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'mama-bear',
      content: `Hello! I'm Mama Bear, your development sanctuary assistant. I'm here to help with your projects, provide guidance, and make your coding journey more comfortable. What can I help you with today?`,
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState('default');
  
  // Refs for drag and resize
  const chatRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Emoji and color options
  const commonEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥',
    '💯', '🎉', '🚀', '💡', '⚡', '🌟', '🎯', '🏆', '💪', '🙌'
  ];
  
  const textColors = [
    { name: 'Default', value: 'default', class: '' },
    { name: 'Purple', value: 'purple', class: 'text-purple-600 dark:text-purple-400' },
    { name: 'Blue', value: 'blue', class: 'text-blue-600 dark:text-blue-400' },
    { name: 'Green', value: 'green', class: 'text-green-600 dark:text-green-400' },
    { name: 'Orange', value: 'orange', class: 'text-orange-600 dark:text-orange-400' },
    { name: 'Red', value: 'red', class: 'text-red-600 dark:text-red-400' },
    { name: 'Pink', value: 'pink', class: 'text-pink-600 dark:text-pink-400' }
  ];

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [position, isMaximized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const newPosition = {
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStartRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStartRef.current.y))
      };
      setPosition(newPosition);
    }
    
    if (isResizing && resizeStartRef.current) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      const newSize = {
        width: Math.max(300, Math.min(800, resizeStartRef.current.width + deltaX)),
        height: Math.max(200, Math.min(600, resizeStartRef.current.height + deltaY))
      };
      setSize(newSize);
    }
  }, [isDragging, isResizing, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    dragStartRef.current = null;
    resizeStartRef.current = null;
  }, []);

  // Resize functionality
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  }, [size, isMaximized]);

  // Window controls
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(initialPosition);
      setSize(initialSize);
    } else {
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    onClose();
  };

  // Chat functionality
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Simulate API call to Mama Bear
      setTimeout(() => {
        const responses = [
          "I understand you're working on that. Let me help you think through this step by step.",
          "That's an interesting challenge! I can definitely assist you with that.",
          "Great question! Here's how I'd approach this problem...",
          "I'm here to support you. Let's break this down together.",
          "Perfect! I love helping with development tasks like this."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const mamaBearMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'mama-bear',
          content: randomResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, mamaBearMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getTextColorClass = () => {
    const color = textColors.find(c => c.value === selectedTextColor);
    return color?.class || '';
  };

  // Event listeners
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

  // Prevent text selection during drag
  useEffect(() => {
    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing]);

  if (!isVisible) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`fixed bottom-4 right-4 ${className}`}
        style={{ zIndex }}
      >
        <Button
          onClick={handleMinimize}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          <Heart className="w-4 h-4 mr-2" />
          {title}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={chatRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={`fixed rounded-lg shadow-2xl overflow-hidden border ${
        theme === 'light'
          ? 'bg-white border-purple-200'
          : theme === 'dark'
          ? 'bg-slate-800 border-slate-600'
          : 'bg-purple-900/90 border-purple-600/50'
      } ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-move bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={handleMinimize}
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-red-500/50"
            onClick={handleClose}
            title="Close"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : msg.type === 'system'
                      ? theme === 'light'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-purple-900/30 text-purple-100 border border-purple-600/30'
                      : theme === 'light'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-slate-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className={`rounded-lg px-3 py-2 ${
                  theme === 'light' ? 'bg-gray-100' : 'bg-slate-700'
                }`}>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className={`p-3 border-t ${
          theme === 'light' ? 'border-purple-200' : 'border-slate-600'
        }`}>
          <div className="flex items-end space-x-2 relative">
            {/* Toolbar */}
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-purple-600 h-6 w-6 p-0"
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
                  className="text-purple-600 h-6 w-6 p-0"
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

              {/* Text Color Picker */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-purple-600 h-6 w-6 p-0"
                  title="Text color"
                >
                  <Palette className="w-3 h-3" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-purple-600 h-6 w-6 p-0"
                title="Voice recording"
              >
                <Mic className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-purple-600 h-6 w-6 p-0"
                title="Video recording"
              >
                <Video className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Message Input */}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Mama Bear for help..."
              className={`min-h-[32px] text-sm resize-none font-medium leading-relaxed ${getTextColorClass()}`}
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white h-8"
              title="Send message"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <div 
            className="w-full h-full bg-purple-400 dark:bg-purple-600" 
            style={{
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default DraggableChat;