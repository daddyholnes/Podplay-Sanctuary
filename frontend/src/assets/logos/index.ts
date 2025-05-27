// Logo assets index for Mini App Launcher
// Provides consistent logo access with fallbacks

export interface LogoAsset {
  id: string;
  name: string;
  logoUrl: string;
  iconUrl?: string;
  fallbackIcon: string;
  bgColor?: string;
  textColor?: string;
}

// Logo asset registry with direct URLs to official logos
export const LOGO_REGISTRY: Record<string, LogoAsset> = {
  // AI Tools
  'chatgpt': {
    id: 'chatgpt',
    name: 'ChatGPT',
    logoUrl: 'https://static.openai.com/images/openai-blossom.svg',
    fallbackIcon: '🤖',
    bgColor: '#74AA9C',
    textColor: '#FFFFFF'
  },
  'claude': {
    id: 'claude',
    name: 'Claude',
    logoUrl: 'https://claude.ai/favicon.ico',
    fallbackIcon: '🧠',
    bgColor: '#CC785C',
    textColor: '#FFFFFF'
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity AI',
    logoUrl: 'https://www.perplexity.ai/favicon.ico',
    fallbackIcon: '🔍',
    bgColor: '#20B2B5',
    textColor: '#FFFFFF'
  },
  'gemini': {
    id: 'gemini',
    name: 'Gemini',
    logoUrl: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.svg',
    fallbackIcon: '✨',
    bgColor: '#4285F4',
    textColor: '#FFFFFF'
  },
  'notebooklm': {
    id: 'notebooklm',
    name: 'NotebookLM',
    logoUrl: 'https://notebooklm.google.com/favicon.ico',
    fallbackIcon: '📓',
    bgColor: '#0F9D58',
    textColor: '#FFFFFF'
  },
  'copilot': {
    id: 'copilot',
    name: 'GitHub Copilot',
    logoUrl: 'https://github.githubassets.com/favicons/favicon.svg',
    fallbackIcon: '🤖',
    bgColor: '#24292e',
    textColor: '#FFFFFF'  },
  'grok': {
    id: 'grok',
    name: 'Grok',
    logoUrl: 'https://grok.x.ai/favicon.ico',
    fallbackIcon: '🤖',
    bgColor: '#1DA1F2',
    textColor: '#FFFFFF'
  },
  
  // Coding Tools
  'github': {
    id: 'github',
    name: 'GitHub',
    logoUrl: 'https://github.githubassets.com/favicons/favicon.svg',
    fallbackIcon: '📦',
    bgColor: '#24292e',
    textColor: '#FFFFFF'
  },
  'vscode-web': {
    id: 'vscode-web',
    name: 'VS Code Web',
    logoUrl: 'https://code.visualstudio.com/favicon.ico',
    fallbackIcon: '💻',
    bgColor: '#007ACC',
    textColor: '#FFFFFF'
  },
  'replit': {
    id: 'replit',
    name: 'Replit',
    logoUrl: 'https://replit.com/favicon.ico',
    fallbackIcon: '🔧',
    bgColor: '#F26207',
    textColor: '#FFFFFF'
  },
  'stackblitz': {
    id: 'stackblitz',
    name: 'StackBlitz',
    logoUrl: 'https://stackblitz.com/favicon.ico',
    fallbackIcon: '⚡',
    bgColor: '#1976D2',
    textColor: '#FFFFFF'
  },
  'codesandbox': {
    id: 'codesandbox',
    name: 'CodeSandbox',
    logoUrl: 'https://codesandbox.io/favicon.ico',
    fallbackIcon: '🏖️',
    bgColor: '#151515',
    textColor: '#FFFFFF'
  },
  'codepen': {
    id: 'codepen',
    name: 'CodePen',
    logoUrl: 'https://codepen.io/favicon.ico',
    fallbackIcon: '✏️',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  
  // Productivity Tools
  'notion': {
    id: 'notion',
    name: 'Notion',
    logoUrl: 'https://www.notion.so/favicon.ico',
    fallbackIcon: '📝',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'obsidian': {
    id: 'obsidian',
    name: 'Obsidian',
    logoUrl: 'https://obsidian.md/favicon.ico',
    fallbackIcon: '🔗',
    bgColor: '#7C3AED',
    textColor: '#FFFFFF'
  },
  'linear': {
    id: 'linear',
    name: 'Linear',
    logoUrl: 'https://linear.app/favicon.ico',
    fallbackIcon: '📋',
    bgColor: '#5E6AD2',
    textColor: '#FFFFFF'
  },
  'figma': {
    id: 'figma',
    name: 'Figma',
    logoUrl: 'https://www.figma.com/favicon.ico',
    fallbackIcon: '🎨',
    bgColor: '#F24E1E',
    textColor: '#FFFFFF'
  },
  'miro': {
    id: 'miro',
    name: 'Miro',
    logoUrl: 'https://miro.com/favicon.ico',
    fallbackIcon: '🎯',
    bgColor: '#050038',
    textColor: '#FFFFFF'
  },
  'canva': {
    id: 'canva',
    name: 'Canva',
    logoUrl: 'https://www.canva.com/favicon.ico',
    fallbackIcon: '🖼️',
    bgColor: '#00C4CC',
    textColor: '#FFFFFF'
  },
  
  // Utilities
  'excalidraw': {
    id: 'excalidraw',
    name: 'Excalidraw',
    logoUrl: 'https://excalidraw.com/favicon.ico',
    fallbackIcon: '✏️',
    bgColor: '#6965db',
    textColor: '#FFFFFF'
  },
  'regex101': {
    id: 'regex101',
    name: 'Regex101',
    logoUrl: 'https://regex101.com/favicon.ico',
    fallbackIcon: '🔤',
    bgColor: '#1e88e5',
    textColor: '#FFFFFF'
  },
  'json-formatter': {
    id: 'json-formatter',
    name: 'JSON Formatter',
    logoUrl: 'https://jsonformatter.curiousconcept.com/favicon.ico',
    fallbackIcon: '📄',
    bgColor: '#FF6B35',
    textColor: '#FFFFFF'
  },
  'base64': {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    logoUrl: 'https://www.base64encode.org/favicon.ico',
    fallbackIcon: '🔐',
    bgColor: '#2E8B57',
    textColor: '#FFFFFF'
  },
  'color-picker': {
    id: 'color-picker',
    name: 'Coolors',
    logoUrl: 'https://coolors.co/favicon.ico',
    fallbackIcon: '🎨',
    bgColor: '#6C5CE7',
    textColor: '#FFFFFF'
  },

  // Additional logos for missing services
  'cursor': {
    id: 'cursor',
    name: 'Cursor',
    logoUrl: 'https://cursor.so/favicon.ico',
    fallbackIcon: '🎯',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  }
};

// Get logo for a mini app
export const getLogo = (appId: string): LogoAsset => {
  return LOGO_REGISTRY[appId] || {
    id: appId,
    name: appId,
    logoUrl: '',
    fallbackIcon: '🔧',
    bgColor: '#6B7280',
    textColor: '#FFFFFF'
  };
};

// Check if logo URL is accessible
export const isLogoAccessible = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
};
