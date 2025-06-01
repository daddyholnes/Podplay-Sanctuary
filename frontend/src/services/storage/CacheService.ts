/**
 * CacheService - Advanced caching system for Podplay Sanctuary
 * 
 * Features:
 * - Multi-tier caching (memory, localStorage, IndexedDB)
 * - TTL-based expiration with automatic cleanup
 * - Cache compression and encryption
 * - Smart cache invalidation strategies
 * - Performance metrics and analytics
 * - Memory pressure management
 * - Cache warming and prefetching
 * - Distributed cache synchronization
 */

import { EventEmitter } from 'events';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  tags: string[];
  priority: CachePriority;
}

export enum CachePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
  PRIORITY = 'priority'
}

export interface CacheConfig {
  maxMemorySize: number;
  maxLocalStorageSize: number;
  maxIndexedDBSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionThreshold: number;
  encryptionEnabled: boolean;
  strategy: CacheStrategy;
  memoryPressureThreshold: number;
  prefetchEnabled: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  compressions: number;
  decompressions: number;
  encryptions: number;
  decryptions: number;
  memoryUsage: number;
  localStorageUsage: number;
  indexedDBUsage: number;
  averageAccessTime: number;
  hitRate: number;
  lastCleanup: number;
}

export interface CacheEventData {
  key: string;
  value?: any;
  oldValue?: any;
  timestamp: number;
  source: 'memory' | 'localStorage' | 'indexedDB';
}

export class CacheService extends EventEmitter {
  private static instance: CacheService;
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private compressionWorker: Worker | null = null;
  private encryptionKey: CryptoKey | null = null;

