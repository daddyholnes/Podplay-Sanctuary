// Model Registry - Dynamic Vertex Garden Discovery System
// Comprehensive model management with pricing, capabilities, and chat history

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: {
    input_tokens: number;  // cost per 1M tokens
    output_tokens: number; // cost per 1M tokens
    context_window: number;
    monthly_limit?: number;
  };
  parameters: {
    max_tokens: number;
    temperature_range: [number, number];
    top_p_range: [number, number];
    supports_streaming: boolean;
    supports_tools: boolean;
    supports_vision: boolean;
    supports_code: boolean;
  };
  ui_config: {
    color: string;
    icon: string;
    theme: 'light' | 'dark' | 'sanctuary';
  };
  billing_tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'limited' | 'maintenance';
}

export interface ChatSession {
  id: string;
  model_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  total_tokens: number;
  cost_estimate: number;
  is_archived: boolean;
  tags: string[];
}

export interface MediaAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'file';
  mimeType: string;
  size: number;
  url?: string;
  file?: File;
  blob?: Blob;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens_used: number;
  cost: number;
  attachments?: MediaAttachment[];
  metadata?: {
    model_config?: any;
    execution_time?: number;
    memory_context?: string[];
    tools_used?: string[];
  };
}

// ==================== MODEL CONFIGURATIONS ====================

