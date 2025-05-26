import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api'; // Assuming api.ts is configured for base URL
import './ScoutProjectView.css';
import ScoutPlanDisplayComponent from './ScoutPlanDisplayComponent';
import ScoutLogViewerComponent from './ScoutLogViewerComponent';
import ScoutInterventionControlsComponent from './ScoutInterventionControlsComponent';

// Interfaces based on backend API design for Scout Agent
interface LogEntry {
  log_id: string;
  timestamp: string;
  message: string;
  step_id?: string;
  step_name?: string;
  agent_action?: string;
  vm_id?: string;
  parameters?: Record<string, any>;
  outputs?: Record<string, any>; // stdout, stderr, tool_result
  agent_thoughts?: string | Record<string, any>;
  status_update?: string;
  is_error?: boolean;
}

interface PlanStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'waiting_for_approval';
  // Add other relevant fields like description, sub_steps if needed
}

interface ProjectStatusSummary {
  project_goal?: string;
  project_overall_status?: 'unknown' | 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting_for_approval';
  project_current_plan?: PlanStep[];
  project_active_step_id?: string | null;
  project_associated_workspace_id?: string | null;
  recent_logs?: LogEntry[];
}

interface ScoutProjectViewProps {
  projectId: string; // Passed as prop, or from router params
}

const ScoutProjectView: React.FC<ScoutProjectViewProps> = ({ projectId }) => {
  const [projectStatus, setProjectStatus] = useState<ProjectStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true); // Control polling

  const fetchProjectStatus = useCallback(async () => {
    if (!projectId) return;
    // Don't set isLoading to true for polling refreshes, only initial load
    // setIsLoading(true); // This would cause flicker during polling
    setError(null);
    console.log(`ScoutProjectView (${projectId}): Fetching project status...`);
    try {
      const response = await api.get(`/scout_agent/projects/${projectId}/status`);
      if (response.data && response.data.success && response.data.project_status) {
        setProjectStatus(response.data.project_status);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch project status: Invalid response structure');
      }
    } catch (err: any) {
      console.error(`ScoutProjectView (${projectId}): Error fetching project status:`, err);
      setError(err.message || 'An unknown error occurred while fetching project status.');
      // Optionally stop polling on certain types of errors
      // setIsPolling(false); 
    } finally {
      if (isLoading) setIsLoading(false); // Only set isLoading to false after the initial load
    }
  }, [projectId, isLoading]); // Include isLoading in dependencies to ensure setIsLoading(false) runs once

  useEffect(() => {
    setIsLoading(true); // Set loading true only for the very first fetch
    fetchProjectStatus();
  }, [projectId]); // Initial fetch when projectId changes

  useEffect(() => {
    if (!isPolling || !projectId) return;

    const intervalId = setInterval(() => {
      console.log(`ScoutProjectView (${projectId}): Polling for status update...`);
      fetchProjectStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount or if polling stops
  }, [isPolling, projectId, fetchProjectStatus]);

  const handleIntervention = async (command: string, parameters?: any) => {
    console.log(`ScoutProjectView (${projectId}): Sending intervention - Command: ${command}, Params:`, parameters);
    try {
      const response = await api.post(`/scout_agent/projects/${projectId}/intervene`, { command, parameters });
      if (response.data && response.data.success) {
        console.log(`ScoutProjectView (${projectId}): Intervention successful:`, response.data.message);
        fetchProjectStatus(); // Refresh status after intervention
      } else {
        throw new Error(response.data?.error || 'Intervention command failed.');
      }
    } catch (err: any) {
      console.error(`ScoutProjectView (${projectId}): Error sending intervention:`, err);
      setError(err.message || 'Failed to send intervention.');
    }
  };
  
  const togglePolling = () => setIsPolling(!isPolling);

  if (isLoading && !projectStatus) { // Show loading only if no data yet
    return <p>Loading project details for {projectId}...</p>;
  }

  if (error && !projectStatus) { // Show error prominently if initial load failed
    return <p className="errorMessage">Error loading project {projectId}: {error}</p>;
  }
  
  if (!projectStatus) {
    return <p>No project data available for {projectId}.</p>;
  }

  return (
    <div className="scoutProjectView">
      <div className="scoutProjectHeader">
        <h2>Scout Agent: Project {projectId}</h2>
        <button onClick={togglePolling} className="button" style={{marginRight: '10px'}}>
            {isPolling ? 'Stop Polling' : 'Start Polling'}
        </button>
        <button onClick={fetchProjectStatus} className="button" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>
      
      {error && <p className="errorMessage">Update error: {error}</p>} {/* For non-critical fetch errors */}

      <div className="projectInfo">
        <p><strong>Goal:</strong> {projectStatus.project_goal || 'Not set'}</p>
        <p><strong>Overall Status:</strong> <span className={`status-${projectStatus.project_overall_status}`}>{projectStatus.project_overall_status || 'Unknown'}</span></p>
        {projectStatus.project_associated_workspace_id && (
          <p><strong>Workspace:</strong> <a href={`#`} onClick={(e) => { e.preventDefault(); alert(`Navigate to workspace ${projectStatus.project_associated_workspace_id}`); }}>{projectStatus.project_associated_workspace_id}</a></p>
        )}
      </div>

      <div className="scoutLayout">
        <div className="planAndControlsColumn">
          <ScoutPlanDisplayComponent
            plan={projectStatus.project_current_plan || []}
            activeStepId={projectStatus.project_active_step_id || null}
          />
          <ScoutInterventionControlsComponent
            projectId={projectId}
            currentStatus={projectStatus.project_overall_status || 'unknown'}
            activeStepId={projectStatus.project_active_step_id || null}
            onIntervene={handleIntervention}
          />
        </div>
        <div className="logViewerColumn">
          <ScoutLogViewerComponent logs={projectStatus.recent_logs || []} />
        </div>
      </div>
    </div>
  );
};

export default ScoutProjectView;
