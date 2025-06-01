/**
 * GeminiService - AI service integration for Google Gemini models
 * Handles AI generation, planning, and intelligent responses
 */

import { apiClient } from '../api/APIClient';
import { 
  AIGenerateRequest, 
  AIGenerateResponse, 
  AIPlanRequest, 
  AIPlanResponse,
  AIModel 
} from '../api/APITypes';

export interface GeminiConfig {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface GeminiGenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  systemMessage?: string;
  stream?: boolean;
}

export interface GeminiPlanOptions {
  model?: string;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
  includeTimeline?: boolean;
  includeDependencies?: boolean;
}

export class GeminiService {
  private config: GeminiConfig;
  private availableModels: AIModel[] = [];
  private defaultModel: string = 'gemini-pro';

  constructor(config: GeminiConfig = {}) {
    this.config = {
      baseURL: '/api/ai',
      defaultModel: 'gemini-pro',
      timeout: 60000,
      maxRetries: 3,
      ...config,
    };
    this.defaultModel = this.config.defaultModel!;
  }

  /**
   * Initialize the service and load available models
   */
  async initialize(): Promise<void> {
    try {
      const response = await apiClient.get<AIModel[]>('/api/ai/models');
      this.availableModels = response.data;
      
      // Set default model if available
      const geminiModels = this.availableModels.filter(m => 
        m.id.includes('gemini') || m.provider === 'google'
      );
      if (geminiModels.length > 0) {
        this.defaultModel = geminiModels[0].id;
      }
    } catch (error) {
      console.warn('Failed to load AI models:', error);
      // Continue with fallback default
    }
  }

  /**
   * Generate AI response for a given prompt
   */
  async generate(
    prompt: string, 
    options: GeminiGenerateOptions = {}
  ): Promise<AIGenerateResponse> {
    const request: AIGenerateRequest = {
      prompt,
      modelId: options.model || this.defaultModel,
      maxTokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      systemMessage: options.systemMessage,
    };

    try {
      const response = await apiClient.post<AIGenerateResponse>(
        '/api/ai/generate',
        request,
        { timeout: this.config.timeout }
      );
      return response.data;
    } catch (error) {
      throw new Error(`AI generation failed: ${error}`);
    }
  }