export const MODEL_REGISTRY: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Latest GPT-4 with vision and advanced reasoning',
    capabilities: ['text', 'vision', 'code', 'reasoning', 'tools'],
    pricing: {
      input_tokens: 5.00,
      output_tokens: 15.00,
      context_window: 128000
    },
    parameters: {
      max_tokens: 4096,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#10B981',
      icon: '🧠',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },
  
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Faster, cost-effective GPT-4 variant',
    capabilities: ['text', 'vision', 'code', 'tools'],
    pricing: {
      input_tokens: 0.15,
      output_tokens: 0.60,
      context_window: 128000
    },
    parameters: {
      max_tokens: 4096,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#3B82F6',
      icon: '⚡',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  {
    id: 'o1-preview',
    name: 'OpenAI o1-preview',
    provider: 'OpenAI',
    description: 'Advanced reasoning model for complex problems',
    capabilities: ['reasoning', 'math', 'science', 'code'],
    pricing: {
      input_tokens: 15.00,
      output_tokens: 60.00,
      context_window: 128000
    },
    parameters: {
      max_tokens: 32768,
      temperature_range: [1, 1], // Fixed temperature
      top_p_range: [1, 1], // Fixed top_p
      supports_streaming: false,
      supports_tools: false,
      supports_vision: false,
      supports_code: true
    },
    ui_config: {
      color: '#8B5CF6',
      icon: '🧮',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    description: 'Cost-effective reasoning model',
    capabilities: ['reasoning', 'math', 'science', 'code'],
    pricing: {
      input_tokens: 3.00,
      output_tokens: 12.00,
      context_window: 128000
    },
    parameters: {
      max_tokens: 65536,
      temperature_range: [1, 1],
      top_p_range: [1, 1],
      supports_streaming: false,
      supports_tools: false,
      supports_vision: false,
      supports_code: true
    },
    ui_config: {
      color: '#6366F1',
      icon: '🔬',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  // Anthropic Models - Claude 4 Generation
  {
    id: 'claude-opus-4@20250514',
    name: 'Claude 4 Opus',
    provider: 'Anthropic via Vertex AI',
    description: 'Revolutionary Claude 4 Opus - the most advanced reasoning model with unprecedented capabilities',
    capabilities: ['text', 'vision', 'audio', 'code', 'advanced_reasoning', 'research', 'creative_writing', 'tools', 'long_context'],
    pricing: {
      input_tokens: 15.00,
      output_tokens: 75.00,
      context_window: 1000000 // 1M context window
    },
    parameters: {
      max_tokens: 16384,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#9333EA',
      icon: '🔮',
      theme: 'sanctuary'
    },
    billing_tier: 'enterprise',
    status: 'active'
  },

  {
    id: 'claude-sonnet-4@20250514',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic via Vertex AI',
    description: 'Enhanced Claude 4 Sonnet with improved speed and efficiency while maintaining high quality',
    capabilities: ['text', 'vision', 'audio', 'code', 'reasoning', 'analysis', 'tools', 'multimodal'],
    pricing: {
      input_tokens: 5.00,
      output_tokens: 25.00,
      context_window: 500000
    },
    parameters: {
      max_tokens: 12288,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#EC4899',
      icon: '🎵',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Most capable Claude model with vision',
    capabilities: ['text', 'vision', 'code', 'analysis', 'tools'],
    pricing: {
      input_tokens: 3.00,
      output_tokens: 15.00,
      context_window: 200000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#F59E0B',
      icon: '🎭',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast, cost-effective Claude model',
    capabilities: ['text', 'vision', 'code'],
    pricing: {
      input_tokens: 0.25,
      output_tokens: 1.25,
      context_window: 200000
    },
    parameters: {
      max_tokens: 4096,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: false,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#EF4444',
      icon: '🌸',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  // Google Vertex AI Models - Complete Gemini Foundation Models
  {
    id: 'gemini-2-0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'Google Vertex AI',
    description: 'Cutting-edge experimental Gemini 2.0 with advanced capabilities',
    capabilities: ['text', 'vision', 'audio', 'video', 'web', 'code', 'reasoning', 'tools', 'experimental'],
    pricing: {
      input_tokens: 0.075,
      output_tokens: 0.30,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#F59E0B',
      icon: '🧪',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'gemini-2-0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking (Experimental)',
    provider: 'Google Vertex AI',
    description: 'Experimental Gemini 2.0 with advanced thinking and reasoning capabilities',
    capabilities: ['text', 'vision', 'audio', 'video', 'code', 'reasoning', 'thinking', 'tools'],
    pricing: {
      input_tokens: 0.075,
      output_tokens: 0.30,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#9C27B0',
      icon: '🧠',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'gemini-1-5-pro-002',
    name: 'Gemini 1.5 Pro 002',
    provider: 'Google Vertex AI',
    description: 'Enhanced Gemini 1.5 Pro with improved performance and reliability',
    capabilities: ['text', 'vision', 'audio', 'video', 'code', 'reasoning', 'tools'],
    pricing: {
      input_tokens: 1.25,
      output_tokens: 5.00,
      context_window: 2000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#4285F4',
      icon: '💎',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  // Google Models
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Advanced multimodal model with huge context',
    capabilities: ['text', 'vision', 'code', 'reasoning', 'tools'],
    pricing: {
      input_tokens: 1.25,
      output_tokens: 5.00,
      context_window: 2000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#10B981',
      icon: '💎',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'gemini-1-5-flash-002',
    name: 'Gemini 1.5 Flash 002',
    provider: 'Google Vertex AI',
    description: 'Enhanced fast Gemini model with improved efficiency',
    capabilities: ['text', 'vision', 'audio', 'code', 'tools'],
    pricing: {
      input_tokens: 0.075,
      output_tokens: 0.30,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#34A853',
      icon: '⚡',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Fast, efficient Gemini model',
    capabilities: ['text', 'vision', 'code'],
    pricing: {
      input_tokens: 0.075,
      output_tokens: 0.30,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: false,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#06B6D4',
      icon: '⚡',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  {
    id: 'gemini-1-5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'Google Vertex AI',
    description: 'Compact 8B parameter Gemini model for high-speed tasks',
    capabilities: ['text', 'vision', 'code', 'fast_processing'],
    pricing: {
      input_tokens: 0.0375,
      output_tokens: 0.15,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#22D3EE',
      icon: '🏃',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  {
    id: 'gemini-1-0-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'Google Vertex AI',
    description: 'Original Gemini Pro model with reliable text capabilities',
    capabilities: ['text', 'code', 'reasoning'],
    pricing: {
      input_tokens: 0.50,
      output_tokens: 1.50,
      context_window: 32768
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: false,
      supports_vision: false,
      supports_code: true
    },
    ui_config: {
      color: '#6366F1',
      icon: '🔷',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  {
    id: 'gemini-1-0-pro-vision',
    name: 'Gemini 1.0 Pro Vision',
    provider: 'Google Vertex AI',
    description: 'Original Gemini Pro with vision capabilities',
    capabilities: ['text', 'vision', 'code', 'image_analysis'],
    pricing: {
      input_tokens: 0.25,
      output_tokens: 0.50,
      context_window: 16384
    },
    parameters: {
      max_tokens: 4096,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: false,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#8B5CF6',
      icon: '👁️',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  // LLAMA 4 MODELS - THE SCOUT & MAVERICK
  {
    id: 'llama-4-scout-17bx16e',
    name: 'Llama 4 Scout (17Bx16E)',
    provider: 'Meta via Vertex AI',
    description: 'Llama 4 Scout - Efficient reasoning model with 17B parameters and 16 expert layers',
    capabilities: ['text', 'code', 'reasoning', 'analysis', 'tools', 'efficient_processing'],
    pricing: {
      input_tokens: 3.00,
      output_tokens: 6.00,
      context_window: 256000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      supports_code: true
    },
    ui_config: {
      color: '#16A34A',
      icon: '🕵️',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'llama-4-maverick-17bx128e',
    name: 'Llama 4 Maverick (17Bx128E)',
    provider: 'Meta via Vertex AI',
    description: 'Llama 4 Maverick - Most powerful with 17B parameters and 128 expert mixture for complex reasoning',
    capabilities: ['text', 'code', 'advanced_reasoning', 'research', 'complex_analysis', 'tools', 'expert_mixture'],
    pricing: {
      input_tokens: 8.00,
      output_tokens: 16.00,
      context_window: 512000
    },
    parameters: {
      max_tokens: 16384,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: false,
      supports_code: true
    },
    ui_config: {
      color: '#DC2626',
      icon: '🚀',
      theme: 'sanctuary'
    },
    billing_tier: 'enterprise',
    status: 'active'
  },

  // GEMINI 2.5 MODELS - THE VERTEX POWERHOUSE
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google Vertex AI',
    description: 'Next-generation multimodal AI with native MCP, audio, video, and web capabilities',
    capabilities: ['text', 'vision', 'audio', 'video', 'web', 'mcp_native', 'code', 'reasoning', 'tools'],
    pricing: {
      input_tokens: 1.25,
      output_tokens: 5.00,
      context_window: 2000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#4285F4',
      icon: '🌟',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  },

  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google Vertex AI',
    description: 'Ultra-fast Gemini 2.5 with full multimodal capabilities',
    capabilities: ['text', 'vision', 'audio', 'video', 'web', 'mcp_native', 'code', 'tools'],
    pricing: {
      input_tokens: 0.075,
      output_tokens: 0.30,
      context_window: 1000000
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 2],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#34A853',
      icon: '⚡',
      theme: 'sanctuary'
    },
    billing_tier: 'free',
    status: 'active'
  },

  // MAMA BEAR = GEMINI 2.5 PRO ENHANCED
  {
    id: 'mama-bear-gemini-25',
    name: 'Mama Bear (Gemini 2.5)',
    provider: 'Sanctuary via Vertex AI',
    description: '🐻 Your personal AI agent powered by Gemini 2.5 with memory, MCP tools, local execution, and multimodal capabilities',
    capabilities: ['text', 'vision', 'audio', 'video', 'web', 'memory', 'mcp_native', 'local_execution', 'project_management', 'sanctuary_wisdom'],
    pricing: {
      input_tokens: 1.25, // Vertex AI pricing
      output_tokens: 5.00,
      context_window: 2000000, // Enhanced with memory
      monthly_limit: 1000000 // Generous limit for development
    },
    parameters: {
      max_tokens: 8192,
      temperature_range: [0, 1],
      top_p_range: [0, 1],
      supports_streaming: true,
      supports_tools: true,
      supports_vision: true,
      supports_code: true
    },
    ui_config: {
      color: '#8B5A3C',
      icon: '🐻',
      theme: 'sanctuary'
    },
    billing_tier: 'premium',
    status: 'active'
  }
];

// ==================== UTILITY FUNCTIONS ====================

export const getModelById = (id: string): ModelConfig | undefined => {
  return MODEL_REGISTRY.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): ModelConfig[] => {
  return MODEL_REGISTRY.filter(model => model.provider === provider);
};

export const getModelsByBillingTier = (tier: 'free' | 'premium' | 'enterprise'): ModelConfig[] => {
  return MODEL_REGISTRY.filter(model => model.billing_tier === tier);
};

export const calculateCost = (inputTokens: number, outputTokens: number, modelId: string): number => {
  const model = getModelById(modelId);
  if (!model) return 0;
  
  const inputCost = (inputTokens / 1000000) * model.pricing.input_tokens;
  const outputCost = (outputTokens / 1000000) * model.pricing.output_tokens;
  
  return inputCost + outputCost;
};

export const getRecommendedModels = (task: string): ModelConfig[] => {
  const taskMappings: Record<string, string[]> = {
    'coding': ['claude-opus-4@20250514', 'claude-sonnet-4@20250514', 'claude-3-5-sonnet', 'gpt-4o', 'o1-preview', 'gemini-2.0-flash-thinking-exp'],
    'reasoning': ['claude-opus-4@20250514', 'llama-4-maverick-17bx128e', 'o1-preview', 'o1-mini', 'gemini-2.0-flash-thinking-exp', 'claude-sonnet-4@20250514'],
    'vision': ['claude-opus-4@20250514', 'gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro-002', 'gemini-2.0-flash-exp'],
    'cost-effective': ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash-002', 'gemini-1.5-flash-8b', 'mistral-7b'],
    'large-context': ['llama-4-maverick-17bx128e', 'gemini-1.5-pro-002', 'claude-opus-4@20250514', 'claude-sonnet-4@20250514', 'meta-llama-3-1-405b'],
    'experimental': ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp', 'claude-opus-4@20250514', 'llama-4-scout-17bx16e'],
    'multimodal': ['claude-opus-4@20250514', 'gemini-2.0-flash-exp', 'gpt-4o', 'gemini-1.5-pro-002', 'claude-3-5-sonnet'],
    'enterprise': ['claude-opus-4@20250514', 'llama-4-maverick-17bx128e', 'o1-preview', 'gemini-1.5-pro-002'],
    'local': ['mama-bear-gemini-25'],
    'mama-bear': ['mama-bear-gemini-25', 'gemini-2.0-flash-thinking-exp', 'gemini-2.0-flash-exp']
  };

  const recommendedIds = taskMappings[task] || [];
  return recommendedIds.map(id => getModelById(id)).filter(Boolean) as ModelConfig[];
};
