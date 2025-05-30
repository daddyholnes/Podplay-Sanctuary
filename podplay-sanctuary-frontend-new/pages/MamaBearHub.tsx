
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { ChatMessage, DailyBriefingResponse, MemorySearchResult, CodeAnalysisResponse } from '../types';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Input, { Textarea } from '../components/Input';
import Spinner from '../components/common/Spinner';
import Modal from '../components/Modal';
import { getFileIcon } from '../utils/fileUtils';

const SECTION_ID = 'mama-bear';

const MamaBearHub: React.FC = () => {
  const { chatHistory, addMessage } = useAppStore(state => ({
    chatHistory: state.chatHistory.filter(msg => msg.section === SECTION_ID),
    addMessage: state.addMessage,
  }));

  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefingResponse | null>(null);
  const [memorySearchTerm, setMemorySearchTerm] = useState('');
  const [memoryResults, setMemoryResults] = useState<MemorySearchResult[]>([]);
  const [codeToAnalyze, setCodeToAnalyze] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResponse | null>(null);
  
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchDailyBriefing = useCallback(async () => {
    setIsLoadingBriefing(true);
    try {
      const briefing = await apiService.getDailyBriefing();
      setDailyBriefing(briefing);
      setIsBriefingModalOpen(true);
    } catch (error) {
      console.error("Error fetching daily briefing:", error);
      addMessage({ id: `err_${Date.now()}`, message: `Error fetching briefing: ${error instanceof Error ? error.message : 'Unknown error'}`, sender: 'mama-bear', timestamp: new Date().toISOString(), section: SECTION_ID });
    } finally {
      setIsLoadingBriefing(false);
    }
  }, [addMessage]);

  const handleMemorySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memorySearchTerm.trim()) return;
    setIsLoadingMemory(true);
    try {
      const results = await apiService.searchMemories(memorySearchTerm);
      setMemoryResults(results);
    } catch (error) {
      console.error("Error searching memories:", error);
      addMessage({ id: `err_${Date.now()}`, message: `Error searching memories: ${error instanceof Error ? error.message : 'Unknown error'}`, sender: 'mama-bear', timestamp: new Date().toISOString(), section: SECTION_ID });
    } finally {
      setIsLoadingMemory(false);
    }
  };

  const handleCodeAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!codeToAnalyze.trim()) return;
    setIsLoadingAnalysis(true);
    try {
      const result = await apiService.analyzeCode(codeToAnalyze, codeLanguage);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing code:", error);
      addMessage({ id: `err_${Date.now()}`, message: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`, sender: 'mama-bear', timestamp: new Date().toISOString(), section: SECTION_ID });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Simulated action button for planning project
  const handlePlanProject = () => {
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      message: "Help me plan a new project.",
      sender: 'user',
      timestamp: new Date().toISOString(),
      section: SECTION_ID,
    };
    addMessage(userMessage);
    
    // Simulate Mama Bear response after API call
    setTimeout(() => {
      const mamaBearResponse: ChatMessage = {
        id: `mb_${Date.now()}`,
        message: "Okay, I can help with that! What kind of project are you thinking of? Tell me more about your goals, target audience, and any key features you have in mind.",
        sender: 'mama-bear',
        timestamp: new Date().toISOString(),
        section: SECTION_ID,
      };
      addMessage(mamaBearResponse);
    }, 1000);
  };
  
  return (
    <div className="h-full flex flex-col space-y-4">
      <header className="flex items-center justify-between pb-2 border-b border-border">
        <h1 className="font-display text-2xl text-mama-bear flex items-center">
          <Icon name="mamaBear" className="w-8 h-8 mr-2" /> Mama Bear Chat Hub
        </h1>
      </header>

      {/* Chat History */}
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardContent ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 bg-secondary-bg custom-scrollbar">
          {chatHistory.length === 0 && (
            <div className="text-center text-text-muted py-10">
              <Icon name="chat" className="w-12 h-12 mx-auto mb-2" />
              <p>Your conversation with Mama Bear will appear here.</p>
              <p>Try asking for a project plan or a daily briefing!</p>
            </div>
          )}
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-tertiary-bg text-text-primary'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map(att => (
                      <div key={att.name} className="flex items-center text-xs p-1.5 rounded bg-black/10">
                        {getFileIcon(att.type)} <span className="ml-1.5 truncate">{att.name} ({Math.round((att.size || 0) / 1024)}KB)</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                {msg.isLoading && <Spinner size="sm" className="mt-1" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>Quick Actions</CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="secondary" onClick={handlePlanProject} leftIcon="puzzle">Plan Project</Button>
          <Button variant="secondary" onClick={fetchDailyBriefing} leftIcon="calendar" isLoading={isLoadingBriefing}>Get Briefing</Button>
          <Button variant="secondary" onClick={() => setIsAnalysisModalOpen(true)} leftIcon="code">Analyze Code</Button>
          <Button variant="secondary" onClick={() => setIsMemoryModalOpen(true)} leftIcon="search">Search Memory</Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} title="Daily Briefing" size="lg">
        {isLoadingBriefing && <Spinner text="Loading briefing..." />}
        {dailyBriefing && (
          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">{new Date(dailyBriefing.date).toLocaleDateString()}</h3>
            <p className="text-text-secondary whitespace-pre-wrap">{dailyBriefing.briefing}</p>
          </div>
        )}
      </Modal>

      <Modal isOpen={isMemoryModalOpen} onClose={() => setIsMemoryModalOpen(false)} title="Search Memories" size="xl">
        <form onSubmit={handleMemorySearch} className="space-y-3">
          <Input 
            value={memorySearchTerm} 
            onChange={(e) => setMemorySearchTerm(e.target.value)}
            placeholder="Enter search query..."
            leftIcon="search"
          />
          <Button type="submit" isLoading={isLoadingMemory}>Search</Button>
        </form>
        {isLoadingMemory && <Spinner text="Searching..." className="my-4" />}
        {memoryResults.length > 0 && (
          <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
            {memoryResults.map(result => (
              <Card key={result.id} className="bg-secondary-bg">
                <CardContent>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{result.content}</p>
                  <p className="text-xs text-text-muted mt-1">Relevance: {result.relevance.toFixed(2)} | {new Date(result.timestamp).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {memoryResults.length === 0 && !isLoadingMemory && memorySearchTerm && (
            <p className="text-text-muted text-center mt-4">No results found.</p>
        )}
      </Modal>

      <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title="Analyze Code" size="2xl">
        <form onSubmit={handleCodeAnalysis} className="space-y-3">
          <Textarea 
            value={codeToAnalyze} 
            onChange={(e) => setCodeToAnalyze(e.target.value)}
            placeholder="Paste code here..."
            rows={10}
            className="font-mono text-sm"
          />
          <Input 
            label="Language"
            value={codeLanguage} 
            onChange={(e) => setCodeLanguage(e.target.value)}
            placeholder="e.g., javascript, python"
          />
          <Button type="submit" isLoading={isLoadingAnalysis}>Analyze</Button>
        </form>
        {isLoadingAnalysis && <Spinner text="Analyzing..." className="my-4" />}
        {analysisResult && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-semibold">Analysis Summary:</h4>
            <p className="text-sm bg-secondary-bg p-2 rounded">{analysisResult.summary}</p>
            {analysisResult.suggestions.length > 0 && (
              <>
                <h4 className="font-semibold">Suggestions:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 bg-secondary-bg p-2 rounded">
                  {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MamaBearHub;
