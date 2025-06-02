import React, { useState } from 'react';

// Types for chat messages, workflows, and knowledge bases
interface ChatMessage {
  id: number;
  sender: 'user' | 'mama-bear';
  text: string;
  timestamp: Date;
  type?: string;
  suggestions?: string[];
  actions?: string[];
}

interface Workflow {
  id: number;
  name: string;
  description: string;
  platform: string;
  status: string;
  created?: Date;
  platforms?: string[];
  triggers?: number;
  lastRun?: string;
  success_rate?: number;
}

interface KnowledgeBase {
  name: string;
  url: string;
  status: string;
  chunks: number;
  lastUpdated: string;
  description: string;
}

const IntegrationWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('scraper');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showMamaBear, setShowMamaBear] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  // Scraper state
  const [scrapingUrl, setScrapingUrl] = useState<string>('');
  const [scrapingStatus, setScrapingStatus] = useState<string>('idle');
  const [scrapedKnowledge, setScrapedKnowledge] = useState<KnowledgeBase[]>([]);
  // Workflow state
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowRequest, setWorkflowRequest] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('idle');
  const [workflowName, setWorkflowName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [integrationType, setIntegrationType] = useState('api');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseBody, setResponseBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mamaBearMessage, setMamaBearMessage] = useState('');


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'scraper') {
      setShowMamaBear(true);
    } else {
      setShowMamaBear(false);
    }
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMamaBearMessageChange = (e) => {
    setMamaBearMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    setChatMessages([...chatMessages, { text: newMessage, type: 'user' }]);
    setNewMessage('');
    setIsTyping(true);
    // Simulate bot response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: 'This is a response from Mama Bear.', type: 'bot' }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl('');
    }
  };

  const handleIntegrationTypeChange = (type) => {
    setIntegrationType(type);
  };

  const handleApiEndpointChange = (e) => {
    setApiEndpoint(e.target.value);
  };

  const handleHttpMethodChange = (e) => {
    setHttpMethod(e.target.value);
  };

  const handleRequestBodyChange = (e) => {
    setRequestBody(e.target.value);
  };

  const handleResponseBodyChange = (e) => {
    setResponseBody(e.target.value);
  };

  const handleSaveWorkflow = () => {
    if (!workflowName) {
      setError('Workflow name is required');
      return;
    }
    const newWorkflow = {
      id: Date.now(),
      name: workflowName,
      webhookUrl,
      file: selectedFile,
      integrationType,
      apiEndpoint,
      httpMethod,
      requestBody,
      responseBody,
    };
    setSavedWorkflows([...savedWorkflows, newWorkflow]);
    setWorkflowName('');
    setWebhookUrl('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    setIntegrationType('api');
    setApiEndpoint('');
    setHttpMethod('GET');
    setRequestBody('');
    setResponseBody('');
    setSuccess('Workflow saved successfully');
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleDeleteWorkflow = (id) => {
    setSavedWorkflows(savedWorkflows.filter(w => w.id !== id));
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWebhookUrl(workflow.webhookUrl);
    setSelectedFile(workflow.file);
    setFilePreviewUrl(URL.createObjectURL(workflow.file));
    setIntegrationType(workflow.integrationType);
    setApiEndpoint(workflow.apiEndpoint);
    setHttpMethod(workflow.httpMethod);
    setRequestBody(workflow.requestBody);
    setResponseBody(workflow.responseBody);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedWorkflow(null);
    setWorkflowName('');
    setWebhookUrl('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    setIntegrationType('api');
    setApiEndpoint('');
    setHttpMethod('GET');
    setRequestBody('');
    setResponseBody('');
  };

  const handleUpdateWorkflow = () => {
    if (!workflowName) {
      setError('Workflow name is required');
      return;
    }
    const updatedWorkflow = {
      ...selectedWorkflow,
      name: workflowName,
      webhookUrl,
      file: selectedFile,
      integrationType,
      apiEndpoint,
      httpMethod,
      requestBody,
      responseBody,
    };
    setSavedWorkflows(savedWorkflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    handleModalClose();
    setSuccess('Workflow updated successfully');
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration Workbench</h1>
          <button
            onClick={handleDarkModeToggle}
            className={`p-2 rounded-full focus:outline-none ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => handleTabChange('scraper')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${activeTab === 'scraper' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
          >
            Scraper
          </button>
          <button
            onClick={() => handleTabChange('api')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${activeTab === 'api' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
          >
            API Integration
          </button>
        </div>
        {activeTab === 'scraper' && (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h2 className="text-lg font-semibold mb-2">Mama Bear</h2>
              <textarea
                value={mamaBearMessage}
                onChange={handleMamaBearMessageChange}
                className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                rows="4"
                placeholder="Type your message to Mama Bear..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Chat</h2>
              <div className="space-y-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs p-3 bg-gray-300 rounded-lg text-gray-900">
                      Typing...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'api' && (
          <div>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h2 className="text-lg font-semibold mb-2">API Integration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Workflow Name</label>
                  <input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                    type="text"
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL</label>
                  <input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                    type="text"
                    placeholder="Enter webhook URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select File</label>
                  <input
                    onChange={handleFileChange}
                    className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                    type="file"
                  />
                  {filePreviewUrl && (
                    <div className="mt-2">
                      <a
                        href={filePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Preview File
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Integration Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleIntegrationTypeChange('api')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${integrationType === 'api' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                      API
                    </button>
                    <button
                      onClick={() => handleIntegrationTypeChange('webhook')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${integrationType === 'webhook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                      Webhook
                    </button>
                  </div>
                </div>
                {integrationType === 'api' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">API Endpoint</label>
                      <input
                        value={apiEndpoint}
                        onChange={handleApiEndpointChange}
                        className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                        type="text"
                        placeholder="Enter API endpoint"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">HTTP Method</label>
                      <select
                        value={httpMethod}
                        onChange={handleHttpMethodChange}
                        className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Request Body</label>
                      <textarea
                        value={requestBody}
                        onChange={handleRequestBodyChange}
                        className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                        rows="4"
                        placeholder="Enter request body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Response Body</label>
                      <textarea
                        value={responseBody}
                        onChange={handleResponseBodyChange}
                        className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                        rows="4"
                        placeholder="Enter response body"
                      />
                    </div>
                  </>
                )}
              </div>
              {error && (
                <div className="mt-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 text-green-600 text-sm">
                  {success}
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={handleSaveWorkflow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-blue-700"
                >
                  Save Workflow
                </button>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Saved Workflows</h2>
              <div className="space-y-2">
                {savedWorkflows.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    No workflows saved yet.
                  </div>
                )}
                {savedWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <div className="text-gray-900 font-semibold">{workflow.name}</div>
                      <div className="text-gray-500 text-sm">{workflow.webhookUrl}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditWorkflow(workflow)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 absolute inset-0"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Workflow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Workflow Name</label>
                <input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                  type="text"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                  type="text"
                  placeholder="Enter webhook URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select File</label>
                <input
                  onChange={handleFileChange}
                  className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                  type="file"
                />
                {filePreviewUrl && (
                  <div className="mt-2">
                    <a
                      href={filePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Preview File
                    </a>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Integration Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleIntegrationTypeChange('api')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${integrationType === 'api' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    API
                  </button>
                  <button
                    onClick={() => handleIntegrationTypeChange('webhook')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none ${integrationType === 'webhook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    Webhook
                  </button>
                </div>
              </div>
              {integrationType === 'api' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">API Endpoint</label>
                    <input
                      value={apiEndpoint}
                      onChange={handleApiEndpointChange}
                      className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                      type="text"
                      placeholder="Enter API endpoint"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">HTTP Method</label>
                    <select
                      value={httpMethod}
                      onChange={handleHttpMethodChange}
                      className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Body</label>
                    <textarea
                      value={requestBody}
                      onChange={handleRequestBodyChange}
                      className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                      rows="4"
                      placeholder="Enter request body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Response Body</label>
                    <textarea
                      value={responseBody}
                      onChange={handleResponseBodyChange}
                      className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                      rows="4"
                      placeholder="Enter response body"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleUpdateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-blue-700"
              >
                Update Workflow
              </button>
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all duration-300 focus:outline-none hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationWorkbench;
