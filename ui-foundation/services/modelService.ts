import axios from 'axios';

// Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  model?: string;
  fileIds?: string[];
  createdAt: Date;
}

export interface Model {
  provider: string;
  displayName: string;
  description: string;
  maxTokens: number;
  capabilities: string[];
  color: string;
  icon: string;
  badge?: {
    text: string;
    color: string;
  };
  pricing?: string;
  rpm?: string;
  knowledgeCutoff?: string;
  logoUrl?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  uploadTime: Date;
}

export interface ModelResponse {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Define the environment variables available in import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_API_BASE_URL?: string;
      [key: string]: string | undefined;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

/**
 * Get available AI models from the API
 * @returns A record of model IDs to model objects
 */
export const getModels = async (): Promise<Record<string, Model>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/models`);
    return response.data.models || {};
  } catch (error) {
    console.error('Error fetching models:', error);
    throw new Error('Failed to fetch available AI models');
  }
};

/**
 * Handles sending messages to the appropriate AI model
 */
export const sendMessageToModel = async (
  modelId: string,
  messages: Message[],
  files: UploadedFile[] = []
): Promise<ModelResponse> => {
  try {
    // Map provider based on model ID prefix
    const provider = getProviderFromModelId(modelId);
    
    // Prepare request payload
    const payload = {
      model: modelId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        fileIds: msg.fileIds || []
      })),
      files: files.map(file => ({
        id: file.id,
        url: file.url,
        type: file.type
      })),
      provider
    };

    // Send request to the appropriate endpoint
    const response = await axios.post(`${API_BASE_URL}/api/chat/completion`, payload);
    
    return {
      message: {
        id: response.data.id || generateId(),
        role: 'assistant',
        content: response.data.content || response.data.message,
        createdAt: new Date(),
        model: modelId,
        fileIds: []
      },
      usage: response.data.usage
    };
  } catch (error) {
    console.error('Error sending message to model:', error);
    return {
      message: {
        id: generateId(),
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting to the ${modelId} model right now. This could be due to API limits or a server issue. Would you like to try with a different model?`,
        createdAt: new Date(),
        model: modelId,
        fileIds: []
      }
    };
  }
};

/**
 * Uploads files to the server for AI processing
 */
export const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      preview: file.preview,
      uploadTime: new Date()
    }));
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error('Failed to upload files. Please try again.');
  }
};

/**
 * Gets available models from the server
 */
export const getAvailableModels = async (): Promise<Record<string, any>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/models`);
    return response.data.models;
  } catch (error) {
    console.error('Error fetching available models:', error);
    return {};
  }
};

/**
 * Determines the provider based on model ID
 */
const getProviderFromModelId = (modelId: string): string => {
  if (modelId.startsWith('gpt') || modelId.includes('openai')) {
    return 'openai';
  } else if (modelId.startsWith('gemini') || modelId.includes('gemma')) {
    return 'google';
  } else if (modelId.includes('claude')) {
    return 'anthropic';
  } else if (modelId.includes('llama') || modelId.includes('mistral')) {
    return 'together';
  }
  return 'unknown';
};

/**
 * Generates a random ID for messages
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Provides audio transcription service
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
};
