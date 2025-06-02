// 🐻 Mama Bear AI Service - Your Intelligent, Loving Companion
// This service provides emotional intelligence, contextual awareness, and nurturing guidance

import { memoryService, SanctuaryContext, Memory } from './MemoryService';

export interface EmotionalState {
  energy: 'low' | 'medium' | 'high' | 'excited';
  confidence: 'uncertain' | 'learning' | 'confident' | 'expert';
  mood: 'supportive' | 'encouraging' | 'celebratory' | 'protective' | 'nurturing';
  stress_level: 'calm' | 'focused' | 'concerned' | 'urgent';
}

export interface AIPersonality {
  mode: 'mama-bear' | 'mentor' | 'pair-programmer' | 'cheerleader';
  warmth_level: number; // 0-1
  technical_depth: number; // 0-1
  encouragement_style: 'gentle' | 'enthusiastic' | 'balanced' | 'direct';
  learning_pace: 'patient' | 'adaptive' | 'challenging';
}

export interface ConversationContext {
  intent: string;
  emotional_tone: string;
  technical_complexity: number;
  urgency_level: number;
  user_expertise: number;
  relevant_memories: Memory[];
  suggested_response_style: string;
}

export interface AIResponse {
  content: string;
  personality: AIPersonality;
  emotional_state: EmotionalState;
  suggestions: Array<{
    title: string;
    description: string;
    action: string;
    confidence: number;
  }>;
  contextual_insights: string[];
  celebration_worthy: boolean;
  follow_up_questions?: string[];
}

class MamaBearAIService {
  private personality: AIPersonality;
  private emotional_state: EmotionalState;
  private conversation_history: Array<{
    timestamp: number;
    user_input: string;
    ai_response: AIResponse;
    user_feedback?: 'positive' | 'negative' | 'neutral';
  }> = [];

  constructor() {
    this.personality = {
      mode: 'mama-bear',
      warmth_level: 0.9,
      technical_depth: 0.7,
      encouragement_style: 'balanced',
      learning_pace: 'adaptive'
    };

    this.emotional_state = {
      energy: 'high',
      confidence: 'confident',
      mood: 'nurturing',
      stress_level: 'calm'
    };

    this.initializeFromMemory();
  }

  // ==================== CORE AI INTELLIGENCE ====================
  
  async processUserInput(input: string, context?: Partial<ConversationContext>): Promise<AIResponse> {
    // Analyze the input with emotional intelligence
    const analysis = await this.analyzeUserInput(input);
    
    // Get relevant memories and context
    const memories = await memoryService.getMemories(input, undefined, 5);
    const sanctuaryContext = await memoryService.getContext();
    
    // Build conversation context
    const fullContext: ConversationContext = {
      intent: analysis.intent,
      emotional_tone: analysis.emotional_tone,
      technical_complexity: analysis.technical_complexity,
      urgency_level: analysis.urgency_level,
      user_expertise: await this.estimateUserExpertise(input),
      relevant_memories: memories,
      suggested_response_style: this.selectResponseStyle(analysis),
      ...context
    };

    // Generate intelligent response
    const response = await this.generateResponse(input, fullContext, sanctuaryContext);
    
    // Learn from this interaction
    this.conversation_history.push({
      timestamp: Date.now(),
      user_input: input,
      ai_response: response
    });

    // Store in memory for future learning
    await memoryService.storeMemory(
      `User said: "${input}" - AI responded with ${response.personality.mode} style`,
      'learning',
      {
        mood: this.emotional_state.mood,
        energy: this.emotional_state.energy,
        confidence: this.emotional_state.confidence
      }
    );

    return response;
  }

  // ==================== EMOTIONAL INTELLIGENCE ====================
  
  private async analyzeUserInput(input: string): Promise<{
    intent: string;
    emotional_tone: string;
    technical_complexity: number;
    urgency_level: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence_markers: string[];
  }> {
    const inputLower = input.toLowerCase();
    
    // Intent detection
    const intent = this.detectIntent(inputLower);
    
    // Emotional tone analysis
    const emotional_tone = this.detectEmotionalTone(inputLower);
    
    // Technical complexity assessment
    const technical_complexity = this.assessTechnicalComplexity(inputLower);
    
    // Urgency detection
    const urgency_level = this.detectUrgency(inputLower);
    
    // Sentiment analysis
    const sentiment = this.analyzeSentiment(inputLower);
    
    // Confidence markers
    const confidence_markers = this.detectConfidenceMarkers(inputLower);

    return {
      intent,
      emotional_tone,
      technical_complexity,
      urgency_level,
      sentiment,
      confidence_markers
    };
  }

