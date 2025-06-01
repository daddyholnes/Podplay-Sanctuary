/**
 * PreferencesManager - Advanced user preferences management system
 * 
 * Features:
 * - Hierarchical preference structure (global, workspace, user)
 * - Type-safe preference schemas with validation
 * - Real-time synchronization across tabs/windows
 * - Cloud sync and backup capabilities
 * - Preference migration and versioning
 * - Theme and UI state management
 * - Performance optimizations with caching
 * - Import/export functionality
 * - Preference change tracking and analytics
 */

import { EventEmitter } from 'events';

export interface PreferenceSchema {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default: any;
  description?: string;
  category?: string;
  validation?: (value: any) => boolean | string;
  enum?: any[];
  min?: number;
  max?: number;
  required?: boolean;
  dependencies?: string[];
  migration?: (oldValue: any, oldVersion: string) => any;
}

export interface PreferenceValue {
  key: string;
  value: any;
  source: PreferenceSource;
  timestamp: number;
  version: string;
  synced: boolean;
  modified: boolean;
}

export enum PreferenceSource {
  DEFAULT = 'default',
  GLOBAL = 'global',
  WORKSPACE = 'workspace',
  USER = 'user',
  TEMPORARY = 'temporary'
}

export interface PreferenceContext {
  workspace?: string;
  user?: string;
  environment?: 'development' | 'production' | 'testing';
  overrides?: Record<string, any>;
}

export interface PreferenceChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
  source: PreferenceSource;
  timestamp: number;
  context?: PreferenceContext;
}

export interface PreferenceMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (preferences: Record<string, any>) => Record<string, any>;
}

export interface PreferenceExport {
  version: string;
  timestamp: number;
  preferences: Record<string, PreferenceValue>;
  schemas: Record<string, PreferenceSchema>;
  metadata: {
    exportedBy: string;
    platform: string;
    environment: string;
  };
}

export class PreferencesManager extends EventEmitter {
  private static instance: PreferencesManager;
  private schemas = new Map<string, PreferenceSchema>();
  private preferences = new Map<string, PreferenceValue>();
  private migrations = new Map<string, PreferenceMigration>();
  private context: PreferenceContext = {};
  private readonly version = '1.0.0';
  private readonly storageKey = 'podplay_preferences';
  private syncEnabled = true;
  private cloudSyncUrl?: string;
  private syncTimer: NodeJS.Timeout | null = null;

  // Built-in preference categories
  public static readonly CATEGORIES = {
    APPEARANCE: 'appearance',
    EDITOR: 'editor',
    WORKSPACE: 'workspace',
    AI: 'ai',
    PERFORMANCE: 'performance',
    SECURITY: 'security',
    NOTIFICATIONS: 'notifications',
    ACCESSIBILITY: 'accessibility',
    DEBUGGING: 'debugging',
    EXTENSIONS: 'extensions'
  } as const;

  private constructor() {
    super();
    this.initializeDefaultSchemas();
    this.loadPreferences();
    this.setupSyncListener();
  }

  public static getInstance(): PreferencesManager {
    if (!PreferencesManager.instance) {
      PreferencesManager.instance = new PreferencesManager();
    }
    return PreferencesManager.instance;
  }

