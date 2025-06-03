"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, Variants } from "framer-motion";
import { 
  ArrowLeftIcon, 
  FileIcon, 
  MessageSquare, 
  Settings, 
  Terminal, 
  Zap, 
  Sparkles, 
  FileText, 
  Braces, 
  Code, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronDown 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface ScoutAgentWorkspaceProps {
  className?: string;
}

const ScoutAgentWorkspace: React.FC<ScoutAgentWorkspaceProps> = ({ className }) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [scope, animate] = useAnimate();
  const workspaceRef = useRef<HTMLDivElement>(null);

  const stages = [
    { name: "Planning", icon: <Sparkles className="h-5 w-5" /> },
    { name: "Orchestration", icon: <Terminal className="h-5 w-5" /> },
    { name: "Workspace", icon: <Braces className="h-5 w-5" /> },
    { name: "Production", icon: <Zap className="h-5 w-5" /> }
  ];

  useEffect(() => {
    // Animate stage transitions
    const timer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStage, stages.length]);

  useEffect(() => {
    // Animate thinking dots
    if (currentStage === 1) {
      animate(
        [
          ["#dot1", { opacity: 1 }, { duration: 0.3 }],
          ["#dot2", { opacity: 1 }, { duration: 0.3, delay: 0.3 }],
          ["#dot3", { opacity: 1 }, { duration: 0.3, delay: 0.6 }],
          ["#dot1, #dot2, #dot3", { opacity: 0.3 }, { duration: 0.3, delay: 0.9 }],
        ],
        {
          repeat: Number.POSITIVE_INFINITY,
        }
      );
    }
  }, [animate, currentStage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={workspaceRef}
      className={cn(
        "relative h-[600px] w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {currentStage === 0 && (
          <WelcomeStage key="welcome" onStart={() => setCurrentStage(1)} />
        )}
        
        {currentStage === 1 && (
          <OrchestrationStage 
            key="orchestration" 
            scope={scope} 
            onComplete={() => setCurrentStage(2)} 
          />
        )}
        
        {currentStage >= 2 && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Scout Agent Workspace</span>
              </div>
              <div className="flex items-center space-x-2">
                <StageIndicator stages={stages} currentStage={currentStage} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-48px)]">
              <ResizablePanel defaultSize={20} minSize={15}>
                <Tabs defaultValue="files">
                  <TabsList className="w-full">
                    <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
                    <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                  </TabsList>
                  <TabsContent value="files" className="p-0">
                    <FileExplorer />
                  </TabsContent>
                  <TabsContent value="timeline" className="p-0">
                    <Timeline />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={50}>
                <Tabs defaultValue="editor">
                  <TabsList className="w-full">
                    <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
                    <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor" className="p-0">
                    <Editor />
                  </TabsContent>
                  <TabsContent value="preview" className="p-0">
                    <Preview />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={30} minSize={20}>
                <ChatPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WelcomeStage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-r from-purple-200 via-violet-400 to-indigo-600 p-8 text-center"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Sparkles className="h-16 w-16 text-white" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 text-3xl font-bold text-white"
      >
        Welcome to Scout Agent
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-4 max-w-md text-white/90"
      >
        Your AI assistant is ready to help you plan, build, and deploy your project with intelligent automation.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button 
          onClick={onStart}
          className="mt-8 bg-white text-indigo-600 hover:bg-white/90"
        >
          Start Planning
        </Button>
      </motion.div>
    </motion.div>
  );
};

const OrchestrationStage: React.FC<{ 
  scope: React.RefObject<HTMLElement>, 
  onComplete: () => void 
}> = ({ scope, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-500 p-8 text-center"
      ref={scope}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-full bg-white/10 p-6"
      >
        <Terminal className="h-12 w-12 text-white" />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 text-2xl font-bold text-white"
      >
        Orchestrating Agents
      </motion.h2>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 flex items-center space-x-2 text-white"
      >
        <span>Thinking</span>
        <span id="dot1" className="h-2 w-2 rounded-full bg-white opacity-30"></span>
        <span id="dot2" className="h-2 w-2 rounded-full bg-white opacity-30"></span>
        <span id="dot3" className="h-2 w-2 rounded-full bg-white opacity-30"></span>
      </motion.div>
    </motion.div>
  );
};

