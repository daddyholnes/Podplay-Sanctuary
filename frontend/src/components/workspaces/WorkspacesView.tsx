import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api'; // buildApiUrl and buildDynamicApiUrl might be removed, API_BASE_URL added for ws URL
import { apiService } from '../../services/apiService'; // Import the new apiService
import { notify } from '../../services/notificationService'; // Import notificationService
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
      const data = await apiService.get<any>(API_ENDPOINTS.NIXOS_WORKSPACES.LIST);
      // apiService throws on !response.ok, so we can assume success if no error
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
      const data = await apiService.post<any>(API_ENDPOINTS.NIXOS_WORKSPACES.CREATE, { name, memory_mb: memoryMB, vcpus });
      // apiService throws on error
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
    let pathKey: keyof typeof API_ENDPOINTS.NIXOS_WORKSPACES;
    let method: 'post' | 'delete' = 'post';
    let successMessage = '';

    switch (action) {
      case 'start':
        pathKey = API_ENDPOINTS.NIXOS_WORKSPACES.START as any; // Type assertion if needed by apiService structure for dynamic paths
        successMessage = 'Workspace starting...';
        break;
      case 'stop':
        pathKey = API_ENDPOINTS.NIXOS_WORKSPACES.STOP as any;
        successMessage = 'Workspace stopping...';
        break;
      case 'delete':
        if (!window.confirm(`Are you sure you want to delete workspace ${workspaceId}? This is irreversible.`)) {
          return;
        }
        pathKey = API_ENDPOINTS.NIXOS_WORKSPACES.DELETE as any;
        method = 'delete';
        successMessage = 'Workspace deleting...';
        break;
      default:
        return;
    }
    
    // Construct the dynamic path. Assumes pathKey is like "NIXOS_WORKSPACES.START" which maps to a template string.
    // And apiService needs a way to substitute {id}.
    // For this refactor, we'll manually construct the path string.
    // Example: API_ENDPOINTS.NIXOS_WORKSPACES.START might be "/api/v1/nixos/workspaces/{id}/start"
    const pathTemplate = API_ENDPOINTS.NIXOS_WORKSPACES[action.toUpperCase() as keyof typeof API_ENDPOINTS.NIXOS_WORKSPACES];
    const actualPath = pathTemplate.replace('{id}', workspaceId);


    console.log(`Performing action '${action}' on workspace ${workspaceId} via ${actualPath}`);
    try {
      let data: any;
      if (method === 'post') {
        data = await apiService.post<any>(actualPath, {});
      } else { // delete
        data = await apiService.delete<any>(actualPath);
      }
      notify.success(data.message || successMessage);
      fetchWorkspaces(); // Refresh list
    } catch (err) {
      // apiService already notifies, so setError for local UI update and console.error is fine
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg); 
      console.error(`Error performing ${action} on ${workspaceId}:`, errorMsg);
      fetchWorkspaces(); // Refresh list even on error to get latest state
    }
  };
  
  const handleOpenTerminal = async (workspaceId: string) => {
    console.log(`Request to open terminal for workspace: ${workspaceId}`);
    setIsLoading(true);
    setError(null);
    try {
      // Manually construct path for GET
      const pathTemplate = API_ENDPOINTS.NIXOS_WORKSPACES.GET;
      const actualPath = pathTemplate.replace('{id}', workspaceId);
      const data = await apiService.get<any>(actualPath);

      if (data.id) { // Check if workspace object exists
        if (data.status !== 'running') {
          notify.warn("Workspace is not running. Please start it first.");
          setIsLoading(false);
          return;
        }
        if (!data.ip_address) {
          notify.error("IP address not available for this workspace. Cannot establish terminal connection.");
          setIsLoading(false);
          return;
        }
        // Create enhanced workspace object with terminal_websocket_url
        // Manually construct terminal websocket URL if buildDynamicApiUrl is removed
        const terminalWsPathTemplate = API_ENDPOINTS.NIXOS_WORKSPACES.TERMINAL_WEBSOCKET;
        const terminalWsActualPath = `${API_BASE_URL}${terminalWsPathTemplate.replace('{id}', workspaceId)}`;

        const enhancedWorkspace = {
          ...data,
          // Ensure your API_BASE_URL for websockets is correctly handled.
          // If API_BASE_URL is http://localhost:5000, then ws://localhost:5000/...
          // This might need adjustment depending on how WebSocket URLs are formed.
          terminal_websocket_url: terminalWsActualPath.replace(/^http/, 'ws')
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
