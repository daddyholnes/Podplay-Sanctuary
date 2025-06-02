// ModelService.ts - Service for interacting with AI models and their capabilities
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

// Type definitions for AI models and capabilities
export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic' | 'local';
  version: string;
  capabilities: {
    streaming: boolean;
    multimodal: boolean;
    function_calling: boolean;
    web_search: boolean;
    code_generation: boolean;
    token_limit: number;
    supports_audio: boolean;
    supports_video: boolean;
    supports_images: boolean;
  };
  pricing?: {
    input_per_1k_tokens: number;
    output_per_1k_tokens: number;
    currency: string;
  };
  description?: string;
  avatarUrl?: string;
}

export interface ModelPreference {
  id: string;
  model_id: string;
  user_id: string;
  is_favorite: boolean;
  settings: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    max_output_tokens?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ModelService - Manages AI model information, preferences, and selection
 * Handles model capabilities, pricing, and user preferences
 */
class ModelService {
  /**
   * Get all available AI models
   * @returns Promise with array of models
   */
  async getAvailableModels(): Promise<ApiResponse<AIModel[]>> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MODELS));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return {
        success: false,
        error: 'Failed to load available models. Please try again.',
        // Return mock data as fallback to prevent UI breaking
        data: this.getMockModels()
      };
    }
  }

  /**
   * Get user preferences for a specific model
   * @param modelId - ID of the model
   * @returns Promise with model preferences
   */
  async getModelPreferences(modelId: string): Promise<ApiResponse<ModelPreference>> {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MODELS)}/${modelId}/preferences`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch preferences for model ${modelId}:`, error);
      return {
        success: false,
        error: 'Failed to load model preferences. Please try again.'
      };
    }
  }

  /**
   * Update user preferences for a specific model
   * @param modelId - ID of the model
   * @param preferences - Updated preference settings
   * @returns Promise with updated preferences
   */
  async updateModelPreferences(
    modelId: string,
    preferences: {
      is_favorite?: boolean;
      settings?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        max_output_tokens?: number;
        [key: string]: any;
      }
    }
  ): Promise<ApiResponse<ModelPreference>> {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MODELS)}/${modelId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to update preferences for model ${modelId}:`, error);
      return {
        success: false,
        error: 'Failed to update model preferences. Please try again.'
      };
    }
  }

  /**
   * Calculate token usage for a message
   * @param message - Message to estimate token usage for
   * @param modelId - ID of the model to use for calculation
   * @returns Promise with token count information
   */
  async estimateTokenUsage(
    message: string,
    modelId: string
  ): Promise<ApiResponse<{ tokens: number; cost?: number }>> {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.MAMA_BEAR.MODELS)}/${modelId}/token-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to estimate token usage:', error);
      return {
        success: false,
        error: 'Failed to estimate token usage. Using approximate calculation instead.',
        // Return approximate calculation
        data: {
          tokens: Math.ceil(message.length / 4), // Very rough approximation
          cost: 0
        }
      };
    }
  }

  /**
   * Generate mock AI models for development and fallback
   * @returns Array of mock AI models
   */
  private getMockModels(): AIModel[] {
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        version: '1.0',
        capabilities: {
          streaming: true,
          multimodal: true,
          function_calling: true,
          web_search: true,
          code_generation: true,
          token_limit: 32000,
          supports_audio: true,
          supports_video: false,
          supports_images: true
        },
        pricing: {
          input_per_1k_tokens: 0.00025,
          output_per_1k_tokens: 0.0005,
          currency: 'USD'
        },
        description: 'Google Gemini Pro - Advanced reasoning, instruction following, and code generation',
        avatarUrl: '/assets/icons/gemini-icon.svg'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        version: '3.0',
        capabilities: {
          streaming: true,
          multimodal: true,
          function_calling: true,
          web_search: true,
          code_generation: true,
          token_limit: 200000,
          supports_audio: true,
          supports_video: true,
          supports_images: true
        },
        pricing: {
          input_per_1k_tokens: 0.015,
          output_per_1k_tokens: 0.075,
          currency: 'USD'
        },
        description: 'Anthropic Claude 3 Opus - State-of-the-art reasoning and content generation',
        avatarUrl: '/assets/icons/claude-icon.svg'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        version: '4.0',
        capabilities: {
          streaming: true,
          multimodal: true,
          function_calling: true,
          web_search: true,
          code_generation: true,
          token_limit: 128000,
          supports_audio: true,
          supports_video: false,
          supports_images: true
        },
        pricing: {
          input_per_1k_tokens: 0.01,
          output_per_1k_tokens: 0.03,
          currency: 'USD'
        },
        description: 'OpenAI GPT-4 Turbo - High performance reasoning and instruction following',
        avatarUrl: '/assets/icons/openai-icon.svg'
      },
      {
        id: 'mama-bear-local',
        name: 'Mama Bear (Local)',
        provider: 'local',
        version: '1.0',
        capabilities: {
          streaming: true,
          multimodal: true,
          function_calling: true,
          web_search: true,
          code_generation: true,
          token_limit: 32000,
          supports_audio: true,
          supports_video: true,
          supports_images: true
        },
        description: 'Local Mama Bear - Optimized for Podplay Build with enhanced memory features',
        avatarUrl: '/assets/icons/mama-bear-icon.svg'
      }
    ];
  }
}

// Export a singleton instance
export const modelService = new ModelService();
export default modelService;
