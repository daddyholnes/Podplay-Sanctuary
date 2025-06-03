"use client";

import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { 
  Download, 
  Github, 
  Terminal, 
  Mic, 
  Paperclip, 
  CornerDownLeft, 
  X, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Image,
  MessageSquare,
  Code,
  History
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// TransitionPanel Component
interface TransitionPanelProps {
  children: React.ReactNode[];
  className?: string;
  transition?: any;
  activeIndex: number;
  variants?: { enter: any; center: any; exit: any };
  custom?: any;
}

function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  custom,
  ...motionProps
}: TransitionPanelProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence
        initial={false}
        mode="popLayout"
        custom={custom}
      >
        <motion.div
          key={activeIndex}
          variants={variants}
          transition={transition}
          initial="enter"
          animate="center"
          exit="exit"
          custom={custom}
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Loader Component
interface LoaderProps {
  variant?: "terminal" | "text-blink" | "loading-dots";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

function TerminalLoader({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cursorSizes = {
    sm: "h-3 w-1.5",
    md: "h-4 w-2",
    lg: "h-5 w-2.5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const containerSizes = {
    sm: "h-4",
    md: "h-5",
    lg: "h-6",
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-1",
        containerSizes[size],
        className
      )}
    >
      <span className={cn("text-primary font-mono", textSizes[size])}>
        {">"}
      </span>
      <div
        className={cn(
          "bg-primary animate-[blink_1s_step-end_infinite]",
          cursorSizes[size]
        )}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function TextBlinkLoader({
  text = "Thinking",
  className,
  size = "md",
}: {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={cn(
        "animate-[text-blink_2s_ease-in-out_infinite] font-medium",
        textSizes[size],
        className
      )}
    >
      {text}
    </div>
  );
}

function TextDotsLoader({
  className,
  text = "Thinking",
  size = "md",
}: {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={cn("inline-flex items-center", className)}
    >
      <span className={cn("text-primary font-medium", textSizes[size])}>
        {text}
      </span>
      <span className="inline-flex">
        <span className="text-primary animate-[loading-dots_1.4s_infinite_0.2s]">
          .
        </span>
        <span className="text-primary animate-[loading-dots_1.4s_infinite_0.4s]">
          .
        </span>
        <span className="text-primary animate-[loading-dots_1.4s_infinite_0.6s]">
          .
        </span>
      </span>
    </div>
  );
}

function Loader({
  variant = "terminal",
  size = "md",
  text,
  className,
}: LoaderProps) {
  switch (variant) {
    case "terminal":
      return <TerminalLoader size={size} className={className} />;
    case "text-blink":
      return <TextBlinkLoader text={text} size={size} className={className} />;
    case "loading-dots":
      return <TextDotsLoader text={text} size={size} className={className} />;
    default:
      return <TerminalLoader size={size} className={className} />;
  }
}

// Chat Input Component
interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <Textarea
      autoComplete="off"
      ref={ref}
      name="message"
      className={cn(
        "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
        className,
      )}
      {...props}
    />
  ),
);
ChatInput.displayName = "ChatInput";

// Canvas Animation
function renderCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  
  let particles: any[] = [];
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: "rgba(128, 90, 213, 0.5)",
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5
    });
  }
  
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particleCount; i++) {
      let p = particles[i];
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      
      p.x += p.speedX;
      p.y += p.speedY;
      
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    }
    
    // Connect particles with lines
    for (let i = 0; i < particleCount; i++) {
      for (let j = i; j < particleCount; j++) {
        let p1 = particles[i];
        let p2 = particles[j];
        
        let distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(128, 90, 213, ${0.2 - distance/500})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }
  
  animate();
  
  window.addEventListener("resize", () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  });
}

// Main Scout Agent Component
interface ScoutAgentProps {
  userName: string;
}