  private constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      maxLocalStorageSize: 10 * 1024 * 1024, // 10MB
      maxIndexedDBSize: 100 * 1024 * 1024, // 100MB
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      compressionThreshold: 1024, // 1KB
      encryptionEnabled: true,
      strategy: CacheStrategy.LRU,
      memoryPressureThreshold: 0.8,
      prefetchEnabled: true,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      compressions: 0,
      decompressions: 0,
      encryptions: 0,
      decryptions: 0,
      memoryUsage: 0,
      localStorageUsage: 0,
      indexedDBUsage: 0,
      averageAccessTime: 0,
      hitRate: 0,
      lastCleanup: Date.now()
    };

    this.initialize();
  }

  public static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize encryption if enabled
      if (this.config.encryptionEnabled) {
        await this.initializeEncryption();
      }

      // Initialize compression worker
      await this.initializeCompression();

      // Start cleanup timer
      this.startCleanupTimer();

      // Initialize IndexedDB
      await this.initializeIndexedDB();

      // Load persistent cache data
      await this.loadPersistentCache();

      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize CacheService:', error);
      this.emit('error', error);
    }
  }

  private async initializeEncryption(): Promise<void> {
    try {
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Encryption initialization failed, disabling encryption:', error);
      this.config.encryptionEnabled = false;
    }
  }

  private async initializeCompression(): Promise<void> {
    if (typeof Worker !== 'undefined') {
      try {
        const workerCode = `
          self.onmessage = function(e) {
            const { action, data, id } = e.data;
            try {
              if (action === 'compress') {
                const compressed = pako.gzip(data);
                self.postMessage({ id, result: compressed });
              } else if (action === 'decompress') {
                const decompressed = pako.ungzip(data, { to: 'string' });
                self.postMessage({ id, result: decompressed });
              }
            } catch (error) {
              self.postMessage({ id, error: error.message });
            }
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.compressionWorker = new Worker(URL.createObjectURL(blob));
      } catch (error) {
        console.warn('Compression worker initialization failed:', error);
      }
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('tags', 'tags', { multiEntry: true });
          store.createIndex('priority', 'priority');
        }
      };
    });
  }

  private async loadPersistentCache(): Promise<void> {
    try {
      // Load from localStorage
      const localStorageKeys = Object.keys(localStorage);
      for (const key of localStorageKeys) {
        if (key.startsWith('podplay_cache_')) {
          const cacheKey = key.replace('podplay_cache_', '');
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const entry: CacheEntry = JSON.parse(data);
              if (this.isEntryValid(entry)) {
                this.memoryCache.set(cacheKey, entry);
              } else {
                localStorage.removeItem(key);
              }
            } catch (error) {
              localStorage.removeItem(key);
            }
          }
        }
      }

      // Load from IndexedDB
      await this.loadFromIndexedDB();
    } catch (error) {
      console.error('Failed to load persistent cache:', error);
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const entries: CacheEntry[] = getAllRequest.result;
          for (const entry of entries) {
            if (this.isEntryValid(entry)) {
              this.memoryCache.set(entry.key, entry);
            } else {
              this.deleteFromIndexedDB(entry.key);
            }
          }
          resolve();
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  public async set<T>(
    key: string,
    value: T,
    options: {
      ttl?: number;
      tags?: string[];
      priority?: CachePriority;
      compress?: boolean;
      encrypt?: boolean;
      persistent?: boolean;
    } = {}
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const {
        ttl = this.config.defaultTTL,
        tags = [],
        priority = CachePriority.NORMAL,
        compress = this.shouldCompress(value),
        encrypt = this.config.encryptionEnabled,
        persistent = false
      } = options;

      let processedValue = value;
      let size = this.calculateSize(value);
      let compressed = false;
      let encrypted = false;

      // Compression
      if (compress && size > this.config.compressionThreshold) {
        processedValue = await this.compress(processedValue);
        compressed = true;
        size = this.calculateSize(processedValue);
        this.metrics.compressions++;
      }

      // Encryption
      if (encrypt && this.encryptionKey) {
        processedValue = await this.encrypt(processedValue);
        encrypted = true;
        size = this.calculateSize(processedValue);
        this.metrics.encryptions++;
      }

      const entry: CacheEntry<T> = {
        key,
        value: processedValue,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
        compressed,
        encrypted,
        tags,
        priority
      };

      // Check memory pressure and evict if necessary
      await this.checkMemoryPressure();

      // Store in memory cache
      this.memoryCache.set(key, entry);
      this.updateMemoryUsage();

      // Store persistently if requested
      if (persistent) {
        await this.storePersistent(entry);
      }

      this.emit('set', {
        key,
        value: processedValue,
        timestamp: Date.now(),
        source: 'memory'
      } as CacheEventData);

    } catch (error) {
      console.error(`Failed to set cache entry for key ${key}:`, error);
      this.emit('error', error);
    } finally {
      const endTime = performance.now();
      this.updateAverageAccessTime(endTime - startTime);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      let entry = this.memoryCache.get(key);
      let source: 'memory' | 'localStorage' | 'indexedDB' = 'memory';

      // If not in memory, try localStorage
      if (!entry) {
        entry = await this.getFromLocalStorage(key);
        source = 'localStorage';
      }

      // If not in localStorage, try IndexedDB
      if (!entry) {
        entry = await this.getFromIndexedDB(key);
        source = 'indexedDB';
      }

      if (!entry) {
        this.metrics.misses++;
        this.updateHitRate();
        return null;
      }

      // Check if entry is valid
      if (!this.isEntryValid(entry)) {
        await this.delete(key);
        this.metrics.misses++;
        this.updateHitRate();
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      // Move to memory cache if not already there
      if (source !== 'memory') {
        this.memoryCache.set(key, entry);
        this.updateMemoryUsage();
      }

      // Process value (decrypt, decompress)
      let value = entry.value;

      if (entry.encrypted && this.encryptionKey) {
        value = await this.decrypt(value);
        this.metrics.decryptions++;
      }

      if (entry.compressed) {
        value = await this.decompress(value);
        this.metrics.decompressions++;
      }

      this.metrics.hits++;
      this.updateHitRate();

      this.emit('get', {
        key,
        value,
        timestamp: Date.now(),
        source
      } as CacheEventData);

      return value as T;

    } catch (error) {
      console.error(`Failed to get cache entry for key ${key}:`, error);
      this.emit('error', error);
      return null;
    } finally {
      const endTime = performance.now();
      this.updateAverageAccessTime(endTime - startTime);
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      const deleted = this.memoryCache.delete(key);
      
      // Remove from localStorage
      localStorage.removeItem(`podplay_cache_${key}`);
      
      // Remove from IndexedDB
      await this.deleteFromIndexedDB(key);
      
      this.updateMemoryUsage();
      
      this.emit('delete', {
        key,
        timestamp: Date.now(),
        source: 'memory'
      } as CacheEventData);
      
      return deleted;
    } catch (error) {
      console.error(`Failed to delete cache entry for key ${key}:`, error);
      this.emit('error', error);
      return false;
    }
  }

  public async clear(tags?: string[]): Promise<void> {
    try {
      if (tags && tags.length > 0) {
        // Clear entries with specific tags
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.tags.some(tag => tags.includes(tag))) {
            await this.delete(key);
          }
        }
      } else {
        // Clear all entries
        this.memoryCache.clear();
        
        // Clear localStorage
        const localStorageKeys = Object.keys(localStorage);
        for (const key of localStorageKeys) {
          if (key.startsWith('podplay_cache_')) {
            localStorage.removeItem(key);
          }
        }
        
        // Clear IndexedDB
        await this.clearIndexedDB();
        
        this.updateMemoryUsage();
      }
      
      this.emit('clear', { timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.emit('error', error);
    }
  }

  public has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    return entry ? this.isEntryValid(entry) : false;
  }

  public keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  public size(): number {
    return this.memoryCache.size;
  }

  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public async prefetch(keys: string[]): Promise<void> {
    if (!this.config.prefetchEnabled) return;
    
    try {
      const prefetchPromises = keys.map(async (key) => {
        if (!this.has(key)) {
          // Try to load from persistent storage
          await this.get(key);
        }
      });
      
      await Promise.all(prefetchPromises);
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  private shouldCompress(value: any): boolean {
    const size = this.calculateSize(value);
    return size > this.config.compressionThreshold;
  }

  private calculateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }

  private async compress(value: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        const timeout = setTimeout(() => reject(new Error('Compression timeout')), 5000);
        
        const handler = (e: MessageEvent) => {
          if (e.data.id === id) {
            this.compressionWorker!.removeEventListener('message', handler);
            clearTimeout(timeout);
            
            if (e.data.error) {
              reject(new Error(e.data.error));
            } else {
              resolve(e.data.result);
            }
          }
        };
        
        this.compressionWorker.addEventListener('message', handler);
        this.compressionWorker.postMessage({
          action: 'compress',
          data: JSON.stringify(value),
          id
        });
      });
    }
    return value; // Fallback if compression worker not available
  }

  private async decompress(value: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        const timeout = setTimeout(() => reject(new Error('Decompression timeout')), 5000);
        
        const handler = (e: MessageEvent) => {
          if (e.data.id === id) {
            this.compressionWorker!.removeEventListener('message', handler);
            clearTimeout(timeout);
            
            if (e.data.error) {
              reject(new Error(e.data.error));
            } else {
              try {
                resolve(JSON.parse(e.data.result));
              } catch (error) {
                reject(error);
              }
            }
          }
        };
        
        this.compressionWorker.addEventListener('message', handler);
        this.compressionWorker.postMessage({
          action: 'decompress',
          data: value,
          id
        });
      });
    }
    return value; // Fallback if compression worker not available
  }

  private async encrypt(value: any): Promise<any> {
    if (!this.encryptionKey) return value;
    
    try {
      const data = new TextEncoder().encode(JSON.stringify(value));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );
      
      return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return value;
    }
  }

  private async decrypt(value: any): Promise<any> {
    if (!this.encryptionKey || !value.encrypted) return value;
    
    try {
      const encryptedData = new Uint8Array(value.encrypted);
      const iv = new Uint8Array(value.iv);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encryptedData
      );
      
      const decryptedText = new TextDecoder().decode(decrypted);
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('Decryption failed:', error);
      return value;
    }
  }

  private async checkMemoryPressure(): Promise<void> {
    const memoryUsage = this.metrics.memoryUsage / this.config.maxMemorySize;
    
    if (memoryUsage > this.config.memoryPressureThreshold) {
      await this.evictEntries();
    }
  }

  private async evictEntries(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by strategy
    switch (this.config.strategy) {
      case CacheStrategy.LRU:
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case CacheStrategy.LFU:
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case CacheStrategy.FIFO:
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case CacheStrategy.PRIORITY:
        entries.sort((a, b) => a[1].priority - b[1].priority);
        break;
    }
    
    // Evict entries until memory usage is acceptable
    const targetSize = this.config.maxMemorySize * 0.7; // Target 70% usage
    let currentSize = this.metrics.memoryUsage;
    
    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) break;
      
      this.memoryCache.delete(key);
      currentSize -= entry.size;
      this.metrics.evictions++;
    }
    
    this.updateMemoryUsage();
  }

  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    this.metrics.memoryUsage = totalSize;
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  private updateAverageAccessTime(time: number): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.averageAccessTime = (this.metrics.averageAccessTime * (total - 1) + time) / total;
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry)) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired entries
    for (const key of expiredKeys) {
      await this.delete(key);
    }
    
    this.metrics.lastCleanup = now;
    this.emit('cleanup', { expiredCount: expiredKeys.length, timestamp: now });
  }

  private async getFromLocalStorage(key: string): Promise<CacheEntry | null> {
    try {
      const data = localStorage.getItem(`podplay_cache_${key}`);
      if (data) {
        const entry: CacheEntry = JSON.parse(data);
        return this.isEntryValid(entry) ? entry : null;
      }
    } catch (error) {
      console.error(`Failed to get from localStorage for key ${key}:`, error);
    }
    return null;
  }

  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          const entry = getRequest.result;
          resolve(entry && this.isEntryValid(entry) ? entry : null);
        };
        
        getRequest.onerror = () => resolve(null);
      };
      
      request.onerror = () => resolve(null);
    });
  }

  private async storePersistent(entry: CacheEntry): Promise<void> {
    try {
      // Store in localStorage if small enough
      if (entry.size < this.config.maxLocalStorageSize) {
        localStorage.setItem(`podplay_cache_${entry.key}`, JSON.stringify(entry));
      } else {
        // Store in IndexedDB for larger entries
        await this.storeInIndexedDB(entry);
      }
    } catch (error) {
      console.error('Failed to store persistent cache entry:', error);
    }
  }

  private async storeInIndexedDB(entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const putRequest = store.put(entry);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => resolve(); // Don't fail on delete errors
      };
      
      request.onerror = () => resolve(); // Don't fail on open errors
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open('PodplaySanctuaryCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => resolve(); // Don't fail on clear errors
      };
      
      request.onerror = () => resolve(); // Don't fail on open errors
    });
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }
    
    this.memoryCache.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
