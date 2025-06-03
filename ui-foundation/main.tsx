import React from 'react';
import { createRoot } from 'react-dom/client';
import ScoutMultiModalChat from './ScoutMultiModalChat';
import './style.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <div className="h-screen flex flex-col bg-gradient-to-r from-purple-900 to-indigo-900">
      <ScoutMultiModalChat />
    </div>
  </React.StrictMode>
);