  private initializeDefaultSchemas(): void {
    // Appearance preferences
    this.registerSchema({
      key: 'theme',
      type: 'string',
      default: 'dark',
      description: 'Application theme',
      category: PreferencesManager.CATEGORIES.APPEARANCE,
      enum: ['light', 'dark', 'auto', 'high-contrast'],
      validation: (value) => ['light', 'dark', 'auto', 'high-contrast'].includes(value)
    });

    this.registerSchema({
      key: 'fontSize',
      type: 'number',
      default: 14,
      description: 'Editor font size',
      category: PreferencesManager.CATEGORIES.EDITOR,
      min: 8,
      max: 72,
      validation: (value) => typeof value === 'number' && value >= 8 && value <= 72
    });

    this.registerSchema({
      key: 'fontFamily',
      type: 'string',
      default: 'Fira Code, Consolas, monospace',
      description: 'Editor font family',
      category: PreferencesManager.CATEGORIES.EDITOR
    });

    this.registerSchema({
      key: 'tabSize',
      type: 'number',
      default: 2,
      description: 'Tab size in spaces',
      category: PreferencesManager.CATEGORIES.EDITOR,
      enum: [2, 4, 8],
      validation: (value) => [2, 4, 8].includes(value)
    });

    // Workspace preferences
    this.registerSchema({
      key: 'autoSave',
      type: 'boolean',
      default: true,
      description: 'Automatically save files',
      category: PreferencesManager.CATEGORIES.WORKSPACE
    });

    this.registerSchema({
      key: 'autoSaveDelay',
      type: 'number',
      default: 1000,
      description: 'Auto-save delay in milliseconds',
      category: PreferencesManager.CATEGORIES.WORKSPACE,
      min: 100,
      max: 10000,
      dependencies: ['autoSave']
    });

    // AI preferences
    this.registerSchema({
      key: 'aiProvider',
      type: 'string',
      default: 'gemini',
      description: 'Default AI provider',
      category: PreferencesManager.CATEGORIES.AI,
      enum: ['gemini', 'openai', 'anthropic', 'local']
    });

    this.registerSchema({
      key: 'aiTemperature',
      type: 'number',
      default: 0.7,
      description: 'AI response creativity (0-1)',
      category: PreferencesManager.CATEGORIES.AI,
      min: 0,
      max: 1
    });

    // Performance preferences
    this.registerSchema({
      key: 'maxCacheSize',
      type: 'number',
      default: 100,
      description: 'Maximum cache size in MB',
      category: PreferencesManager.CATEGORIES.PERFORMANCE,
      min: 10,
      max: 1000
    });

    this.registerSchema({
      key: 'enableVirtualization',
      type: 'boolean',
      default: true,
      description: 'Enable UI virtualization for large datasets',
      category: PreferencesManager.CATEGORIES.PERFORMANCE
    });

    // Security preferences
    this.registerSchema({
      key: 'enableTelemetry',
      type: 'boolean',
      default: false,
      description: 'Enable anonymous usage telemetry',
      category: PreferencesManager.CATEGORIES.SECURITY
    });

    this.registerSchema({
      key: 'encryptLocalData',
      type: 'boolean',
      default: true,
      description: 'Encrypt sensitive data stored locally',
      category: PreferencesManager.CATEGORIES.SECURITY
    });

    // Notifications preferences
    this.registerSchema({
      key: 'enableNotifications',
      type: 'boolean',
      default: true,
      description: 'Enable desktop notifications',
      category: PreferencesManager.CATEGORIES.NOTIFICATIONS
    });

    this.registerSchema({
      key: 'notificationPosition',
      type: 'string',
      default: 'top-right',
      description: 'Notification position',
      category: PreferencesManager.CATEGORIES.NOTIFICATIONS,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    });

    // Accessibility preferences
    this.registerSchema({
      key: 'reducedMotion',
      type: 'boolean',
      default: false,
      description: 'Reduce animations and motion',
      category: PreferencesManager.CATEGORIES.ACCESSIBILITY
    });

    this.registerSchema({
      key: 'highContrast',
      type: 'boolean',
      default: false,
      description: 'Enable high contrast mode',
      category: PreferencesManager.CATEGORIES.ACCESSIBILITY
    });

    this.registerSchema({
      key: 'screenReaderOptimizations',
      type: 'boolean',
      default: false,
      description: 'Enable screen reader optimizations',
      category: PreferencesManager.CATEGORIES.ACCESSIBILITY
    });
  }

  public registerSchema(schema: PreferenceSchema): void {
    this.schemas.set(schema.key, schema);
    
    // Set default value if preference doesn't exist
    if (!this.preferences.has(schema.key)) {
      this.setPreference(schema.key, schema.default, PreferenceSource.DEFAULT, false);
    }
    
    this.emit('schemaRegistered', schema);
  }

  public unregisterSchema(key: string): boolean {
    const removed = this.schemas.delete(key);
    if (removed) {
      this.preferences.delete(key);
      this.emit('schemaUnregistered', key);
    }
    return removed;
  }

  public getSchema(key: string): PreferenceSchema | undefined {
    return this.schemas.get(key);
  }

  public getAllSchemas(): PreferenceSchema[] {
    return Array.from(this.schemas.values());
  }

  public getSchemasByCategory(category: string): PreferenceSchema[] {
    return Array.from(this.schemas.values()).filter(schema => schema.category === category);
  }

