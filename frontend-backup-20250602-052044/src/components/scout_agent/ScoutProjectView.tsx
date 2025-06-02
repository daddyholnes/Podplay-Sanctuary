import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, buildDynamicApiUrl } from '../../config/api';
import ScoutPlanDisplayComponent from './ScoutPlanDisplayComponent';
import ScoutLogViewerComponent from './ScoutLogViewerComponent';
import ScoutInterventionControlsComponent from './ScoutInterventionControlsComponent';
import '../../styles/unified-scout-sanctuary.css';
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
  onBackToChat?: () => void; // Router callback for navigation
  onOpenWorkspace?: () => void; // Router callback for workspace
}

const ScoutProjectView: React.FC<ScoutProjectViewProps> = ({ 
  projectId, 
  onBackToChat,
  onOpenWorkspace 
}) => {
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
      const apiUrl = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_PROJECT, { id: projectId });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch project status: ${response.statusText}`);
      }
      const data = await response.json();
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
      const apiUrl = buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.CREATE_INTERVENTION, { id: projectId });
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, parameters: params }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send intervention');
      }
      alert(data.message || 'Intervention sent.');
      fetchProjectStatus(); // Refresh status after intervention
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg); // Show error
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
        <div className="scout-project-header-top">
          <div className="scout-project-title">
            <h3>Scout Agent Project: {projectStatus.project_goal || projectId}</h3>
            <p>Overall Status: <span className={`scout-status-${projectStatus.project_overall_status}`}>{projectStatus.project_overall_status || 'Unknown'}</span></p>
          </div>
          
          <div className="scout-project-actions">
            {onBackToChat && (
              <button 
                className="scout-btn secondary" 
                onClick={onBackToChat}
                title="Back to Scout Chat"
              >
                🏠 Back to Chat
              </button>
            )}
            {onOpenWorkspace && (
              <button 
                className="scout-btn primary" 
                onClick={onOpenWorkspace}
                title="Open Dynamic Workspace"
              >
                🚀 Open Workspace
              </button>
            )}
          </div>
        </div>
        
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
