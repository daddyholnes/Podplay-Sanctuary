/**
 * Composite Selectors
 * 
 * Complex selectors that combine data from multiple slices
 * for advanced UI state and business logic
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// ============================================================================
// Cross-Slice Selectors
// ============================================================================

/**
 * Application Health - combines connection status, errors, and performance
 */
export const selectApplicationHealth = createSelector(
  [(state: RootState) => state.ui.loadingStates,
   (state: RootState) => state.chat.connectionStatus,
   (state: RootState) => state.workspace.connectionStatus,
   (state: RootState) => state.scout.isAnalyzing,
   (state: RootState) => state.mcp.servers],
  (loadingStates, chatConnection, workspaceConnection, scoutAnalyzing, mcpServers) => {
    const totalLoading = Object.keys(loadingStates).length;
    const mcpConnected = Object.values(mcpServers).filter(s => s.status === 'connected').length;
    const mcpTotal = Object.values(mcpServers).length;
    
    const healthScore = [
      chatConnection.status === 'connected' ? 25 : 0,
      workspaceConnection === 'connected' ? 25 : 0,
      totalLoading === 0 ? 25 : Math.max(0, 25 - totalLoading * 5),
      mcpTotal > 0 ? (mcpConnected / mcpTotal) * 25 : 25,
    ].reduce((sum, score) => sum + score, 0);

    return {
      score: Math.round(healthScore),
      status: healthScore >= 80 ? 'excellent' : 
              healthScore >= 60 ? 'good' :
              healthScore >= 40 ? 'fair' : 'poor',
      issues: {
        chatDisconnected: chatConnection.status !== 'connected',
        workspaceDisconnected: workspaceConnection !== 'connected',
        heavyLoading: totalLoading > 3,
        mcpIssues: mcpConnected < mcpTotal,
        analyzing: scoutAnalyzing,
      },
      activeConnections: {
        chat: chatConnection.status === 'connected',
        workspace: workspaceConnection === 'connected',
        mcp: `${mcpConnected}/${mcpTotal}`,
      },
    };
  }
);

/**
 * Smart Suggestions - AI-powered suggestions based on current context
 */
export const selectSmartSuggestions = createSelector(
  [(state: RootState) => state.chat.activeConversation,
   (state: RootState) => state.workspace.currentFile,
   (state: RootState) => state.scout.insights,
   (state: RootState) => state.mcp.availableTools,
   (state: RootState) => state.ui.commandPalette.recentCommands],
  (activeConversation, currentFile, insights, mcpTools, recentCommands) => {
    const suggestions = [];

    // File-based suggestions
    if (currentFile) {
      if (currentFile.language === 'typescript' || currentFile.language === 'javascript') {
        suggestions.push({
          id: 'analyze_code',
          type: 'analysis',
          title: 'Analyze Code Quality',
          description: 'Run Scout analysis on current file',
          action: 'scout/analyzeFile',
          priority: 'medium',
          icon: '🔍',
        });
      }

      if (currentFile.hasChanges) {
        suggestions.push({
          id: 'save_file',
          type: 'action',
          title: 'Save Changes',
          description: 'Save unsaved changes',
          action: 'workspace/saveFile',
          priority: 'high',
          icon: '💾',
        });
      }
    }

    // Chat-based suggestions
    if (activeConversation && activeConversation.messages.length > 0) {
      const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
      
      if (lastMessage.role === 'assistant' && lastMessage.metadata?.codeGenerated) {
        suggestions.push({
          id: 'apply_code',
          type: 'action',
          title: 'Apply Generated Code',
          description: 'Apply the AI-generated code to your project',
          action: 'chat/applyCode',
          priority: 'high',
          icon: '✨',
        });
      }

      if (lastMessage.content.includes('error') || lastMessage.content.includes('bug')) {
        suggestions.push({
          id: 'debug_assistance',
          type: 'ai',
          title: 'Debug Assistance',
          description: 'Get AI help with debugging',
          action: 'chat/startDebugging',
          priority: 'medium',
          icon: '🐛',
        });
      }
    }

    // Insight-based suggestions
    insights.forEach(insight => {
      if (insight.category === 'performance' && insight.severity === 'high') {
        suggestions.push({
          id: `fix_${insight.id}`,
          type: 'optimization',
          title: 'Fix Performance Issue',
          description: insight.title,
          action: 'scout/applyFix',
          params: { insightId: insight.id },
          priority: 'high',
          icon: '⚡',
        });
      }

      if (insight.category === 'security' && insight.autoFixAvailable) {
        suggestions.push({
          id: `security_fix_${insight.id}`,
          type: 'security',
          title: 'Apply Security Fix',
          description: insight.title,
          action: 'scout/applySecurityFix',
          params: { insightId: insight.id },
          priority: 'high',
          icon: '🔒',
        });
      }
    });

    // MCP tool suggestions
    if (mcpTools.length > 0 && currentFile) {
      const relevantTools = mcpTools.filter(tool => 
        tool.name.includes(currentFile.language) ||
        tool.description.toLowerCase().includes(currentFile.language.toLowerCase())
      );

      relevantTools.slice(0, 2).forEach(tool => {
        suggestions.push({
          id: `mcp_${tool.name}`,
          type: 'tool',
          title: `Use ${tool.name}`,
          description: tool.description,
          action: 'mcp/invokeTool',
          params: { toolName: tool.name },
          priority: 'low',
          icon: '🔧',
        });
      });
    }

    // Recent command suggestions
    const topCommands = recentCommands.slice(0, 3);
    topCommands.forEach(command => {
      suggestions.push({
        id: `recent_${command}`,
        type: 'command',
        title: 'Repeat Command',
        description: command,
        action: 'ui/executeCommand',
        params: { command },
        priority: 'low',
        icon: '🔄',
      });
    });

    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 8); // Limit to top 8 suggestions
  }
);

