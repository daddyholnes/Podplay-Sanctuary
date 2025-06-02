// 🐻 Enhanced Mama Bear AI with Advanced Emotional Intelligence
// Adaptive personality system with deep memory integration

import { sanctuaryMemoryService, type PersonalityState, type EmotionalMoment } from './SanctuaryMemoryService';
import { mamaBearAI, type AIResponse, type EmotionalState } from './MamaBearAIService';

export type PersonalityMode = 'mama-bear' | 'mentor' | 'companion' | 'pair-programmer' | 'cheerleader' | 'sage';
export type EmotionalTone = 'nurturing' | 'enthusiastic' | 'calm' | 'playful' | 'focused' | 'inspiring';
export type InteractionStyle = 'gentle' | 'direct' | 'technical' | 'creative' | 'supportive' | 'collaborative';

export interface EnhancedAIResponse extends AIResponse {
  personality_insights: PersonalityInsight[];
  emotional_analysis: EmotionalAnalysis;
  relationship_building: RelationshipGrowth;
  contextual_memory: ContextualMemory[];
  future_suggestions: FutureSuggestion[];
  celebration_trigger?: CelebrationTrigger;
}

export interface PersonalityInsight {
  type: 'preference_learned' | 'emotional_pattern' | 'learning_style' | 'communication_adaptation';
  insight: string;
  confidence: number; // 1-10
  actionable: boolean;
}

export interface EmotionalAnalysis {
  detected_emotion: string;
  intensity: number; // 1-10
  context_understanding: string;
  empathy_response: string;
  suggested_approach: 'supportive' | 'celebratory' | 'encouraging' | 'mentor' | 'playful';
}

export interface RelationshipGrowth {
  current_trust_level: number; // 1-10
  relationship_depth: number; // 1-10
  communication_harmony: number; // 1-10
  shared_experiences: number;
  growth_areas: string[];
}

export interface ContextualMemory {
  memory_type: 'preference' | 'achievement' | 'struggle' | 'learning' | 'emotional';
  content: string;
  relevance_score: number; // 1-10
  emotional_weight: number; // 1-10
  timestamp: Date;
}

export interface FutureSuggestion {
  type: 'learning' | 'project' | 'tool' | 'break' | 'celebration' | 'exploration';
  title: string;
  description: string;
  confidence: number; // 1-10
  estimated_value: number; // 1-10
  personalization_level: number; // 1-10
}

export interface CelebrationTrigger {
  reason: string;
  intensity: 'small' | 'medium' | 'grand' | 'legendary';
  celebration_type: 'achievement' | 'milestone' | 'breakthrough' | 'persistence' | 'growth';
  message: string;
  suggested_sharing: boolean;
}

export interface AdaptivePersonality {
  mode: PersonalityMode;
  tone: EmotionalTone;
  style: InteractionStyle;
  energy_level: number; // 1-10
  formality: number; // 1-10 (1 = very casual, 10 = formal)
  creativity: number; // 1-10
  technical_depth: number; // 1-10
  emotional_expressiveness: number; // 1-10
}

export interface ConversationContext {
  session_id: string;
  conversation_depth: number;
  topics_discussed: string[];
  emotional_journey: EmotionalMoment[];
  user_engagement_level: number; // 1-10
  ai_effectiveness_rating: number; // 1-10
  relationship_building_score: number; // 1-10
}

class EnhancedMamaBearAI {
  private currentPersonality: AdaptivePersonality;
  private conversationContext: ConversationContext;
  private emotionalMemory: Map<string, number> = new Map();
  private learningPatterns: Map<string, any> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    this.currentPersonality = {
      mode: 'mama-bear',
      tone: 'nurturing',
      style: 'gentle',
      energy_level: 7,
      formality: 3,
      creativity: 8,
      technical_depth: 6,
      emotional_expressiveness: 9
    };

