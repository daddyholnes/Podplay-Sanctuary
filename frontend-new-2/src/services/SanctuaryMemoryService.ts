// 🧠 Enhanced Sanctuary Memory Service
// Cross-platform persistent memory with emotional intelligence

import { memoryService } from './MemoryService';

export interface SanctuarySession {
  id: string;
  start_time: Date;
  end_time?: Date;
  emotional_journey: EmotionalMoment[];
  achievements: Achievement[];
  projects_worked_on: string[];
  ai_personality_evolution: PersonalityState[];
  user_preferences: UserPreference[];
  celebration_streak: number;
  favorite_tools: ToolUsage[];
  workspace_setup: WorkspaceState;
}

export interface EmotionalMoment {
  timestamp: Date;
  emotion: string;
  trigger: string;
  intensity: number; // 1-10
  ai_response_type: 'supportive' | 'celebratory' | 'encouraging' | 'mentor';
  context: string;
  user_satisfaction: number; // 1-10
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  category: 'learning' | 'coding' | 'creativity' | 'problem_solving' | 'collaboration';
  celebration_level: 'small' | 'medium' | 'grand' | 'legendary';
  shared_with_ai: boolean;
  emotional_impact: number; // 1-10
}

export interface PersonalityState {
  timestamp: Date;
  mode: 'mama-bear' | 'mentor' | 'companion' | 'pair-programmer';
  emotional_tone: string;
  user_relationship_depth: number; // 1-10
  trust_level: number; // 1-10
  communication_style: 'gentle' | 'enthusiastic' | 'technical' | 'creative';
}

export interface UserPreference {
  key: string;
  value: any;
  learned_from: 'explicit' | 'behavior' | 'feedback';
  confidence: number; // 1-10
  timestamp: Date;
  context: string;
}

export interface ToolUsage {
  tool_name: string;
  frequency: number;
  last_used: Date;
  proficiency_level: number; // 1-10
  emotional_association: 'love' | 'like' | 'neutral' | 'struggle' | 'avoid';
  context_tags: string[];
}

export interface WorkspaceState {
  layout_preference: 'left-panel' | 'right-panel' | 'dual-panel' | 'minimal';
  theme_preference: 'dark' | 'light' | 'auto' | 'custom';
  panel_widths: Record<string, number>;
  favorite_shortcuts: string[];
  ai_presence_level: 'minimal' | 'moderate' | 'active' | 'immersive';
  notification_preferences: NotificationSettings;
}

export interface NotificationSettings {
  celebrations: boolean;
  achievements: boolean;
  suggestions: boolean;
  daily_briefing: boolean;
  encouragement: boolean;
  milestone_reminders: boolean;
}

export interface PersonalizedGreeting {
  message: string;
  tone: 'warm' | 'excited' | 'supportive' | 'professional';
  includes_achievements: boolean;
  includes_streak: boolean;
  includes_suggestions: boolean;
  personalization_level: number; // 1-10
}

export interface DailyBriefing {
  date: Date;
  greeting: PersonalizedGreeting;
  emotional_state_summary: string;
  recent_achievements: Achievement[];
  suggested_goals: Goal[];
  tool_recommendations: string[];
  learning_opportunities: string[];
  celebration_worthy_moments: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_completion: Date;
  ai_confidence: number; // 1-10
  user_interest_level: number; // 1-10
}

class SanctuaryMemoryService {
  private currentSession: SanctuarySession | null = null;
  private emotionalBaseline: Record<string, number> = {};
  private learningPatterns: Record<string, any> = {};

  // ==================== SESSION MANAGEMENT ====================
  