const StageIndicator: React.FC<{
  stages: { name: string; icon: React.ReactNode }[];
  currentStage: number;
}> = ({ stages, currentStage }) => {
  return (
    <div className="flex items-center space-x-1">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.name}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <div
            className={cn(
              "flex items-center rounded-md px-2 py-1",
              index === currentStage
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : index < currentStage
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            )}
          >
            {stage.icon}
            <span className="ml-1 text-xs font-medium">{stage.name}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<{ name: string; type: string; children?: { name: string; type: string }[] }[]>([
    { 
      name: "src", 
      type: "folder", 
      children: [
        { name: "components", type: "folder" },
        { name: "app.tsx", type: "file" },
        { name: "index.tsx", type: "file" }
      ] 
    },
    { name: "package.json", type: "file" },
    { name: "README.md", type: "file" }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  return (
    <div className="h-full overflow-auto p-2">
      <div className="space-y-1">
        {files.map((file) => (
          <div key={file.name}>
            {file.type === "folder" ? (
              <>
                <button
                  onClick={() => toggleFolder(file.name)}
                  className="flex w-full items-center rounded-md px-2 py-1 hover:bg-muted"
                >
                  {expandedFolders[file.name] ? (
                    <ChevronDown className="mr-1 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="mr-1 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{file.name}</span>
                </button>
                {expandedFolders[file.name] && file.children && (
                  <div className="ml-4 space-y-1 border-l border-border pl-2">
                    {file.children.map((child) => (
                      <div
                        key={child.name}
                        className="flex items-center rounded-md px-2 py-1 hover:bg-muted"
                      >
                        <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{child.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center rounded-md px-2 py-1 hover:bg-muted">
                <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Timeline: React.FC = () => {
  const timelineItems = [
    { time: "10:15 AM", event: "Project initialized", icon: <Sparkles className="h-4 w-4" /> },
    { time: "10:17 AM", event: "Dependencies installed", icon: <Code className="h-4 w-4" /> },
    { time: "10:20 AM", event: "Component structure created", icon: <Braces className="h-4 w-4" /> },
    { time: "10:25 AM", event: "First file generated", icon: <FileText className="h-4 w-4" /> }
  ];

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start"
          >
            <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-medium">{item.event}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Editor: React.FC = () => {
  return (
    <div className="h-full overflow-auto bg-muted/20 p-4 font-mono text-sm">
      <pre className="text-foreground">
        <code>{`import React from 'react';
import { Button } from './components/ui/button';

export function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">
        Scout Agent Project
      </h1>
      <p className="mt-2">
        This project was scaffolded by Scout Agent.
      </p>
      <Button className="mt-4">
        Get Started
      </Button>
    </div>
  );
}`}</code>
      </pre>
    </div>
  );
};

const Preview: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Scout Agent Project</h1>
        <p className="mt-2 text-muted-foreground">This project was scaffolded by Scout Agent.</p>
        <Button className="mt-4">Get Started</Button>
      </div>
    </div>
  );
};

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your Scout Agent. How can I help with your project today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // Simulate assistant response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'I\'m analyzing your request. Let me help you implement that feature in your project.' 
        }
      ]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
          <span className="font-medium">Agent Chat</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex max-w-[80%] flex-col rounded-lg p-3",
                message.role === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-border p-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button onClick={handleSendMessage} size="sm">Send</Button>
        </div>
      </div>
    </div>
  );
};

// Particles component for background effects
const Particles: React.FC<{
  className?: string;
  quantity?: number;
  color?: string;
}> = ({ className = "", quantity = 40, color = "#a855f7" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<any[]>([]);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    
    contextRef.current = context;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    });
    
    resizeObserver.observe(canvas.parentElement || document.body);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initParticles();
      animate();
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions]);

  const initParticles = () => {
    particles.current = [];
    for (let i = 0; i < quantity; i++) {
      particles.current.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        radius: Math.random() * 2 + 1,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  };

  const animate = () => {
    const context = contextRef.current;
    if (!context) return;
    
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    
    particles.current.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > dimensions.width) {
        particle.vx = -particle.vx;
      }
      
      if (particle.y < 0 || particle.y > dimensions.height) {
        particle.vy = -particle.vy;
      }
      
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `${color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
      context.fill();
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

// Example usage
const ScoutAgentWorkspaceExample = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Scout Agent Workspace</h1>
      <ScoutAgentWorkspace />
    </div>
  );
};

export default ScoutAgentWorkspaceExample;
