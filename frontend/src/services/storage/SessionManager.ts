import { EventEmitter } from 'events';

export interface SessionData {
  id: string;
  userId?: string;
  data: any;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SessionManagerConfig {
  defaultTTL?: number; // Time to live in milliseconds
  cleanupInterval?: number;
  maxSessions?: number;
  enablePersistence?: boolean;
  storageKey?: string;
  enableCompression?: boolean;
  enableEncryption?: boolean;
}

export interface SessionQuery {
  userId?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  includeExpired?: boolean;
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  memoryUsage: number;
}

export class SessionManager extends EventEmitter {
  private sessions = new Map<string, SessionData>();
  private config: Required<SessionManagerConfig>;
  private cleanupTimer?: NodeJS.Timeout;
  private metrics: SessionMetrics = {
    totalSessions: 0,
    activeSessions: 0,
    expiredSessions: 0,
    averageSessionDuration: 0,
    memoryUsage: 0
  };

  constructor(config: SessionManagerConfig = {}) {
    super();
    
    this.config = {
      defaultTTL: config.defaultTTL ?? 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: config.cleanupInterval ?? 60 * 60 * 1000, // 1 hour
      maxSessions: config.maxSessions ?? 1000,
      enablePersistence: config.enablePersistence ?? true,
      storageKey: config.storageKey ?? 'podplay_sessions',
      enableCompression: config.enableCompression ?? false,
      enableEncryption: config.enableEncryption ?? false
    };

    this.startCleanupTimer();
    
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  async createSession(
    data: any, 
    options: {
      id?: string;
      userId?: string;
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const sessionId = options.id || this.generateSessionId();
    const now = new Date();
    const ttl = options.ttl ?? this.config.defaultTTL;
    
    // Check session limit
    if (this.sessions.size >= this.config.maxSessions) {
      await this.evictOldestSession();
    }

    const session: SessionData = {
      id: sessionId,
      userId: options.userId,
      data: this.config.enableCompression ? this.compress(data) : data,
      expiresAt: new Date(now.getTime() + ttl),
      createdAt: now,
      updatedAt: now,
      tags: options.tags,
      metadata: options.metadata
    };

    this.sessions.set(sessionId, session);
    this.updateMetrics();
    
    this.emit('sessionCreated', sessionId, session);
    
    if (this.config.enablePersistence) {
      await this.saveToStorage();
    }

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt && new Date() > session.expiresAt) {
      await this.deleteSession(sessionId);
      return null;
    }

    // Decompress data if needed
    const data = this.config.enableCompression 
      ? this.decompress(session.data) 
      : session.data;

    return {
      ...session,
      data
    };
  }

  async updateSession(
    sessionId: string, 
    data: any, 
    options: {
      merge?: boolean;
      extendTTL?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    const now = new Date();
    
    // Update data
    if (options.merge && typeof data === 'object' && typeof session.data === 'object') {
      session.data = { ...session.data, ...data };
    } else {
      session.data = this.config.enableCompression ? this.compress(data) : data;
    }

    // Update metadata
    session.updatedAt = now;
    
    if (options.tags) {
      session.tags = options.tags;
    }
    
    if (options.metadata) {
      session.metadata = { ...session.metadata, ...options.metadata };
    }

    // Extend TTL if requested
    if (options.extendTTL && session.expiresAt) {
      session.expiresAt = new Date(now.getTime() + options.extendTTL);
    }

    this.sessions.set(sessionId, session);
    
    this.emit('sessionUpdated', sessionId, session);
    
    if (this.config.enablePersistence) {
      await this.saveToStorage();
    }

    return true;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.updateMetrics();
    
    this.emit('sessionDeleted', sessionId, session);
    
    if (this.config.enablePersistence) {
      await this.saveToStorage();
    }

    return true;
  }

  async touchSession(sessionId: string, ttl?: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    const now = new Date();
    const extendBy = ttl ?? this.config.defaultTTL;
    
    session.updatedAt = now;
    session.expiresAt = new Date(now.getTime() + extendBy);
    
    this.sessions.set(sessionId, session);
    
    this.emit('sessionTouched', sessionId);
    
    if (this.config.enablePersistence) {
      await this.saveToStorage();
    }

    return true;
  }

  async querySessions(query: SessionQuery = {}): Promise<SessionData[]> {
    const results: SessionData[] = [];
    const now = new Date();
    
    for (const session of this.sessions.values()) {
      // Check expiration
      if (!query.includeExpired && session.expiresAt && now > session.expiresAt) {
        continue;
      }

      // Filter by userId
      if (query.userId && session.userId !== query.userId) {
        continue;
      }

      // Filter by tags
      if (query.tags && query.tags.length > 0) {
        if (!session.tags || !query.tags.some(tag => session.tags!.includes(tag))) {
          continue;
        }
      }

      // Filter by creation date
      if (query.createdAfter && session.createdAt < query.createdAfter) {
        continue;
      }

      if (query.createdBefore && session.createdAt > query.createdBefore) {
        continue;
      }

      // Decompress data if needed
      const data = this.config.enableCompression 
        ? this.decompress(session.data) 
        : session.data;

      results.push({
        ...session,
        data
      });
    }

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    return this.querySessions({ userId });
  }

  async getSessionsByTags(tags: string[]): Promise<SessionData[]> {
    return this.querySessions({ tags });
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt && now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleanedCount++;
        this.emit('sessionExpired', sessionId, session);
      }
    }

    if (cleanedCount > 0) {
      this.updateMetrics();
      
      if (this.config.enablePersistence) {
        await this.saveToStorage();
      }
    }

    return cleanedCount;
  }

