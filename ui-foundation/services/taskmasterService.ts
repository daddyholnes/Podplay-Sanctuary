import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * TaskmasterService - Integration service for taskmaster-ai
 * 
 * This service handles communication with the taskmaster-ai MCP server
 * and integrates it with the Podplay Sanctuary framework.
 */
export class TaskmasterService {
  private static instance: TaskmasterService;
  private initialized: boolean = false;
  private apiKey: string;
  
  private constructor() {
    // Private constructor for singleton pattern
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  /**
   * Get the singleton instance of TaskmasterService
   */
  public static getInstance(): TaskmasterService {
    if (!TaskmasterService.instance) {
      TaskmasterService.instance = new TaskmasterService();
    }
    return TaskmasterService.instance;
  }

  /**
   * Initialize the Taskmaster service
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Check if MCP server is available
      const response = await axios.get(`${API_BASE_URL}/api/mcp/status`);
      
      if (response.data.servers && response.data.servers.some((s: any) => s.name === 'taskmaster-ai' && s.status === 'online')) {
        this.initialized = true;
        console.log('✅ Taskmaster AI service initialized successfully');
        return true;
      } else {
        console.warn('⚠️ Taskmaster AI MCP server is not online');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Taskmaster AI service:', error);
      return false;
    }
  }

  /**
   * Create a new task using taskmaster-ai
   */
  public async createTask(task: {
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
    tags?: string[];
  }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcp/execute`, {
        server: 'taskmaster-ai',
        tool: 'create_task',
        params: task
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  /**
   * List all tasks
   */
  public async listTasks(filters?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcp/execute`, {
        server: 'taskmaster-ai',
        tool: 'list_tasks',
        params: filters || {}
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to list tasks:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  public async updateTask(taskId: string, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
    tags?: string[];
  }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcp/execute`, {
        server: 'taskmaster-ai',
        tool: 'update_task',
        params: {
          taskId,
          ...updates
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  public async deleteTask(taskId: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcp/execute`, {
        server: 'taskmaster-ai',
        tool: 'delete_task',
        params: {
          taskId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered task suggestions based on current context
   */
  public async generateTaskSuggestions(context: {
    projectDescription: string;
    currentTasks?: any[];
    userPreferences?: any;
  }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcp/execute`, {
        server: 'taskmaster-ai',
        tool: 'generate_task_suggestions',
        params: context
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to generate task suggestions:', error);
      throw error;
    }
  }
}