    this.conversationContext = {
      session_id: `conversation_${Date.now()}`,
      conversation_depth: 0,
      topics_discussed: [],
      emotional_journey: [],
      user_engagement_level: 5,
      ai_effectiveness_rating: 5,
      relationship_building_score: 5
    };
  }

  // ==================== ENHANCED CONVERSATION PROCESSING ====================

  async processUserInputEnhanced(
    input: string, 
    context?: { urgency?: number; complexity?: number; emotional_state?: EmotionalState }
  ): Promise<EnhancedAIResponse> {
    
    // Step 1: Analyze user input for deep context
    const inputAnalysis = await this.analyzeUserInput(input, context);
    
    // Step 2: Retrieve relevant memories and context
    const contextualMemories = await this.getRelevantMemories(input);
    
    // Step 3: Adapt personality based on context and history
    await this.adaptPersonality(inputAnalysis, contextualMemories);
    
    // Step 4: Generate base response using existing AI
    const baseResponse = await mamaBearAI.processUserInput(input, {
      technical_complexity: context?.complexity || 0.5,
      urgency_level: context?.urgency || 0.4
    });

    // Step 5: Enhance with emotional intelligence and memory
    const enhancedResponse = await this.enhanceResponse(baseResponse, inputAnalysis, contextualMemories);
    
    // Step 6: Record interaction for future learning
    await this.recordInteraction(input, enhancedResponse, inputAnalysis);
    
    return enhancedResponse;
  }

  private async analyzeUserInput(input: string, context?: any): Promise<EmotionalAnalysis> {
    // Detect emotional undertones
    const emotionalIndicators = {
      excited: ['excited', 'awesome', 'amazing', 'love', 'fantastic', '!', 'wow'],
      frustrated: ['stuck', 'confused', 'help', 'problem', 'error', 'broken', 'issue'],
      curious: ['how', 'why', 'what', 'learn', 'understand', 'explore', 'discover'],
      accomplished: ['done', 'finished', 'completed', 'worked', 'success', 'achieved'],
      uncertain: ['maybe', 'not sure', 'think', 'possibly', 'might', 'unclear']
    };

    let detectedEmotion = 'neutral';
    let maxScore = 0;

    Object.entries(emotionalIndicators).forEach(([emotion, indicators]) => {
      const score = indicators.reduce((count, indicator) => {
        return count + (input.toLowerCase().includes(indicator) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    });

    // Calculate intensity based on punctuation and capitalization
    const intensity = Math.min(10, 5 + 
      (input.match(/!/g)?.length || 0) * 2 +
      (input.match(/[A-Z]{2,}/g)?.length || 0) * 1.5 +
      (input.length > 100 ? 1 : 0)
    );

    return {
      detected_emotion: detectedEmotion,
      intensity,
      context_understanding: this.generateContextUnderstanding(input, detectedEmotion),
      empathy_response: this.generateEmpathyResponse(detectedEmotion, intensity),
      suggested_approach: this.determineSuggestedApproach(detectedEmotion, intensity)
    };
  }

  private generateContextUnderstanding(input: string, emotion: string): string {
    const contexts = {
      excited: "I can feel your enthusiasm! You're energized about something and ready to dive in.",
      frustrated: "I sense you're working through a challenge. That's completely normal in development.",
      curious: "Your curiosity is beautiful! Learning and exploring is how we grow.",
      accomplished: "I can hear the satisfaction in your words. You've achieved something meaningful!",
      uncertain: "I understand the feeling of uncertainty. Let's explore this together step by step."
    };

    return contexts[emotion as keyof typeof contexts] || "I'm here to understand and support whatever you're working on.";
  }

  private generateEmpathyResponse(emotion: string, intensity: number): string {
    const highIntensity = intensity >= 7;
    
    const responses = {
      excited: highIntensity ? 
        "Your excitement is absolutely contagious! I'm thrilled to be part of this journey with you! 🚀✨" :
        "I love seeing your enthusiasm! Let's channel that energy into something amazing! 💫",
      frustrated: highIntensity ?
        "I can really feel your frustration right now, and that's completely valid. Take a breath - we'll figure this out together. 💝" :
        "I understand this is challenging. Remember, every expert was once a beginner facing the same struggles. 🌱",
      curious: highIntensity ?
        "Your curiosity is inspiring! I absolutely love when you dive deep into understanding things! 🧠✨" :
        "What a wonderful question! Curiosity is the spark of all great discoveries. 🔍",
      accomplished: highIntensity ?
        "WOW! I am SO proud of you right now! This achievement deserves a proper celebration! 🎉🏆" :
        "That's fantastic! I can feel your sense of accomplishment, and you absolutely deserve it! ⭐",
      uncertain: "It's perfectly okay to feel uncertain. Some of the best discoveries come from admitting we don't know everything yet. 🤗"
    };

    return responses[emotion as keyof typeof responses] || "I'm here with you, whatever you're feeling right now. 💝";
  }

  private determineSuggestedApproach(emotion: string, intensity: number): EmotionalAnalysis['suggested_approach'] {
    if (emotion === 'excited' && intensity >= 7) return 'celebratory';
    if (emotion === 'frustrated' && intensity >= 6) return 'supportive';
    if (emotion === 'accomplished') return 'celebratory';
    if (emotion === 'curious') return 'mentor';
    if (emotion === 'uncertain') return 'encouraging';
    return 'supportive';
  }

  // ==================== PERSONALITY ADAPTATION ====================

  private async adaptPersonality(analysis: EmotionalAnalysis, memories: ContextualMemory[]): Promise<void> {
    // Adjust personality based on user's emotional state and history
    
    if (analysis.detected_emotion === 'frustrated') {
      this.currentPersonality.tone = 'calm';
      this.currentPersonality.style = 'gentle';
      this.currentPersonality.emotional_expressiveness = 7;
      this.currentPersonality.technical_depth = Math.min(5, this.currentPersonality.technical_depth);
    } else if (analysis.detected_emotion === 'excited') {
      this.currentPersonality.tone = 'enthusiastic';
      this.currentPersonality.energy_level = Math.min(10, this.currentPersonality.energy_level + 2);
      this.currentPersonality.emotional_expressiveness = 9;
    } else if (analysis.detected_emotion === 'curious') {
      this.currentPersonality.mode = 'mentor';
      this.currentPersonality.tone = 'inspiring';
      this.currentPersonality.technical_depth = Math.min(10, this.currentPersonality.technical_depth + 1);
    }

    // Learn from past successful interactions
    const successfulInteractions = memories.filter(m => m.emotional_weight >= 7);
    if (successfulInteractions.length > 0) {
      // Adapt to patterns that work well with this user
      this.learnFromSuccessfulPatterns(successfulInteractions);
    }
  }

  private learnFromSuccessfulPatterns(interactions: ContextualMemory[]): void {
    // Analyze what personality traits led to positive interactions
    interactions.forEach(interaction => {
      if (interaction.content.includes('celebration')) {
        this.currentPersonality.emotional_expressiveness = Math.min(10, this.currentPersonality.emotional_expressiveness + 0.1);
      }
      if (interaction.content.includes('technical') || interaction.content.includes('code')) {
        this.currentPersonality.technical_depth = Math.min(10, this.currentPersonality.technical_depth + 0.1);
      }
    });
  }

  // ==================== MEMORY INTEGRATION ====================

  private async getRelevantMemories(input: string): Promise<ContextualMemory[]> {
    // Use sanctuary memory service to get relevant context
    const keywords = this.extractKeywords(input);
    const memories: ContextualMemory[] = [];

    // Get relevant memories from different categories
    for (const keyword of keywords) {
      const memoryResults = await sanctuaryMemoryService.getRecentAchievements(3);
      // Convert achievements to contextual memories
      memoryResults.forEach(achievement => {
        memories.push({
          memory_type: 'achievement',
          content: `${achievement.title}: ${achievement.description}`,
          relevance_score: this.calculateRelevance(keyword, achievement.title + achievement.description),
          emotional_weight: achievement.emotional_impact,
          timestamp: achievement.timestamp
        });
      });
    }

    // Sort by relevance and return top memories
    return memories
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5);
  }

  private extractKeywords(input: string): string[] {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to most important words
  }

  private calculateRelevance(keyword: string, content: string): number {
    const contentLower = content.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    if (contentLower.includes(keywordLower)) {
      return 8 + Math.random() * 2; // Add some randomness for variety
    }
    
    // Check for semantic similarity (simplified)
    const semanticScore = this.calculateSemanticSimilarity(keywordLower, contentLower);
    return semanticScore;
  }

  private calculateSemanticSimilarity(keyword: string, content: string): number {
    // Simple semantic similarity based on common programming terms
    const semanticGroups = {
      coding: ['code', 'programming', 'development', 'function', 'variable', 'class'],
      learning: ['learn', 'study', 'understand', 'knowledge', 'skill', 'practice'],
      problem: ['error', 'bug', 'issue', 'problem', 'fix', 'debug'],
      achievement: ['success', 'complete', 'finish', 'accomplish', 'done', 'win']
    };

    for (const [group, terms] of Object.entries(semanticGroups)) {
      if (terms.includes(keyword)) {
        const groupMatches = terms.filter(term => content.includes(term)).length;
        if (groupMatches > 0) {
          return 3 + (groupMatches * 1.5);
        }
      }
    }

    return 1; // Minimum relevance
  }

  // ==================== RESPONSE ENHANCEMENT ====================

  private async enhanceResponse(
    baseResponse: AIResponse,
    analysis: EmotionalAnalysis,
    memories: ContextualMemory[]
  ): Promise<EnhancedAIResponse> {
    
    const personalityInsights = await this.generatePersonalityInsights(analysis, memories);
    const relationshipGrowth = await this.assessRelationshipGrowth();
    const futureSuggestions = await this.generateFutureSuggestions(analysis, memories);
    const celebrationTrigger = this.detectCelebrationTrigger(analysis, baseResponse);

    return {
      ...baseResponse,
      content: await this.personalizeResponse(baseResponse.content, analysis, memories),
      personality_insights: personalityInsights,
      emotional_analysis: analysis,
      relationship_building: relationshipGrowth,
      contextual_memory: memories,
      future_suggestions: futureSuggestions,
      celebration_trigger: celebrationTrigger
    };
  }

  private async personalizeResponse(
    baseContent: string, 
    analysis: EmotionalAnalysis, 
    memories: ContextualMemory[]
  ): Promise<string> {
    let personalizedContent = baseContent;

    // Add emotional resonance
    personalizedContent = analysis.empathy_response + "\n\n" + personalizedContent;

    // Add relevant memory context
    const relevantMemory = memories.find(m => m.relevance_score >= 7);
    if (relevantMemory && Math.random() > 0.7) { // Sometimes add memory context
      personalizedContent += `\n\n💭 This reminds me of when you ${relevantMemory.content.toLowerCase()}. Look how far you've come!`;
    }

    // Add personality-specific flourishes
    if (this.currentPersonality.emotional_expressiveness >= 8) {
      personalizedContent = this.addEmotionalFlourishes(personalizedContent, analysis.detected_emotion);
    }

    return personalizedContent;
  }

  private addEmotionalFlourishes(content: string, emotion: string): string {
    const flourishes = {
      excited: ['✨', '🚀', '💫', '⭐', '🌟'],
      frustrated: ['💝', '🌱', '💪', '🤗', '💖'],
      curious: ['🧠', '🔍', '💡', '🌟', '✨'],
      accomplished: ['🎉', '🏆', '⭐', '💫', '🔥'],
      uncertain: ['🤗', '💝', '🌱', '💪', '✨']
    };

    const emotionFlourishes = flourishes[emotion as keyof typeof flourishes] || ['💝'];
    const randomFlourish = emotionFlourishes[Math.floor(Math.random() * emotionFlourishes.length)];
    
    return content + ' ' + randomFlourish;
  }

  private async generatePersonalityInsights(
    analysis: EmotionalAnalysis, 
    memories: ContextualMemory[]
  ): Promise<PersonalityInsight[]> {
    const insights: PersonalityInsight[] = [];

    // Learning style insights
    if (analysis.detected_emotion === 'curious') {
      insights.push({
        type: 'learning_style',
        insight: 'You learn best through exploration and questioning - I love that about you!',
        confidence: 8,
        actionable: true
      });
    }

    // Communication adaptation insights
    if (this.conversationContext.conversation_depth > 5) {
      insights.push({
        type: 'communication_adaptation',
        insight: 'Our conversations are getting deeper and more meaningful over time',
        confidence: 9,
        actionable: false
      });
    }

    return insights;
  }

  private async assessRelationshipGrowth(): Promise<RelationshipGrowth> {
    return {
      current_trust_level: Math.min(10, 5 + this.conversationContext.conversation_depth * 0.3),
      relationship_depth: Math.min(10, 3 + this.conversationContext.topics_discussed.length * 0.2),
      communication_harmony: this.conversationContext.ai_effectiveness_rating,
      shared_experiences: this.conversationContext.emotional_journey.length,
      growth_areas: ['deeper technical discussions', 'more personalized encouragement']
    };
  }

  private async generateFutureSuggestions(
    analysis: EmotionalAnalysis, 
    memories: ContextualMemory[]
  ): Promise<FutureSuggestion[]> {
    const suggestions: FutureSuggestion[] = [];

    if (analysis.detected_emotion === 'curious') {
      suggestions.push({
        type: 'learning',
        title: 'Deep Dive Learning Session',
        description: 'Based on your curiosity, we could explore advanced concepts together',
        confidence: 8,
        estimated_value: 9,
        personalization_level: 7
      });
    }

    if (analysis.detected_emotion === 'accomplished') {
      suggestions.push({
        type: 'celebration',
        title: 'Achievement Celebration',
        description: 'Let\'s take a moment to properly celebrate your success!',
        confidence: 10,
        estimated_value: 8,
        personalization_level: 9
      });
    }

    return suggestions;
  }

  private detectCelebrationTrigger(
    analysis: EmotionalAnalysis, 
    response: AIResponse
  ): CelebrationTrigger | undefined {
    if (analysis.detected_emotion === 'accomplished' || response.celebration_worthy) {
      return {
        reason: 'Achievement detected',
        intensity: analysis.intensity >= 8 ? 'grand' : 'medium',
        celebration_type: 'achievement',
        message: 'Your hard work is paying off beautifully! 🎉',
        suggested_sharing: true
      };
    }

    return undefined;
  }

  // ==================== INTERACTION RECORDING ====================

  private async recordInteraction(
    input: string, 
    response: EnhancedAIResponse, 
    analysis: EmotionalAnalysis
  ): Promise<void> {
    // Record emotional moment
    await sanctuaryMemoryService.recordEmotionalMoment(
      analysis.detected_emotion,
      `User input: ${input.substring(0, 50)}...`,
      `AI response effectiveness: ${this.conversationContext.ai_effectiveness_rating}`,
      analysis.intensity
    );

    // Update conversation context
    this.conversationContext.conversation_depth++;
    this.conversationContext.topics_discussed.push(this.extractMainTopic(input));
    this.conversationContext.emotional_journey.push({
      timestamp: new Date(),
      emotion: analysis.detected_emotion,
      trigger: input,
      intensity: analysis.intensity,
      ai_response_type: analysis.suggested_approach,
      context: 'enhanced_conversation',
      user_satisfaction: 0 // To be updated based on feedback
    });

    // Learn preferences
    await this.updateUserPreferences(input, response, analysis);
  }

  private extractMainTopic(input: string): string {
    const keywords = this.extractKeywords(input);
    return keywords[0] || 'general_conversation';
  }

  private async updateUserPreferences(
    input: string, 
    response: EnhancedAIResponse, 
    analysis: EmotionalAnalysis
  ): Promise<void> {
    // Track what types of responses work well
    if (analysis.intensity >= 7 && analysis.detected_emotion === 'excited') {
      this.userPreferences.set('high_energy_responses', true);
    }
    
    if (input.includes('technical') || input.includes('code')) {
      this.userPreferences.set('technical_depth_preference', 
        (this.userPreferences.get('technical_depth_preference') || 5) + 0.1
      );
    }
  }

  // ==================== PUBLIC INTERFACE ====================

  async getCurrentPersonality(): Promise<AdaptivePersonality> {
    return { ...this.currentPersonality };
  }

  async getConversationContext(): Promise<ConversationContext> {
    return { ...this.conversationContext };
  }

  async adaptToFeedback(feedbackScore: number, feedbackType: string): Promise<void> {
    this.conversationContext.ai_effectiveness_rating = 
      (this.conversationContext.ai_effectiveness_rating * 0.8) + (feedbackScore * 0.2);

    if (feedbackScore >= 8) {
      // Reinforce current personality traits
      Object.keys(this.currentPersonality).forEach(key => {
        if (typeof this.currentPersonality[key as keyof AdaptivePersonality] === 'number') {
          const currentValue = this.currentPersonality[key as keyof AdaptivePersonality] as number;
          (this.currentPersonality as any)[key] = Math.min(10, currentValue + 0.1);
        }
      });
    }
  }

  async resetPersonality(): Promise<void> {
    this.currentPersonality = {
      mode: 'mama-bear',
      tone: 'nurturing',
      style: 'gentle',
      energy_level: 7,
      formality: 3,
      creativity: 8,
      technical_depth: 6,
      emotional_expressiveness: 9
    };
  }
}

// Export singleton instance
export const enhancedMamaBearAI = new EnhancedMamaBearAI();
export default enhancedMamaBearAI;
