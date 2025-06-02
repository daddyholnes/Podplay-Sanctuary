import React from 'react';

interface CodeEditorProps {
  file: { name: string; content: string } | null;
  theme: string;
}

/**
 * CodeEditor component displays and allows editing of code files
 * with syntax highlighting and editor features
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ file, theme }) => {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-white/50 dark:bg-gray-900/50">
        <div className="text-center p-6">
          <div className="text-purple-500 dark:text-purple-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.414A2 2 0 0 0 18.414 6L14 1.586A2 2 0 0 0 12.586 1H8a2 2 0 0 0-2 2v4"></path>
              <path d="M14 1v4a2 2 0 0 0 2 2h4"></path>
              <path d="m9 15 3-3 3 3"></path>
              <path d="M12 12v6"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300">No File Selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  // Determine language for syntax highlighting class
  const getLanguageClass = () => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'js':
        return 'language-javascript';
      case 'jsx':
        return 'language-jsx';
      case 'ts':
        return 'language-typescript';
      case 'tsx':
        return 'language-tsx';
      case 'html':
        return 'language-html';
      case 'css':
        return 'language-css';
      case 'json':
        return 'language-json';
      case 'py':
        return 'language-python';
      case 'md':
        return 'language-markdown';
      default:
        return 'language-plaintext';
    }
  };

  // In a real implementation, we would use a proper code editor like Monaco, CodeMirror, or Ace
  // This is a simplified version just for demonstration
  return (
    <div className="h-full flex flex-col">
      {/* Editor toolbar */}
      <div className="p-2 border-b border-purple-100 dark:border-purple-900 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {file.name}
        </div>
        <div className="flex space-x-2">
          <button className="text-xs px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300">
            Format
          </button>
          <button className="text-xs px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300">
            Save
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-white dark:bg-gray-900">
        <pre className={`${getLanguageClass()} whitespace-pre-wrap`}>
          <code>{file.content}</code>
        </pre>
      </div>
      
      {/* Status bar */}
      <div className="h-6 border-t border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-gray-800 px-3 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Ln 1, Col 1
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {file.name.split('.').pop()?.toUpperCase() || 'TXT'}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
