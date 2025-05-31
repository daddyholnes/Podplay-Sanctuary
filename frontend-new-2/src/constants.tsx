
import React from 'react';
import { NavItem, ViewType, MiniApp } from './types';

// Heroicon SVGs (outline style)
const ChatBubbleLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RectangleGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 3.75H6.75a2.25 2.25 0 00-2.25 2.25v1.5M9.25 3.75h1.5M9.25 3.75V2.25m1.5 1.5H15a2.25 2.25 0 012.25 2.25v1.5M15 3.75V2.25m0 1.5H18a2.25 2.25 0 012.25 2.25v1.5M6 12c0 .621.504 1.125 1.125 1.125H9.75V9.75H7.125C6.504 9.75 6 10.379 6 11.25v.75c0 .621.504 1.125 1.125 1.125H9.75m0 0v3.75m0-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3.75m0 0H16.5M12 9.75v3.75m0 0c0 .621-.504 1.125-1.125 1.125H7.125m8.625-3.375c.621 0 1.125.504 1.125 1.125v3.75m0 0H19.5m-1.5-3.375c.621 0 1.125.504 1.125 1.125v3.75m0 0c0 .621-.504 1.125-1.125 1.125H15m0 0V9.75m5.25 3.375c0 .621-.504 1.125-1.125 1.125H15m2.625 0V12m2.25 0h.375m-.375 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H3.75A2.25 2.25 0 011.5 15V7.5A2.25 2.25 0 013.75 5.25h16.5A2.25 2.25 0 0122.5 7.5v1.5" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93L15.6 7.21c.478.207.88.572 1.146.94l.501.727c.329.475.329 1.09 0 1.566l-.501.727c-.266.368-.668.733-1.146.94l-1.007.433c-.396.166-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894a1.873 1.873 0 01-.78-.93l-1.007-.433c-.478-.207-.88-.572-1.146-.94l-.501-.727c-.329-.475-.329-1.09 0-1.566l.501-.727c.266-.368.668-.733-1.146-.94l1.007-.433c.396-.166.71-.506.78.93l.149.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 003.09 3.09L25.5 12l-2.846.813a4.5 4.5 0 00-3.09 3.09L18.25 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L11.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L18.25 7.5z" />
    </svg>
);

export const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.597.484-1.087 1.087-1.087h.001c.597 0 1.087.484 1.087 1.087v5.582c0 .597-.484 1.087-1.087 1.087h-.001c-.597 0-1.087-.484-1.087-1.087V6.087zM4.687 21.094A2.25 2.25 0 012.437 18.844V6.087c0-1.236.99-2.23 2.23-2.23h9.666c1.236 0 2.23.99 2.23 2.23v12.757a2.25 2.25 0 01-2.25 2.25H4.687zM8.25 12h7.5" />
  </svg>
);

export const ClaudeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  // Simple "C" placeholder for Claude
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18.36 6.64A9 9 0 1 1 5.64 18.36M18.36 6.64A9 9 0 1 0 5.64 18.36"/>
    <path d="M12 6v12M12 12h-4a4 4 0 0 1 0-8h4"/>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12px" fill="currentColor" stroke="none" dy=".1em">C</text>
  </svg>
);

export const JulepIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  // Simple "J" placeholder for Julep
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
     <path d="M12 22V12"/> <path d="M12 12C12 8.68629 9.31371 6 6 6"/>
     <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12px" fill="currentColor" stroke="none" dy=".1em">J</text>
  </svg>
);

// Generic App Icon (if specific icon is not available)
export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);


