import { AgentMessage, AgentType } from './types';
import { buildApiUrl } from '../../config/api';

/**
 * Agent Communication Service
 * Handles communication between different agent types (Mama Bear, Scout)
 */
class AgentCommunicationService {
  private static instance: AgentCommunicationService;

  private constructor() {}

  public static getInstance(): AgentCommunicationService {
    if (!AgentCommunicationService.instance) {
      AgentCommunicationService.instance = new AgentCommunicationService();
    }
    return AgentCommunicationService.instance;
  }

  /**
   * Send a message to an agent
   */
  public async sendMessage(
    agentType: AgentType,
    message: string,
    attachments: any[] = []
  ): Promise<AgentMessage> {
    try {
      const response = await fetch(buildApiUrl(`/api/agents/${agentType}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to agent:', error);
      throw error;
    }
  }

  /**
   * Get agent messages
   */
  public async getMessages(
    agentType: AgentType,
    sessionId?: string
  ): Promise<AgentMessage[]> {
    try {
      const url = sessionId
        ? buildApiUrl(`/api/agents/${agentType}/sessions/${sessionId}/messages`)
        : buildApiUrl(`/api/agents/${agentType}/messages`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error getting agent messages:', error);
      throw error;
    }
  }

  /**
   * Create a new agent session
   */
  public async createSession(
    agentType: AgentType,
    name: string
  ): Promise<{ sessionId: string }> {
    try {
      const response = await fetch(buildApiUrl(`/api/agents/${agentType}/sessions`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      return { sessionId: data.sessionId };
    } catch (error) {
      console.error('Error creating agent session:', error);
      throw error;
    }
  }

  /**
   * Transfer conversation context between agents
   */
  public async transferContext(
    fromAgentType: AgentType,
    toAgentType: AgentType,
    sessionId: string,
    contextType: 'full' | 'summary' = 'summary'
  ): Promise<boolean> {
    try {
      const response = await fetch(
        buildApiUrl(`/api/agents/${fromAgentType}/transfer`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetAgent: toAgentType,
            sessionId,
            contextType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to transfer context: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error transferring context between agents:', error);
      throw error;
    }
  }
}

// Export agent types
export { AgentType } from './types';

export default AgentCommunicationService.getInstance();
