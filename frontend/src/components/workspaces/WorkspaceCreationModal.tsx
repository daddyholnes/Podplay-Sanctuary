import React, { useState } from 'react';
// Assuming a global CSS or parent component handles modal styling for now.
// If specific styles are needed: import './WorkspaceCreationModal.css';

interface CreateWorkspaceFormData {
  workspace_id?: string; // Optional, backend might generate if not provided
  memory_mb?: number;
  vcpus?: number;
  // Add other relevant fields from backend API, e.g., base_image_id, disk_size_gb
  // For now, keeping it simple. Backend will use defaults if not provided.
}

interface WorkspaceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateWorkspaceFormData) => Promise<void>;
  isLoading?: boolean; // Optional: parent can control loading state
}

const WorkspaceCreationModal: React.FC<WorkspaceCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading: parentIsLoading,
}) => {
  const [workspaceId, setWorkspaceId] = useState('');
  const [memoryMb, setMemoryMb] = useState<number | string>(1024); // Default to 1GB
  const [vcpus, setVcpus] = useState<number | string>(2);       // Default to 2 vCPUs
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIsLoading = parentIsLoading !== undefined ? parentIsLoading : internalIsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!parentIsLoading) setInternalIsLoading(true);

    const formData: CreateWorkspaceFormData = {};
    if (workspaceId.trim()) {
      formData.workspace_id = workspaceId.trim();
    }
    if (typeof memoryMb === 'number' && memoryMb > 0) {
      formData.memory_mb = memoryMb;
    } else if (typeof memoryMb === 'string' && parseInt(memoryMb, 10) > 0) {
        formData.memory_mb = parseInt(memoryMb, 10);
    }

    if (typeof vcpus === 'number' && vcpus > 0) {
      formData.vcpus = vcpus;
    } else if (typeof vcpus === 'string' && parseInt(vcpus, 10) > 0) {
        formData.vcpus = parseInt(vcpus, 10);
    }
    
    console.log("WorkspaceCreationModal: Submitting form data:", formData);

    try {
      await onSubmit(formData);
      // Parent component (WorkspacesView) will handle closing modal on successful submission via its own logic
      // and refreshing data. If an error occurs within onSubmit, it should be handled there or propagated.
    } catch (err: any) {
      console.error("WorkspaceCreationModal: Error during onSubmit:", err);
      setError(err.message || "Failed to submit workspace creation.");
    } finally {
      if (!parentIsLoading) setInternalIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Basic modal styling (inline for simplicity, move to CSS for production)
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px 40px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    zIndex: 1000,
    width: '400px',
    color: '#333', // Default text color for modal content
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: '15px',
  };
  
  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };
  
  const buttonContainerStyle: React.CSSProperties = {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  };


  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2>Create New Workspace</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label htmlFor="workspaceId" style={labelStyle}>Workspace ID (Optional):</label>
            <input
              type="text"
              id="workspaceId"
              style={inputStyle}
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="e.g., my-dev-space (auto-generated if empty)"
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="memoryMb" style={labelStyle}>Memory (MB):</label>
            <input
              type="number"
              id="memoryMb"
              style={inputStyle}
              value={memoryMb}
              onChange={(e) => setMemoryMb(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="e.g., 1024"
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="vcpus" style={labelStyle}>vCPUs:</label>
            <input
              type="number"
              id="vcpus"
              style={inputStyle}
              value={vcpus}
              onChange={(e) => setVcpus(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="e.g., 2"
            />
          </div>
          {/* Add more fields as needed, e.g., disk size, base image selection */}
          <div style={buttonContainerStyle}>
            <button type="button" onClick={onClose} disabled={currentIsLoading} className="button">
              Cancel
            </button>
            <button type="submit" disabled={currentIsLoading} className="button buttonPrimary">
              {currentIsLoading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default WorkspaceCreationModal;
