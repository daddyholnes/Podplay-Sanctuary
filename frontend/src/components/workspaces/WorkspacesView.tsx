import React, { useState, useEffect, useCallback } from 'react';
import api from '../../config/api';
import './WorkspacesView.css';
import WorkspaceListComponent from './WorkspaceListComponent';
import WorkspaceCreationModal from './WorkspaceCreationModal';

// Define interfaces based on backend API responses
interface Workspace {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown'; // Example statuses
  vm_type: string;
  disk_path?: string;
  memory_mb?: number;
  vcpus?: number;
  ip_address?: string;
  ssh_port?: number;
  terminal_websocket_url?: string; 
}

interface CreateWorkspaceFormData {
  workspace_id?: string; // Optional, backend might generate
  memory_mb?: number;
  vcpus?: number;
  // Add other relevant fields for creation if needed
}

const WorkspacesView: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('WorkspacesView: Fetching workspaces...');
    try {
      const response = await api.get('/workspaces'); // Using relative path from api.ts base
      if (response.data && response.data.success && Array.isArray(response.data.workspaces)) {
        setWorkspaces(response.data.workspaces);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch workspaces: Invalid response structure');
      }
    } catch (err: any) {
      console.error('WorkspacesView: Error fetching workspaces:', err);
      setError(err.message || 'An unknown error occurred while fetching workspaces.');
      setWorkspaces([]); // Clear workspaces on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (formData: CreateWorkspaceFormData) => {
    setIsLoading(true); // Consider a specific loading state for creation
    console.log('WorkspacesView: Creating workspace...', formData);
    try {
      const response = await api.post('/workspaces', formData);
      if (response.data && response.data.success) {
        console.log('WorkspacesView: Workspace creation initiated:', response.data.workspace);
        setIsCreateModalOpen(false);
        fetchWorkspaces(); // Refresh the list
      } else {
        throw new Error(response.data?.error || 'Failed to create workspace.');
      }
    } catch (err: any) {
      console.error('WorkspacesView: Error creating workspace:', err);
      setError(err.message || 'An unknown error occurred while creating the workspace.');
      // Keep modal open or handle error display within modal
    } finally {
      setIsLoading(false); // Reset general loading state
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!window.confirm(`Are you sure you want to delete workspace ${workspaceId}?`)) {
      return;
    }
    console.log(`WorkspacesView: Deleting workspace ${workspaceId}...`);
    // Add loading state for this specific action if needed
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      fetchWorkspaces(); // Refresh list
    } catch (err: any) {
      console.error(`WorkspacesView: Error deleting workspace ${workspaceId}:`, err);
      setError(err.message || `Failed to delete workspace ${workspaceId}.`);
    }
  };

  const handleStartWorkspace = async (workspaceId: string) => {
    console.log(`WorkspacesView: Starting workspace ${workspaceId}...`);
    try {
      await api.post(`/workspaces/${workspaceId}/start`, {});
      // Optimistically update UI or wait for fetchWorkspaces to reflect status change
      fetchWorkspaces(); 
    } catch (err: any) {
      console.error(`WorkspacesView: Error starting workspace ${workspaceId}:`, err);
      setError(err.message || `Failed to start workspace ${workspaceId}.`);
    }
  };

  const handleStopWorkspace = async (workspaceId: string) => {
    console.log(`WorkspacesView: Stopping workspace ${workspaceId}...`);
    try {
      await api.post(`/workspaces/${workspaceId}/stop`, {});
      fetchWorkspaces();
    } catch (err: any) {
      console.error(`WorkspacesView: Error stopping workspace ${workspaceId}:`, err);
      setError(err.message || `Failed to stop workspace ${workspaceId}.`);
    }
  };
  
  const handleRefreshWorkspaces = () => {
    fetchWorkspaces();
  };

  return (
    <div className="workspacesView">
      <div className="workspacesViewHeader">
        <h2>Active Workspaces</h2>
        <div className="headerActions">
          <button onClick={handleRefreshWorkspaces} disabled={isLoading} className="button">
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="button buttonPrimary">
            + Create New Workspace
          </button>
        </div>
      </div>

      {isLoading && <p>Loading workspaces...</p>}
      {error && <p className="errorMessage">Error: {error}</p>}
      
      {!isLoading && !error && workspaces.length === 0 && (
        <p>No active workspaces found. Create one to get started!</p>
      )}

      <WorkspaceListComponent
        workspaces={workspaces}
        onDelete={handleDeleteWorkspace}
        onStart={handleStartWorkspace}
        onStop={handleStopWorkspace}
      />

      {isCreateModalOpen && (
        <WorkspaceCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWorkspace}
        />
      )}
    </div>
  );
};

export default WorkspacesView;