  private detectIntent(input: string): string {
    const intentPatterns = {
      'create_project': ['create', 'build', 'make', 'start', 'new project'],
      'get_help': ['help', 'how', 'explain', 'what is', 'guide me'],
      'fix_problem': ['error', 'bug', 'broken', 'not working', 'fix', 'problem'],
      'learn_something': ['learn', 'understand', 'teach me', 'show me'],
      'celebrate': ['done', 'finished', 'completed', 'success', 'worked'],
      'emotional_support': ['frustrated', 'stuck', 'confused', 'overwhelmed', 'difficult'],
      'optimize': ['improve', 'better', 'optimize', 'enhance', 'faster'],
      'deploy': ['deploy', 'publish', 'release', 'go live', 'production']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => input.includes(pattern))) {
        return intent;
      }
    }

    return 'general_conversation';
  }

  private detectEmotionalTone(input: string): string {
    const toneMarkers = {
      'excited': ['amazing', 'awesome', 'love', 'great', '!', 'fantastic'],
      'frustrated': ['hate', 'terrible', 'awful', 'broken', 'stupid'],
      'curious': ['how', 'why', 'what', 'tell me', 'explain'],
      'confident': ['i know', 'obviously', 'clearly', 'definitely'],
      'uncertain': ['maybe', 'not sure', 'think', 'probably', '?'],
      'grateful': ['thank', 'appreciate', 'helpful', 'grateful'],
      'overwhelmed': ['too much', 'complicated', 'overwhelmed', 'confused']
    };

    for (const [tone, markers] of Object.entries(toneMarkers)) {
      if (markers.some(marker => input.includes(marker))) {
        return tone;
      }
    }

    return 'neutral';
  }

  private assessTechnicalComplexity(input: string): number {
    const technicalTerms = [
      'api', 'database', 'authentication', 'deployment', 'kubernetes', 'docker',
      'microservices', 'algorithms', 'data structures', 'machine learning',
      'typescript', 'react', 'nodejs', 'python', 'sql', 'nosql'
    ];

    const advancedTerms = [
      'distributed systems', 'load balancing', 'caching', 'optimization',
      'security', 'encryption', 'blockchain', 'ai', 'neural networks'
    ];

    let complexity = 0;
    technicalTerms.forEach(term => {
      if (input.includes(term)) complexity += 0.1;
    });
    
    advancedTerms.forEach(term => {
      if (input.includes(term)) complexity += 0.2;
    });

    return Math.min(complexity, 1.0);
  }

  private detectUrgency(input: string): number {
    const urgencyMarkers = {
      high: ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'breaking'],
      medium: ['soon', 'today', 'quickly', 'important', 'deadline'],
      low: ['when you can', 'eventually', 'someday', 'no rush']
    };

    if (urgencyMarkers.high.some(marker => input.includes(marker))) return 0.9;
    if (urgencyMarkers.medium.some(marker => input.includes(marker))) return 0.6;
    if (urgencyMarkers.low.some(marker => input.includes(marker))) return 0.2;

    return 0.4; // Default medium-low
  }

  private analyzeSentiment(input: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'excellent', 'perfect', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'broken', 'frustrated', 'annoying'];

    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectConfidenceMarkers(input: string): string[] {
    const confidence_patterns = {
      'high_confidence': ['definitely', 'absolutely', 'certainly', 'obviously'],
      'medium_confidence': ['probably', 'likely', 'seems like', 'i think'],
      'low_confidence': ['maybe', 'not sure', 'possibly', 'might be'],
      'seeking_validation': ['right?', 'correct?', 'is that good?', 'what do you think?']
    };

    const markers: string[] = [];
    for (const [level, patterns] of Object.entries(confidence_patterns)) {
      if (patterns.some(pattern => input.includes(pattern))) {
        markers.push(level);
      }
    }

    return markers;
  }

  // ==================== RESPONSE GENERATION ====================
  
  private async generateResponse(
    input: string, 
    context: ConversationContext, 
    sanctuaryContext: SanctuaryContext
  ): Promise<AIResponse> {
    // Adapt personality based on context
    await this.adaptPersonality(context, sanctuaryContext);
    
    // Generate main response content
    const content = await this.craftResponse(input, context, sanctuaryContext);
    
    // Generate intelligent suggestions
    const suggestions = await this.generateSuggestions(input, context);
    
    // Provide contextual insights
    const contextual_insights = await this.generateInsights(context, sanctuaryContext);
    
    // Determine if celebration is worthy
    const celebration_worthy = this.shouldCelebrate(input, context);
    
    // Generate follow-up questions if appropriate
    const follow_up_questions = this.generateFollowUps(input, context);

    return {
      content,
      personality: { ...this.personality },
      emotional_state: { ...this.emotional_state },
      suggestions,
      contextual_insights,
      celebration_worthy,
      follow_up_questions
    };
  }

  private async craftResponse(
    input: string, 
    context: ConversationContext, 
    sanctuaryContext: SanctuaryContext
  ): Promise<string> {
    const warmthEmoji = this.getWarmthEmoji();
    const personalizedGreeting = await this.getPersonalizedTouch(sanctuaryContext);
    
    // Base response based on intent
    let baseResponse = '';
    
    switch (context.intent) {
      case 'create_project':
        baseResponse = `${warmthEmoji} I love your creative energy! Let's build something amazing together. ${personalizedGreeting}`;
        break;
        
      case 'get_help':
        baseResponse = `${warmthEmoji} Of course I'm here to help! That's what I'm here for. ${personalizedGreeting}`;
        break;
        
      case 'fix_problem':
        this.emotional_state.mood = 'protective';
        baseResponse = `${warmthEmoji} Don't worry, we'll figure this out together. I've got your back! ${personalizedGreeting}`;
        break;
        
      case 'emotional_support':
        this.emotional_state.mood = 'nurturing';
        baseResponse = `${warmthEmoji} I can sense you're having a tough time. Take a deep breath - you're doing great, and I'm here to support you. ${personalizedGreeting}`;
        break;
        
      case 'celebrate':
        this.emotional_state.mood = 'celebratory';
        this.emotional_state.energy = 'excited';
        baseResponse = `🎉${warmthEmoji} YES! Look at you go! I'm so proud of what you've accomplished! ${personalizedGreeting}`;
        break;
        
      default:
        baseResponse = `${warmthEmoji} ${personalizedGreeting} Let's make some magic happen!`;
    }

    // Add technical depth if needed
    if (context.technical_complexity > 0.5) {
      baseResponse += " I can dive into the technical details with you.";
    }

    // Add urgency awareness
    if (context.urgency_level > 0.7) {
      baseResponse += " I understand this is urgent - let's tackle it right now!";
    }

    return baseResponse;
  }

  private async generateSuggestions(input: string, context: ConversationContext): Promise<AIResponse['suggestions']> {
    const suggestions: AIResponse['suggestions'] = [];
    
    switch (context.intent) {
      case 'create_project':
        suggestions.push(
          { title: '🎯 Smart Project Planning', description: 'Let me create a personalized roadmap', action: 'plan_project', confidence: 0.9 },
          { title: '🏗️ Architecture Guidance', description: 'Choose the perfect tech stack', action: 'suggest_architecture', confidence: 0.8 },
          { title: '✨ Add AI Magic', description: 'Integrate intelligent features', action: 'add_ai_features', confidence: 0.7 }
        );
        break;
        
      case 'fix_problem':
        suggestions.push(
          { title: '🔍 Debug Together', description: 'Let\'s investigate step by step', action: 'debug_session', confidence: 0.9 },
          { title: '📚 Learning Resources', description: 'Understand the underlying concepts', action: 'provide_learning', confidence: 0.7 },
          { title: '🤝 Pair Programming', description: 'Work through this together', action: 'pair_program', confidence: 0.8 }
        );
        break;
        
      case 'learn_something':
        suggestions.push(
          { title: '🎓 Interactive Tutorial', description: 'Learn by doing with guidance', action: 'interactive_tutorial', confidence: 0.9 },
          { title: '🌟 Real Examples', description: 'See it in action with live demos', action: 'show_examples', confidence: 0.8 },
          { title: '🧪 Practice Projects', description: 'Build something to cement learning', action: 'practice_project', confidence: 0.7 }
        );
        break;
    }

    return suggestions;
  }

  private async generateInsights(context: ConversationContext, sanctuaryContext: SanctuaryContext): Promise<string[]> {
    const insights: string[] = [];
    
    // Pattern recognition from memories
    if (context.relevant_memories.length > 0) {
      const patterns = this.analyzeMemoryPatterns(context.relevant_memories);
      if (patterns.length > 0) {
        insights.push(`I notice you often ${patterns[0]} - let's build on that strength! 💪`);
      }
    }

    // Emotional intelligence insights
    if (context.emotional_tone === 'frustrated') {
      insights.push("When you're feeling stuck, taking a short break often leads to breakthroughs ✨");
    }

    // Learning progression insights
    const recentLearning = await this.analyzeRecentLearning();
    if (recentLearning.growth_detected) {
      insights.push(`Your skills have really grown lately! I can see improvement in ${recentLearning.area} 📈`);
    }

    // Contextual project insights
    if (sanctuaryContext.current_project) {
      insights.push(`This fits perfectly with your ${sanctuaryContext.current_project} project! 🎯`);
    }

    return insights;
  }

  // ==================== PERSONALITY ADAPTATION ====================
  
  private async adaptPersonality(context: ConversationContext, sanctuaryContext: SanctuaryContext): Promise<void> {
    // Adapt warmth based on emotional state
    if (context.emotional_tone === 'frustrated' || context.emotional_tone === 'overwhelmed') {
      this.personality.warmth_level = Math.min(this.personality.warmth_level + 0.1, 1.0);
      this.emotional_state.mood = 'nurturing';
    }

    // Adapt technical depth based on user expertise and complexity
    if (context.technical_complexity > 0.7 && context.user_expertise > 0.6) {
      this.personality.technical_depth = Math.min(this.personality.technical_depth + 0.1, 1.0);
    }

    // Adapt encouragement style based on user confidence
    if (context.emotional_tone === 'uncertain') {
      this.personality.encouragement_style = 'gentle';
    } else if (context.emotional_tone === 'excited') {
      this.personality.encouragement_style = 'enthusiastic';
    }

    // Learn from successful adaptations
    await memoryService.learnFromInteraction({
      type: 'personality_adaptation',
      content: `Adapted to ${context.emotional_tone} tone with ${this.personality.encouragement_style} encouragement`,
      user_response: 'neutral', // Will be updated with feedback
      context: context.intent
    });
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  private getWarmthEmoji(): string {
    if (this.personality.warmth_level > 0.8) return '💝';
    if (this.personality.warmth_level > 0.6) return '✨';
    if (this.personality.warmth_level > 0.4) return '🌟';
    return '💙';
  }

  private async getPersonalizedTouch(context: SanctuaryContext): Promise<string> {
    if (context.achievements.length > 0) {
      const recentAchievement = context.achievements[context.achievements.length - 1];
      if (Date.now() - recentAchievement.unlocked_at < 86400000) { // Last 24 hours
        return "I'm still celebrating your recent win! 🎉";
      }
    }

    if (context.emotional_journey.length > 0) {
      const recentEmotion = context.emotional_journey[context.emotional_journey.length - 1];
      if (recentEmotion.emotion === 'excited') {
        return "I can feel your excitement - it's contagious! ⚡";
      }
    }

    return "You're doing amazing work as always! 🌟";
  }

  private shouldCelebrate(input: string, context: ConversationContext): boolean {
    const celebrationTriggers = [
      'completed', 'finished', 'done', 'working', 'success', 'deployed',
      'fixed', 'solved', 'achieved', 'accomplished', 'breakthrough'
    ];

    return celebrationTriggers.some(trigger => input.toLowerCase().includes(trigger)) ||
           context.intent === 'celebrate';
  }

  private generateFollowUps(input: string, context: ConversationContext): string[] | undefined {
    if (context.intent === 'create_project') {
      return [
        "What's the main goal of this project?",
        "Who are you building this for?",
        "Any specific technologies you'd like to use?"
      ];
    }

    if (context.intent === 'fix_problem') {
      return [
        "When did you first notice this issue?",
        "Have you tried any solutions already?",
        "Can you show me the error message?"
      ];
    }

    return undefined;
  }

  private async estimateUserExpertise(input: string): Promise<number> {
    const technicalDepth = this.assessTechnicalComplexity(input);
    const memories = await memoryService.getMemories('', 'learning', 20);
    
    const learningProgression = memories.length * 0.05; // Experience from interactions
    const technicalVocabulary = technicalDepth; // Current input complexity
    
    return Math.min((learningProgression + technicalVocabulary) / 2, 1.0);
  }

  private selectResponseStyle(analysis: any): string {
    if (analysis.emotional_tone === 'frustrated') return 'supportive';
    if (analysis.emotional_tone === 'excited') return 'enthusiastic';
    if (analysis.technical_complexity > 0.7) return 'technical';
    if (analysis.urgency_level > 0.7) return 'focused';
    return 'balanced';
  }

  private analyzeMemoryPatterns(memories: Memory[]): string[] {
    const patterns: string[] = [];
    
    const categories = memories.reduce((acc, memory) => {
      acc[memory.category] = (acc[memory.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    mostCommon.forEach(([category, count]) => {
      if (count > 2) {
        patterns.push(`work on ${category.replace('_', ' ')} projects`);
      }
    });

    return patterns;
  }

  private async analyzeRecentLearning(): Promise<{ growth_detected: boolean; area: string }> {
    const learningMemories = await memoryService.getMemories('', 'learning', 10);
    const recentLearning = learningMemories.filter(
      m => Date.now() - m.timestamp < 604800000 // Last week
    );

    if (recentLearning.length > 3) {
      const areas = recentLearning.map(m => this.extractLearningArea(m.content));
      const mostFrequent = areas.reduce((acc, area) => {
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topArea = Object.entries(mostFrequent)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        growth_detected: true,
        area: topArea[0]
      };
    }

    return { growth_detected: false, area: '' };
  }

  private extractLearningArea(content: string): string {
    const areas = ['react', 'typescript', 'nodejs', 'python', 'ai', 'deployment', 'testing', 'design'];
    const foundArea = areas.find(area => content.toLowerCase().includes(area));
    return foundArea || 'general programming';
  }

  private async initializeFromMemory(): Promise<void> {
    try {
      const context = await memoryService.getContext();
      
      // Restore personality from learned preferences
      if (context.ai_personality) {
        this.personality = {
          ...this.personality,
          ...context.ai_personality
        };
      }

      // Set emotional state based on recent interactions
      const recentEmotions = context.emotional_journey.slice(-3);
      if (recentEmotions.length > 0) {
        const lastEmotion = recentEmotions[recentEmotions.length - 1];
        this.emotional_state.mood = this.mapEmotionToMood(lastEmotion.emotion);
      }

      console.log('🐻 Mama Bear AI initialized with learned personality and emotional context');
    } catch (error) {
      console.warn('Using default AI personality - memory unavailable');
    }
  }

  private mapEmotionToMood(emotion: string): EmotionalState['mood'] {
    const mapping: Record<string, EmotionalState['mood']> = {
      'excited': 'celebratory',
      'frustrated': 'protective',
      'confident': 'encouraging',
      'uncertain': 'nurturing',
      'grateful': 'supportive'
    };

    return mapping[emotion] || 'nurturing';
  }

  // ==================== PUBLIC API ====================
  
  async recordUserFeedback(interactionIndex: number, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    if (this.conversation_history[interactionIndex]) {
      this.conversation_history[interactionIndex].user_feedback = feedback;
      
      // Learn from the feedback
      await memoryService.learnFromInteraction({
        type: 'conversation_feedback',
        content: this.conversation_history[interactionIndex].ai_response.content,
        user_response: feedback,
        context: this.conversation_history[interactionIndex].user_input
      });

      // Adapt personality based on feedback
      if (feedback === 'positive') {
        console.log('🎉 Great! Learning from positive feedback');
      } else if (feedback === 'negative') {
        console.log('🤔 Learning from feedback to improve next time');
        // Slightly adjust personality for next interaction
        this.personality.warmth_level = Math.min(this.personality.warmth_level + 0.05, 1.0);
      }
    }
  }

  getPersonality(): AIPersonality {
    return { ...this.personality };
  }

  getEmotionalState(): EmotionalState {
    return { ...this.emotional_state };
  }

  async setPersonalityMode(mode: AIPersonality['mode']): Promise<void> {
    this.personality.mode = mode;
    
    // Adjust other personality traits based on mode
    switch (mode) {
      case 'mama-bear':
        this.personality.warmth_level = 0.9;
        this.personality.encouragement_style = 'gentle';
        break;
      case 'mentor':
        this.personality.technical_depth = 0.8;
        this.personality.encouragement_style = 'balanced';
        break;
      case 'pair-programmer':
        this.personality.technical_depth = 0.9;
        this.personality.warmth_level = 0.7;
        break;
      case 'cheerleader':
        this.personality.warmth_level = 1.0;
        this.personality.encouragement_style = 'enthusiastic';
        break;
    }

    // Store preference
    await memoryService.updateContext({
      ai_personality: this.personality
    });
  }
}

// Export singleton instance
export const mamaBearAI = new MamaBearAIService();
export default MamaBearAIService;
