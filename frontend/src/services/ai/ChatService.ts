import { GeminiService } from './GeminiService';
import { APIClient } from '../api/APIClient';
import { 
  ChatMessage, 
  ChatResponse, 
  ChatContext,
  AIModel,
  ChatError,
  StreamingResponse
} from '../api/APITypes';

export interface ChatServiceConfig {
  defaultModel?: AIModel;
  maxTokens?: number;
  temperature?: number;
  maxHistory?: number;
  enableStreaming?: boolean;
  enableCodeGeneration?: boolean;
  enableContextAwareness?: boolean;
  systemPrompt?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  context: ChatContext;
  model: AIModel;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface ChatMetrics {
  totalMessages: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
  mostUsedModel: AIModel;
}

export class ChatService {
  private geminiService: GeminiService;
  private apiClient: APIClient;
  private config: Required<ChatServiceConfig>;
  private activeSessions = new Map<string, ChatSession>();
  private streamingControllers = new Map<string, AbortController>();
  private metrics: ChatMetrics = {
    totalMessages: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    errorRate: 0,
    mostUsedModel: 'gemini-pro'
  };

  constructor(
    geminiService: GeminiService,
    apiClient: APIClient,
    config: ChatServiceConfig = {}
  ) {
    this.geminiService = geminiService;
    this.apiClient = apiClient;
    
    this.config = {
      defaultModel: config.defaultModel ?? 'gemini-pro',
      maxTokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
      maxHistory: config.maxHistory ?? 50,
      enableStreaming: config.enableStreaming ?? true,
      enableCodeGeneration: config.enableCodeGeneration ?? true,
      enableContextAwareness: config.enableContextAwareness ?? true,
      systemPrompt: config.systemPrompt ?? 'You are a helpful AI assistant specialized in software development and coding.'
    };
  }

  async createSession(name: string, options: {
    model?: AIModel;
    systemPrompt?: string;
    context?: Partial<ChatContext>;
  } = {}): Promise<ChatSession> {
    const sessionId = this.generateSessionId();
    
    const session: ChatSession = {
      id: sessionId,
      name,
      messages: [],
      context: {
        workspaceFiles: options.context?.workspaceFiles ?? [],
        selectedCode: options.context?.selectedCode ?? '',
        currentFile: options.context?.currentFile ?? '',
        projectType: options.context?.projectType ?? 'unknown',
        framework: options.context?.framework ?? '',
        language: options.context?.language ?? '',
        dependencies: options.context?.dependencies ?? [],
        ...options.context
      },
      model: options.model ?? this.config.defaultModel,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {}
    };

    // Add system message if provided
    if (options.systemPrompt || this.config.systemPrompt) {
      session.messages.push({
        id: this.generateMessageId(),
        content: options.systemPrompt || this.config.systemPrompt,
        role: 'system',
        timestamp: new Date(),
        sessionId
      });
    }

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async sendMessage(
    sessionId: string, 
    content: string, 
    options: {
      model?: AIModel;
      streaming?: boolean;
      attachments?: any[];
      context?: Partial<ChatContext>;
    } = {}
  ): Promise<ChatResponse | AsyncGenerator<StreamingResponse>> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const startTime = Date.now();
    const messageId = this.generateMessageId();
    
    // Create user message
    const userMessage: ChatMessage = {
      id: messageId,
      content,
      role: 'user',
      timestamp: new Date(),
      sessionId,
      attachments: options.attachments
    };

    // Update session context if provided
    if (options.context) {
      session.context = { ...session.context, ...options.context };
    }

    // Add user message to session
    session.messages.push(userMessage);
    session.updatedAt = new Date();

    try {
      const model = options.model ?? session.model;
      const enableStreaming = options.streaming ?? this.config.enableStreaming;

      let response: ChatResponse | AsyncGenerator<StreamingResponse>;

      if (enableStreaming) {
        response = await this.handleStreamingResponse(session, model, content);
      } else {
        response = await this.handleRegularResponse(session, model, content);
      }

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, model);

      return response;
    } catch (error) {
      this.metrics.errorRate++;
      
      const errorResponse: ChatResponse = {
        id: this.generateMessageId(),
        content: `I apologize, but I encountered an error: ${(error as Error).message}`,
        role: 'assistant',
        timestamp: new Date(),
        sessionId,
        error: {
          code: 'CHAT_ERROR',
          message: (error as Error).message
        }
      };

      session.messages.push(errorResponse);
      session.updatedAt = new Date();

      throw error;
    }
  }

  private async handleRegularResponse(
    session: ChatSession, 
    model: AIModel, 
    userInput: string
  ): Promise<ChatResponse> {
    const conversationHistory = this.buildConversationHistory(session);
    
    let assistantResponse: string;

    switch (model) {
      case 'gemini-pro':
      case 'gemini-pro-vision':
        assistantResponse = await this.geminiService.generateResponse(
          userInput,
          {
            conversationHistory,
            context: session.context,
            maxTokens: this.config.maxTokens,
            temperature: this.config.temperature
          }
        );
        break;
      
      default:
        // Fallback to API client for other models
        const apiResponse = await this.apiClient.post('/chat/completions', {
          model,
          messages: conversationHistory,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        });
        assistantResponse = apiResponse.data.choices[0].message.content;
    }

    const response: ChatResponse = {
      id: this.generateMessageId(),
      content: assistantResponse,
      role: 'assistant',
      timestamp: new Date(),
      sessionId: session.id,
      model,
      tokenUsage: {
        promptTokens: this.estimateTokens(conversationHistory),
        completionTokens: this.estimateTokens([{ role: 'assistant', content: assistantResponse }]),
        totalTokens: 0
      }
    };

    response.tokenUsage!.totalTokens = response.tokenUsage!.promptTokens + response.tokenUsage!.completionTokens;

    // Add response to session
    session.messages.push(response);
    session.updatedAt = new Date();

    // Trim history if needed
    this.trimSessionHistory(session);

    return response;
  }

