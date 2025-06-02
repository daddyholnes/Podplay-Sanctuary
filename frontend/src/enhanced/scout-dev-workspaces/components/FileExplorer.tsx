import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { Project, File, Directory } from '@/types/workspace';

interface FileExplorerProps {
  projects: Project[];
  activeProjectId: string;
  onFileSelect: (fileName: string, fileContent: string) => void;
}

/**
 * FileExplorer component displays a tree view of files and directories
 * with expand/collapse functionality and file selection
 */
const FileExplorer: React.FC<FileExplorerProps> = ({ 
  projects, 
  activeProjectId,
  onFileSelect 
}) => {
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({
    // Start with root folders expanded
    'project-1': true,
    'workspace-1': true
  });

  // Sample file content (for demo purposes)
  const fileContents: { [key: string]: string } = {
    'App.tsx': `import React from 'react';
import { ThemeProvider } from './ThemeContext';
import AppLayout from './components/layout/AppLayout';
import './index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
};

export default App;`,
    'ThemeContext.tsx': `import React, { createContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};`,
    'app.py': `from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello from Flask!'})

if __name__ == '__main__':
    app.run(debug=True)`,
    'models.py': `from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    messages = relationship("Message", back_populates="user")
    
class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="messages")`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Processor App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Image Processor</h1>
    <div id="app"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    'script.js': `document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  // Create image preview
  const preview = document.createElement('div');
  preview.className = 'preview';
  
  // Add to DOM
  app.appendChild(fileInput);
  app.appendChild(preview);
  
  // Handle file selection
  fileInput.addEventListener('change', handleFileSelect);
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.innerHTML = '';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});`
  };

  // Sample file structure (in a real app, this would come from the backend)
  const fileStructure = {
    'project-1': [
      {
        id: 'folder-1',
        name: 'src',
        type: 'directory',
        children: [
          { id: 'file-1', name: 'App.tsx', type: 'file', language: 'tsx' },
          { id: 'file-2', name: 'ThemeContext.tsx', type: 'file', language: 'tsx' },
          {
            id: 'folder-2',
            name: 'components',
            type: 'directory',
            children: [
              {
                id: 'folder-3',
                name: 'layout',
                type: 'directory',
                children: [
                  { id: 'file-3', name: 'AppLayout.tsx', type: 'file', language: 'tsx' },
                  { id: 'file-4', name: 'SideNavigation.tsx', type: 'file', language: 'tsx' }
                ]
              },
              {
                id: 'folder-4',
                name: 'ui',
                type: 'directory',
                children: [
                  { id: 'file-5', name: 'Button.tsx', type: 'file', language: 'tsx' },
                  { id: 'file-6', name: 'Input.tsx', type: 'file', language: 'tsx' }
                ]
              }
            ]
          }
        ]
      },
      { id: 'file-7', name: 'package.json', type: 'file', language: 'json' },
      { id: 'file-8', name: 'tsconfig.json', type: 'file', language: 'json' }
    ],
    'workspace-2': [
      { id: 'file-9', name: 'app.py', type: 'file', language: 'python' },
      { id: 'file-10', name: 'models.py', type: 'file', language: 'python' },
      { id: 'file-11', name: 'requirements.txt', type: 'file', language: 'text' },
      {
        id: 'folder-5',
        name: 'static',
        type: 'directory',
        children: [
          { id: 'file-12', name: 'style.css', type: 'file', language: 'css' }
        ]
      }
    ],
    'workspace-3': [
      { id: 'file-13', name: 'index.html', type: 'file', language: 'html' },
      { id: 'file-14', name: 'script.js', type: 'file', language: 'javascript' },
      { id: 'file-15', name: 'style.css', type: 'file', language: 'css' }
    ]
  };

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Handle file click
  const handleFileClick = (fileName: string) => {
    onFileSelect(fileName, fileContents[fileName] || `// Content for ${fileName}`);
  };

  // Render a file or directory item recursively
  const renderItem = (item: any, level = 0) => {
    const isExpanded = expandedFolders[item.id] || false;
    
    if (item.type === 'directory') {
      return (
        <div key={item.id}>
          <div 
            className="flex items-center py-1 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleFolder(item.id)}
          >
            <span className="mr-1 text-purple-600 dark:text-purple-400">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span className="mr-1.5 text-purple-700 dark:text-purple-300">
              {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
            </span>
            <span className="text-xs text-gray-800 dark:text-gray-200">{item.name}</span>
          </div>
          
          {isExpanded && item.children && (
            <div>
              {item.children.map((child: any) => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div 
          key={item.id}
          className="flex items-center py-1 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
          style={{ paddingLeft: `${level * 12 + 24}px` }}
          onClick={() => handleFileClick(item.name)}
        >
          <span className="mr-1.5 text-purple-700 dark:text-purple-300">
            <FileText size={14} />
          </span>
          <span className="text-xs text-gray-800 dark:text-gray-200">{item.name}</span>
        </div>
      );
    }
  };

  // Get the active project and workspace
  const activeProject = projects.find(project => project.id === activeProjectId);
  const projectFiles = fileStructure[activeProjectId] || [];
  
  return (
    <div className="file-explorer h-full flex flex-col">
      {/* Project and workspace path */}
      <div className="p-2 border-b border-purple-100 dark:border-purple-900 bg-white/50 dark:bg-gray-900/50">
        <div className="text-xs text-purple-800 dark:text-purple-200 font-medium">
          {activeProject?.name}
        </div>
      </div>
      
      {/* Project actions */}
      <div className="p-2 flex items-center justify-between border-b border-purple-100 dark:border-purple-900 bg-white/50 dark:bg-gray-900/50">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Files</div>
        <div className="flex space-x-1">
          <button className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <Plus size={14} />
          </button>
          <button className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      
      {/* File tree */}
      <div className="flex-1 overflow-y-auto p-1">
        {projectFiles.map(item => renderItem(item))}
      </div>
    </div>
  );
};

export default FileExplorer;
