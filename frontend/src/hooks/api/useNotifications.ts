/**
 * useNotifications Hook
 * 
 * Manages application-wide notification system with multiple types,
 * queuing, auto-dismissal, and user preferences.
 * 
 * Features:
 * - Toast notifications with different severity levels
 * - Notification queuing and rate limiting
 * - Persistent notifications for important messages
 * - User preference management (enabled/disabled types)
 * - Sound notifications with audio cues
 * - Accessibility support (screen reader announcements)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  persistent?: boolean; // Override auto-dismiss
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  timestamp: number;
  read: boolean;
  source?: string; // Which component/service triggered this
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    info: boolean;
    success: boolean;
    warning: boolean;
    error: boolean;
    system: boolean;
  };
  sounds: {
    enabled: boolean;
    volume: number;
  };
  autoReading: boolean; // Screen reader announcements
  maxVisible: number; // Max notifications visible at once
}

export interface NotificationQueue {
  queue: Notification[];
  maxSize: number;
  rateLimit: number; // Max notifications per second
}

export interface UseNotificationsOptions {
  maxVisible?: number;
  defaultDuration?: number;
  enableSounds?: boolean;
  enablePersistence?: boolean;
  rateLimit?: number;
}

export interface UseNotificationsResult {
  // State
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isEnabled: boolean;
  queue: NotificationQueue;
  
  // Actions
  notify: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
  system: (title: string, message?: string, options?: Partial<Notification>) => string;
  
  // Management
  dismiss: (notificationId: string) => void;
  dismissAll: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // Configuration
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  toggleType: (type: keyof NotificationPreferences['types']) => void;
  toggleSounds: () => void;
  
  // Utilities
  clearHistory: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  searchNotifications: (query: string) => Notification[];
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    info: true,
    success: true,
    warning: true,
    error: true,
    system: true,
  },
  sounds: {
    enabled: true,
    volume: 0.5,
  },
  autoReading: false,
  maxVisible: 5,
};

const DEFAULT_OPTIONS: Required<UseNotificationsOptions> = {
  maxVisible: 5,
  defaultDuration: 5000,
  enableSounds: true,
  enablePersistence: true,
  rateLimit: 10, // 10 notifications per second max
};

export default function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [queue, setQueue] = useState<NotificationQueue>({
    queue: [],
    maxSize: 100,
    rateLimit: config.rateLimit,
  });
  
  // Refs for rate limiting and audio
  const rateLimitRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notification-preferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }, []);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
  }, [preferences]);
  
  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (!notification.persistent && notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dismiss(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications]);
  
  // Rate limiting check
  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Clean old timestamps
    rateLimitRef.current = rateLimitRef.current.filter(timestamp => timestamp > oneSecondAgo);
    
    return rateLimitRef.current.length >= queue.rateLimit;
  }, [queue.rateLimit]);
  
  // Play notification sound
  const playNotificationSound = useCallback(async (type: Notification['type']) => {
    if (!preferences.sounds.enabled || !config.enableSounds) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Different frequencies for different notification types
      const frequencies = {
        info: 440,      // A4
        success: 523,   // C5
        warning: 698,   // F5
        error: 330,     // E4
        system: 392,    // G4
      };
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(preferences.sounds.volume * 0.1, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [preferences.sounds, config.enableSounds]);
  
  // Screen reader announcement
  const announceToScreenReader = useCallback((notification: Notification) => {
    if (!preferences.autoReading) return;
    
    const announcement = `${notification.type} notification: ${notification.title}. ${notification.message}`;
    
    // Create a temporary element for screen reader announcement
    const element = document.createElement('div');
    element.setAttribute('aria-live', notification.type === 'error' ? 'assertive' : 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.style.position = 'absolute';
    element.style.left = '-10000px';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.overflow = 'hidden';
    
    document.body.appendChild(element);
    element.textContent = announcement;
    
    setTimeout(() => {
      document.body.removeChild(element);
    }, 1000);
  }, [preferences.autoReading]);
  
  // Core notification function
  const notify = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    if (!preferences.enabled || !preferences.types[notificationData.type]) {
      return ''; // Notification type disabled
    }
    
    if (isRateLimited()) {
      console.warn('Notification rate limit exceeded');
      return '';
    }
    
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
      duration: notificationData.duration ?? config.defaultDuration,
    };
    
    // Add to rate limit tracker
    rateLimitRef.current.push(notification.timestamp);
    
    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      
      // Limit visible notifications
      if (newNotifications.length > preferences.maxVisible) {
        return newNotifications.slice(0, preferences.maxVisible);
      }
      
      return newNotifications;
    });
    
    // Play sound and announce
    playNotificationSound(notification.type);
    announceToScreenReader(notification);
    
    return notification.id;
  }, [preferences, isRateLimited, config.defaultDuration, playNotificationSound, announceToScreenReader]);
  
  // Convenience methods
  const success = useCallback((title: string, message = '', options: Partial<Notification> = {}) => {
    return notify({ ...options, type: 'success', title, message });
  }, [notify]);
  
  const error = useCallback((title: string, message = '', options: Partial<Notification> = {}) => {
    return notify({ ...options, type: 'error', title, message, persistent: true });
  }, [notify]);
  
  const warning = useCallback((title: string, message = '', options: Partial<Notification> = {}) => {
    return notify({ ...options, type: 'warning', title, message });
  }, [notify]);
  
  const info = useCallback((title: string, message = '', options: Partial<Notification> = {}) => {
    return notify({ ...options, type: 'info', title, message });
  }, [notify]);
  
  const system = useCallback((title: string, message = '', options: Partial<Notification> = {}) => {
    return notify({ ...options, type: 'system', title, message });
  }, [notify]);
  
  // Management functions
  const dismiss = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);
  
  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  
  // Configuration functions
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);
  
  const toggleType = useCallback((type: keyof NotificationPreferences['types']) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  }, []);
  
  const toggleSounds = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      sounds: {
        ...prev.sounds,
        enabled: !prev.sounds.enabled,
      },
    }));
  }, []);
  
  // Utility functions
  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);
  
  const searchNotifications = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return notifications.filter(n => 
      n.title.toLowerCase().includes(lowercaseQuery) ||
      n.message.toLowerCase().includes(lowercaseQuery)
    );
  }, [notifications]);
  
  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;
  const isEnabled = preferences.enabled;
  
  return {
    // State
    notifications,
    unreadCount,
    preferences,
    isEnabled,
    queue,
    
    // Actions
    notify,
    success,
    error,
    warning,
    info,
    system,
    
    // Management
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    
    // Configuration
    updatePreferences,
    toggleType,
    toggleSounds,
    
    // Utilities
    clearHistory,
    getNotificationsByType,
    searchNotifications,
  };
}