  private async handleStreamingResponse(
    session: ChatSession, 
    model: AIModel, 
    userInput: string
  ): Promise<AsyncGenerator<StreamingResponse>> {
    const conversationHistory = this.buildConversationHistory(session);
    const controller = new AbortController();
    this.streamingControllers.set(session.id, controller);

    const responseId = this.generateMessageId();
    let fullContent = '';

    return (async function* (this: ChatService) {
      try {
        let streamGenerator: AsyncGenerator<string>;

        switch (model) {
          case 'gemini-pro':
          case 'gemini-pro-vision':
            streamGenerator = this.geminiService.generateStreamingResponse(
              userInput,
              {
                conversationHistory,
                context: session.context,
                maxTokens: this.config.maxTokens,
                temperature: this.config.temperature
              }
            );
            break;
          
          default:
            // For other models, we'd implement streaming via API client
            throw new Error(`Streaming not supported for model: ${model}`);
        }

        for await (const chunk of streamGenerator) {
          if (controller.signal.aborted) {
            break;
          }

          fullContent += chunk;
          
          yield {
            id: responseId,
            content: chunk,
            fullContent,
            role: 'assistant',
            timestamp: new Date(),
            sessionId: session.id,
            model,
            isComplete: false
          };
        }

        // Send final message
        const finalResponse: ChatResponse = {
          id: responseId,
          content: fullContent,
          role: 'assistant',
          timestamp: new Date(),
          sessionId: session.id,
          model,
          tokenUsage: {
            promptTokens: this.estimateTokens(conversationHistory),
            completionTokens: this.estimateTokens([{ role: 'assistant', content: fullContent }]),
            totalTokens: 0
          }
        };

        finalResponse.tokenUsage!.totalTokens = finalResponse.tokenUsage!.promptTokens + finalResponse.tokenUsage!.completionTokens;

        session.messages.push(finalResponse);
        session.updatedAt = new Date();
        this.trimSessionHistory(session);

        yield {
          ...finalResponse,
          fullContent,
          isComplete: true
        } as StreamingResponse;

      } catch (error) {
        yield {
          id: responseId,
          content: '',
          fullContent: '',
          role: 'assistant',
          timestamp: new Date(),
          sessionId: session.id,
          model,
          isComplete: true,
          error: {
            code: 'STREAMING_ERROR',
            message: (error as Error).message
          }
        };
      } finally {
        this.streamingControllers.delete(session.id);
      }
    }).call(this);
  }

  async stopStreaming(sessionId: string): Promise<void> {
    const controller = this.streamingControllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.streamingControllers.delete(sessionId);
    }
  }

  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.activeSessions.get(sessionId);
  }

  async getAllSessions(): Promise<ChatSession[]> {
    return Array.from(this.activeSessions.values());
  }

  async updateSessionContext(sessionId: string, context: Partial<ChatContext>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      session.updatedAt = new Date();
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.activeSessions.delete(sessionId);
    const controller = this.streamingControllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.streamingControllers.delete(sessionId);
    }
  }

  async clearSessionHistory(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Keep only system messages
      session.messages = session.messages.filter(msg => msg.role === 'system');
      session.updatedAt = new Date();
    }
  }

  async generateCode(
    prompt: string, 
    language: string, 
    context?: ChatContext
  ): Promise<string> {
    if (!this.config.enableCodeGeneration) {
      throw new Error('Code generation is disabled');
    }

    return await this.geminiService.generateCode(prompt, language, context);
  }

  async explainCode(code: string, language?: string): Promise<string> {
    return await this.geminiService.explainCode(code, language);
  }

  async reviewCode(code: string, language?: string): Promise<string> {
    return await this.geminiService.reviewCode(code, language);
  }

  getMetrics(): ChatMetrics {
    return { ...this.metrics };
  }

  private buildConversationHistory(session: ChatSession): any[] {
    return session.messages
      .slice(-this.config.maxHistory)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  private trimSessionHistory(session: ChatSession): void {
    if (session.messages.length > this.config.maxHistory) {
      // Keep system messages and recent messages
      const systemMessages = session.messages.filter(msg => msg.role === 'system');
      const recentMessages = session.messages
        .filter(msg => msg.role !== 'system')
        .slice(-this.config.maxHistory + systemMessages.length);
      
      session.messages = [...systemMessages, ...recentMessages];
    }
  }

  private updateMetrics(responseTime: number, model: AIModel): void {
    this.metrics.totalMessages++;
    
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalMessages - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.totalMessages;
    
    // Simple tracking of most used model
    this.metrics.mostUsedModel = model;
  }

  private estimateTokens(messages: any[]): number {
    // Rough estimation: ~4 characters per token
    const totalChars = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
    return Math.ceil(totalChars / 4);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
