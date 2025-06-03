"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variant, MotionValue, useTransform } from "framer-motion";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { 
  FileText, 
  MessageSquare, 
  Code, 
  Settings, 
  ChevronRight, 
  Play, 
  Layers, 
  Zap, 
  Sparkles,
  Workflow,
  Bot,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Types
interface StageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TransitionPanelProps {
  children: React.ReactNode[];
  className?: string;
  transition?: any;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
}

// TransitionPanel Component
function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
}: TransitionPanelProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence
        initial={false}
        mode="popLayout"
      >
        <motion.div
          key={activeIndex}
          variants={variants}
          transition={transition}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Main Component
function ScoutAgentWorkspace() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const stages: StageProps[] = [
    {
      title: "Welcome",
      description: "Get started with Scout Agent and explore its capabilities",
      icon: <Sparkles className="h-5 w-5" />,
      color: "bg-purple-500/20 text-purple-500"
    },
    {
      title: "Agent Orchestration",
      description: "Configure and orchestrate your Scout Agents",
      icon: <Workflow className="h-5 w-5" />,
      color: "bg-indigo-500/20 text-indigo-500"
    },
    {
      title: "Workspace Animation",
      description: "Visualize your agent's workflow and interactions",
      icon: <Bot className="h-5 w-5" />,
      color: "bg-violet-500/20 text-violet-500"
    },
    {
      title: "Live Production",
      description: "Deploy your agents to production environments",
      icon: <Rocket className="h-5 w-5" />,
      color: "bg-fuchsia-500/20 text-fuchsia-500"
    }
  ];

  const handleStageChange = (index: number) => {
    setActiveStage(index);
  };

  useEffect(() => {
    // Scroll to active stage in timeline
    if (timelineRef.current) {
      const activeElement = timelineRef.current.querySelector(`[data-stage="${activeStage}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStage]);

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-purple-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">Scout Agent Workspace</h1>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            className="p-2 rounded-md hover:bg-accent"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Timeline Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col border-r border-border">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-medium">Stages</h2>
              </div>
              <div 
                ref={timelineRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {stages.map((stage, index) => (
                  <motion.div
                    key={index}
                    data-stage={index}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all",
                      activeStage === index 
                        ? "bg-accent" 
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleStageChange(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-md", stage.color)}>
                        {stage.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{stage.title}</h3>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      </div>
                      {activeStage === index && (
                        <motion.div 
                          className="ml-auto"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>
                    {activeStage === index && (
                      <motion.div 
                        className="h-1 w-full bg-purple-500 mt-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Workspace */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-medium">{stages[activeStage].title}</h2>
                <div className="flex items-center gap-2">
                  <motion.button 
                    className="p-2 rounded-md hover:bg-accent flex items-center gap-1 text-sm"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="h-4 w-4" />
                    <span>Run</span>
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <TransitionPanel
                  activeIndex={activeStage}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  variants={{
                    enter: { opacity: 0, y: 20, filter: "blur(10px)" },
                    center: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: -20, filter: "blur(10px)" },
                  }}
                >
                  {/* Welcome Stage */}
                  <div className="h-full p-6 flex flex-col items-center justify-center">
                    <motion.div 
                      className="text-center max-w-md"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="mx-auto h-16 w-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-6">
                        <Sparkles className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Welcome to Scout Agent</h3>
                      <p className="text-muted-foreground mb-6">
                        Get started with your intelligent agent workspace. Configure, train, and deploy your agents with ease.
                      </p>
                      <motion.button 
                        className="px-4 py-2 bg-purple-600 text-white rounded-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStageChange(1)}
                      >
                        Get Started
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Agent Orchestration Stage */}
                  <div className="h-full p-6">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                      <ResizablePanel defaultSize={60}>
                        <Card className="h-full overflow-hidden">
                          <Tabs defaultValue="config" className="h-full flex flex-col">
                            <div className="border-b border-border px-4">
                              <TabsList className="mt-2">
                                <TabsTrigger value="config">Configuration</TabsTrigger>
                                <TabsTrigger value="flow">Flow</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                              </TabsList>
                            </div>
                            <TabsContent value="config" className="flex-1 p-4 overflow-auto">
                              <motion.div 
                                className="space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <h3 className="text-lg font-medium">Agent Configuration</h3>
                                <p className="text-sm text-muted-foreground">
                                  Configure your agent's behavior, capabilities, and integrations.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  {Array.from({ length: 4 }).map((_, i) => (
                                    <motion.div 
                                      key={i}
                                      className="h-24 rounded-lg bg-accent/50 animate-pulse"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.1 * i }}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            </TabsContent>
                            <TabsContent value="flow" className="flex-1 p-4">
                              <div className="h-full flex items-center justify-center">
                                <p className="text-muted-foreground">Flow visualization coming soon</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="settings" className="flex-1 p-4">
                              <div className="h-full flex items-center justify-center">
                                <p className="text-muted-foreground">Settings panel coming soon</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </Card>
                      </ResizablePanel>
                      
                      <ResizableHandle withHandle />
                      
                      <ResizablePanel defaultSize={40}>
                        <Card className="h-full overflow-hidden">
                          <div className="p-4 border-b border-border">
                            <h3 className="font-medium">Agent Properties</h3>
                          </div>
                          <div className="p-4 overflow-auto h-[calc(100%-53px)]">
                            <div className="space-y-4">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <motion.div 
                                  key={i}
                                  className="h-12 rounded-lg bg-accent/50 animate-pulse"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * i }}
                                />
                              ))}
                            </div>
                          </div>
                        </Card>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>

                  {/* Workspace Animation Stage */}
                  <div className="h-full p-6">
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={30}>
                        <Card className="h-full overflow-hidden">
                          <div className="p-4 border-b border-border">
                            <h3 className="font-medium">Files</h3>
                          </div>
                          <div className="p-2 overflow-auto h-[calc(100%-53px)]">
                            <div className="space-y-1">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div 
                                  key={i}
                                  className="p-2 rounded-md hover:bg-accent flex items-center gap-2 cursor-pointer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05 * i }}
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">file-{i + 1}.json</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </ResizablePanel>
                      
                      <ResizableHandle withHandle />
                      
                      <ResizablePanel defaultSize={70}>
                        <Card className="h-full overflow-hidden">
                          <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-medium">Workspace Preview</h3>
                            <div className="flex items-center gap-2">
                              <motion.button 
                                className="p-1.5 rounded-md hover:bg-accent"
                                whileTap={{ scale: 0.95 }}
                              >
                                <Code className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                className="p-1.5 rounded-md hover:bg-accent"
                                whileTap={{ scale: 0.95 }}
                              >
                                <Layers className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                          <div className="p-4 overflow-auto h-[calc(100%-53px)] flex items-center justify-center">
                            <motion.div 
                              className="w-full h-full rounded-lg bg-accent/30 flex items-center justify-center"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="text-center">
                                <Bot className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                                <p className="text-muted-foreground">Workspace animation preview</p>
                              </div>
                            </motion.div>
                          </div>
                        </Card>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>

                  {/* Live Production Stage */}
                  <div className="h-full p-6">
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={70}>
                        <Card className="h-full overflow-hidden">
                          <div className="p-4 border-b border-border">
                            <h3 className="font-medium">Production Environment</h3>
                          </div>
                          <div className="p-4 overflow-auto h-[calc(100%-53px)]">
                            <motion.div 
                              className="w-full h-full rounded-lg bg-accent/30 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="text-center">
                                <Rocket className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                                <p className="text-lg font-medium mb-2">Ready for Deployment</p>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                  Your Scout Agent is configured and ready to be deployed to production.
                                </p>
                                <motion.button 
                                  className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Deploy to Production
                                </motion.button>
                              </div>
                            </motion.div>
                          </div>
                        </Card>
                      </ResizablePanel>
                      
                      <ResizableHandle withHandle />
                      
                      <ResizablePanel defaultSize={30}>
                        <Card className="h-full overflow-hidden">
                          <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-medium">Chat</h3>
                            <motion.button 
                              className="p-1.5 rounded-md hover:bg-accent"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </motion.button>
                          </div>
                          <div className={cn(
                            "flex flex-col h-[calc(100%-53px)]",
                            isPanelExpanded ? "absolute inset-0 z-10 bg-background" : ""
                          )}>
                            <div className="flex-1 p-4 overflow-auto">
                              <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <motion.div 
                                    key={i}
                                    className="flex gap-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                  >
                                    <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                                      <Bot className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="bg-accent/50 p-3 rounded-lg text-sm max-w-[80%]">
                                      <p>This is a sample message from the Scout Agent assistant.</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            <Separator />
                            <div className="p-4">
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="Type a message..."
                                />
                                <motion.button 
                                  className="p-2 rounded-md bg-purple-600 text-white"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </TransitionPanel>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default function ScoutAgentWorkspaceDemo() {
  return <ScoutAgentWorkspace />;
}