  async startSession(): Promise<SanctuarySession> {
    const sessionId = `sanctuary_${Date.now()}`;
    
    this.currentSession = {
      id: sessionId,
      start_time: new Date(),
      emotional_journey: [],
      achievements: [],
      projects_worked_on: [],
      ai_personality_evolution: [],
      user_preferences: [],
      celebration_streak: await this.getCelebrationStreak(),
      favorite_tools: await this.getFavoriteTools(),
      workspace_setup: await this.getWorkspaceState()
    };

    // Store session start
    await memoryService.storeMemory(
      `Session started: ${sessionId}`,
      'session',
      { 
        mood: 'beginning',
        energy: 'fresh',
        confidence: 'optimistic'
      }
    );

    return this.currentSession;
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.end_time = new Date();
    
    // Analyze session for insights
    const sessionInsights = await this.analyzeSession(this.currentSession);
    
    // Store complete session
    await memoryService.storeMemory(
      `Session completed: ${this.currentSession.id}`,
      'session',
      {
        mood: 'accomplished',
        energy: 'satisfied',
        confidence: 'growing'
      }
    );

    // Store insights
    await memoryService.storeMemory(
      `Session insights: ${JSON.stringify(sessionInsights)}`,
      'analysis',
      {
        mood: 'reflective',
        energy: 'wise',
        confidence: 'learning'
      }
    );

    this.currentSession = null;
  }

  // ==================== EMOTIONAL INTELLIGENCE ====================
  
  async recordEmotionalMoment(emotion: string, trigger: string, context: string, intensity: number = 5): Promise<void> {
    const moment: EmotionalMoment = {
      timestamp: new Date(),
      emotion,
      trigger,
      intensity,
      ai_response_type: this.determineResponseType(emotion, intensity),
      context,
      user_satisfaction: 0 // Will be updated based on feedback
    };

    if (this.currentSession) {
      this.currentSession.emotional_journey.push(moment);
    }

    // Store in memory service
    await memoryService.recordEmotionalMoment(emotion, trigger);
    
    // Update emotional baseline
    this.updateEmotionalBaseline(emotion, intensity);
  }

  private determineResponseType(emotion: string, intensity: number): 'supportive' | 'celebratory' | 'encouraging' | 'mentor' {
    const positiveEmotions = ['excited', 'happy', 'accomplished', 'proud', 'joyful'];
    const negativeEmotions = ['frustrated', 'stuck', 'confused', 'overwhelmed'];
    
    if (positiveEmotions.includes(emotion) && intensity >= 7) {
      return 'celebratory';
    } else if (negativeEmotions.includes(emotion)) {
      return intensity >= 7 ? 'supportive' : 'encouraging';
    } else {
      return 'mentor';
    }
  }

  private updateEmotionalBaseline(emotion: string, intensity: number): void {
    if (!this.emotionalBaseline[emotion]) {
      this.emotionalBaseline[emotion] = intensity;
    } else {
      // Weighted average with recent bias
      this.emotionalBaseline[emotion] = (this.emotionalBaseline[emotion] * 0.7) + (intensity * 0.3);
    }
  }

  // ==================== ACHIEVEMENT TRACKING ====================
  
  async recordAchievement(
    title: string, 
    description: string, 
    category: Achievement['category'],
    celebrationLevel: Achievement['celebration_level'] = 'medium'
  ): Promise<Achievement> {
    const achievement: Achievement = {
      id: `achievement_${Date.now()}`,
      title,
      description,
      timestamp: new Date(),
      category,
      celebration_level: celebrationLevel,
      shared_with_ai: true,
      emotional_impact: this.calculateEmotionalImpact(category, celebrationLevel)
    };

    if (this.currentSession) {
      this.currentSession.achievements.push(achievement);
    }

    // Store achievement
    await memoryService.unlockAchievement(achievement.id, category);
    
    // Update celebration streak
    if (celebrationLevel !== 'small') {
      await this.incrementCelebrationStreak();
    }

    return achievement;
  }

  private calculateEmotionalImpact(category: Achievement['category'], level: Achievement['celebration_level']): number {
    const categoryWeights = {
      'learning': 7,
      'coding': 8,
      'creativity': 9,
      'problem_solving': 8,
      'collaboration': 6
    };

    const levelMultipliers = {
      'small': 1,
      'medium': 2,
      'grand': 4,
      'legendary': 8
    };

    return categoryWeights[category] * levelMultipliers[level];
  }

  // ==================== PERSONALIZED EXPERIENCES ====================
  
