import React, { lazy, Suspense } from 'react';
import { WindowDefinition, AgentProps } from './types';
import LoadingWindow from './LoadingWindow';

// Lazy load components to improve initial load time
const MamaBearChatWindow = lazy(() => import('../mama-bear-agents/MamaBearChatWindow'));
const ScoutChatWindow = lazy(() => import('../scout-agents/ScoutChatWindow'));
const CodeBuildWindow = lazy(() => import('../code-build/CodeBuildWindow'));
const MCPWindow = lazy(() => import('../mcp/MCPWindow'));
const MamaBearIntegrationWorkbench = lazy(() => import('../mama-bear-agents/MamaBearIntegrationWorkbench'));

// Register all window types here
export const WindowRegistry: Record<string, WindowDefinition> = {
  'mama-bear-chat': {
    title: 'Mama Bear',
    component: (props: AgentProps) => (
      <Suspense fallback={<LoadingWindow title="Loading Mama Bear..." />}>
        <MamaBearChatWindow {...props} />
      </Suspense>
    ),
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 300, height: 300 },
    icon: 'mama-bear',
    category: 'agent',
  },
  'scout-chat': {
    title: 'Scout',
    component: (props: AgentProps) => (
      <Suspense fallback={<LoadingWindow title="Loading Scout..." />}>
        <ScoutChatWindow {...props} />
      </Suspense>
    ),
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 300, height: 300 },
    icon: 'scout',
    category: 'agent',
  },
  'code-build': {
    title: 'Code Build',
    component: (props: AgentProps) => (
      <Suspense fallback={<LoadingWindow title="Loading Code Build..." />}>
        <CodeBuildWindow {...props} />
      </Suspense>
    ),
    defaultSize: { width: 900, height: 650 },
    minSize: { width: 400, height: 400 },
    icon: 'code',
    category: 'development',
  },
  'mcp': {
    title: 'MCP',
    component: (props: AgentProps) => (
      <Suspense fallback={<LoadingWindow title="Loading MCP..." />}>
        <MCPWindow {...props} />
      </Suspense>
    ),
    defaultSize: { width: 850, height: 600 },
    minSize: { width: 400, height: 400 },
    icon: 'mcp',
    category: 'system',
  },
  'integration-workbench': {
    title: 'Integration Workbench',
    component: (props: AgentProps) => (
      <Suspense fallback={<LoadingWindow title="Loading Integration Workbench..." />}>
        <MamaBearIntegrationWorkbench {...props} />
      </Suspense>
    ),
    defaultSize: { width: 1000, height: 700 },
    minSize: { width: 500, height: 500 },
    icon: 'zap',
    category: 'agent',
  },
};
