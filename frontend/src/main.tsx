import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS

// Welcome message for Nathan's sanctuary
console.log(`
🐻 Welcome to Nathan's Podplay Build Sanctuary
🏠 Mama Bear Gem - Lead Developer Agent is ready
✨ Your sanctuary for calm, empowered creation
`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