  /**
   * Generate a structured plan for a given goal
   */
  async generatePlan(
    goal: string,
    context?: string,
    options: GeminiPlanOptions = {}
  ): Promise<AIPlanResponse> {
    const request: AIPlanRequest = {
      goal,
      context,
      constraints: this.buildPlanConstraints(options),
      modelId: options.model || this.defaultModel,
    };

    try {
      const response = await apiClient.post<AIPlanResponse>(
        '/api/ai/plan',
        request,
        { timeout: this.config.timeout }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Plan generation failed: ${error}`);
    }
  }

  /**
   * Generate chat response with conversation context
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    options: GeminiGenerateOptions = {}
  ): Promise<AIGenerateResponse> {
    // Build conversation context
    let prompt = '';
    if (conversationHistory.length > 0) {
      prompt = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n') + '\n';
    }
    prompt += `user: ${message}\nassistant:`;

    return this.generate(prompt, {
      ...options,
      systemMessage: options.systemMessage || this.getDefaultChatSystemMessage(),
    });
  }

  /**
   * Generate code completion or code-related responses
   */
  async generateCode(
    instruction: string,
    language: string = 'typescript',
    context?: string,
    options: GeminiGenerateOptions = {}
  ): Promise<AIGenerateResponse> {
    const systemMessage = `You are an expert ${language} developer. Generate high-quality, well-documented code that follows best practices. ${context ? `Context: ${context}` : ''}`;
    
    return this.generate(instruction, {
      ...options,
      systemMessage,
      temperature: 0.3, // Lower temperature for more deterministic code
    });
  }

  /**
   * Analyze and explain code
   */
  async analyzeCode(
    code: string,
    language: string = 'typescript',
    options: GeminiGenerateOptions = {}
  ): Promise<AIGenerateResponse> {
    const prompt = `Analyze the following ${language} code and provide a detailed explanation of what it does, its purpose, and any potential improvements:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    return this.generate(prompt, {
      ...options,
      systemMessage: 'You are an expert code reviewer. Provide thorough, constructive analysis.',
      temperature: 0.4,
    });
  }

  /**
   * Generate documentation for code
   */
  async generateDocumentation(
    code: string,
    language: string = 'typescript',
    docStyle: 'jsdoc' | 'markdown' | 'inline' = 'jsdoc',
    options: GeminiGenerateOptions = {}
  ): Promise<AIGenerateResponse> {
    const prompt = `Generate ${docStyle} documentation for the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    return this.generate(prompt, {
      ...options,
      systemMessage: `You are a technical writer specializing in ${docStyle} documentation. Create comprehensive, clear documentation.`,
      temperature: 0.3,
    });
  }

  /**
   * Get available AI models
   */
  getAvailableModels(): AIModel[] {
    return this.availableModels;
  }

  /**
   * Get default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Set default model
   */
  setDefaultModel(modelId: string): void {
    const model = this.availableModels.find(m => m.id === modelId);
    if (model) {
      this.defaultModel = modelId;
    } else {
      throw new Error(`Model ${modelId} not found in available models`);
    }
  }

  /**
   * Check if a model supports a specific capability
   */
  modelSupports(modelId: string, capability: string): boolean {
    const model = this.availableModels.find(m => m.id === modelId);
    return model?.capabilities.includes(capability) || false;
  }

  /**
   * Get optimal model for a specific task
   */
  getOptimalModelForTask(task: 'chat' | 'code' | 'planning' | 'analysis'): string {
    const taskModelPreferences = {
      chat: ['gemini-pro', 'gemini-1.5-pro'],
      code: ['gemini-pro', 'gemini-1.5-pro'],
      planning: ['gemini-1.5-pro', 'gemini-pro'],
      analysis: ['gemini-1.5-pro', 'gemini-pro'],
    };

    const preferences = taskModelPreferences[task] || [this.defaultModel];
    
    for (const preferred of preferences) {
      if (this.availableModels.some(m => m.id === preferred)) {
        return preferred;
      }
    }
    
    return this.defaultModel;
  }

  /**
   * Build plan constraints based on options
   */
  private buildPlanConstraints(options: GeminiPlanOptions): string[] {
    const constraints: string[] = [];
    
    if (options.detailLevel === 'basic') {
      constraints.push('Keep the plan high-level with 5-10 main steps');
    } else if (options.detailLevel === 'detailed') {
      constraints.push('Provide detailed steps with sub-tasks and clear descriptions');
    } else if (options.detailLevel === 'comprehensive') {
      constraints.push('Create a comprehensive plan with detailed steps, sub-tasks, prerequisites, and success criteria');
    }
    
    if (options.includeTimeline) {
      constraints.push('Include estimated time for each step');
    }
    
    if (options.includeDependencies) {
      constraints.push('Specify dependencies between steps');
    }
    
    return constraints;
  }

  /**
   * Get default system message for chat
   */
  private getDefaultChatSystemMessage(): string {
    return 'You are a helpful, intelligent assistant. Provide accurate, helpful, and thoughtful responses. Be concise but thorough in your explanations.';
  }

  /**
   * Calculate estimated cost for a request
   */
  calculateEstimatedCost(
    promptTokens: number, 
    maxTokens: number, 
    modelId?: string
  ): number {
    const model = this.availableModels.find(m => m.id === (modelId || this.defaultModel));
    if (!model?.costPer1000Tokens) return 0;
    
    const totalTokens = promptTokens + maxTokens;
    return (totalTokens / 1000) * model.costPer1000Tokens;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
