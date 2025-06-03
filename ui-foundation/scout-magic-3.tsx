"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  Code,
  Eye,
  ChevronRight,
  Clock,
  Sparkles,
  Layers,
  Zap,
  X,
  Maximize2,
  Minimize2,
  MoreHorizontal,
} from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StageProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface ScoutAgentWorkspaceProps {
  initialStage?: string;
}

const stages: StageProps[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Configure your Scout Agent",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "orchestration",
    title: "Agent Orchestration",
    description: "Setting up agent connections",
    icon: <Layers className="h-5 w-5" />,
    color: "bg-purple-600/10 text-purple-600",
  },
  {
    id: "workspace",
    title: "Workspace Animation",
    description: "Building your workspace",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-purple-700/10 text-purple-700",
  },
  {
    id: "production",
    title: "Live Production",
    description: "Your agent is ready",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-purple-800/10 text-purple-800",
  },
];

function ScoutAgentWorkspace({ initialStage = "welcome" }: ScoutAgentWorkspaceProps) {
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatPosition, setChatPosition] = useState<"right" | "bottom">("right");
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleStageChange = (stageId: string) => {
    setCurrentStage(stageId);
    
    // Reposition chat based on stage
    if (stageId === "welcome" || stageId === "orchestration") {
      setChatPosition("right");
    } else {
      setChatPosition("bottom");
    }
  };

  const toggleFullscreen = () => {
    if (!workspaceRef.current) return;
    
    if (!document.fullscreenElement) {
      workspaceRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);

  return (
    <div 
      ref={workspaceRef}
      className="h-screen w-full bg-background text-foreground overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-700/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-purple-600/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col h-full">
        <header className="border-b border-border p-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-purple-600 text-white flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">Scout Agent Workspace</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  More Options
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-medium">Stages</h2>
                </div>
                
                <div className="flex-1 overflow-auto p-2">
                  <MotionConfig transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}>
                    <div className="space-y-2">
                      {stages.map((stage, index) => (
                        <StageButton 
                          key={stage.id}
                          stage={stage}
                          isActive={currentStage === stage.id}
                          isCompleted={index < currentStageIndex}
                          onClick={() => handleStageChange(stage.id)}
                        />
                      ))}
                    </div>
                  </MotionConfig>
                </div>
                
                <div className="p-4 border-t border-border">
                  <Timeline currentStage={currentStage} stages={stages} />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={80}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStage}
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <WorkspaceContent 
                    currentStage={currentStage} 
                    chatPosition={chatPosition}
                  />
                </motion.div>
              </AnimatePresence>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}

function StageButton({ 
  stage, 
  isActive, 
  isCompleted, 
  onClick 
}: { 
  stage: StageProps; 
  isActive: boolean; 
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-md text-left transition-all",
        isActive 
          ? "bg-purple-500/10 text-purple-600" 
          : "hover:bg-muted"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        "h-8 w-8 rounded-md flex items-center justify-center",
        stage.color
      )}>
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-4 w-4 bg-purple-500 text-white rounded-full flex items-center justify-center"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M8 3L4 7L2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        ) : stage.icon}
      </div>
      
      <div className="flex-1">
        <div className="font-medium">{stage.title}</div>
        <div className="text-xs text-muted-foreground">{stage.description}</div>
      </div>
      
      {isActive && (
        <ChevronRight className="h-4 w-4 text-purple-500" />
      )}
    </motion.button>
  );
}

