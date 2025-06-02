// 🧠 Memory Service - Cross-Platform Context Persistence
// This service enables your AI companion to remember you everywhere!

import { io, Socket } from 'socket.io-client';

export interface Memory {
  id: string;
  content: string;
  category: 'preference' | 'achievement' | 'emotional_state' | 'project_context' | 'learning';
  timestamp: number;
  platform: 'vscode' | 'codespaces' | 'jetbrains' | 'web';
  emotional_context?: {
    mood: string;
    energy: string;
    confidence: string;
  };
  user_id: string;
  session_id: string;
}

export interface SanctuaryContext {
  current_project: string;
  emotional_journey: Array<{
    timestamp: number;
    emotion: string;
    trigger: string;
  }>;
  preferences: Record<string, any>;
  achievements: Array<{
    id: string;
    type: string;
    unlocked_at: number;
    celebration_count: number;
  }>;
  ai_personality: {
    mode: 'mama-bear' | 'mentor' | 'pair-programmer';
    adaptation_level: number;
    learned_patterns: Record<string, any>;
  };
}

class MemoryService {
  private socket: Socket | null = null;
  private memoryCache: Map<string, Memory> = new Map();
  private contextCache: SanctuaryContext | null = null;
  private initialized = false;
  
  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // Connect to backend memory service
      this.socket = io(process.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log('🧠 Memory Service Connected - Your AI remembers you! ✨');
        this.initialized = true;
        this.syncFromCloud();
      });

      this.socket.on('memory_updated', (memory: Memory) => {
        this.memoryCache.set(memory.id, memory);
        this.notifyMemoryUpdate(memory);
      });

      this.socket.on('context_synced', (context: SanctuaryContext) => {
        this.contextCache = context;
        this.notifyContextUpdate(context);
      });

    } catch (error) {
      console.warn('Memory service offline - using local storage fallback');
      this.initializeLocalFallback();
    }
  }

  private initializeLocalFallback() {
    this.initialized = true;
    // Load from localStorage as fallback
    const localContext = localStorage.getItem('sanctuary_context');
    if (localContext) {
      this.contextCache = JSON.parse(localContext);
    }
  }

  // ==================== CORE MEMORY OPERATIONS ====================
  
  async storeMemory(content: string, category: Memory['category'], emotional_context?: Memory['emotional_context']): Promise<string> {
    const memory: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      category,
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      emotional_context,
      user_id: this.getUserId(),
      session_id: this.getSessionId()
    };

    // Store in cache
    this.memoryCache.set(memory.id, memory);

    // Sync to cloud if available
    if (this.socket?.connected) {
      this.socket.emit('store_memory', memory);
    } else {
      // Local storage fallback
      this.storeLocally('memory', memory.id, memory);
    }

    return memory.id;
  }

  async getMemories(query?: string, category?: Memory['category'], limit = 10): Promise<Memory[]> {
    let memories = Array.from(this.memoryCache.values());

    // Apply filters
    if (category) {
      memories = memories.filter(m => m.category === category);
    }

    if (query) {
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Sort by relevance and recency
    memories.sort((a, b) => {
      if (query) {
        const aScore = this.calculateRelevanceScore(a.content, query);
        const bScore = this.calculateRelevanceScore(b.content, query);
        if (aScore !== bScore) return bScore - aScore;
      }
      return b.timestamp - a.timestamp;
    });

    return memories.slice(0, limit);
  }

  async updateContext(updates: Partial<SanctuaryContext>): Promise<void> {
    this.contextCache = {
      ...this.getDefaultContext(),
      ...this.contextCache,
      ...updates
    };

    // Sync to cloud
    if (this.socket?.connected) {
      this.socket.emit('update_context', this.contextCache);
    } else {
      // Local storage fallback
      localStorage.setItem('sanctuary_context', JSON.stringify(this.contextCache));
    }
  }

  async getContext(): Promise<SanctuaryContext> {
    if (!this.contextCache) {
      await this.loadContextFromStorage();
    }
    return this.contextCache || this.getDefaultContext();
  }

  // ==================== CROSS-PLATFORM SYNC ====================
  
  async syncFromCloud(): Promise<void> {
    if (!this.socket?.connected) return;

    return new Promise((resolve) => {
      this.socket!.emit('sync_request', {
        user_id: this.getUserId(),
        platform: this.detectPlatform(),
        last_sync: this.getLastSyncTimestamp()
      });

      this.socket!.once('sync_complete', (data) => {
        console.log(`🔄 Synced ${data.memories_count} memories and context from cloud`);
        resolve();
      });
    });
  }

  async syncToCloud(): Promise<void> {
    if (!this.socket?.connected) return;

    const localMemories = Array.from(this.memoryCache.values());
    const context = await this.getContext();

    this.socket.emit('bulk_sync', {
      memories: localMemories,
      context,
      platform: this.detectPlatform(),
      timestamp: Date.now()
    });
  }

  // ==================== INTELLIGENT HELPERS ====================
  
  async getPersonalizedGreeting(): Promise<string> {
    const memories = await this.getMemories('greeting', 'emotional_state', 5);
    const context = await this.getContext();
    
    const recentActivity = memories.filter(m => 
      Date.now() - m.timestamp < 3600000 // Last hour
    );

    if (recentActivity.length > 0) {
      return "Welcome back! I've been thinking about what we discussed... 💭✨";
    }

    const daysSinceLastVisit = this.getDaysSinceLastVisit();
    
    if (daysSinceLastVisit === 0) {
      return "Hey again! Ready to continue our amazing work? 🚀";
    } else if (daysSinceLastVisit === 1) {
      return "Welcome back! I missed our collaboration yesterday 💝";
    } else if (daysSinceLastVisit < 7) {
      return `Great to see you after ${daysSinceLastVisit} days! Let's create something magical! ✨`;
    } else {
      return "Welcome back to your Sanctuary! I've kept everything just as you like it 🏠💝";
    }
  }

  async learnFromInteraction(interaction: {
    type: string;
    content: string;
    user_response: 'positive' | 'negative' | 'neutral';
    context: string;
  }): Promise<void> {
    await this.storeMemory(
      `User ${interaction.user_response} response to ${interaction.type}: ${interaction.content}`,
      'learning',
      await this.getCurrentEmotionalContext()
    );

    // Update AI adaptation
    const context = await this.getContext();
    const adaptationLevel = Math.min(
      context.ai_personality.adaptation_level + (interaction.user_response === 'positive' ? 0.1 : -0.05),
      1.0
    );

    await this.updateContext({
      ai_personality: {
        ...context.ai_personality,
        adaptation_level,
        learned_patterns: {
          ...context.ai_personality.learned_patterns,
          [interaction.type]: {
            ...context.ai_personality.learned_patterns[interaction.type],
            success_rate: this.updateSuccessRate(
              context.ai_personality.learned_patterns[interaction.type]?.success_rate || 0.5,
              interaction.user_response === 'positive'
            )
          }
        }
      }
    });
  }

  // ==================== ACHIEVEMENT SYSTEM ====================
  
  async unlockAchievement(achievementId: string, type: string): Promise<boolean> {
    const context = await this.getContext();
    const existing = context.achievements.find(a => a.id === achievementId);
    
    if (existing) {
      existing.celebration_count++;
      await this.updateContext({ achievements: context.achievements });
      return false; // Already unlocked
    }

    const newAchievement = {
      id: achievementId,
      type,
      unlocked_at: Date.now(),
      celebration_count: 1
    };

    await this.updateContext({
      achievements: [...context.achievements, newAchievement]
    });

    await this.storeMemory(
      `Achievement unlocked: ${achievementId} (${type})`,
      'achievement',
      await this.getCurrentEmotionalContext()
    );

    return true; // Newly unlocked
  }

  async getCelebrationStreak(): Promise<number> {
    const recentAchievements = (await this.getContext()).achievements.filter(
      a => Date.now() - a.unlocked_at < 86400000 // Last 24 hours
    );
    
    return recentAchievements.length;
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  private detectPlatform(): Memory['platform'] {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('codespaces')) return 'codespaces';
      if (window.location.hostname.includes('localhost')) return 'vscode';
    }
    return 'web';
  }

  private getUserId(): string {
    let userId = localStorage.getItem('sanctuary_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sanctuary_user_id', userId);
    }
    return userId;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sanctuary_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sanctuary_session_id', sessionId);
    }
    return sessionId;
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (contentLower.includes(queryLower)) return 2;
    
    const queryWords = queryLower.split(' ');
    const matchingWords = queryWords.filter(word => contentLower.includes(word));
    
    return matchingWords.length / queryWords.length;
  }

  private async getCurrentEmotionalContext() {
    const context = await this.getContext();
    return {
      mood: context.emotional_journey[context.emotional_journey.length - 1]?.emotion || 'neutral',
      energy: 'medium', // Would be tracked from UI
      confidence: context.ai_personality.adaptation_level > 0.7 ? 'high' : 'learning'
    };
  }

  private updateSuccessRate(current: number, wasSuccessful: boolean): number {
    return (current * 0.9) + (wasSuccessful ? 0.1 : 0);
  }

  private getDaysSinceLastVisit(): number {
    const lastVisit = localStorage.getItem('sanctuary_last_visit');
    if (!lastVisit) return 999;
    
    const daysDiff = Math.floor((Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
    return daysDiff;
  }

  private getLastSyncTimestamp(): number {
    const lastSync = localStorage.getItem('sanctuary_last_sync');
    return lastSync ? parseInt(lastSync) : 0;
  }

  private storeLocally(type: string, key: string, data: any): void {
    localStorage.setItem(`sanctuary_${type}_${key}`, JSON.stringify(data));
  }

  private async loadContextFromStorage(): Promise<void> {
    const stored = localStorage.getItem('sanctuary_context');
    if (stored) {
      this.contextCache = JSON.parse(stored);
    } else {
      this.contextCache = this.getDefaultContext();
    }
  }

  private getDefaultContext(): SanctuaryContext {
    return {
      current_project: '',
      emotional_journey: [],
      preferences: {},
      achievements: [],
      ai_personality: {
        mode: 'mama-bear',
        adaptation_level: 0.5,
        learned_patterns: {}
      }
    };
  }

  private notifyMemoryUpdate(memory: Memory): void {
    window.dispatchEvent(new CustomEvent('sanctuary_memory_update', {
      detail: { memory }
    }));
  }

  private notifyContextUpdate(context: SanctuaryContext): void {
    window.dispatchEvent(new CustomEvent('sanctuary_context_update', {
      detail: { context }
    }));
  }

  // ==================== PUBLIC API ====================
  
  isInitialized(): boolean {
    return this.initialized;
  }

  async recordEmotionalMoment(emotion: string, trigger: string): Promise<void> {
    const context = await this.getContext();
    const emotionalMoment = {
      timestamp: Date.now(),
      emotion,
      trigger
    };

    await this.updateContext({
      emotional_journey: [...context.emotional_journey.slice(-19), emotionalMoment] // Keep last 20
    });

    await this.storeMemory(
      `Emotional moment: ${emotion} triggered by ${trigger}`,
      'emotional_state',
      { mood: emotion, energy: 'detected', confidence: 'recording' }
    );
  }

  async getEmotionalTrends(): Promise<{ emotion: string; count: number }[]> {
    const context = await this.getContext();
    const recentEmotions = context.emotional_journey.filter(
      e => Date.now() - e.timestamp < 604800000 // Last week
    );

    const emotionCounts = recentEmotions.reduce((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// Export singleton instance
export const memoryService = new MemoryService();
export default MemoryService;
