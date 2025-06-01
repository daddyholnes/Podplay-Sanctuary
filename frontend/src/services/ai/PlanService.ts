import { GeminiService } from './GeminiService';
import { APIClient } from '../api/APIClient';
import { 
  PlanTask, 
  PlanResult, 
  CodeAnalysis,
  ProjectStructure,
  TaskPriority,
  PlanContext,
  PlanError
} from '../api/APITypes';

export interface PlanServiceConfig {
  defaultPlanningModel?: string;
  maxTasksPerPlan?: number;
  enableAutomaticBreakdown?: boolean;
  enableDependencyTracking?: boolean;
  enableTimeEstimation?: boolean;
  enableRiskAssessment?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  tasks: PlanTask[];
  context: PlanContext;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number;
  estimatedDuration?: number;
  actualDuration?: number;
  metadata: Record<string, any>;
}

export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  blockedBy: string[];
  prerequisites: string[];
}

export interface PlanMetrics {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  averageTasksPerPlan: number;
  averageCompletionTime: number;
  successRate: number;
}

export class PlanService {
  private geminiService: GeminiService;
  private apiClient: APIClient;
  private config: Required<PlanServiceConfig>;
  private activePlans = new Map<string, Plan>();
  private taskDependencies = new Map<string, TaskDependency>();
  private planMetrics: PlanMetrics = {
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    averageTasksPerPlan: 0,
    averageCompletionTime: 0,
    successRate: 0
  };

  constructor(
    geminiService: GeminiService,
    apiClient: APIClient,
    config: PlanServiceConfig = {}
  ) {
    this.geminiService = geminiService;
    this.apiClient = apiClient;
    
    this.config = {
      defaultPlanningModel: config.defaultPlanningModel ?? 'gemini-pro',
      maxTasksPerPlan: config.maxTasksPerPlan ?? 50,
      enableAutomaticBreakdown: config.enableAutomaticBreakdown ?? true,
      enableDependencyTracking: config.enableDependencyTracking ?? true,
      enableTimeEstimation: config.enableTimeEstimation ?? true,
      enableRiskAssessment: config.enableRiskAssessment ?? true
    };
  }

  async createPlan(
    name: string, 
    description: string, 
    context: PlanContext
  ): Promise<Plan> {
    const planId = this.generatePlanId();
    
    const plan: Plan = {
      id: planId,
      name,
      description,
      tasks: [],
      context,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      progress: 0,
      metadata: {}
    };

    this.activePlans.set(planId, plan);
    this.planMetrics.totalPlans++;
    
    return plan;
  }