/**
 * Project Overview - comprehensive project status
 */
export const selectProjectOverview = createSelector(
  [(state: RootState) => state.workspace.fileTree,
   (state: RootState) => state.workspace.recentFiles,
   (state: RootState) => state.scout.insights,
   (state: RootState) => state.chat.conversations,
   (state: RootState) => state.mcp.servers],
  (fileTree, recentFiles, insights, conversations, mcpServers) => {
    const totalFiles = Object.keys(fileTree.nodes).length;
    const totalInsights = insights.length;
    const criticalIssues = insights.filter(i => i.severity === 'high').length;
    const activeConversations = Object.values(conversations).filter(c => c.isActive).length;
    const connectedServers = Object.values(mcpServers).filter(s => s.status === 'connected').length;

    // Calculate project health
    const healthFactors = {
      codeQuality: Math.max(0, 100 - (criticalIssues * 10)),
      activity: Math.min(100, recentFiles.length * 5),
      ai: activeConversations > 0 ? 100 : 50,
      tools: mcpServers ? (connectedServers / Object.keys(mcpServers).length) * 100 : 0,
    };

    const overallHealth = Object.values(healthFactors).reduce((sum, factor) => sum + factor, 0) / 4;

    return {
      stats: {
        totalFiles,
        totalInsights,
        criticalIssues,
        activeConversations,
        connectedServers: `${connectedServers}/${Object.keys(mcpServers).length}`,
      },
      health: {
        overall: Math.round(overallHealth),
        factors: healthFactors,
        status: overallHealth >= 80 ? 'excellent' :
                overallHealth >= 60 ? 'good' :
                overallHealth >= 40 ? 'needs_attention' : 'critical',
      },
      recentActivity: recentFiles.slice(0, 5),
      topIssues: insights
        .filter(i => i.severity === 'high')
        .slice(0, 3)
        .map(i => ({ id: i.id, title: i.title, category: i.category })),
    };
  }
);

/**
 * Contextual Actions - actions available based on current state
 */
