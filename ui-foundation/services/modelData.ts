import { Model } from './modelService';

// Model data including latest models from all providers
export const modelData: Record<string, Model> = {
  // Gemini Models
  'gemini-1.5-pro': {
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    description: 'Best for complex tasks, reasoning, and code generation.',
    maxTokens: 1048576,
    capabilities: ['text', 'image', 'audio', 'video'],
    color: '#8e24aa',
    icon: 'sparkles',
    badge: {
      text: 'PRO',
      color: 'violet'
    },
    pricing: '$0.00175 / 1K tokens',
    rpm: '60 RPM',
    knowledgeCutoff: 'Feb 2024',
    logoUrl: '../logos/gemini-logo_brandlogos.net_fwajr-512x512.png'
  },
  'gemini-1.5-flash': {
    provider: 'google',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for everyday tasks.',
    maxTokens: 1048576,
    capabilities: ['text', 'image', 'audio'],
    color: '#7e57c2',
    icon: 'zap',
    badge: {
      text: 'FLASH',
      color: 'blue'
    },
    pricing: '$0.0007 / 1K tokens',
    rpm: '120 RPM',
    knowledgeCutoff: 'Feb 2024',
    logoUrl: '../logos/gemini.png'
  },
  'gemini-1.5-ultra': {
    provider: 'google',
    displayName: 'Gemini 1.5 Ultra',
    description: 'Highest capability model for complex tasks.',
    maxTokens: 1048576,
    capabilities: ['text', 'image', 'audio', 'video', 'code'],
    color: '#5e35b1',
    icon: 'gem',
    badge: {
      text: 'ULTRA',
      color: 'indigo'
    },
    pricing: '$0.00345 / 1K tokens',
    rpm: '40 RPM',
    knowledgeCutoff: 'Apr 2024',
    logoUrl: '../logos/gemini-logo_brandlogos.net_fwajr-512x512.png'
  },
  
  // OpenAI Models
  'gpt-4.1-turbo': {
    provider: 'openai',
    displayName: 'GPT-4.1 Turbo',
    description: 'Latest GPT model for general purpose use.',
    maxTokens: 128000,
    capabilities: ['text', 'image', 'code'],
    color: '#10a37f',
    icon: 'bot',
    badge: {
      text: 'NEW',
      color: 'green'
    },
    pricing: '$0.01 / 1K tokens',
    rpm: '100 RPM',
    knowledgeCutoff: 'Apr 2025',
    logoUrl: '../logos/openai-icon-2021x2048-4rpe5x7n.png'
  },
  'gpt-4.1-mini': {
    provider: 'openai',
    displayName: 'GPT-4.1 Mini',
    description: 'Efficient and cost-effective for everyday tasks.',
    maxTokens: 64000,
    capabilities: ['text', 'image', 'code'],
    color: '#10a37f',
    icon: 'bot',
    pricing: '$0.003 / 1K tokens',
    rpm: '240 RPM',
    knowledgeCutoff: 'Apr 2025',
    logoUrl: '../logos/openai-icon-2021x2048-4rpe5x7n.png'
  },
  'gpt-4o': {
    provider: 'openai',
    displayName: 'GPT-4o',
    description: 'Vision, audio, and advanced reasoning.',
    maxTokens: 32000,
    capabilities: ['text', 'image', 'audio', 'video'],
    color: '#10a37f',
    icon: 'eye',
    pricing: '$0.005 / 1K tokens',
    rpm: '150 RPM',
    knowledgeCutoff: 'Oct 2024',
    logoUrl: '../logos/openai-icon-2021x2048-4rpe5x7n.png'
  },
  
  // Anthropic Models
  'claude-opus-4': {
    provider: 'anthropic',
    displayName: 'Claude Opus 4',
    description: 'Flagship model with highest capabilities.',
    maxTokens: 200000,
    capabilities: ['text', 'image', 'code', 'pdf'],
    color: '#5436da',
    icon: 'bot',
    badge: {
      text: 'OPUS',
      color: 'purple'
    },
    pricing: '$0.015 / 1K tokens',
    rpm: '50 RPM',
    knowledgeCutoff: 'Nov 2024',
    logoUrl: '../logos/claude-ai9117.logowik.com.webp'
  },
  'claude-sonnet-3.7': {
    provider: 'anthropic',
    displayName: 'Claude Sonnet 3.7',
    description: 'Balanced performance for general use.',
    maxTokens: 150000,
    capabilities: ['text', 'image', 'code', 'pdf'],
    color: '#5436da',
    icon: 'music',
    badge: {
      text: 'SONNET',
      color: 'indigo'
    },
    pricing: '$0.003 / 1K tokens',
    rpm: '120 RPM',
    knowledgeCutoff: 'Nov 2024',
    logoUrl: '../logos/claude-ai9117.logowik.com.webp'
  },
  'claude-haiku-3.5': {
    provider: 'anthropic',
    displayName: 'Claude Haiku 3.5',
    description: 'Fast responses for everyday tasks.',
    maxTokens: 70000,
    capabilities: ['text', 'image'],
    color: '#5436da',
    icon: 'zap',
    badge: {
      text: 'HAIKU',
      color: 'blue'
    },
    pricing: '$0.00025 / 1K tokens',
    rpm: '250 RPM',
    knowledgeCutoff: 'Aug 2024',
    logoUrl: '../logos/claude-ai9117.logowik.com.webp'
  }
};

// Group models by provider
export const modelGroups = {
  'Gemini 2 Models': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-ultra'],
  'GPT-4 Models': ['gpt-4.1-turbo', 'gpt-4.1-mini', 'gpt-4o'],
  'Claude Models': ['claude-opus-4', 'claude-sonnet-3.7', 'claude-haiku-3.5']
};

// Get the models for the getModels function
export function getMockModels(): Record<string, Model> {
  return modelData;
}