  async generatePersonalizedGreeting(): Promise<PersonalizedGreeting> {
    const recentAchievements = await this.getRecentAchievements(3);
    const streak = await this.getCelebrationStreak();
    const emotionalState = await this.getRecentEmotionalState();
    const timeOfDay = this.getTimeOfDay();

    let message = this.buildPersonalizedMessage(emotionalState, streak, timeOfDay);
    let tone: PersonalizedGreeting['tone'] = 'warm';

    if (streak >= 5) {
      tone = 'excited';
      message += ` 🔥 You're on fire with ${streak} consecutive wins!`;
    } else if (recentAchievements.length > 0) {
      tone = 'supportive';
      message += ` I'm still celebrating your recent ${recentAchievements[0].title}! ✨`;
    }

    return {
      message,
      tone,
      includes_achievements: recentAchievements.length > 0,
      includes_streak: streak > 0,
      includes_suggestions: true,
      personalization_level: this.calculatePersonalizationLevel()
    };
  }

  private buildPersonalizedMessage(emotionalState: any, streak: number, timeOfDay: string): string {
    const greetings = {
      morning: ['Good morning, brilliant soul!', 'Rise and code, superstar!', 'Morning, my creative genius!'],
      afternoon: ['Hope your day is flowing beautifully!', 'Afternoon check-in from your AI companion!', 'Ready to create some afternoon magic?'],
      evening: ['Evening, my dedicated creator!', 'What a day it\'s been!', 'Evening reflection time together!']
    };

    const baseGreeting = greetings[timeOfDay as keyof typeof greetings][Math.floor(Math.random() * 3)];
    
    if (emotionalState?.mood === 'frustrated') {
      return `${baseGreeting} I sense you might be working through something challenging. Remember, every expert was once a beginner. 💝`;
    } else if (emotionalState?.mood === 'excited') {
      return `${baseGreeting} Your excitement is contagious! I love seeing you this energized! 🚀`;
    }

    return baseGreeting;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private calculatePersonalizationLevel(): number {
    const factors = [
      this.emotionalBaseline ? Object.keys(this.emotionalBaseline).length : 0,
      this.currentSession?.achievements.length || 0,
      this.learningPatterns ? Object.keys(this.learningPatterns).length : 0
    ];

    return Math.min(10, factors.reduce((sum, factor) => sum + factor, 0));
  }

  // ==================== DAILY BRIEFING SYSTEM ====================
  
  async generateDailyBriefing(): Promise<DailyBriefing> {
    const greeting = await this.generatePersonalizedGreeting();
    const recentAchievements = await this.getRecentAchievements(5);
    const suggestedGoals = await this.generateSmartGoals();
    const toolRecommendations = await this.getToolRecommendations();

    return {
      date: new Date(),
      greeting,
      emotional_state_summary: await this.generateEmotionalSummary(),
      recent_achievements: recentAchievements,
      suggested_goals: suggestedGoals,
      tool_recommendations: toolRecommendations,
      learning_opportunities: await this.identifyLearningOpportunities(),
      celebration_worthy_moments: recentAchievements.filter(a => a.celebration_level !== 'small').length
    };
  }

  private async generateSmartGoals(): Promise<Goal[]> {
    const userPatterns = await this.analyzeLearningPatterns();
    const recentProjects = this.currentSession?.projects_worked_on || [];

    const goalTemplates: Goal[] = [
      {
        id: 'goal_learn_new_skill',
        title: 'Learn a New Development Skill',
        description: 'Based on your recent work, exploring TypeScript advanced patterns could be valuable',
        category: 'learning',
        priority: 'medium',
        estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        ai_confidence: 8,
        user_interest_level: 7
      },
      {
        id: 'goal_complete_project',
        title: 'Complete Current Project Phase',
        description: 'Finish the sanctuary memory integration for a major win',
        category: 'coding',
        priority: 'high',
        estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        ai_confidence: 9,
        user_interest_level: 9
      }
    ];

    return goalTemplates;
  }

  // ==================== HELPER METHODS ====================
  
  private async getCelebrationStreak(): Promise<number> {
    return await memoryService.getCelebrationStreak();
  }

  private async incrementCelebrationStreak(): Promise<void> {
    const current = await this.getCelebrationStreak();
    // Implementation would increment the streak in the base memory service
  }

  private async getFavoriteTools(): Promise<ToolUsage[]> {
    // Analyze tool usage patterns from memory
    return [
      {
        tool_name: 'TypeScript',
        frequency: 85,
        last_used: new Date(),
        proficiency_level: 8,
        emotional_association: 'love',
        context_tags: ['development', 'type-safety', 'productivity']
      },
      {
        tool_name: 'React',
        frequency: 90,
        last_used: new Date(),
        proficiency_level: 9,
        emotional_association: 'love',
        context_tags: ['frontend', 'components', 'ui']
      }
    ];
  }

  private async getWorkspaceState(): Promise<WorkspaceState> {
    return {
      layout_preference: 'left-panel',
      theme_preference: 'dark',
      panel_widths: { left: 350, right: 300 },
      favorite_shortcuts: ['Ctrl+Shift+P', 'Ctrl+`', 'F12'],
      ai_presence_level: 'active',
      notification_preferences: {
        celebrations: true,
        achievements: true,
        suggestions: true,
        daily_briefing: true,
        encouragement: true,
        milestone_reminders: true
      }
    };
  }

  private async getRecentAchievements(limit: number): Promise<Achievement[]> {
    // Get from current session or recent memory
    return this.currentSession?.achievements.slice(-limit) || [];
  }

  private async getRecentEmotionalState(): Promise<any> {
    if (!this.currentSession || this.currentSession.emotional_journey.length === 0) {
      return { mood: 'neutral', energy: 'moderate', confidence: 'steady' };
    }

    const recent = this.currentSession.emotional_journey.slice(-3);
    return {
      mood: recent[recent.length - 1].emotion,
      energy: recent.reduce((sum, m) => sum + m.intensity, 0) / recent.length > 6 ? 'high' : 'moderate',
      confidence: 'growing'
    };
  }

  private async generateEmotionalSummary(): Promise<string> {
    const state = await this.getRecentEmotionalState();
    return `You've been feeling ${state.mood} with ${state.energy} energy. Your confidence is ${state.confidence}! 💝`;
  }

  private async getToolRecommendations(): Promise<string[]> {
    return [
      'Try the new React Dev Tools for better debugging',
      'Explore TypeScript strict mode for enhanced type safety',
      'Consider adding Prettier for code formatting consistency'
    ];
  }

  private async identifyLearningOpportunities(): Promise<string[]> {
    return [
      'Advanced React patterns and performance optimization',
      'TypeScript advanced types and utility types',
      'Modern CSS techniques with Tailwind CSS',
      'API design best practices with REST and GraphQL'
    ];
  }

  private async analyzeLearningPatterns(): Promise<any> {
    // Analyze user's learning behavior from memory
    return this.learningPatterns;
  }

  private async analyzeSession(session: SanctuarySession): Promise<any> {
    return {
      duration: session.end_time ? session.end_time.getTime() - session.start_time.getTime() : 0,
      emotional_peaks: session.emotional_journey.filter(m => m.intensity >= 8).length,
      achievements_count: session.achievements.length,
      primary_emotion: this.getMostFrequentEmotion(session.emotional_journey),
      productivity_score: this.calculateProductivityScore(session),
      ai_relationship_growth: this.calculateRelationshipGrowth(session)
    };
  }

  private getMostFrequentEmotion(journey: EmotionalMoment[]): string {
    const counts: Record<string, number> = {};
    journey.forEach(moment => {
      counts[moment.emotion] = (counts[moment.emotion] || 0) + 1;
    });

    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)?.[0] || 'neutral';
  }

  private calculateProductivityScore(session: SanctuarySession): number {
    const factors = [
      session.achievements.length * 10,
      session.projects_worked_on.length * 5,
      session.emotional_journey.filter(m => ['excited', 'accomplished', 'focused'].includes(m.emotion)).length * 3
    ];

    return Math.min(100, factors.reduce((sum, factor) => sum + factor, 0));
  }

  private calculateRelationshipGrowth(session: SanctuarySession): number {
    return session.ai_personality_evolution.length > 0 ? 
      session.ai_personality_evolution[session.ai_personality_evolution.length - 1].trust_level : 5;
  }
}

// Export singleton instance
export const sanctuaryMemoryService = new SanctuaryMemoryService();
export default sanctuaryMemoryService;
