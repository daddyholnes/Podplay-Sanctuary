"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, Variant, Transition } from "framer-motion";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { FileText, Github, Download, Terminal, History, X, MessageSquare, FileCode, Eye, ChevronRight } from "lucide-react";

// Types
interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

interface UIMessage {
  id: string;
  content: string;
  role: string;
  attachments?: Attachment[];
}

type VisibilityType = 'public' | 'private' | 'unlisted' | string;

interface TransitionPanelProps {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
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

// MultimodalInput Component
function MultimodalInput({
  onSendMessage,
  onStopGenerating,
  isGenerating,
}: {
  onSendMessage: (params: { input: string; attachments: Attachment[] }) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
}) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (input.trim() || attachments.length > 0) {
      onSendMessage({ input, attachments });
      setInput("");
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        contentType: file.type,
        size: file.size
      }));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="relative w-full rounded-lg border border-border bg-background p-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              <div className="flex items-center gap-2 rounded-md bg-muted p-2 pr-8">
                <FileText className="h-4 w-4" />
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(index)}
                  className="absolute right-2 top-2 rounded-full bg-background p-1 opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-md hover:bg-muted"
        >
          <FileText className="h-5 w-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 resize-none border-0 bg-transparent p-2 focus:outline-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        
        <button
          onClick={isGenerating ? onStopGenerating : handleSendMessage}
          disabled={(!input.trim() && attachments.length === 0) && !isGenerating}
          className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader variant="dots" size="sm" className="text-primary-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </div>
  );
}

// Main Scout Agent Component
function ScoutAgent() {
  const [activeStage, setActiveStage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);

  const stages = [
    {
      id: "welcome",
      title: "Welcome",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-violet-400 to-indigo-600 bg-clip-text text-transparent mb-4"
          >
            Hey Nathan! Got work? Let's jam!
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Your AI-powered coding assistant is ready to help
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setActiveStage(1)}
          >
            Let's Get Started
          </motion.button>
        </div>
      )
    },
    {
      id: "orchestration",
      title: "Orchestration",
      content: (
        <div className="flex flex-col h-full p-6">
          <h2 className="text-2xl font-semibold mb-4">Project Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
              <h3 className="font-medium mb-2">New Project</h3>
              <p className="text-sm text-muted-foreground">Start from scratch with a new codebase</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
              <h3 className="font-medium mb-2">GitHub Repository</h3>
              <p className="text-sm text-muted-foreground">Connect to an existing repository</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
              <h3 className="font-medium mb-2">Local Files</h3>
              <p className="text-sm text-muted-foreground">Upload files from your computer</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
              <h3 className="font-medium mb-2">Templates</h3>
              <p className="text-sm text-muted-foreground">Start with pre-built project templates</p>
            </div>
          </div>
          <div className="mt-auto flex justify-between">
            <button 
              className="px-4 py-2 rounded-md border border-border hover:bg-muted"
              onClick={() => setActiveStage(0)}
            >
              Back
            </button>
            <button 
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setActiveStage(2)}
            >
              Continue
            </button>
          </div>
        </div>
      )
    },
    {
      id: "workspace",
      title: "Workspace",
      content: (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="h-full border-r border-border p-2">
              <div className="flex items-center justify-between mb-4 p-2">
                <h3 className="font-medium">Files</h3>
                <button className="p-1 rounded-md hover:bg-muted">
                  <FileCode className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                {['index.tsx', 'styles.css', 'utils.ts', 'components/'].map((file, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                    {file.endsWith('/') ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="text-sm">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <div className="h-full p-4 overflow-auto">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-muted ml-8' : 'bg-primary/10 mr-8'}`}>
                        {msg.content}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <MultimodalInput 
                      onSendMessage={({ input, attachments }) => {
                        setIsGenerating(true);
                        setMessages([...messages, { id: Date.now().toString(), content: input, role: 'user' }]);
                        
                        // Simulate response
                        setTimeout(() => {
                          setMessages(prev => [...prev, { 
                            id: Date.now().toString(), 
                            content: "I've analyzed your request. Let me help you implement that feature.", 
                            role: 'assistant' 
                          }]);
                          setIsGenerating(false);
                        }, 2000);
                      }}
                      onStopGenerating={() => setIsGenerating(false)}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30}>
                <div className="h-full border-t border-border">
                  <div className="flex items-center justify-between p-2 border-b border-border">
                    <h3 className="font-medium">Terminal</h3>
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="p-2 font-mono text-sm text-muted-foreground">
                    <p>$ npm install</p>
                    <p>$ npm run dev</p>
                    <p className="text-green-500">Ready on http://localhost:3000</p>
                    <p>$ _</p>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="h-full border-l border-border p-2">
              <div className="flex items-center justify-between mb-4 p-2">
                <h3 className="font-medium">Preview</h3>
                <button className="p-1 rounded-md hover:bg-muted">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-md border border-border h-[calc(100%-60px)] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Preview will appear here</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )
    },
    {
      id: "production",
      title: "Production",
      content: (
        <div className="flex flex-col h-full p-6">
          <h2 className="text-2xl font-semibold mb-4">Ready for Production</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Download Files</h3>
                <p className="text-sm text-muted-foreground">Get your code as a ZIP archive</p>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors flex items-center gap-3">
              <Github className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Push to GitHub</h3>
                <p className="text-sm text-muted-foreground">Commit changes to your repository</p>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors flex items-center gap-3">
              <Terminal className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">Deploy</h3>
                <p className="text-sm text-muted-foreground">Deploy to Vercel, Netlify or others</p>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors flex items-center gap-3">
              <History className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-medium">Timeline History</h3>
                <p className="text-sm text-muted-foreground">View all changes and revisions</p>
              </div>
            </div>
          </div>
          <div className="mt-auto flex justify-between">
            <button 
              className="px-4 py-2 rounded-md border border-border hover:bg-muted"
              onClick={() => setActiveStage(2)}
            >
              Back to Workspace
            </button>
            <button 
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setActiveStage(0)}
            >
              Start New Project
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold">Scout Agent</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-muted">
              <Github className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-muted">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="w-48 border-r border-border p-4 hidden md:block">
            <nav className="space-y-2">
              {stages.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(index)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeStage === index 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  {stage.title}
                </button>
              ))}
            </nav>
          </div>
          
          <main className="flex-1 overflow-hidden">
            <TransitionPanel
              activeIndex={activeStage}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              variants={{
                enter: { opacity: 0, x: 20 },
                center: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -20 },
              }}
            >
              {stages.map((stage) => (
                <div key={stage.id} className="h-full">
                  {stage.content}
                </div>
              ))}
            </TransitionPanel>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ScoutAgentPage() {
  return <ScoutAgent />;
}