  async generateTasks(
    planId: string, 
    requirements: string, 
    options: {
      complexity?: 'simple' | 'moderate' | 'complex';
      includeTests?: boolean;
      includeDocumentation?: boolean;
      targetFramework?: string;
      estimateTime?: boolean;
    } = {}
  ): Promise<PlanTask[]> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    try {
      const prompt = this.buildTaskGenerationPrompt(requirements, plan.context, options);
      
      const response = await this.geminiService.generatePlan(
        prompt,
        {
          projectType: plan.context.projectType,
          framework: plan.context.framework,
          complexity: options.complexity ?? 'moderate'
        }
      );

      const tasks = this.parseTasksFromResponse(response, planId);
      
      if (this.config.enableAutomaticBreakdown) {
        const expandedTasks = await this.breakdownComplexTasks(tasks);
        plan.tasks = expandedTasks;
      } else {
        plan.tasks = tasks;
      }

      if (this.config.enableDependencyTracking) {
        await this.establishTaskDependencies(plan.tasks);
      }

      if (this.config.enableTimeEstimation && options.estimateTime) {
        await this.estimateTaskDurations(plan.tasks, plan.context);
      }

      if (this.config.enableRiskAssessment) {
        await this.assessTaskRisks(plan.tasks, plan.context);
      }

      plan.updatedAt = new Date();
      this.updatePlanMetrics();

      return plan.tasks;
    } catch (error) {
      throw new Error(`Failed to generate tasks: ${(error as Error).message}`);
    }
  }

  async optimizePlan(planId: string): Promise<Plan> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    try {
      // Analyze current plan structure
      const analysis = await this.analyzePlanStructure(plan);
      
      // Optimize task order based on dependencies
      if (this.config.enableDependencyTracking) {
        plan.tasks = this.optimizeTaskOrder(plan.tasks);
      }

      // Consolidate similar tasks
      plan.tasks = this.consolidateSimilarTasks(plan.tasks);

      // Re-estimate durations after optimization
      if (this.config.enableTimeEstimation) {
        await this.estimateTaskDurations(plan.tasks, plan.context);
        plan.estimatedDuration = this.calculatePlanDuration(plan.tasks);
      }

      plan.updatedAt = new Date();
      
      return plan;
    } catch (error) {
      throw new Error(`Failed to optimize plan: ${(error as Error).message}`);
    }
  }

  async updateTaskStatus(
    planId: string, 
    taskId: string, 
    status: PlanTask['status'],
    notes?: string
  ): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found in plan ${planId}`);
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();

    if (notes) {
      task.notes = (task.notes || '') + `\n${new Date().toISOString()}: ${notes}`;
    }

    // Track completion time
    if (status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
      if (task.startedAt) {
        task.actualDuration = task.completedAt.getTime() - task.startedAt.getTime();
      }
    } else if (status === 'in-progress' && oldStatus === 'pending') {
      task.startedAt = new Date();
    }

    // Update plan progress
    this.updatePlanProgress(plan);
    
    // Check if plan is completed
    if (plan.tasks.every(t => t.status === 'completed')) {
      plan.status = 'completed';
      plan.progress = 100;
      this.planMetrics.completedPlans++;
      this.planMetrics.activePlans--;
    }

    plan.updatedAt = new Date();
  }

  async addTask(
    planId: string, 
    task: Omit<PlanTask, 'id' | 'planId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const taskId = this.generateTaskId();
    const newTask: PlanTask = {
      ...task,
      id: taskId,
      planId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    plan.tasks.push(newTask);
    plan.updatedAt = new Date();

    if (this.config.enableDependencyTracking) {
      await this.establishTaskDependencies([newTask]);
    }

    this.updatePlanProgress(plan);
    return taskId;
  }

  async removeTask(planId: string, taskId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const taskIndex = plan.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found in plan ${planId}`);
    }

    plan.tasks.splice(taskIndex, 1);
    this.taskDependencies.delete(taskId);
    
    // Update dependencies that referenced this task
    this.taskDependencies.forEach(dep => {
      dep.dependsOn = dep.dependsOn.filter(id => id !== taskId);
      dep.blockedBy = dep.blockedBy.filter(id => id !== taskId);
      dep.prerequisites = dep.prerequisites.filter(id => id !== taskId);
    });

    plan.updatedAt = new Date();
    this.updatePlanProgress(plan);
  }

  async generateCodeForTask(taskId: string): Promise<string> {
    const task = this.findTaskById(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const plan = this.activePlans.get(task.planId);
    if (!plan) {
      throw new Error(`Plan ${task.planId} not found`);
    }

    try {
      const codePrompt = this.buildCodeGenerationPrompt(task, plan.context);
      
      return await this.geminiService.generateCode(
        codePrompt,
        plan.context.language || 'typescript',
        plan.context
      );
    } catch (error) {
      throw new Error(`Failed to generate code for task: ${(error as Error).message}`);
    }
  }

  async validatePlan(planId: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for circular dependencies
    if (this.config.enableDependencyTracking) {
      const circularDeps = this.detectCircularDependencies(plan.tasks);
      if (circularDeps.length > 0) {
        issues.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
      }
    }

    // Check for orphaned tasks
    const orphanedTasks = plan.tasks.filter(task => 
      !this.taskDependencies.has(task.id) && 
      task.priority === 'low' && 
      !task.description.includes('optional')
    );
    
    if (orphanedTasks.length > 0) {
      suggestions.push(`Consider reviewing orphaned tasks: ${orphanedTasks.map(t => t.title).join(', ')}`);
    }

    // Check for unrealistic time estimates
    const longTasks = plan.tasks.filter(task => 
      task.estimatedDuration && task.estimatedDuration > 8 * 60 * 60 * 1000 // > 8 hours
    );
    
    if (longTasks.length > 0) {
      suggestions.push(`Consider breaking down large tasks: ${longTasks.map(t => t.title).join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  getPlan(planId: string): Plan | undefined {
    return this.activePlans.get(planId);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.activePlans.values());
  }

  getActivePlans(): Plan[] {
    return Array.from(this.activePlans.values()).filter(plan => plan.status === 'active');
  }

  getTaskDependencies(taskId: string): TaskDependency | undefined {
    return this.taskDependencies.get(taskId);
  }

  getMetrics(): PlanMetrics {
    return { ...this.planMetrics };
  }

  private buildTaskGenerationPrompt(
    requirements: string, 
    context: PlanContext, 
    options: any
  ): string {
    const complexityLevel = options.complexity || 'moderate';
    const includeTests = options.includeTests ? 'Include comprehensive testing tasks.' : '';
    const includeDocs = options.includeDocumentation ? 'Include documentation tasks.' : '';
    
    return `
Generate a detailed task breakdown for the following requirements:

Requirements: ${requirements}

Project Context:
- Type: ${context.projectType}
- Language: ${context.language}
- Framework: ${context.framework}
- Current Files: ${context.workspaceFiles?.join(', ') || 'None specified'}

Complexity Level: ${complexityLevel}
${includeTests}
${includeDocs}

Please provide a structured list of tasks with:
1. Clear, actionable titles
2. Detailed descriptions
3. Priority levels (high, medium, low)
4. Dependencies between tasks
5. Estimated time requirements
6. File changes needed

Format each task as:
TASK: [Title]
DESCRIPTION: [Detailed description]
PRIORITY: [high/medium/low]
DEPENDENCIES: [List of prerequisite tasks]
ESTIMATED_TIME: [Hours]
FILES: [Files to create/modify]
---
    `.trim();
  }

  private buildCodeGenerationPrompt(task: PlanTask, context: PlanContext): string {
    return `
Generate code for the following task:

Task: ${task.title}
Description: ${task.description}

Context:
- Language: ${context.language}
- Framework: ${context.framework}
- Project Type: ${context.projectType}

Requirements:
- Follow best practices for ${context.language}
- Include proper error handling
- Add appropriate comments
- Ensure code is production-ready

Please provide complete, working code with explanations.
    `.trim();
  }

  private parseTasksFromResponse(response: string, planId: string): PlanTask[] {
    const tasks: PlanTask[] = [];
    const taskBlocks = response.split('---').filter(block => block.trim());

    taskBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      const task: Partial<PlanTask> = {
        id: this.generateTaskId(),
        planId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        switch (key.trim()) {
          case 'TASK':
            task.title = value;
            break;
          case 'DESCRIPTION':
            task.description = value;
            break;
          case 'PRIORITY':
            task.priority = value as TaskPriority;
            break;
          case 'ESTIMATED_TIME':
            task.estimatedDuration = parseFloat(value) * 60 * 60 * 1000; // Convert hours to ms
            break;
          case 'FILES':
            task.files = value.split(',').map(f => f.trim());
            break;
        }
      });

      if (task.title && task.description) {
        tasks.push(task as PlanTask);
      }
    });

    return tasks;
  }

  private async breakdownComplexTasks(tasks: PlanTask[]): Promise<PlanTask[]> {
    const expandedTasks: PlanTask[] = [];

    for (const task of tasks) {
      if (task.estimatedDuration && task.estimatedDuration > 4 * 60 * 60 * 1000) { // > 4 hours
        try {
          const subtasks = await this.generateSubtasks(task);
          expandedTasks.push(...subtasks);
        } catch (error) {
          // If breakdown fails, keep original task
          expandedTasks.push(task);
        }
      } else {
        expandedTasks.push(task);
      }
    }

    return expandedTasks;
  }

  private async generateSubtasks(parentTask: PlanTask): Promise<PlanTask[]> {
    const prompt = `Break down this complex task into smaller, manageable subtasks:

Task: ${parentTask.title}
Description: ${parentTask.description}

Please create 3-5 subtasks that:
1. Are each completable in 1-2 hours
2. Have clear deliverables
3. Build upon each other logically
4. Maintain the same priority level`;

    const response = await this.geminiService.generateResponse(prompt);
    return this.parseTasksFromResponse(response, parentTask.planId);
  }

  private async establishTaskDependencies(tasks: PlanTask[]): Promise<void> {
    // Simple dependency detection based on file operations and task titles
    tasks.forEach(task => {
      const dependency: TaskDependency = {
        taskId: task.id,
        dependsOn: [],
        blockedBy: [],
        prerequisites: []
      };

      // Find dependencies based on file requirements
      tasks.forEach(otherTask => {
        if (otherTask.id !== task.id && task.files && otherTask.files) {
          const hasCommonFiles = task.files.some(file => 
            otherTask.files?.includes(file)
          );
          
          if (hasCommonFiles && otherTask.createdAt < task.createdAt) {
            dependency.dependsOn.push(otherTask.id);
          }
        }
      });

      this.taskDependencies.set(task.id, dependency);
    });
  }

  private async estimateTaskDurations(tasks: PlanTask[], context: PlanContext): Promise<void> {
    for (const task of tasks) {
      if (!task.estimatedDuration) {
        // Estimate based on complexity, file count, and task type
        let baseTime = 2 * 60 * 60 * 1000; // 2 hours base

        if (task.files) {
          baseTime += task.files.length * 30 * 60 * 1000; // 30 min per file
        }

        if (task.description.toLowerCase().includes('test')) {
          baseTime *= 1.5; // Testing takes longer
        }

        if (task.priority === 'high') {
          baseTime *= 1.2; // High priority tasks might be more complex
        }

        task.estimatedDuration = baseTime;
      }
    }
  }

  private async assessTaskRisks(tasks: PlanTask[], context: PlanContext): Promise<void> {
    tasks.forEach(task => {
      let riskLevel = 'low';

      // Assess risk based on various factors
      if (task.files && task.files.length > 5) {
        riskLevel = 'medium';
      }

      if (task.description.toLowerCase().includes('integration') ||
          task.description.toLowerCase().includes('migration') ||
          task.description.toLowerCase().includes('refactor')) {
        riskLevel = 'high';
      }

      task.metadata = { ...task.metadata, riskLevel };
    });
  }

  private optimizeTaskOrder(tasks: PlanTask[]): PlanTask[] {
    // Topological sort based on dependencies
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: PlanTask[] = [];

    const visit = (taskId: string) => {
      if (temp.has(taskId)) {
        throw new Error('Circular dependency detected');
      }
      
      if (!visited.has(taskId)) {
        temp.add(taskId);
        
        const deps = this.taskDependencies.get(taskId);
        if (deps) {
          deps.dependsOn.forEach(depId => visit(depId));
        }
        
        temp.delete(taskId);
        visited.add(taskId);
        
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          result.unshift(task);
        }
      }
    };

    tasks.forEach(task => visit(task.id));
    
    return result;
  }

  private consolidateSimilarTasks(tasks: PlanTask[]): PlanTask[] {
    // Group tasks by similar titles/descriptions and merge if appropriate
    const groups = new Map<string, PlanTask[]>();
    
    tasks.forEach(task => {
      const key = task.title.toLowerCase().split(' ')[0]; // Group by first word
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(task);
    });

    const consolidatedTasks: PlanTask[] = [];
    
    groups.forEach(group => {
      if (group.length === 1) {
        consolidatedTasks.push(group[0]);
      } else {
        // Check if tasks can be merged
        const canMerge = group.every(task => 
          task.priority === group[0].priority &&
          task.estimatedDuration && task.estimatedDuration < 2 * 60 * 60 * 1000 // < 2 hours
        );
        
        if (canMerge) {
          const mergedTask: PlanTask = {
            ...group[0],
            id: this.generateTaskId(),
            title: `${group[0].title} (consolidated)`,
            description: group.map(t => t.description).join('\n'),
            estimatedDuration: group.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0),
            files: group.flatMap(t => t.files || [])
          };
          consolidatedTasks.push(mergedTask);
        } else {
          consolidatedTasks.push(...group);
        }
      }
    });

    return consolidatedTasks;
  }

  private analyzePlanStructure(plan: Plan): Promise<any> {
    // Analyze plan for optimization opportunities
    return Promise.resolve({
      taskCount: plan.tasks.length,
      totalEstimatedTime: plan.tasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0),
      dependencyComplexity: this.taskDependencies.size,
      riskTasks: plan.tasks.filter(t => t.metadata?.riskLevel === 'high').length
    });
  }

  private calculatePlanDuration(tasks: PlanTask[]): number {
    return tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
  }

  private updatePlanProgress(plan: Plan): void {
    const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
    plan.progress = plan.tasks.length > 0 ? (completedTasks / plan.tasks.length) * 100 : 0;
  }

  private updatePlanMetrics(): void {
    const totalTasks = Array.from(this.activePlans.values())
      .reduce((sum, plan) => sum + plan.tasks.length, 0);
    
    this.planMetrics.averageTasksPerPlan = this.planMetrics.totalPlans > 0 
      ? totalTasks / this.planMetrics.totalPlans 
      : 0;

    this.planMetrics.activePlans = Array.from(this.activePlans.values())
      .filter(plan => plan.status === 'active').length;

    this.planMetrics.successRate = this.planMetrics.totalPlans > 0
      ? this.planMetrics.completedPlans / this.planMetrics.totalPlans
      : 0;
  }

  private detectCircularDependencies(tasks: PlanTask[]): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const detectCycle = (taskId: string): boolean => {
      if (temp.has(taskId)) {
        circular.push(taskId);
        return true;
      }
      
      if (visited.has(taskId)) {
        return false;
      }

      temp.add(taskId);
      
      const deps = this.taskDependencies.get(taskId);
      if (deps) {
        for (const depId of deps.dependsOn) {
          if (detectCycle(depId)) {
            return true;
          }
        }
      }
      
      temp.delete(taskId);
      visited.add(taskId);
      return false;
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        detectCycle(task.id);
      }
    });

    return circular;
  }

  private findTaskById(taskId: string): PlanTask | undefined {
    for (const plan of this.activePlans.values()) {
      const task = plan.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