export const selectContextualActions = createSelector(
  [(state: RootState) => state.workspace.currentFile,
   (state: RootState) => state.workspace.selectedFiles,
   (state: RootState) => state.chat.activeConversation,
   (state: RootState) => state.scout.selectedInsight,
   (state: RootState) => state.ui.quickActions.context],
  (currentFile, selectedFiles, activeConversation, selectedInsight, context) => {
    const actions = [];

    // File actions
    if (currentFile) {
      actions.push(
        {
          id: 'save_file',
          label: 'Save File',
          icon: '💾',
          shortcut: 'Ctrl+S',
          category: 'File',
          action: 'workspace/saveFile',
          disabled: !currentFile.hasChanges,
        },
        {
          id: 'format_file',
          label: 'Format Document',
          icon: '📐',
          shortcut: 'Shift+Alt+F',
          category: 'Edit',
          action: 'workspace/formatFile',
        },
        {
          id: 'analyze_file',
          label: 'Analyze with Scout',
          icon: '🔍',
          category: 'Analysis',
          action: 'scout/analyzeFile',
          params: { fileId: currentFile.id },
        }
      );

      if (currentFile.language === 'typescript' || currentFile.language === 'javascript') {
        actions.push({
          id: 'run_file',
          label: 'Run File',
          icon: '▶️',
          shortcut: 'F5',
          category: 'Debug',
          action: 'workspace/runFile',
        });
      }
    }

    // Multi-selection actions
    if (selectedFiles.length > 1) {
      actions.push(
        {
          id: 'bulk_format',
          label: 'Format Selected Files',
          icon: '📐',
          category: 'Edit',
          action: 'workspace/formatFiles',
          params: { files: selectedFiles },
        },
        {
          id: 'bulk_analyze',
          label: 'Analyze Selected Files',
          icon: '🔍',
          category: 'Analysis',
          action: 'scout/analyzeFiles',
          params: { files: selectedFiles },
        }
      );
    }

    // Chat actions
    if (activeConversation) {
      actions.push(
        {
          id: 'new_message',
          label: 'New Message',
          icon: '💬',
          shortcut: 'Ctrl+/',
          category: 'Chat',
          action: 'chat/focusInput',
        },
        {
          id: 'clear_conversation',
          label: 'Clear Conversation',
          icon: '🗑️',
          category: 'Chat',
          action: 'chat/clearConversation',
          params: { conversationId: activeConversation.id },
        }
      );

      if (activeConversation.messages.length > 0) {
        actions.push({
          id: 'export_conversation',
          label: 'Export Conversation',
          icon: '📤',
          category: 'Chat',
          action: 'chat/exportConversation',
          params: { conversationId: activeConversation.id },
        });
      }
    }

    // Scout insight actions
    if (selectedInsight) {
      actions.push({
        id: 'apply_fix',
        label: 'Apply Fix',
        icon: '🔧',
        category: 'Fix',
        action: 'scout/applyFix',
        params: { insightId: selectedInsight.id },
        disabled: !selectedInsight.autoFixAvailable,
      });

      if (selectedInsight.documentation) {
        actions.push({
          id: 'view_docs',
          label: 'View Documentation',
          icon: '📚',
          category: 'Help',
          action: 'scout/viewDocumentation',
          params: { insightId: selectedInsight.id },
        });
      }
    }

    // Context-specific actions
    if (context === 'code_editor') {
      actions.push(
        {
          id: 'ask_ai',
          label: 'Ask AI about this code',
          icon: '🤖',
          shortcut: 'Ctrl+Shift+A',
          category: 'AI',
          action: 'chat/askAboutCode',
        },
        {
          id: 'explain_code',
          label: 'Explain Code',
          icon: '💡',
          category: 'AI',
          action: 'chat/explainCode',
        }
      );
    }

    return actions.sort((a, b) => a.category.localeCompare(b.category));
  }
);

/**
 * Real-time Activity Feed
 */
