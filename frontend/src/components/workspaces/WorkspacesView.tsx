import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, buildApiUrl, buildDynamicApiUrl } from '../../config/api';
import WorkspaceListComponent from './WorkspaceListComponent';
import WorkspaceCreationModal from './WorkspaceCreationModal';
import WebTerminalComponent from './WebTerminalComponent'; // Will be used by WorkspaceItem
import './WorkspacesView.css';

export interface NixOSWorkspace {
  id: string; // This will be the VM name from libvirt
  name: string;
  status: 'running' | 'stopped' | 'error' | 'creating' | 'unknown';
  vm_type: 'workspace' | 'ephemeral' | 'unknown';
  disk_path?: string;
  memory_mb?: number;
  vcpus?: number;
  ip_address?: string;
  terminal_websocket_url?: string; // Full URL for WebSocket connection
  // Add other fields from backend's get_domain_details as needed
}

const WorkspacesView: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<NixOSWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  
  const [selectedWorkspaceForTerminal, setSelectedWorkspaceForTerminal] = useState<NixOSWorkspace | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.LIST));
      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data.workspaces)) {
        // Transform backend data to frontend NixOSWorkspace interface
        const transformedWorkspaces = data.workspaces.map((ws: any) => ({
          id: ws.id, // Use ws.id instead of ws.name
          name: ws.name,
          status: ws.status,
          vm_type: ws.vm_type || 'workspace',
          disk_path: ws.disk_path,
          memory_mb: ws.memory_mb,
          vcpus: ws.vcpus,
          ip_address: ws.ip_address,
          // Add other relevant fields from ws object if needed
        }));
        setWorkspaces(transformedWorkspaces);
      } else {
        throw new Error(data.error || 'Invalid data format for workspaces');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Error fetching workspaces:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (name: string, memoryMB: number, vcpus: number) => {
    setIsLoading(true); // Or a specific creating state
    setError(null);
    console.log(`Attempting to create workspace: ${name}, Mem: ${memoryMB}, vCPUs: ${vcpus}`);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.CREATE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memory_mb: memoryMB, vcpus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to create workspace: ${response.statusText}`);
      }
      console.log('Workspace created successfully:', data);
      fetchWorkspaces(); // Refresh list
      setIsCreateModalOpen(false);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Error creating workspace:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (workspaceId: string, action: 'start' | 'stop' | 'delete') => {
    let endpoint = '';
    let successMessage = '';

    switch (action) {
      case 'start':
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.START, { id: workspaceId });
        successMessage = 'Workspace starting...';
        break;
      case 'stop':
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.STOP, { id: workspaceId });
        successMessage = 'Workspace stopping...';
        break;
      case 'delete':
        if (!window.confirm(`Are you sure you want to delete workspace ${workspaceId}? This is irreversible.`)) {
          return;
        }
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.DELETE, { id: workspaceId });
        successMessage = 'Workspace deleting...';
        break;
      default:
        return;
    }

    console.log(`Performing action '${action}' on workspace ${workspaceId} via ${endpoint}`);
    // Add a temporary optimistic update or loading state for the specific item
    // For now, just log and refetch
    try {
      const response = await fetch(endpoint, { method: action === 'delete' ? 'DELETE' : 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Action ${action} failed: ${response.statusText}`);
      }
      alert(data.message || successMessage); // Simple feedback for now
      fetchWorkspaces(); // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg); // Show error globally for now
      console.error(`Error performing ${action} on ${workspaceId}:`, errorMsg);
      fetchWorkspaces(); // Refresh list even on error to get latest state
    }
  };
  
  const handleOpenTerminal = async (workspaceId: string) => {
    console.log(`Request to open terminal for workspace: ${workspaceId}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.GET, { id: workspaceId }));
      if (!response.ok) throw new Error(`Failed to fetch workspace details: ${response.statusText}`);
      const data = await response.json();
      if (data.id) { // Check if workspace object exists
        if (data.status !== 'running') {
          alert("Workspace is not running. Please start it first.");
          setIsLoading(false);
          return;
        }
        if (!data.ip_address) {
          alert("IP address not available for this workspace. Cannot establish terminal connection.");
          setIsLoading(false);
          return;
        }
        // Create enhanced workspace object with terminal_websocket_url
        const enhancedWorkspace = {
          ...data,
          terminal_websocket_url: buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.TERMINAL_WEBSOCKET, { id: workspaceId })
        } as NixOSWorkspace;
        setSelectedWorkspaceForTerminal(enhancedWorkspace);
      } else {
        throw new Error(data.error || "Could not get workspace details for terminal.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error(`Error opening terminal for ${workspaceId}:`, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTerminal = () => {
    setSelectedWorkspaceForTerminal(null);
  };


  return (
    <div className="workspaces-view">
      <div className="workspaces-header">
        <h2>❄️ NixOS Workspaces</h2>
        <button onClick={() => setIsCreateModalOpen(true)} className="create-workspace-btn">
          + Create New Workspace
        </button>
      </div>

      {isLoading && <p>Loading workspaces...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!isLoading && !error && workspaces.length === 0 && (
        <p>No workspaces found. Create one to get started!</p>
      )}

      {!isLoading && !error && workspaces.length > 0 && (
        <WorkspaceListComponent
          workspaces={workspaces}
          onAction={handleAction}
          onOpenTerminal={handleOpenTerminal}
        />
      )}

      {isCreateModalOpen && (
        <WorkspaceCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateWorkspace}
        />
      )}
      
      {selectedWorkspaceForTerminal && selectedWorkspaceForTerminal.terminal_websocket_url && (
        <WebTerminalComponent
          workspaceId={selectedWorkspaceForTerminal.id}
          websocketUrl={selectedWorkspaceForTerminal.terminal_websocket_url}
          isOpen={!!selectedWorkspaceForTerminal}
          onClose={handleCloseTerminal}
        />
      )}
    </div>
  );
};

export default WorkspacesView;