  async clearAllSessions(): Promise<number> {
    const count = this.sessions.size;
    
    this.sessions.clear();
    this.updateMetrics();
    
    this.emit('allSessionsCleared', count);
    
    if (this.config.enablePersistence) {
      await this.saveToStorage();
    }

    return count;
  }

  async clearUserSessions(userId: string): Promise<number> {
    let count = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
        this.emit('sessionDeleted', sessionId, session);
      }
    }

    if (count > 0) {
      this.updateMetrics();
      
      if (this.config.enablePersistence) {
        await this.saveToStorage();
      }
    }

    return count;
  }

  getMetrics(): SessionMetrics {
    return { ...this.metrics };
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getSessionAge(sessionId: string): number | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    return Date.now() - session.createdAt.getTime();
  }

  getTimeToExpiry(sessionId: string): number | null {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.expiresAt) {
      return null;
    }

    return session.expiresAt.getTime() - Date.now();
  }

  private async evictOldestSession(): Promise<void> {
    let oldestSession: [string, SessionData] | null = null;
    
    for (const entry of this.sessions) {
      if (!oldestSession || entry[1].createdAt < oldestSession[1].createdAt) {
        oldestSession = entry;
      }
    }

    if (oldestSession) {
      await this.deleteSession(oldestSession[0]);
      this.emit('sessionEvicted', oldestSession[0], oldestSession[1]);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions().catch(error => {
        this.emit('cleanupError', error);
      });
    }, this.config.cleanupInterval);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private updateMetrics(): void {
    const now = new Date();
    let activeSessions = 0;
    let expiredSessions = 0;
    let totalDuration = 0;
    let memoryUsage = 0;

    for (const session of this.sessions.values()) {
      const isExpired = session.expiresAt && now > session.expiresAt;
      
      if (isExpired) {
        expiredSessions++;
      } else {
        activeSessions++;
      }

      totalDuration += now.getTime() - session.createdAt.getTime();
      memoryUsage += this.estimateSessionSize(session);
    }

    this.metrics = {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions,
      averageSessionDuration: this.sessions.size > 0 ? totalDuration / this.sessions.size : 0,
      memoryUsage
    };
  }

  private estimateSessionSize(session: SessionData): number {
    // Rough estimation of memory usage
    return JSON.stringify(session).length * 2; // Assuming UTF-16
  }

  private async saveToStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = Array.from(this.sessions.entries()).map(([id, session]) => [
        id,
        {
          ...session,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          expiresAt: session.expiresAt?.toISOString()
        }
      ]);

      const serialized = JSON.stringify(data);
      
      if (this.config.enableEncryption) {
        // In a real implementation, you'd use proper encryption
        localStorage.setItem(this.config.storageKey, btoa(serialized));
      } else {
        localStorage.setItem(this.config.storageKey, serialized);
      }
    } catch (error) {
      this.emit('persistenceError', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      
      if (!stored) {
        return;
      }

      const serialized = this.config.enableEncryption ? atob(stored) : stored;
      const data = JSON.parse(serialized);

      for (const [id, sessionData] of data) {
        const session: SessionData = {
          ...sessionData,
          createdAt: new Date(sessionData.createdAt),
          updatedAt: new Date(sessionData.updatedAt),
          expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt) : undefined
        };

        this.sessions.set(id, session);
      }

      this.updateMetrics();
      this.emit('sessionsLoaded', this.sessions.size);
    } catch (error) {
      this.emit('persistenceError', error);
    }
  }

  private compress(data: any): any {
    // Simple compression placeholder
    // In a real implementation, you'd use a compression library
    if (this.config.enableCompression && typeof data === 'string') {
      return btoa(data);
    }
    return data;
  }

  private decompress(data: any): any {
    // Simple decompression placeholder
    if (this.config.enableCompression && typeof data === 'string') {
      try {
        return atob(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    this.stopCleanupTimer();
    this.sessions.clear();
    this.removeAllListeners();
  }
}
