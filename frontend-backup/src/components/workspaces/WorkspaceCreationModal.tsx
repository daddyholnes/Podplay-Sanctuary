import React, { useState } from 'react';

interface WorkspaceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, memoryMB: number, vcpus: number) => Promise<boolean>;
}

const WorkspaceCreationModal: React.FC<WorkspaceCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState<string>('');
  const [memoryMB, setMemoryMB] = useState<number>(2048); // Default 2GB
  const [vcpus, setVcpus] = useState<number>(2);      // Default 2 vCPUs
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const success = await onCreate(name, memoryMB, vcpus);
      if (success) {
        onClose(); // Close modal on successful creation
        setName(''); // Reset form
        setMemoryMB(2048);
        setVcpus(2);
      } else {
        // Error should ideally be set by the parent WorkspacesView if it has more context
        setError('Failed to create workspace. Please check server logs or try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Basic inline styles for modal (can be moved to a CSS file or use existing classes)
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050, // Ensure it's above other content
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--background-color-darker, #2c2c2c)', // Darker background
    padding: '25px 30px',
    borderRadius: '8px',
    width: 'clamp(350px, 50%, 550px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
    border: '1px solid var(--border-color-strong, #555)',
    color: 'var(--text-color-primary, #eee)',
  };
  
  const inputStyle: React.CSSProperties = {
    width: '100%', // Full width of form group
    padding: '10px',
    boxSizing: 'border-box', // Include padding and border in the element's total width and height
    borderRadius: '4px',
    border: '1px solid var(--border-color-base, #444)',
    backgroundColor: 'var(--background-color-base, #333)',
    color: 'var(--text-color-primary, #eee)',
    fontSize: '1em',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', 
    marginBottom: '8px', 
    color:'var(--text-color-secondary, #ccc)',
    fontSize: '0.9em',
    fontWeight: 'bold',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 18px',
    marginRight: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
  };

  const actionsStyle: React.CSSProperties = {
    textAlign: 'right',
    marginTop: '25px',
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="createWorkspaceModalTitle">
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 id="createWorkspaceModalTitle" style={{ marginTop: 0, marginBottom: '25px', borderBottom: '1px solid var(--border-color-light, #444)', paddingBottom: '10px' }}>
          Create New NixOS Workspace
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="workspaceName" style={labelStyle}>Workspace Name:</label>
            <input
              type="text"
              id="workspaceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-project-dev-env"
              style={inputStyle}
              disabled={isCreating}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="workspaceMemory" style={labelStyle}>Memory (MB):</label>
            <input
              type="number"
              id="workspaceMemory"
              value={memoryMB}
              onChange={(e) => setMemoryMB(parseInt(e.target.value, 10))}
              min="512"
              step="256"
              style={inputStyle}
              disabled={isCreating}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="workspaceVcpus" style={labelStyle}>vCPUs:</label>
            <input
              type="number"
              id="workspaceVcpus"
              value={vcpus}
              onChange={(e) => setVcpus(parseInt(e.target.value, 10))}
              min="1"
              max="16" // Reasonable max for typical local use
              style={inputStyle}
              disabled={isCreating}
              required
            />
          </div>
          {error && <p style={{ color: 'var(--error-color, #ff6b6b)', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
          <div style={actionsStyle}>
            <button type="button" onClick={onClose} disabled={isCreating} style={{...buttonStyle, backgroundColor: 'var(--button-secondary-background-color, #555)', color: 'var(--text-color-primary, #fff)'}}>
              Cancel
            </button>
            <button type="submit" disabled={isCreating} style={{...buttonStyle, backgroundColor: 'var(--accent-color-primary, #007bff)', color: 'white', marginLeft: '10px'}}>
              {isCreating ? 'Creating...' : '🚀 Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreationModal;
