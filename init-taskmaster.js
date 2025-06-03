#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create taskmaster storage directory
const taskmasterDir = path.join(__dirname, '.taskmaster');
if (!fs.existsSync(taskmasterDir)) {
  fs.mkdirSync(taskmasterDir, { recursive: true });
  console.log('✅ Created .taskmaster directory');
}

// Create initial tasks file
const tasksFile = path.join(taskmasterDir, 'tasks.json');
if (!fs.existsSync(tasksFile)) {
  const initialTasks = {
    "tasks": [
      {
        "id": "task_001",
        "title": "Initialize Scout Multimodal Chat",
        "description": "Set up the Scout Multimodal Chat component with proper model integration",
        "status": "in_progress",
        "priority": "high",
        "tags": ["frontend", "ui", "multimodal"],
        "created": new Date().toISOString()
      }
    ],
    "meta": {
      "lastUpdated": new Date().toISOString(),
      "nextId": "task_002"
    }
  };
  
  fs.writeFileSync(tasksFile, JSON.stringify(initialTasks, null, 2));
  console.log('✅ Created initial tasks file');
}

// Check if environment variables are properly set
const configFile = path.join(__dirname, 'taskmaster.config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// Verify the configuration
const requiredKeys = ['version', 'defaultModel', 'models', 'projectName'];
const missingKeys = requiredKeys.filter(key => !config[key]);

if (missingKeys.length > 0) {
  console.error(`❌ Missing required keys in configuration: ${missingKeys.join(', ')}`);
  process.exit(1);
}

console.log('✅ Configuration verified');
console.log('✅ Taskmaster AI initialized successfully');
console.log('');
console.log('📋 Initial task created:');
console.log('   - Initialize Scout Multimodal Chat');
console.log('');
console.log('🚀 Ready to use Taskmaster AI in your project');
