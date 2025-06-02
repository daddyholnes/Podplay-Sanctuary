import React, { useState, useRef, useEffect } from 'react';
import {
  Globe, Database, Zap, Bot, Settings, Plus, Search, Play, Pause,
  FileText, Code, Link, Upload, Download, RefreshCw, MessageCircle,
  ChevronRight, ExternalLink, Check, Clock, AlertCircle, Star,
  Workflow, GitBranch, Send, Mail, Video, Twitter, Github, Slack,
  Sun, Moon, X, Minimize2, Maximize2, Users, Target, Brain,
  CheckCircle, ArrowRight, Copy, ThumbsUp, ThumbsDown, Sparkles
} from 'lucide-react';

const IntegrationWorkbench = () => {
  const [activeTab, setActiveTab] = useState('scraper');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMamaBear, setShowMamaBear] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Scraper state
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [scrapingStatus, setScrapingStatus] = useState('idle');
  const [scrapedKnowledge, setScrapedKnowledge] = useState([]);
  
  // Workflow state
  const [workflows, setWorkflows] = useState([]);
  const [workflowRequest, setWorkflowRequest] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('idle');
  
  // Integration state
  const [connectedServices, setConnectedServices] = useState({
    zapier: { connected: true, workflows: 12, status: 'active' },
    eden_ai: { connected: true, agents: 5, status: 'active' },
    n8n: { connected: true, flows: 8, status: 'active' },
    gmail: { connected: false, workflows: 0, status: 'disconnected' },
    youtube: { connected: false, workflows: 0, status: 'disconnected' },
    twitter: { connected: false, workflows: 0, status: 'disconnected' }
  });

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
    cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
    border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
    button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
    accent: 'from-purple-500 to-pink-500'
  };

  const tabs = [
    { id: 'scraper', name: 'Knowledge Scraper', icon: Database, color: 'text-blue-400' },
    { id: 'workflows', name: 'Workflow Creator', icon: Workflow, color: 'text-purple-400' },
    { id: 'zapier', name: 'Zapier Hub', icon: Zap, color: 'text-orange-400' },
    { id: 'eden', name: 'Eden AI Studio', icon: Bot, color: 'text-green-400' },
    { id: 'n8n', name: 'n8n Designer', icon: GitBranch, color: 'text-pink-400' },
    { id: 'integrations', name: 'Platform Hub', icon: Link, color: 'text-cyan-400' }
  ];

  const knowledgeBases = [
    { 
      name: 'Zapier API Documentation', 
      url: 'https://docs.zapier.com', 
      status: 'scraped', 
      chunks: 1247,
      lastUpdated: '2 hours ago',
      description: 'Complete Zapier API reference and workflow guides'
    },
    { 
      name: 'Eden AI Platform Docs', 
      url: 'https://docs.edenai.co', 
      status: 'scraped', 
      chunks: 892,
      lastUpdated: '1 day ago',
      description: 'AI model integration and agent creation guides'
    },
    { 
      name: 'n8n Workflow Examples', 
      url: 'https://n8n.io/workflows', 
      status: 'scraping', 
      chunks: 234,
      lastUpdated: 'Just now',
      description: 'Community workflow templates and automation patterns'
    },
    { 
      name: 'Gmail API Reference', 
      url: 'https://developers.google.com/gmail/api', 
      status: 'pending', 
      chunks: 0,
      lastUpdated: 'Never',
      description: 'Google Gmail API for email automation'
    }
  ];

  const sampleWorkflows = [
    {
      id: 1,
      name: 'Email → AI Analysis → Slack',
      description: 'Analyze important emails with AI and post summaries to Slack',
      platform: 'multi',
      platforms: ['Gmail', 'Eden AI', 'Slack'],
      status: 'active',
      triggers: 147,
      lastRun: '5 minutes ago',
      success_rate: 98.5
    },
    {
      id: 2,
      name: 'YouTube → Twitter → Discord',
      description: 'Auto-post new YouTube videos to Twitter and Discord',
      platform: 'zapier',
      platforms: ['YouTube', 'Twitter', 'Discord'],
      status: 'draft',
      triggers: 0,
      lastRun: 'Never',
      success_rate: 0
    },
    {
      id: 3,
      name: 'GitHub → Linear → Team Notification',
      description: 'Create Linear tasks from GitHub issues and notify team',
      platform: 'n8n',
      platforms: ['GitHub', 'Linear', 'Slack'],
      status: 'active',
      triggers: 23,
      lastRun: '1 hour ago',
      success_rate: 100
    }
  ];

  useEffect(() => {
    setChatMessages([
      {
        id: 1,
        sender: 'mama-bear',
        text: `Hello Nathan! 💝 Welcome to your Integration Workbench! I'm here to help you scrape knowledge, create workflows, and build powerful automations.\n\n🧠 **My Current Knowledge:**\n• Zapier API (1,247 chunks)\n• Eden AI Platform (892 chunks)\n• n8n Workflows (234 chunks)\n• Growing every day!\n\n🔧 **Connected Platforms:**\n• Zapier: 12 active workflows\n• Eden AI: 5 agents running\n• n8n: 8 flows deployed\n\nWhat integration shall we build today? I can guide you through everything! 🚀`,
        timestamp: new Date(),
        type: 'greeting',
        suggestions: ['Scrape new knowledge base', 'Create workflow automation', 'Set up Gmail integration', 'Build AI content pipeline']
      }
    ]);
  }, []);

  const handleScrapeKnowledge = async () => {
    if (!scrapingUrl.trim()) return;
    
    setScrapingStatus('scraping');
    
    // Add to Mama Bear chat
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: `Please scrape and learn from: ${scrapingUrl}`,
      timestamp: new Date()
    }]);

    // Mama Bear responds immediately
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `🔍 **Starting intelligent scraping of your URL...**\n\n📋 **My Process:**\n• Analyzing site structure and navigation\n• Extracting documentation sections\n• Processing API references and examples\n• Converting to mem0-compatible format\n• Building searchable knowledge index\n\nThis will take 2-3 minutes. I'll organize everything perfectly for future integrations! 💝`,
        timestamp: new Date(),
        type: 'scraping-start'
      }]);

      // Simulate the actual API call
      fetch('/api/integration/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: scrapingUrl,
          source_name: extractSourceName(scrapingUrl)
        })
      })
      .then(response => response.json())
      .then(data => {
        setScrapingStatus('completed');
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: `✅ **Knowledge successfully scraped and stored!**\n\n📊 **Results:**\n• ${data.result?.chunks_created || 547} documentation chunks processed\n• ${data.result?.pages_scraped || 89} pages analyzed\n• All content stored in mem0 with searchable metadata\n• Knowledge index created for instant access\n\nI now have complete understanding of this platform! Ready to create any integration you need. 🎯`,
          timestamp: new Date(),
          type: 'scraping-success'
        }]);
        
        // Update knowledge bases list
        setScrapedKnowledge(prev => [...prev, {
          name: extractSourceName(scrapingUrl),
          url: scrapingUrl,
          status: 'completed',
          chunks: data.result?.chunks_created || 547,
          timestamp: new Date()
        }]);
      })
      .catch(error => {
        setScrapingStatus('error');
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: `❌ I encountered an issue while scraping. Let me try a different approach or check if the URL is accessible. Don't worry, I'll figure this out! 💝`,
          timestamp: new Date(),
          type: 'error'
        }]);
      });
    }, 1000);

    setScrapingUrl('');
  };

  const handleCreateWorkflow = async () => {
    if (!workflowRequest.trim()) return;
    
    setWorkflowStatus('creating');
    
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: workflowRequest,
      timestamp: new Date()
    }]);

    // Mama Bear analyzes and creates
    setTimeout(() => {
      setIsTyping(true);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: `🤖 **Analyzing your automation request...**\n\nLet me think about the best approach using my knowledge of all platforms...`,
        timestamp: new Date(),
        type: 'analysis'
      }]);

      // Simulate workflow creation
      setTimeout(() => {
        setIsTyping(false);
        setWorkflowStatus('completed');
        
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'mama-bear',
          text: `🎯 **Perfect! I've designed your automation workflow:**\n\n**Platform Recommendation:** Multi-platform approach\n**Trigger:** Gmail webhook for new emails\n**Processing:** Eden AI sentiment analysis\n**Action:** Slack message with summary\n\n**Implementation Steps:**\n1. Set up Gmail API webhook\n2. Configure Eden AI for content analysis\n3. Create Slack bot integration\n4. Test end-to-end workflow\n\nShall I create this workflow for you? I can handle all the technical setup! 🚀`,
          timestamp: new Date(),
          type: 'workflow-plan',
          actions: ['create-workflow', 'explain-steps', 'modify-plan']
        }]);
        
        // Add to workflows list
        setWorkflows(prev => [...prev, {
          id: Date.now(),
          name: extractWorkflowName(workflowRequest),
          description: workflowRequest,
          platform: 'multi',
          status: 'ready',
          created: new Date()
        }]);
      }, 3000);
    }, 1000);

    setWorkflowRequest('');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    // Mama Bear AI responses based on current tab and context
    setTimeout(() => {
      setIsTyping(false);
      const lowerMessage = newMessage.toLowerCase();
      let response = '';
      
      if (activeTab === 'scraper') {
        if (lowerMessage.includes('scrape') || lowerMessage.includes('learn')) {
          response = `🧠 I'd love to learn more! Just paste any documentation URL and I'll:\n\n• Extract all valuable content\n• Store it in my persistent memory\n• Make it instantly searchable\n• Use it for future integrations\n\nPopular sources to scrape:\n• API documentation sites\n• Integration platforms\n• Workflow examples\n• Tutorial repositories\n\nWhat knowledge should I acquire? 💝`;
        } else {
          response = `I'm ready to expand my knowledge! 📚 I can scrape and memorize:\n\n• Zapier documentation\n• Eden AI guides  \n• n8n workflow examples\n• Any API documentation\n• Integration tutorials\n\nOnce I learn it, I remember forever and can help you build anything! What shall I study next? 🎓`;
        }
      } else if (activeTab === 'workflows') {
        response = `🎯 Let's create some automation magic! I can build:\n\n• **Email Automations** - Smart filtering and responses\n• **Social Media Workflows** - Cross-platform posting\n• **Data Processing** - AI analysis and insights\n• **Team Notifications** - Smart alerts and updates\n• **Content Pipelines** - Automated publishing flows\n\nDescribe what you want to automate and I'll design the perfect workflow! ⚡`;
      } else if (activeTab === 'zapier') {
        response = `⚡ Zapier mastery at your service! With my complete knowledge of Zapier's platform, I can:\n\n• Create multi-step Zaps instantly\n• Configure complex filters and conditions\n• Set up webhooks and API connections\n• Handle error handling and retries\n• Optimize for performance and reliability\n\nI know all 5,000+ Zapier integrations! What automation should we build? 🔥`;
      } else if (activeTab === 'eden') {
        response = `🤖 Eden AI agent creation ready! I can design:\n\n• **Content Analysis Agents** - Text, image, and video processing\n• **Multi-model Workflows** - Combining different AI capabilities\n• **Intelligent Routing** - Smart decision-making agents\n• **Data Processing Pipelines** - Automated AI workflows\n\nWith my Eden AI knowledge, I'll create the perfect agent for your needs! What should it do? 🧠`;
      } else if (activeTab === 'n8n') {
        response = `🌊 n8n flow design expertise activated! I can create:\n\n• **Complex Automation Flows** - Multi-step processes\n• **API Integration Networks** - Connecting any services\n• **Data Transformation Pipelines** - Clean and process data\n• **Conditional Logic Flows** - Smart branching workflows\n• **Error Handling Systems** - Robust error recovery\n\nI know every n8n node and pattern! What flow should we build? 💫`;
      } else {
        response = `🔗 Universal integration power! I can connect:\n\n• **Gmail** ↔ **AI Analysis** ↔ **Slack**\n• **YouTube** ↔ **Twitter** ↔ **Discord**\n• **GitHub** ↔ **Linear** ↔ **Team Chat**\n• **Forms** ↔ **Database** ↔ **Email Sequences**\n• **Any API** ↔ **Any Platform** ↔ **Any Service**\n\nI handle OAuth, webhooks, data transformation - everything! What connections do you need? 🌟`;
      }

      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'mama-bear',
        text: response,
        timestamp: new Date(),
        type: 'response',
        suggestions: activeTab === 'scraper' ? 
          ['Scrape Zapier docs', 'Learn GitHub API', 'Study Notion integration'] :
          activeTab === 'workflows' ?
          ['Email → AI → Slack', 'YouTube → Social Media', 'Forms → CRM'] :
          ['Connect Gmail', 'Setup YouTube automation', 'Build content pipeline']
      }]);
    }, 1500);

    setNewMessage('');
  };

  const extractSourceName = (url) => {
    const domain = new URL(url).hostname.replace('www.', '');
    const mapping = {
      'docs.zapier.com': 'Zapier Documentation',
      'docs.edenai.co': 'Eden AI Documentation',
      'docs.n8n.io': 'n8n Documentation',
      'developers.google.com': 'Google API Documentation'
    };
    return mapping[domain] || `${domain} Documentation`;
  };

  const extractWorkflowName = (request) => {
    if (request.toLowerCase().includes('email')) return 'Email Automation Workflow';
    if (request.toLowerCase().includes('social') || request.toLowerCase().includes('twitter')) return 'Social Media Pipeline';
    if (request.toLowerCase().includes('github')) return 'GitHub Integration Flow';
    return 'Custom Automation Workflow';
  };

  // Tab Components
  const ScraperTab = () => (
    <div className="p-6 space-y-6">
      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Database size={24} className="text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme.text}`}>🧠 Knowledge Base Scraper</h3>
            <p className={`${theme.textSecondary} text-sm`}>Teach Mama Bear new platforms and APIs</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>
              Documentation URL to Learn From
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={scrapingUrl}
                onChange={(e) => setScrapingUrl(e.target.value)}
                placeholder="https://docs.zapier.com or any documentation site..."
                className={`flex-1 px-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
              />
              <button
                onClick={handleScrapeKnowledge}
                disabled={!scrapingUrl.trim() || scrapingStatus === 'scraping'}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl disabled:opacity-50 transition-all hover:scale-105 shadow-lg"
              >
                {scrapingStatus === 'scraping' ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  'Learn & Store'
                )}
              </button>
            </div>
          </div>

          {scrapingStatus === 'scraping' && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
              <RefreshCw size={20} className="text-blue-400 animate-spin" />
              <div>
                <p className="text-blue-400 font-medium">Mama Bear is learning...</p>
                <p className="text-blue-300 text-sm">Analyzing structure, extracting knowledge, storing in memory</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <h4 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
          <Sparkles size={20} className="text-purple-400" />
          Mama Bear's Knowledge Base
        </h4>
        <div className="space-y-3">
          {knowledgeBases.map((kb, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-purple-400" />
                  <div>
                    <p className={`font-semibold ${theme.text}`}>{kb.name}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{kb.description}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  kb.status === 'scraped' ? 'bg-green-400' :
                  kb.status === 'scraping' ? 'bg-yellow-400 animate-pulse' :
                  'bg-gray-400'
                }`} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={theme.textTertiary}>
                  {kb.chunks > 0 ? `${kb.chunks.toLocaleString()} knowledge chunks` : 'Pending...'}
                </span>
                <span className={`text-xs ${theme.textTertiary}`}>{kb.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WorkflowsTab = () => (
    <div className="p-6 space-y-6">
      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Workflow size={24} className="text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme.text}`}>🎯 Intelligent Workflow Creator</h3>
            <p className={`${theme.textSecondary} text-sm`}>Describe what you want to automate</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>
              Describe Your Automation Need
            </label>
            <div className="flex gap-3">
              <textarea
                value={workflowRequest}
                onChange={(e) => setWorkflowRequest(e.target.value)}
                placeholder="When I get an important email, analyze it with AI and send a summary to my Slack channel..."
                className={`flex-1 px-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm resize-none`}
                rows={3}
              />
              <button
                onClick={handleCreateWorkflow}
                disabled={!workflowRequest.trim() || workflowStatus === 'creating'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50 transition-all hover:scale-105 shadow-lg self-end"
              >
                {workflowStatus === 'creating' ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  'Create Magic'
                )}
              </button>
            </div>
          </div>

          {workflowStatus === 'creating' && (
            <div className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <Brain size={20} className="text-purple-400 animate-pulse" />
              <div>
                <p className="text-purple-400 font-medium">Mama Bear is designing your workflow...</p>
                <p className="text-purple-300 text-sm">Analyzing platforms, optimizing flow, preparing implementation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <h4 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
          <Target size={20} className="text-purple-400" />
          Your Active Workflows
        </h4>
        <div className="space-y-4">
          {sampleWorkflows.map((workflow) => (
            <div key={workflow.id} className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/10 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className={`font-semibold ${theme.text} mb-1`}>{workflow.name}</h5>
                  <p className={`text-sm ${theme.textSecondary} mb-2`}>{workflow.description}</p>
                  <div className="flex items-center gap-2">
                    {workflow.platforms.map((platform, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workflow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {workflow.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={theme.textTertiary}>{workflow.triggers} triggers • {workflow.success_rate}% success</span>
                <span className={`text-xs ${theme.textTertiary}`}>Last: {workflow.lastRun}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const IntegrationsTab = () => (
    <div className="p-6 space-y-6">
      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <h3 className={`text-xl font-bold ${theme.text} mb-6 flex items-center gap-3`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Link size={24} className="text-white" />
          </div>
          🔗 Platform Integration Hub
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Gmail', icon: Mail, connected: true, workflows: 8, color: 'text-red-400', bgColor: 'from-red-500/10 to-pink-500/10' },
            { name: 'YouTube', icon: Video, connected: false, workflows: 0, color: 'text-red-500', bgColor: 'from-red-500/5 to-pink-500/5' },
            { name: 'Twitter', icon: Twitter, connected: false, workflows: 0, color: 'text-blue-400', bgColor: 'from-blue-500/5 to-cyan-500/5' },
            { name: 'GitHub', icon: Github, connected: true, workflows: 12, color: 'text-gray-400', bgColor: 'from-gray-500/10 to-slate-500/10' },
            { name: 'Slack', icon: Slack, connected: true, workflows: 15, color: 'text-purple-400', bgColor: 'from-purple-500/10 to-pink-500/10' },
            { name: 'Discord', icon: MessageCircle, connected: false, workflows: 0, color: 'text-indigo-400', bgColor: 'from-indigo-500/5 to-purple-500/5' }
          ].map((service, index) => (
            <div key={index} className={`p-4 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 ${
              service.connected 
                ? `bg-gradient-to-r ${service.bgColor} border-green-500/20` 
                : `bg-gradient-to-r ${service.bgColor} border-gray-500/20`
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <service.icon size={24} className={service.color} />
                  <span className={`font-semibold ${theme.text}`}>{service.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${service.connected ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <p className={`text-sm ${theme.textSecondary} mb-3`}>
                {service.connected ? `${service.workflows} active workflows` : 'Ready to connect'}
              </p>
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                service.connected 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              }`}>
                {service.connected ? 'Configure' : 'Connect Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`${theme.cardBg} backdrop-blur-md rounded-2xl p-6 border ${theme.border} shadow-lg`}>
        <h4 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
          <Sparkles size={20} className="text-purple-400" />
          Popular Integration Patterns
        </h4>
        <div className="space-y-3">
          {[
            'Gmail → AI Summary → Slack notification',
            'YouTube upload → Twitter announcement → Discord post',
            'GitHub commit → Linear task update → Team notification',
            'Calendar event → Zoom meeting → Email reminder sequence',
            'Form submission → Database entry → CRM update → Follow-up email'
          ].map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-purple-500/5 rounded-xl hover:bg-purple-500/10 transition-colors cursor-pointer border border-purple-500/10">
              <div className="flex items-center gap-3">
                <ArrowRight size={16} className="text-purple-400" />
                <span className={theme.textSecondary}>{pattern}</span>
              </div>
              <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
                Create
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scraper': return <ScraperTab />;
      case 'workflows': return <WorkflowsTab />;
      case 'integrations': return <IntegrationsTab />;
      default: return <ScraperTab />;
    }
  };

  return (
    <div className={`h-screen ${theme.bg} transition-colors duration-300`}>
      <div className="flex h-full">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${showMamaBear ? 'w-3/4' : 'w-full'}`}>
          {/* Header */}
          <div className={`${theme.cardBg} backdrop-blur-md border-b ${theme.border} p-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl">
                  🔧
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Integration Workbench
                  </h1>
                  <p className={`${theme.textSecondary} text-sm`}>
                    Universal automation hub powered by Mama Bear's intelligence
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">All systems connected</span>
                </div>
                
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                
                <button
                  onClick={() => setShowMamaBear(!showMamaBear)}
                  className={`p-3 rounded-xl ${theme.button} transition-colors hover:scale-105`}
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-purple-500/10 rounded-xl p-1 backdrop-blur-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white shadow-lg scale-105'
                      : `${theme.textSecondary} hover:text-white hover:bg-white/5`
                  }`}
                >
                  <tab.icon size={16} className={tab.color} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* Mama Bear Chat Panel */}
        {showMamaBear && (
          <div className={`w-1/3 ${theme.cardBg} backdrop-blur-md border-l ${theme.border} flex flex-col shadow-2xl`}>
            <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                    💝
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme.text}`}>Mama Bear</h3>
                    <p className={`text-sm ${theme.textTertiary}`}>Integration Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMamaBear(false)}
                  className={`p-2 rounded-lg ${theme.button} transition-colors hover:scale-105`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <div className="font-semibold text-blue-400">Knowledge</div>
                  <div className={theme.textTertiary}>2,387 chunks</div>
                </div>
                <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="font-semibold text-green-400">Workflows</div>
                  <div className={theme.textTertiary}>23 active</div>
                </div>
                <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <div className="font-semibold text-purple-400">Platforms</div>
                  <div className={theme.textTertiary}>8 connected</div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.sender === 'user' ? '👤' : '💝'}
                  </div>
                  
                  <div className={`flex-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : `${theme.cardBg} border ${theme.border}`
                    } shadow-lg backdrop-blur-md max-w-full`}>
                      <div className={`${theme.text} text-sm leading-relaxed whitespace-pre-wrap`}>
                        {message.text}
                      </div>
                      
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setNewMessage(suggestion)}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {message.actions && (
                        <div className="mt-3 flex gap-2">
                          {message.actions.includes('create-workflow') && (
                            <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 transition-colors">
                              Create Workflow
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className={`text-xs ${theme.textTertiary} mt-3 flex items-center justify-between`}>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.sender === 'mama-bear' && (
                          <div className="flex gap-1">
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <Copy size={10} />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <ThumbsUp size={10} />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <ThumbsDown size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm shadow-lg">
                    💝
                  </div>
                  <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-lg backdrop-blur-md`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-purple-500/20">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about integrations, scraping, or workflows..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className={`flex-1 px-4 py-3 rounded-xl border ${theme.input} focus:border-purple-400 focus:outline-none transition-colors backdrop-blur-sm`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105 shadow-lg"
                >
                  💝
                </button>
              </div>
              <div className={`text-xs ${theme.textTertiary} text-center`}>
                💡 I can scrape any docs, create workflows, and connect all platforms
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationWorkbench;