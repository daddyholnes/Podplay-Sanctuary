import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Code, 
  Store, 
  Mic, 
  Grid3X3, 
  Settings, 
  Layout,
  Heart,
  Menu,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';

// API service
const API_BASE_URL = 'http://localhost:5000/api';

const fetchFromBackend = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Main Chat Component
const MainChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetchFromBackend('/chat/messages');
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetchFromBackend('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          message: inputMessage,
          sender: 'user'
        })
      });

      setInputMessage('');
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
      }
      // Refresh messages to get any AI responses
      setTimeout(() => fetchMessages(), 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                : 'bg-white text-gray-800 shadow-md'
            }`}>
              {message.content || message.message}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-white border-t border-purple-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Chat with Mama Bear..."
            className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Dev Workspaces Component
const DevWorkspacesPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    fetchFiles();
    
    // Poll for file changes every 5 seconds
    const pollInterval = setInterval(() => {
      fetchFiles();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetchFromBackend('/workspaces/files');
      setFiles(response.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const createFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      await fetchFromBackend('/workspaces/files', {
        method: 'POST',
        body: JSON.stringify({
          name: fileName,
          content: ''
        })
      });
      fetchFiles();
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;

    try {
      await fetchFromBackend(`/workspaces/files/${selectedFile.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: fileContent
        })
      });
      alert('File saved successfully!');
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="w-1/3 bg-white border-r border-purple-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Files</h3>
          <button
            onClick={createFile}
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded text-sm hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            New File
          </button>
        </div>
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => {
                setSelectedFile(file);
                setFileContent(file.content || '');
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedFile?.id === file.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <div className="font-medium">{file.name}</div>
              <div className="text-sm opacity-75">{file.lastModified}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        {selectedFile ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedFile.name}</h3>
              <button
                onClick={saveFile}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all"
              >
                Save
              </button>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="flex-1 p-4 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
              placeholder="Start coding..."
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a file to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// MCP Marketplace Component
const MCPMarketplacePage = () => {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetchFromBackend('/mcp/tools');
      setTools(response.tools || []);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const runTool = async (toolId) => {
    try {
      const response = await fetchFromBackend(`/mcp/tools/${toolId}/run`, {
        method: 'POST'
      });
      alert(`Tool executed: ${JSON.stringify(response)}`);
    } catch (error) {
      console.error('Failed to run tool:', error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">MCP Tool Marketplace</h2>
        <p className="text-gray-600">Discover and manage your Model Context Protocol tools</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-800">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.category}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{tool.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-600 font-medium">{tool.version}</span>
              <button
                onClick={() => runTool(tool.id)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
              >
                Run Tool
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Multimodal Chat Component
const MultimodalChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetchFromBackend('/chat/messages');
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !file) return;

    const formData = new FormData();
    if (inputMessage.trim()) {
      formData.append('message', inputMessage);
    }
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/attachments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setInputMessage('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh messages after sending
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                : 'bg-white text-gray-800 shadow-md'
            }`}>
              {message.type === 'file' ? (
                <div>
                  <p className="text-sm font-medium">File: {message.filename}</p>
                  {message.content && <p className="mt-2">{message.content}</p>}
                </div>
              ) : (
                message.content || message.message
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-white border-t border-purple-200">
        {file && (
          <div className="mb-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-800">Selected file: {file.name}</p>
          </div>
        )}
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send text, images, or files..."
            className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            📎
          </button>
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini Apps Hub Component
const MiniAppsHubPage = () => {
  const [apps, setApps] = useState([]);
  const [runningApps, setRunningApps] = useState([]);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await fetchFromBackend('/miniapps');
      setApps(response.apps || []);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    }
  };

  const launchApp = async (appId) => {
    try {
      await fetchFromBackend(`/miniapps/${appId}/launch`, {
        method: 'POST'
      });
      setRunningApps(prev => [...prev, appId]);
    } catch (error) {
      console.error('Failed to launch app:', error);
    }
  };

  const closeApp = async (appId) => {
    try {
      await fetchFromBackend(`/miniapps/${appId}/close`, {
        method: 'POST'
      });
      setRunningApps(prev => prev.filter(id => id !== appId));
    } catch (error) {
      console.error('Failed to close app:', error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mini Apps Hub</h2>
        <p className="text-gray-600">Launch and manage your mini applications</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Grid3X3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{app.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{app.description}</p>
              {runningApps.includes(app.id) ? (
                <button
                  onClick={() => closeApp(app.id)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  Close App
                </button>
              ) : (
                <button
                  onClick={() => launchApp(app.id)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
                >
                  Launch App
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Integration Workbench Component
const IntegrationWorkbenchPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [testResults, setTestResults] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetchFromBackend('/integration/status');
      setConnectionStatus(response.status);
    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to check connection status:', error);
    }
  };

  const runTest = async () => {
    setIsRunningTest(true);
    try {
      const response = await fetchFromBackend('/integration/test', {
        method: 'POST'
      });
      setTestResults(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        result: response.result,
        status: response.status
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        result: 'Test failed',
        status: 'error'
      }]);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Integration Workbench</h2>
        <p className="text-gray-600">Universal Automation Hub - Test and manage integrations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Status</h3>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-gray-700 capitalize">{connectionStatus}</span>
          </div>
          <button
            onClick={checkConnectionStatus}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            Refresh Status
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Run Integration Test</h3>
          <p className="text-gray-600 mb-4">Test your integrations and automation workflows</p>
          <button
            onClick={runTest}
            disabled={isRunningTest}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isRunningTest ? 'Running Test...' : 'Run Test'}
          </button>
        </div>
      </div>
      
      {testResults.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Results</h3>
          <div className="space-y-3">
            {testResults.slice(-5).reverse().map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-gray-800">{result.result}</p>
                  <p className="text-sm text-gray-500">{result.timestamp}</p>
                </div>
                <div className={`px-3 py-1 rounded text-sm ${
                  result.status === 'success' ? 'bg-green-100 text-green-800' :
                  result.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Workspace Layout Component
const WorkspaceLayoutPage = () => {
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);

  useEffect(() => {
    fetchLayouts();
    
    // Poll for layout changes every 10 seconds
    const pollInterval = setInterval(() => {
      fetchLayouts();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const fetchLayouts = async () => {
    try {
      const response = await fetchFromBackend('/layouts');
      setLayouts(response.layouts || []);
    } catch (error) {
      console.error('Failed to fetch layouts:', error);
    }
  };

  const saveLayout = async () => {
    const layoutName = prompt('Enter layout name:');
    if (!layoutName) return;

    try {
      await fetchFromBackend('/layouts', {
        method: 'POST',
        body: JSON.stringify({
          name: layoutName,
          config: currentLayout || {}
        })
      });
      fetchLayouts();
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const loadLayout = async (layoutId) => {
    try {
      const response = await fetchFromBackend(`/layouts/${layoutId}`);
      setCurrentLayout(response.layout);
    } catch (error) {
      console.error('Failed to load layout:', error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Workspace Layout</h2>
        <p className="text-gray-600">Manage your workspace configurations and layouts</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Saved Layouts</h3>
            <button
              onClick={saveLayout}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
            >
              Save Current
            </button>
          </div>
          <div className="space-y-3">
            {layouts.map((layout) => (
              <div key={layout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-800">{layout.name}</p>
                  <p className="text-sm text-gray-500">{layout.createdAt}</p>
                </div>
                <button
                  onClick={() => loadLayout(layout.id)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Layout</h3>
          <div className="bg-gray-50 rounded p-4 min-h-32">
            {currentLayout ? (
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(currentLayout, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 text-center">No layout loaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Application Component
const PodplayApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status`);
        setBackendConnected(response.ok);
      } catch (error) {
        setBackendConnected(false);
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const connectionInterval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(connectionInterval);
    };
  }, []);

  const navigationItems = [
    { id: 'chat', label: 'Mama Bear Chat', icon: MessageCircle, component: MainChatPage },
    { id: 'workspaces', label: 'Dev Workspaces', icon: Code, component: DevWorkspacesPage },
    { id: 'marketplace', label: 'MCP Marketplace', icon: Store, component: MCPMarketplacePage },
    { id: 'multimodal', label: 'Multimodal Chat', icon: Mic, component: MultimodalChatPage },
    { id: 'miniapps', label: 'Mini Apps Hub', icon: Grid3X3, component: MiniAppsHubPage },
    { id: 'integration', label: 'Integration Workbench', icon: Settings, component: IntegrationWorkbenchPage },
    { id: 'layout', label: 'Workspace Layout', icon: Layout, component: WorkspaceLayoutPage },
  ];

  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || MainChatPage;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-purple-800 to-indigo-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-purple-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <Heart className="w-8 h-8 text-purple-300" />
                <div>
                  <h1 className="text-lg font-bold">Podplay Build</h1>
                  <p className="text-xs text-purple-300">Your Creative Sanctuary</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-purple-700 rounded"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all hover:bg-purple-700 ${
                      activeTab === item.id ? 'bg-purple-700 bg-opacity-80' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-purple-700">
            <div className="text-center">
              <p className="text-sm text-purple-300">Powered by Mama Bear AI</p>
              <p className="text-xs text-purple-400">v1.0.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600">
                Welcome to your creative sanctuary
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {backendConnected ? 'Backend Connected' : 'Backend Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default PodplayApp;