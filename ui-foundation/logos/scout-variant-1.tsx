"use client";

import { useEffect, useRef, useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  Figma,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  Github,
  Download,
  Terminal,
  History,
  Code,
  FileCode,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  LayoutPanelLeft,
  MessageSquare,
  Files,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TypingDotsProps {
  className?: string;
}

function TypingDots({ className }: TypingDotsProps) {
  return (
    <div className={cn("flex items-center ml-1", className)}>
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ 
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
          }}
        />
      ))}
    </div>
  );
}

interface StageProps {
  active: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}

function Stage({ active, onComplete, children }: StageProps) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FileItemProps {
  name: string;
  type: string;
  size?: string;
  onSelect?: () => void;
}

function FileItem({ name, type, size = "2.4KB", onSelect }: FileItemProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <FileCode className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{size}</div>
    </motion.div>
  );
}

interface TimelineItemProps {
  time: string;
  action: string;
  description: string;
}

function TimelineItem({ time, action, description }: TimelineItemProps) {
  return (
    <motion.div 
      className="mb-4 relative pl-6 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:rounded-full before:bg-primary/30 before:border before:border-primary"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-primary">{time}</span>
        <span className="text-sm font-semibold">{action}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </motion.div>
  );
}

function ScoutAgentWorkspace() {
  const [stage, setStage] = useState<'welcome' | 'orchestration' | 'workspace' | 'production'>('welcome');
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const commandSuggestions: CommandSuggestion[] = [
    { 
      icon: <ImageIcon className="w-4 h-4" />, 
      label: "Clone UI", 
      description: "Generate a UI from a screenshot", 
      prefix: "/clone" 
    },
    { 
      icon: <Figma className="w-4 h-4" />, 
      label: "Import Figma", 
      description: "Import a design from Figma", 
      prefix: "/figma" 
    },
    { 
      icon: <MonitorIcon className="w-4 h-4" />, 
      label: "Create Page", 
      description: "Generate a new web page", 
      prefix: "/page" 
    },
    { 
      icon: <Sparkles className="w-4 h-4" />, 
      label: "Improve", 
      description: "Improve existing UI design", 
      prefix: "/improve" 
    },
  ];

  const files = [
    { name: "index.tsx", type: "React Component", size: "4.2KB" },
    { name: "styles.css", type: "CSS", size: "1.8KB" },
    { name: "utils.ts", type: "TypeScript", size: "2.1KB" },
    { name: "api.ts", type: "TypeScript", size: "3.5KB" },
    { name: "types.d.ts", type: "TypeScript Definitions", size: "1.2KB" },
  ];

  const timelineHistory = [
    { time: "10:15 AM", action: "File Created", description: "Created index.tsx component file" },
    { time: "10:22 AM", action: "Code Generated", description: "Generated responsive layout structure" },
    { time: "10:35 AM", action: "Styling Added", description: "Added Tailwind CSS styling to components" },
    { time: "10:42 AM", action: "Bug Fixed", description: "Fixed responsive layout issues on mobile" },
    { time: "10:55 AM", action: "Feature Added", description: "Implemented drag and drop functionality" },
  ];

  const handleStageComplete = () => {
    if (stage === 'welcome') setStage('orchestration');
    else if (stage === 'orchestration') setStage('workspace');
    else if (stage === 'workspace') setStage('production');
  };

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);
      
      const matchingSuggestionIndex = commandSuggestions.findIndex(
        (cmd) => cmd.prefix.startsWith(value)
      );
      
      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector('[data-command-button]');
      
      if (commandPaletteRef.current && 
        !commandPaletteRef.current.contains(target) && 
        !commandButton?.contains(target)) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + ' ');
          setShowCommandPalette(false);
          
          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue("");
          adjustHeight(true);
        }, 3000);
      });
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments(prev => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + ' ');
    setShowCommandPalette(false);
    
    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  if (stage === 'welcome' || stage === 'orchestration') {
    return (
      <div className="min-h-screen flex flex-col w-full items-center justify-center bg-[#1E0A3C] text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
        </div>

        <Stage active={stage === 'welcome'} onComplete={handleStageComplete}>
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
              Hey Nathan! Got work? Let's jam!
            </h1>
            <p className="text-lg text-violet-200/80">
              Your Scout Agent is ready to assist
            </p>
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <TypingDots className="justify-center" />
            </motion.div>
          </motion.div>
        </Stage>

        <Stage active={stage === 'orchestration'} onComplete={handleStageComplete}>
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div 
                className="absolute inset-0 rounded-full bg-violet-600/20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.2, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-300" />
              </div>
            </div>
            <h2 className="text-2xl font-medium">Orchestrating your workspace</h2>
            <p className="text-violet-200/60">Setting up your development environment</p>
          </motion.div>
        </Stage>
      </div>
    );
  }

  if (stage === 'workspace') {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background text-foreground relative overflow-hidden">
        <header className="border-b border-border h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold">Scout Agent</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Github className="w-4 h-4" />
              <span>Connect</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="default" size="sm" onClick={() => handleStageComplete()}>
              <span>Continue</span>
            </Button>
          </div>
        </header>

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={25} minSize={20}>
            <Tabs defaultValue="files" className="h-full flex flex-col">
              <TabsList className="w-full justify-start px-4 pt-2">
                <TabsTrigger value="files" className="flex items-center gap-1">
                  <Files className="w-4 h-4" />
                  <span>Files</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 space-y-1">
                    {files.map((file, index) => (
                      <FileItem 
                        key={index}
                        name={file.name}
                        type={file.type}
                        size={file.size}
                        onSelect={() => setSelectedFile(file.name)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="history" className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4">
                    {timelineHistory.map((item, index) => (
                      <TimelineItem 
                        key={index}
                        time={item.time}
                        action={item.action}
                        description={item.description}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    <Terminal className="w-4 h-4" />
                    <span>Terminal</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="mb-8">
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Scout Agent</p>
                        <div className="prose prose-sm dark:prose-invert">
                          <p>I've set up your workspace with the files you need. You can:</p>
                          <ul className="my-2">
                            <li>Edit files in the editor</li>
                            <li>Use the terminal for commands</li>
                            <li>Drag and drop files to upload</li>
                            <li>Export your work when finished</li>
                          </ul>
                          <p>What would you like to work on first?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="border-t border-border p-4">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Scout Agent..."
                    className="min-h-[60px] resize-none pr-12"
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 bottom-2 h-8 w-8"
                    onClick={handleSendMessage}
                    disabled={!value.trim()}
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    <Command className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-4">
                {selectedFile ? (
                  <Card className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">{selectedFile}</h3>
                      <p className="text-sm text-muted-foreground">File preview</p>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Select a file to preview</p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  // Production stage
  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground relative overflow-hidden">
      <header className="border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold">Scout Agent</h1>
          <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
            Production Ready
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Github className="w-4 h-4" />
            <span>Push to GitHub</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
          <Button variant="default" size="sm">
            <span>Deploy</span>
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <Tabs defaultValue="files" className="h-full flex flex-col">
            <TabsList className="w-full justify-start px-4 pt-2">
              <TabsTrigger value="files" className="flex items-center gap-1">
                <Files className="w-4 h-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4 space-y-1">
                  {files.map((file, index) => (
                    <FileItem 
                      key={index}
                      name={file.name}
                      type={file.type}
                      size={file.size}
                      onSelect={() => setSelectedFile(file.name)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="history" className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4">
                  {timelineHistory.map((item, index) => (
                    <TimelineItem 
                      key={index}
                      time={item.time}
                      action={item.action}
                      description={item.description}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={55}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col">
                <div className="border-b border-border p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <Code className="w-4 h-4" />
                      <span>Editor</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-muted/30">
                  {selectedFile ? (
                    <div className="h-full flex flex-col">
                      <div className="text-sm font-mono bg-background p-2 rounded-md border border-border">
                        <div className="text-muted-foreground">// {selectedFile}</div>
                        <div className="mt-2">
                          <span className="text-blue-500">import</span> <span className="text-foreground">React</span> <span className="text-blue-500">from</span> <span className="text-green-500">"react"</span>;
                        </div>
                        <div className="mt-1">
                          <span className="text-blue-500">import</span> <span className="text-foreground">&#123; motion &#125;</span> <span className="text-blue-500">from</span> <span className="text-green-500">"framer-motion"</span>;
                        </div>
                        <div className="mt-4">
                          <span className="text-blue-500">function</span> <span className="text-yellow-500">ScoutComponent</span>() &#123;
                        </div>
                        <div className="ml-4 mt-1">
                          <span className="text-blue-500">return</span> (
                        </div>
                        <div className="ml-8 mt-1">
                          &lt;<span className="text-yellow-500">div</span> <span className="text-purple-500">className</span>=<span className="text-green-500">"container"</span>&gt;
                        </div>
                        <div className="ml-12 mt-1">
                          &lt;<span className="text-yellow-500">h1</span>&gt;Scout Agent Workspace&lt;/<span className="text-yellow-500">h1</span>&gt;
                        </div>
                        <div className="ml-8 mt-1">
                          &lt;/<span className="text-yellow-500">div</span>&gt;
                        </div>
                        <div className="ml-4 mt-1">
                          );
                        </div>
                        <div className="mt-1">
                          &#125;
                        </div>
                        <div className="mt-4">
                          <span className="text-blue-500">export</span> <span className="text-blue-500">default</span> <span className="text-foreground">ScoutComponent</span>;
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Code className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Select a file to edit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={30}>
              <div className="h-full flex flex-col">
                <div className="border-b border-border p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <Terminal className="w-4 h-4" />
                      <span>Terminal</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-black font-mono text-green-400 text-sm">
                  <div>$ npm run build</div>
                  <div className="text-white/70 mt-1">Creating an optimized production build...</div>
                  <div className="text-white/70 mt-1">✓ Compiled successfully</div>
                  <div className="text-white/70 mt-1">✓ Built in 3.2s</div>
                  <div className="mt-2">$ npm run test</div>
                  <div className="text-white/70 mt-1">PASS src/components/ScoutComponent.test.tsx</div>
                  <div className="text-white/70 mt-1">Test Suites: 1 passed, 1 total</div>
                  <div className="text-white/70 mt-1">Tests: 3 passed, 3 total</div>
                  <div className="mt-2 flex items-center">
                    <span>$</span>
                    <span className="ml-1 animate-pulse">|</span>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="border-b border-border p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 bg-white dark:bg-zinc-900 p-4">
              <div className="h-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-violet-600/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-violet-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Scout Agent Workspace</h2>
                  <p className="text-muted-foreground mb-4">Your project is ready for production</p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function ScoutAgentWorkspaceDemo() {
  return <ScoutAgentWorkspace />;
}
