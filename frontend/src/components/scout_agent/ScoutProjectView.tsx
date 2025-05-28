import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api'; // buildDynamicApiUrl might be removed
import { apiService } from '../../services/apiService'; // Import the new apiService
import { notify } from '../../services/notificationService'; // Import notificationService
import ScoutPlanDisplayComponent from './ScoutPlanDisplayComponent';
import ScoutLogViewerComponent from './ScoutLogViewerComponent';
import ScoutInterventionControlsComponent from './ScoutInterventionControlsComponent';
import './ScoutProjectView.css';

// Define interfaces based on backend API response for project status
export interface ScoutStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'waiting-for-approval';
  // Add other relevant step details, e.g., description, estimated_time
}

export interface ScoutLogEntry {
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
  // Add other fields from your backend's ScoutLogManager schema
}

export interface ScoutProjectStatusSummary {
  project_goal?: string;
  project_overall_status?: 'running' | 'paused' | 'completed' | 'failed' | 'unknown';
  project_current_plan?: ScoutStep[];
  project_active_step_id?: string;
  project_associated_workspace_id?: string;
  recent_logs?: ScoutLogEntry[];
}

interface ScoutProjectViewProps {
  projectId: string; // This will be passed as a prop or from router
}

const ScoutProjectView: React.FC<ScoutProjectViewProps> = ({ projectId }) => {
  const [projectStatus, setProjectStatus] = useState<ScoutProjectStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(5000); // Auto-refresh every 5 seconds

  const fetchProjectStatus = useCallback(async () => {
    if (!projectId) return;
    // Only set loading if not auto-refreshing silently in background
    if (!autoRefreshInterval || (autoRefreshInterval && !projectStatus)) {
        setIsLoading(true);
    }
    setError(null);
    try {
      // Manually construct path for GET_PROJECT
      const pathTemplate = API_ENDPOINTS.SCOUT_AGENT.GET_PROJECT;
      const actualPath = pathTemplate.replace('{id}', projectId);
      const data = await apiService.get<any>(actualPath);

      if (data.success && data.status_summary) {
        setProjectStatus(data.status_summary);
      } else {
        throw new Error(data.error || 'Invalid data format for project status');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error(`Error fetching status for project ${projectId}:`, errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, autoRefreshInterval, projectStatus]); // Include dependencies

  useEffect(() => {
    fetchProjectStatus(); // Initial fetch

    if (autoRefreshInterval) {
      const intervalId = setInterval(fetchProjectStatus, autoRefreshInterval);
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [fetchProjectStatus, autoRefreshInterval]);

  const handleIntervene = async (command: string, params?: Record<string, any>) => {
    console.log(`Intervening in project ${projectId}: ${command}`, params);
    setError(null);
    try {
      // Manually construct path for CREATE_INTERVENTION
      const pathTemplate = API_ENDPOINTS.SCOUT_AGENT.CREATE_INTERVENTION;
      const actualPath = pathTemplate.replace('{id}', projectId);
      const data = await apiService.post<any>(actualPath, { command, parameters: params });

      // apiService throws on error, so no need to check response.ok or data.success here if that's the convention.
      // However, if data.success is part of the expected JSON payload for successful business logic, keep it.
      if (!data.success) { // Assuming the backend might return success: false for logical errors
          throw new Error(data.error || 'Failed to send intervention (API indicated failure)');
      }
      notify.success(data.message || 'Intervention sent.');
      fetchProjectStatus(); // Refresh status after intervention
    } catch (err) {
      // apiService already notifies, so setError for local UI update and console.error is fine
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg); 
      console.error(`Error sending intervention for project ${projectId}:`, errorMsg);
    }
  };
  
  const activeStepDetails = projectStatus?.project_current_plan?.find(
    step => step.id === projectStatus.project_active_step_id
  );

  if (isLoading && !projectStatus) { // Show loading only on initial load or manual refresh
    return <p className="scout-loading">Loading Scout Agent project details for '{projectId}'...</p>;
  }

  if (error && !projectStatus) { // Show error prominently if initial load fails
    return <p className="scout-error-message">Error loading project: {error}</p>;
  }
  
  if (!projectStatus) {
    return <p className="scout-info">No status information available for project '{projectId}'.</p>;
  }

  return (
    <div className="scout-project-view">
      <div className="scout-project-header">
        <h3>Scout Agent Project: {projectStatus.project_goal || projectId}</h3>
        <p>Overall Status: <span className={`scout-status-${projectStatus.project_overall_status}`}>{projectStatus.project_overall_status || 'Unknown'}</span></p>
        {projectStatus.project_associated_workspace_id && (
          <p>Workspace: <a href={`/workspaces#${projectStatus.project_associated_workspace_id}`}>{projectStatus.project_associated_workspace_id}</a></p>
        )}
         <div className="scout-refresh-toggle">
            Auto-Refresh:
            <select 
                value={autoRefreshInterval === null ? 'off' : String(autoRefreshInterval)}
                onChange={(e) => {
                    const val = e.target.value;
                    setAutoRefreshInterval(val === 'off' ? null : Number(val));
                }}
            >
                <option value="off">Off</option>
                <option value="3000">3s</option>
                <option value="5000">5s</option>
                <option value="10000">10s</option>
            </select>
            <button onClick={() => fetchProjectStatus()} disabled={isLoading} style={{marginLeft: '10px'}}>
                {isLoading && !projectStatus ? 'Refreshing...' : '🔄 Refresh Now'}
            </button>
        </div>
        {error && <p className="scout-error-message" style={{fontSize: '0.9em', marginTop: '5px'}}>Last fetch error: {error}</p>}
      </div>

      <div className="scout-main-content">
        <div className="scout-plan-section">
          <h4>Project Plan</h4>
          {projectStatus.project_current_plan && projectStatus.project_current_plan.length > 0 ? (
            <ScoutPlanDisplayComponent
              planSteps={projectStatus.project_current_plan}
              activeStepId={projectStatus.project_active_step_id}
            />
          ) : (
            <p>No plan defined yet.</p>
          )}
        </div>

        <div className="scout-intervention-section">
          <h4>Agent Controls</h4>
          <ScoutInterventionControlsComponent
            projectId={projectId}
            currentProjectStatus={projectStatus.project_overall_status || 'unknown'}
            activeStepId={projectStatus.project_active_step_id}
            onIntervene={handleIntervene}
          />
        </div>
      </div>
      
      <div className="scout-logs-section">
        <h4>Activity Logs {activeStepDetails ? `(Current Step: ${activeStepDetails.name})`: ""}</h4>
        {projectStatus.recent_logs && projectStatus.recent_logs.length > 0 ? (
          <ScoutLogViewerComponent logs={projectStatus.recent_logs} />
        ) : (
          <p>No logs available for this project yet.</p>
        )}
      </div>
    </div>
  );
};

export default ScoutProjectView;