function Timeline({ currentStage, stages }: { currentStage: string; stages: StageProps[] }) {
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Timeline</h3>
      <div className="relative pt-2">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={stage.id} className="flex items-center gap-3 mb-3">
              <div className="relative">
                <motion.div 
                  className={cn(
                    "h-3 w-3 rounded-full z-10 relative",
                    isActive ? "bg-purple-600" : 
                    isCompleted ? "bg-purple-600" : "bg-muted"
                  )}
                  initial={false}
                  animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                />
                
                {index < stages.length - 1 && (
                  <div className="absolute top-3 left-1.5 w-[1px] h-6 -translate-x-1/2 bg-border" />
                )}
              </div>
              
              <div className={cn(
                "text-xs",
                isActive ? "text-purple-600 font-medium" : 
                isCompleted ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceContent({ 
  currentStage,
  chatPosition
}: { 
  currentStage: string;
  chatPosition: "right" | "bottom";
}) {
  return (
    <div className="h-full">
      {chatPosition === "right" ? (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <MainWorkspaceArea currentStage={currentStage} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            <MainWorkspaceArea currentStage={currentStage} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}

function MainWorkspaceArea({ currentStage }: { currentStage: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {stages.find(stage => stage.id === currentStage)?.title || "Workspace"}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={20}>
            <Tabs defaultValue="files">
              <div className="border-b border-border">
                <TabsList className="w-full justify-start h-12 px-4">
                  <TabsTrigger value="files" className="data-[state=active]:bg-muted">
                    <FileText className="h-4 w-4 mr-2" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-muted">
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="files" className="p-0 h-[calc(100%-48px)]">
                <FilesExplorer currentStage={currentStage} />
              </TabsContent>
              
              <TabsContent value="code" className="p-0 h-[calc(100%-48px)]">
                <div className="p-4 h-full overflow-auto">
                  <CodePreview currentStage={currentStage} />
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-2 flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  index.html
                </Button>
                <Button variant="ghost" size="sm">
                  style.css
                </Button>
                <Button variant="ghost" size="sm">
                  script.js
                </Button>
              </div>
              
              <div className="flex-1 p-4 overflow-auto">
                <PreviewPanel currentStage={currentStage} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

function FilesExplorer({ currentStage }: { currentStage: string }) {
  const files = [
    { name: "index.html", icon: <FileText className="h-4 w-4" /> },
    { name: "style.css", icon: <FileText className="h-4 w-4" /> },
    { name: "script.js", icon: <FileText className="h-4 w-4" /> },
    { name: "assets", icon: <FileText className="h-4 w-4" /> },
    { name: "components", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full overflow-auto p-2">
      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
          >
            {file.icon}
            <span>{file.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CodePreview({ currentStage }: { currentStage: string }) {
  return (
    <div className="font-mono text-sm">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-purple-500">// Scout Agent Code</div>
        <div className="text-green-500">// Stage: {currentStage}</div>
        <div className="mt-4">
          <div>function initScoutAgent() {'{'}</div>
          <div className="pl-4">const agent = new ScoutAgent();</div>
          <div className="pl-4">agent.init();</div>
          <div className="pl-4">agent.setStage('{currentStage}');</div>
          <div className="pl-4">return agent;</div>
          <div>{'}'}</div>
        </div>
      </motion.div>
    </div>
  );
}

function PreviewPanel({ currentStage }: { currentStage: string }) {
  const stageContent = {
    welcome: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-24 w-24 rounded-full bg-purple-600/20 flex items-center justify-center mb-6"
        >
          <Sparkles className="h-12 w-12 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Scout Agent</h2>
        <p className="text-muted-foreground max-w-md">
          Configure your agent to start building your workspace
        </p>
      </div>
    ),
    orchestration: (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 w-64"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 h-32 w-32 rounded-full border-2 border-purple-500/30"
              initial={{ scale: 0, x: "-50%", y: "-50%" }}
              animate={{ 
                scale: [0, 1.5, 1],
                opacity: [0, 0.5, 0],
              }}
              transition={{ 
                duration: 3,
                delay: i * 0.6,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          ))}
          <motion.div 
            className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Layers className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>
        <h3 className="text-xl font-medium mt-8">Orchestrating Agents</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Connecting and configuring agent systems
        </p>
      </div>
    ),
    workspace: (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="relative w-full max-w-lg aspect-video bg-muted rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-700/20"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute h-8 rounded-md bg-white/10"
              initial={{ 
                width: 100 + Math.random() * 200,
                top: 20 + (i * 50),
                left: 20,
                opacity: 0
              }}
              animate={{ 
                opacity: 0.7,
                left: [20, 40, 20],
              }}
              transition={{ 
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        <h3 className="text-xl font-medium mt-8">Building Workspace</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Creating your customized agent workspace
        </p>
      </div>
    ),
    production: (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative h-32 w-32 mb-8"
        >
          <motion.div 
            className="absolute inset-0 rounded-full bg-green-500/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="h-24 w-24 rounded-full border-4 border-t-green-500 border-r-purple-500 border-b-blue-500 border-l-amber-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-green-500">Live and Ready!</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Your Scout Agent is now fully operational
        </p>
        <Button className="mt-6 bg-green-600 hover:bg-green-700">
          Launch Dashboard
        </Button>
      </div>
    ),
  };

  return (
    <Card className="h-full flex items-center justify-center overflow-hidden border-dashed">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full flex items-center justify-center p-6"
        >
          {stageContent[currentStage as keyof typeof stageContent]}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your Scout Agent assistant. How can I help you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    setInputValue("");
    
    // Simulate response after a delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          text: `I'm processing your request: "${inputValue}"`, 
          isUser: false 
        }
      ]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col border-l border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat
        </h2>
        <Button variant="ghost" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.isUser 
                    ? "bg-purple-600 text-white" 
                    : "bg-muted"
                )}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-muted rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}

export default function ScoutAgentWorkspaceDemo() {
  return <ScoutAgentWorkspace />;
}