export const selectActivityFeed = createSelector(
  [(state: RootState) => state.chat.messages,
   (state: RootState) => state.workspace.fileHistory,
   (state: RootState) => state.scout.analysisHistory,
   (state: RootState) => state.mcp.executionHistory,
   (state: RootState) => state.ui.notifications],
  (chatMessages, fileHistory, analysisHistory, mcpHistory, notifications) => {
    const activities = [];

    // Recent chat messages
    Object.values(chatMessages)
      .flat()
      .slice(-10)
      .forEach(message => {
        activities.push({
          id: `chat_${message.id}`,
          type: 'chat',
          timestamp: message.timestamp,
          title: message.role === 'user' ? 'User Message' : 'AI Response',
          description: message.content.slice(0, 100) + (message.content.length > 100 ? '...' : ''),
          icon: message.role === 'user' ? '👤' : '🤖',
          metadata: { messageId: message.id },
        });
      });

    // File operations
    fileHistory.slice(-10).forEach(operation => {
      activities.push({
        id: `file_${operation.id}`,
        type: 'file',
        timestamp: operation.timestamp,
        title: `File ${operation.operation}`,
        description: operation.path,
        icon: operation.operation === 'created' ? '📄' : 
              operation.operation === 'modified' ? '✏️' : 
              operation.operation === 'deleted' ? '🗑️' : '📁',
        metadata: { operation },
      });
    });

    // Scout analyses
    analysisHistory.slice(-5).forEach(analysis => {
      activities.push({
        id: `analysis_${analysis.id}`,
        type: 'analysis',
        timestamp: analysis.completedAt,
        title: 'Code Analysis Complete',
        description: `Found ${analysis.insights.length} insights`,
        icon: '🔍',
        metadata: { analysisId: analysis.id },
      });
    });

    // MCP executions
    mcpHistory.slice(-5).forEach(execution => {
      activities.push({
        id: `mcp_${execution.id}`,
        type: 'tool',
        timestamp: execution.timestamp,
        title: `Tool: ${execution.toolName}`,
        description: execution.result ? 'Completed successfully' : 'Failed',
        icon: execution.result ? '🔧' : '❌',
        metadata: { executionId: execution.id },
      });
    });

    // Recent notifications
    notifications.slice(-5).forEach(notification => {
      activities.push({
        id: `notif_${notification.id}`,
        type: 'notification',
        timestamp: notification.timestamp,
        title: notification.title,
        description: notification.message,
        icon: notification.type === 'success' ? '✅' :
              notification.type === 'error' ? '❌' :
              notification.type === 'warning' ? '⚠️' : 'ℹ️',
        metadata: { notificationId: notification.id },
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Last 20 activities
  }
);

/**
 * Performance Metrics Summary
 */
export const selectPerformanceMetrics = createSelector(
  [(state: RootState) => state.ui.loadingStates,
   (state: RootState) => state.chat.responseTime,
   (state: RootState) => state.workspace.operationTimes,
   (state: RootState) => state.scout.analysisTime,
   (state: RootState) => state.mcp.executionTimes],
  (loadingStates, chatResponseTime, workspaceOperationTimes, scoutAnalysisTime, mcpExecutionTimes) => {
    const metrics = {
      activeOperations: Object.keys(loadingStates).length,
      averageResponseTime: {
        chat: chatResponseTime.average,
        workspace: workspaceOperationTimes.average,
        scout: scoutAnalysisTime.average,
        mcp: mcpExecutionTimes.average,
      },
      slowestOperations: [
        { type: 'chat', time: chatResponseTime.slowest?.time, operation: 'AI Response' },
        { type: 'workspace', time: workspaceOperationTimes.slowest?.time, operation: workspaceOperationTimes.slowest?.operation },
        { type: 'scout', time: scoutAnalysisTime.slowest?.time, operation: 'Code Analysis' },
        { type: 'mcp', time: mcpExecutionTimes.slowest?.time, operation: mcpExecutionTimes.slowest?.tool },
      ]
        .filter(op => op.time)
        .sort((a, b) => b.time - a.time)
        .slice(0, 5),
      systemHealth: {
        status: Object.keys(loadingStates).length > 5 ? 'busy' :
                Object.keys(loadingStates).length > 2 ? 'moderate' : 'idle',
        load: Math.min(100, Object.keys(loadingStates).length * 20),
      },
    };

    return metrics;
  }
);

/**
 * Search and Filter State
 */
export const selectSearchState = createSelector(
  [(state: RootState) => state.workspace.searchQuery,
   (state: RootState) => state.workspace.searchResults,
   (state: RootState) => state.chat.searchQuery,
   (state: RootState) => state.scout.filterCriteria,
   (state: RootState) => state.ui.commandPalette.query],
  (workspaceQuery, workspaceResults, chatQuery, scoutFilters, commandQuery) => {
    return {
      active: Boolean(workspaceQuery || chatQuery || commandQuery || scoutFilters.query),
      workspace: {
        query: workspaceQuery,
        resultCount: workspaceResults.length,
        hasResults: workspaceResults.length > 0,
      },
      chat: {
        query: chatQuery,
        hasQuery: Boolean(chatQuery),
      },
      scout: {
        filters: scoutFilters,
        hasFilters: Boolean(scoutFilters.query || scoutFilters.category || scoutFilters.severity),
      },
      commands: {
        query: commandQuery,
        hasQuery: Boolean(commandQuery),
      },
    };
  }
);

/**
 * Feature Availability - what features are available based on current state
 */
export const selectFeatureAvailability = createSelector(
  [(state: RootState) => state.ui.features,
   (state: RootState) => state.chat.connectionStatus,
   (state: RootState) => state.workspace.connectionStatus,
   (state: RootState) => state.mcp.servers,
   (state: RootState) => state.ui.viewport],
  (features, chatConnection, workspaceConnection, mcpServers, viewport) => {
    const availability = {
      chat: features.aiAssistant && chatConnection.status === 'connected',
      codeAnalysis: features.codeAnalysis && workspaceConnection === 'connected',
      realTimeSync: features.realTimeSync && workspaceConnection === 'connected',
      voiceCommands: features.voiceCommands && 'speechRecognition' in window,
      mcpTools: Object.values(mcpServers).some(s => s.status === 'connected'),
      mobileOptimized: viewport.isMobile,
      offlineMode: !navigator.onLine,
      notifications: 'Notification' in window && Notification.permission === 'granted',
      fileSystem: 'showOpenFilePicker' in window,
      clipboard: 'clipboard' in navigator,
    };

    return {
      ...availability,
      overall: Object.values(availability).filter(Boolean).length / Object.keys(availability).length,
    };
  }
);