function ScoutAgent({ userName = "Nathan" }: ScoutAgentProps) {
  const [stage, setStage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<{type: string, content: string}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => {
        setDirection(1);
        setStage(1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);
  
  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setMessages([...messages, {type: 'user', content: inputValue}]);
    
    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'assistant', 
        content: `Processing your request: "${inputValue}"`
      }]);
    }, 1000);
    
    setInputValue("");
    
    if (stage < 3) {
      setTimeout(() => {
        setDirection(1);
        setStage(prev => prev + 1);
      }, 2000);
    }
  };

  const handleNextStage = () => {
    if (stage < 3) {
      setDirection(1);
      setStage(stage + 1);
    }
  };

  const handlePrevStage = () => {
    if (stage > 0) {
      setDirection(-1);
      setStage(stage - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  const STAGES = [
    {
      title: "Welcome",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h1 className="text-4xl font-bold mb-6 text-white">
            Hey {userName}! Got work? Let's jam!
          </h1>
          <p className="text-xl mb-8 text-purple-200">
            Your AI-powered Scout Agent is ready to help you build amazing things.
          </p>
          <Button 
            onClick={handleNextStage}
            size="lg" 
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Get Started
          </Button>
        </div>
      ),
    },
    {
      title: "Orchestration",
      content: (
        <div className="flex flex-col h-full p-8">
          <h2 className="text-3xl font-bold mb-6">Orchestration</h2>
          <p className="text-lg mb-6">
            Let me understand what you're trying to build. I can help you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Plan Your Project</h3>
              <p>Break down complex tasks into manageable steps</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Research Solutions</h3>
              <p>Find the best approaches and technologies</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Generate Code</h3>
              <p>Create working code samples and prototypes</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Debug Issues</h3>
              <p>Identify and fix problems in your code</p>
            </Card>
          </div>
          <div className="flex justify-between mt-auto">
            <Button onClick={handlePrevStage} variant="outline">
              Back
            </Button>
            <Button onClick={handleNextStage}>
              Continue to Workspace
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Workspace",
      content: (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">Scout Agent Workspace</h2>
          </div>
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full flex flex-col">
                <div className="p-2 border-b font-medium flex items-center justify-between">
                  <span>Files</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                      <ChevronRight className="h-4 w-4" />
                      <span>project/</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                      <FileText className="h-4 w-4" />
                      <span>README.md</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                      <Code className="h-4 w-4" />
                      <span>index.js</span>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <div className="border-b p-2">
                  <TabsList>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="terminal">Terminal</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="chat" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p>Start a conversation with your Scout Agent</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
                      <ChatInput
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message here..."
                        className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                      />
                      <div className="flex items-center p-3 pt-0">
                        <Button variant="ghost" size="icon" type="button">
                          <Paperclip className="size-4" />
                          <span className="sr-only">Attach file</span>
                        </Button>
                        <Button variant="ghost" size="icon" type="button">
                          <Mic className="size-4" />
                          <span className="sr-only">Use Microphone</span>
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="ml-auto gap-1.5"
                        >
                          Send Message
                          <CornerDownLeft className="size-3.5" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
                <TabsContent value="terminal" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                  <div className="flex-1 bg-black text-green-400 p-4 font-mono text-sm overflow-auto">
                    <div>$ scout-agent init</div>
                    <div>Initializing Scout Agent environment...</div>
                    <div>Setting up workspace...</div>
                    <div>Ready for commands!</div>
                    <div className="flex items-center mt-2">
                      <span>$</span>
                      <div className="w-2 h-4 bg-green-400 ml-2 animate-pulse"></div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full flex flex-col">
                <div className="p-2 border-b font-medium flex items-center justify-between">
                  <span>Preview</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p className="text-muted-foreground">Preview will appear here</p>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          <div className="p-4 border-t flex justify-between">
            <Button onClick={handlePrevStage} variant="outline">
              Back
            </Button>
            <Button onClick={handleNextStage}>
              Continue to Production
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Production",
      content: (
        <div className="flex flex-col h-full p-8">
          <h2 className="text-3xl font-bold mb-6">Production Ready</h2>
          <p className="text-lg mb-6">
            Your project is ready for deployment. Here are your options:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Download className="h-8 w-8" />
                <h3 className="text-xl font-semibold">Download Files</h3>
              </div>
              <p className="mb-4">Get all your project files in a zip archive</p>
              <Button className="w-full">Download Project</Button>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Github className="h-8 w-8" />
                <h3 className="text-xl font-semibold">Push to GitHub</h3>
              </div>
              <p className="mb-4">Create a new repository with your project</p>
              <Button className="w-full">Connect GitHub</Button>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="h-8 w-8" />
                <h3 className="text-xl font-semibold">Deploy Commands</h3>
              </div>
              <p className="mb-4">Get deployment instructions for your platform</p>
              <Button className="w-full">View Commands</Button>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <History className="h-8 w-8" />
                <h3 className="text-xl font-semibold">Project Timeline</h3>
              </div>
              <p className="mb-4">View the complete history of your project</p>
              <Button className="w-full">View Timeline</Button>
            </Card>
          </div>
          <div className="flex justify-between mt-auto">
            <Button onClick={handlePrevStage} variant="outline">
              Back to Workspace
            </Button>
            <Button onClick={() => setStage(0)}>
              Start New Project
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className={`flex-1 ${stage === 0 ? 'bg-purple-900' : 'bg-background'} relative overflow-hidden`}>
        <canvas
          ref={canvasRef}
          id="canvas"
          className="absolute inset-0 pointer-events-none"
        ></canvas>
        
        <TransitionPanel
          activeIndex={stage}
          variants={variants}
          transition={transition}
          custom={direction}
        >
          {STAGES.map((s, i) => (
            <div key={i} className="h-full">
              {s.content}
            </div>
          ))}
        </TransitionPanel>
      </div>
      
      {stage > 0 && (
        <div className="border-t p-2 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <Loader variant="terminal" size="sm" />
            <span className="text-sm font-medium">Scout Agent</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {STAGES[stage].title} Stage
            </span>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-1">
              {STAGES.map((_, i) => (
                <div 
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === stage ? 'bg-primary' : 'bg-muted'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScoutAgentWorkspace() {
  return <ScoutAgent userName="Nathan" />;
}