  public setPreference<T = any>(
    key: string,
    value: T,
    source: PreferenceSource = PreferenceSource.USER,
    validate: boolean = true
  ): boolean {
    try {
      const schema = this.schemas.get(key);
      
      if (!schema) {
        console.warn(`No schema found for preference key: ${key}`);
        return false;
      }

      // Validate value
      if (validate && !this.validateValue(key, value)) {
        return false;
      }

      const oldValue = this.preferences.get(key)?.value;
      
      const preferenceValue: PreferenceValue = {
        key,
        value,
        source,
        timestamp: Date.now(),
        version: this.version,
        synced: false,
        modified: oldValue !== value
      };

      this.preferences.set(key, preferenceValue);
      
      // Save to storage
      this.savePreferences();
      
      // Emit change event
      if (oldValue !== value) {
        const changeEvent: PreferenceChangeEvent = {
          key,
          oldValue,
          newValue: value,
          source,
          timestamp: preferenceValue.timestamp,
          context: this.context
        };
        
        this.emit('preferenceChanged', changeEvent);
        this.emit(`preference:${key}`, changeEvent);
      }
      
      // Schedule sync if enabled
      if (this.syncEnabled && source !== PreferenceSource.TEMPORARY) {
        this.scheduleSync();
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to set preference ${key}:`, error);
      return false;
    }
  }

  public getPreference<T = any>(key: string, defaultValue?: T): T {
    const preference = this.preferences.get(key);
    
    if (preference) {
      return preference.value as T;
    }
    
    const schema = this.schemas.get(key);
    if (schema) {
      return schema.default as T;
    }
    
    return defaultValue as T;
  }

  public hasPreference(key: string): boolean {
    return this.preferences.has(key);
  }

  public deletePreference(key: string): boolean {
    const preference = this.preferences.get(key);
    if (!preference) return false;
    
    const schema = this.schemas.get(key);
    const oldValue = preference.value;
    const defaultValue = schema?.default;
    
    // Reset to default value instead of deleting
    if (schema) {
      return this.setPreference(key, defaultValue, PreferenceSource.DEFAULT);
    }
    
    // Actually delete if no schema
    const deleted = this.preferences.delete(key);
    if (deleted) {
      this.savePreferences();
      
      const changeEvent: PreferenceChangeEvent = {
        key,
        oldValue,
        newValue: undefined,
        source: PreferenceSource.USER,
        timestamp: Date.now(),
        context: this.context
      };
      
      this.emit('preferenceChanged', changeEvent);
      this.emit(`preference:${key}`, changeEvent);
    }
    
    return deleted;
  }

  public resetPreference(key: string): boolean {
    const schema = this.schemas.get(key);
    if (!schema) return false;
    
    return this.setPreference(key, schema.default, PreferenceSource.DEFAULT);
  }

  public resetAllPreferences(): void {
    for (const [key, schema] of this.schemas.entries()) {
      this.setPreference(key, schema.default, PreferenceSource.DEFAULT, false);
    }
    this.emit('allPreferencesReset');
  }

  public validateValue(key: string, value: any): boolean {
    const schema = this.schemas.get(key);
    if (!schema) return false;
    
    // Type validation
    if (!this.validateType(value, schema.type)) {
      console.warn(`Invalid type for preference ${key}. Expected ${schema.type}, got ${typeof value}`);
      return false;
    }
    
    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      console.warn(`Invalid enum value for preference ${key}. Expected one of ${schema.enum.join(', ')}, got ${value}`);
      return false;
    }
    
    // Range validation
    if (schema.type === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        console.warn(`Value for preference ${key} is below minimum. Min: ${schema.min}, got: ${value}`);
        return false;
      }
      if (schema.max !== undefined && value > schema.max) {
        console.warn(`Value for preference ${key} is above maximum. Max: ${schema.max}, got: ${value}`);
        return false;
      }
    }
    
    // Custom validation
    if (schema.validation) {
      const result = schema.validation(value);
      if (result !== true) {
        console.warn(`Custom validation failed for preference ${key}: ${result}`);
        return false;
      }
    }
    
    return true;
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  public setContext(context: PreferenceContext): void {
    this.context = { ...this.context, ...context };
    this.emit('contextChanged', this.context);
  }

  public getContext(): PreferenceContext {
    return { ...this.context };
  }

  public getAllPreferences(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, preference] of this.preferences.entries()) {
      result[key] = preference.value;
    }
    return result;
  }

  public getPreferencesByCategory(category: string): Record<string, any> {
    const schemas = this.getSchemasByCategory(category);
    const result: Record<string, any> = {};
    
    for (const schema of schemas) {
      result[schema.key] = this.getPreference(schema.key);
    }
    
    return result;
  }

  public exportPreferences(): PreferenceExport {
    return {
      version: this.version,
      timestamp: Date.now(),
      preferences: Object.fromEntries(this.preferences.entries()),
      schemas: Object.fromEntries(this.schemas.entries()),
      metadata: {
        exportedBy: 'Podplay Sanctuary',
        platform: navigator.platform,
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  public async importPreferences(data: PreferenceExport): Promise<boolean> {
    try {
      // Validate import data
      if (!data.version || !data.preferences || !data.schemas) {
        throw new Error('Invalid preference export format');
      }
      
      // Check for version compatibility and migrate if needed
      const migratedData = await this.migratePreferences(data);
      
      // Import schemas first
      for (const [key, schema] of Object.entries(migratedData.schemas)) {
        this.registerSchema(schema);
      }
      
      // Import preferences
      for (const [key, preference] of Object.entries(migratedData.preferences)) {
        if (this.validateValue(key, preference.value)) {
          this.preferences.set(key, preference);
        }
      }
      
      this.savePreferences();
      this.emit('preferencesImported', migratedData);
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      this.emit('importError', error);
      return false;
    }
  }

  private async migratePreferences(data: PreferenceExport): Promise<PreferenceExport> {
    let migratedData = { ...data };
    
    // Apply migrations in order
    const sortedMigrations = Array.from(this.migrations.values())
      .sort((a, b) => a.fromVersion.localeCompare(b.fromVersion));
    
    for (const migration of sortedMigrations) {
      if (this.shouldApplyMigration(migratedData.version, migration)) {
        try {
          const preferences = Object.fromEntries(
            Object.entries(migratedData.preferences).map(([key, pref]) => [key, pref.value])
          );
          
          const migratedPreferences = migration.migrate(preferences);
          
          // Update preference values
          for (const [key, value] of Object.entries(migratedPreferences)) {
            if (migratedData.preferences[key]) {
              migratedData.preferences[key].value = value;
              migratedData.preferences[key].version = migration.toVersion;
            }
          }
          
          migratedData.version = migration.toVersion;
        } catch (error) {
          console.error(`Migration from ${migration.fromVersion} to ${migration.toVersion} failed:`, error);
        }
      }
    }
    
    return migratedData;
  }

  private shouldApplyMigration(currentVersion: string, migration: PreferenceMigration): boolean {
    return currentVersion === migration.fromVersion;
  }

  public registerMigration(migration: PreferenceMigration): void {
    const key = `${migration.fromVersion}->${migration.toVersion}`;
    this.migrations.set(key, migration);
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Handle legacy format
        if (data.preferences) {
          for (const [key, preference] of Object.entries(data.preferences)) {
            this.preferences.set(key, preference as PreferenceValue);
          }
        } else {
          // Legacy format: direct key-value pairs
          for (const [key, value] of Object.entries(data)) {
            this.preferences.set(key, {
              key,
              value,
              source: PreferenceSource.USER,
              timestamp: Date.now(),
              version: this.version,
              synced: false,
              modified: false
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      const data = {
        version: this.version,
        timestamp: Date.now(),
        preferences: Object.fromEntries(this.preferences.entries())
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  private setupSyncListener(): void {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.preferences) {
            // Update preferences from other tab
            for (const [key, preference] of Object.entries(data.preferences)) {
              const current = this.preferences.get(key);
              const incoming = preference as PreferenceValue;
              
              // Only update if incoming is newer
              if (!current || incoming.timestamp > current.timestamp) {
                this.preferences.set(key, incoming);
                this.emit('preferenceChanged', {
                  key,
                  oldValue: current?.value,
                  newValue: incoming.value,
                  source: incoming.source,
                  timestamp: incoming.timestamp,
                  context: this.context
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to sync preferences from other tab:', error);
        }
      }
    });
  }

  public enableCloudSync(syncUrl: string): void {
    this.cloudSyncUrl = syncUrl;
    this.syncEnabled = true;
    this.scheduleSync();
  }

  public disableCloudSync(): void {
    this.syncEnabled = false;
    this.cloudSyncUrl = undefined;
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private scheduleSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    
    this.syncTimer = setTimeout(() => {
      this.performCloudSync();
    }, 5000); // Debounce sync for 5 seconds
  }

  private async performCloudSync(): Promise<void> {
    if (!this.cloudSyncUrl || !this.syncEnabled) return;
    
    try {
      const unsyncedPreferences = Array.from(this.preferences.entries())
        .filter(([_, pref]) => !pref.synced && pref.source !== PreferenceSource.TEMPORARY);
      
      if (unsyncedPreferences.length === 0) return;
      
      const syncData = {
        preferences: Object.fromEntries(unsyncedPreferences),
        context: this.context,
        timestamp: Date.now()
      };
      
      const response = await fetch(this.cloudSyncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData)
      });
      
      if (response.ok) {
        // Mark preferences as synced
        for (const [key, _] of unsyncedPreferences) {
          const pref = this.preferences.get(key);
          if (pref) {
            pref.synced = true;
            this.preferences.set(key, pref);
          }
        }
        
        this.savePreferences();
        this.emit('cloudSyncSuccess', unsyncedPreferences.length);
      } else {
        throw new Error(`Cloud sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Cloud sync failed:', error);
      this.emit('cloudSyncError', error);
      
      // Retry after delay
      setTimeout(() => this.scheduleSync(), 30000);
    }
  }

  public getModifiedPreferences(): PreferenceValue[] {
    return Array.from(this.preferences.values()).filter(pref => pref.modified);
  }

  public markAllAsSynced(): void {
    for (const [key, pref] of this.preferences.entries()) {
      pref.synced = true;
      pref.modified = false;
      this.preferences.set(key, pref);
    }
    this.savePreferences();
  }

  public destroy(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const preferencesManager = PreferencesManager.getInstance();