export const NAVIGATION_ITEMS: NavItem[] = [
  { id: ViewType.MamaBearChat, label: 'Mama Bear', icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5" /> },
  { id: ViewType.UnifiedDevelopmentHub, label: 'Unified Dev Hub', icon: <RectangleGroupIcon className="w-5 h-5" /> },
  { id: ViewType.ScoutAgentWorkspace, label: 'Scout Agent', icon: <MagnifyingGlassIcon className="w-5 h-5" /> },
  { id: ViewType.MiniAppsLauncher, label: 'Mini Apps', icon: <SparklesIcon className="w-5 h-5" /> },
  { id: ViewType.MamaBearControlCenter, label: 'Control Center', icon: <CogIcon className="w-5 h-5" /> },
];

export const APP_TITLE = "Podplay Build Sanctuary";
export const MAMA_BEAR_AVATAR = "🐻"; // Simple emoji avatar
export const USER_AVATAR = "🧑‍💻"; // Simple emoji avatar

export const INITIAL_GREETING_TEXT = "Hey Nathan! Got work? Let's jam! I'm Mama Bear, your lead developer agent. How can I help you today?";


export const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const FaceSmileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9V9.75zm6 0h.008v.008H15V9.75z" />
  </svg>
);


export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

export const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

export const CommandLineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75V17.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);


export const MINI_APPS_DATA: MiniApp[] = [
  // AI & Research Tools
  {
    id: 'perplexity', name: 'Perplexity AI', url: 'https://www.perplexity.ai', category: 'ai',
    description: 'AI-powered research and conversational search.', icon: <MagnifyingGlassIcon className="w-6 h-6" />, featured: true
  },
  {
    id: 'notebooklm', name: 'NotebookLM', url: 'https://notebooklm.google.com', category: 'google',
    description: 'Google AI-powered notebook and research assistant.', icon: <CubeIcon className="w-6 h-6" /> , featured: true // Using Cube as placeholder Google icon
  },
  {
    id: 'gemini-app', name: 'Gemini App', url: 'https://gemini.google.com/app', category: 'google',
    description: 'Google Gemini advanced research capabilities.', icon: <SparklesIcon className="w-6 h-6" />, featured: true
  },
  {
    id: 'claude', name: 'Claude.ai', url: 'https://claude.ai', category: 'ai',
    description: 'Anthropic Claude AI assistant for various tasks.', icon: <ClaudeIcon className="w-6 h-6" />, featured: true
  },
  {
    id: 'julep', name: 'Julep (Google)', url: 'https://julep.google.com', category: 'google', // Assuming this is the intended URL
    description: 'Google Julep (AI Storytelling or other internal tool).', icon: <JulepIcon className="w-6 h-6" />, featured: true
  },
  {
    id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', category: 'ai',
    description: 'OpenAI ChatGPT interface for text generation.', icon: <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
  },
  // Coding & Development
  {
    id: 'vscode-web', name: 'VS Code Web', url: 'https://vscode.dev', category: 'coding',
    description: 'Visual Studio Code directly in your browser.', icon: <CodeBracketIcon className="w-6 h-6" />, featured: true
  },
  {
    id: 'github', name: 'GitHub', url: 'https://github.com', category: 'coding',
    description: 'Code repositories, version control, and collaboration.', icon: <CubeIcon className="w-6 h-6" /> // Placeholder, ideally a GitHub Octocat icon
  },
  {
    id: 'replit', name: 'Replit', url: 'https://replit.com', category: 'coding',
    description: 'Online IDE and collaborative development environment.', icon: <CodeBracketIcon className="w-6 h-6" />
  },
  // Productivity
  {
    id: 'notion', name: 'Notion', url: 'https://notion.so', category: 'productivity',
    description: 'All-in-one workspace for notes, projects, and wikis.', icon: <DocumentIcon className="w-6 h-6" />
  },
  {
    id: 'figma', name: 'Figma', url: 'https://figma.com', category: 'productivity',
    description: 'Collaborative interface design tool.', icon: <EyeIcon className="w-6 h-6" /> // Placeholder
  },
  // Utilities
  {
    id: 'excalidraw', name: 'Excalidraw', url: 'https://excalidraw.com', category: 'utilities',
    description: 'Virtual collaborative whiteboard for sketching diagrams.', icon: <CubeIcon className="w-6 h-6" /> // Placeholder
  },
];
