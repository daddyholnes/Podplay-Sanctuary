import React from 'react';
import { GitBranch, Cpu, HardDrive, BarChart2 } from 'lucide-react';

interface ResourceMonitorProps {
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
  workspaceName: string;
  gitBranch: string;
}

/**
 * ResourceMonitor displays system resource usage for the current workspace
 * including CPU, memory, and disk usage with visual indicators
 */
const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
  resources,
  workspaceName,
  gitBranch
}) => {
  // Helper to determine the color class based on usage percentage
  const getUsageColorClass = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="resource-monitor h-full flex flex-col p-3 bg-white dark:bg-gray-900">
      {/* Workspace info */}
      <div className="mb-4">
        <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
          {workspaceName}
        </div>
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <GitBranch size={12} className="mr-1" />
          {gitBranch}
        </div>
      </div>

      {/* Resource usage meters */}
      <div className="space-y-4 flex-1">
        {/* CPU Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
              <Cpu size={12} className="mr-1" />
              CPU
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {resources.cpu}%
            </div>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className={`h-1.5 rounded-full ${getUsageColorClass(resources.cpu)}`}
              style={{ width: `${resources.cpu}%` }}
            ></div>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
              <BarChart2 size={12} className="mr-1" />
              Memory
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {resources.memory}%
            </div>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className={`h-1.5 rounded-full ${getUsageColorClass(resources.memory)}`}
              style={{ width: `${resources.memory}%` }}
            ></div>
          </div>
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
              <HardDrive size={12} className="mr-1" />
              Disk
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {resources.disk}%
            </div>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className={`h-1.5 rounded-full ${getUsageColorClass(resources.disk)}`}
              style={{ width: `${resources.disk}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Performance stats */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          System Statistics
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-600 dark:text-gray-400">Runtime</div>
          <div className="text-right text-purple-700 dark:text-purple-300">01:45:32</div>
          
          <div className="text-gray-600 dark:text-gray-400">Node</div>
          <div className="text-right text-purple-700 dark:text-purple-300">v16.14.2</div>
          
          <div className="text-gray-600 dark:text-gray-400">Environment</div>
          <div className="text-right text-purple-700 dark:text-purple-300">Development</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-xs py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
          Optimize Resources
        </button>
      </div>
    </div>
  );
};

export default ResourceMonitor;
