import React, { useState, useRef, useEffect } from 'react';

interface TerminalPanelProps {
  output: string;
  onExecuteCommand: (command: string) => void;
}

/**
 * TerminalPanel provides a command-line interface for interacting with
 * the development environment, workspace, and Scout agent
 */
const TerminalPanel: React.FC<TerminalPanelProps> = ({ output, onExecuteCommand }) => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll terminal to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when terminal is clicked
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim()) return;
    
    // Execute command
    onExecuteCommand(command);
    
    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Clear input
    setCommand('');
  };

  // Handle command history navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate up through history
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate down through history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div 
      className="terminal-panel h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm"
      onClick={focusInput}
    >
      {/* Terminal output */}
      <div 
        ref={terminalRef}
        className="flex-1 p-2 overflow-y-auto whitespace-pre-wrap"
      >
        {output}
      </div>
      
      {/* Command input */}
      <form onSubmit={handleSubmit} className="flex items-center p-2 border-t border-gray-700">
        <span className="mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none border-none text-green-400"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          placeholder="Enter command..."
        />
      </form>
      
      {/* Terminal actions */}
      <div className="p-2 border-t border-gray-700 flex justify-between text-xs text-gray-400">
        <div className="flex space-x-2">
          <button className="hover:text-green-400">Clear</button>
          <button className="hover:text-green-400">Copy</button>
        </div>
        <div className="text-gray-500">Scout Terminal v1.0</div>
      </div>
    </div>
  );
};

export default TerminalPanel;
