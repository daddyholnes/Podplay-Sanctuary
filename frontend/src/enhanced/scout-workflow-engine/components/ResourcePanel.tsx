import React, { useState } from 'react';
import { useWorkflow, WorkflowTask } from '../ScoutWorkflowContext';
import './ResourcePanel.css';

interface ResourcePanelProps {
  taskId: string;
  onClose: () => void;
}

/**
 * ResourcePanel - Displays and manages resources attached to a task
 */
const ResourcePanel: React.FC<ResourcePanelProps> = ({ taskId, onClose }) => {
  const { activeWorkflow, addResource, updateTask } = useWorkflow();
  const [activeTab, setActiveTab] = useState<'resources' | 'preview' | 'editor'>('resources');
  const [newResourceType, setNewResourceType] = useState<'file' | 'link' | 'note' | 'code'>('note');
  const [resourceName, setResourceName] = useState('');
  const [resourceContent, setResourceContent] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [previewResource, setPreviewResource] = useState<{
    type: 'file' | 'link' | 'note' | 'code';
    name: string;
    content?: string;
    url?: string;
  } | null>(null);
  
  // Find the task
  let task: WorkflowTask | null = null;
  
  if (activeWorkflow) {
    for (const stage of activeWorkflow.stages) {
      const foundTask = stage.tasks.find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }
  }
  
  if (!task) {
    return (
      <div className="resource-panel">
        <div className="panel-header">
          <h3>Resources</h3>
          <button 
            className="close-panel-button"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="panel-content empty">
          <p>Task not found</p>
        </div>
      </div>
    );
  }
  
  // Handle adding a new resource
  const handleAddResource = async () => {
    try {
      let newResource: {
        type: 'file' | 'link' | 'note' | 'code';
        name: string;
        content?: string;
        url?: string;
      };
      
      switch (newResourceType) {
        case 'file':
          newResource = {
            type: 'file',
            name: resourceName,
            path: '/path/to/file' // Placeholder, would be replaced with actual file path
          };
          break;
        case 'link':
          newResource = {
            type: 'link',
            name: resourceName,
            url: resourceUrl
          };
          break;
        case 'note':
        case 'code':
          newResource = {
            type: newResourceType,
            name: resourceName,
            content: resourceContent
          };
          break;
      }
      
      await addResource(taskId, newResource);
      
      // Reset form
      setResourceName('');
      setResourceContent('');
      setResourceUrl('');
      setIsAddingResource(false);
    } catch (err) {
      console.error('Failed to add resource:', err);
    }
  };
  
  // Handle previewing a resource
  const handlePreview = (resource: {
    type: 'file' | 'link' | 'note' | 'code';
    name: string;
    content?: string;
    url?: string;
  }) => {
    setPreviewResource(resource);
    setActiveTab('preview');
  };
  
  // Handle editing a resource
  const handleEdit = (resource: {
    type: 'file' | 'link' | 'note' | 'code';
    name: string;
    content?: string;
    url?: string;
  }) => {
    setNewResourceType(resource.type);
    setResourceName(resource.name);
    setResourceContent(resource.content || '');
    setResourceUrl(resource.url || '');
    setActiveTab('editor');
  };
  
  // Get icon for resource type
  const getResourceIcon = (type: 'file' | 'link' | 'note' | 'code'): JSX.Element => {
    switch (type) {
      case 'file':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path 
              fill="currentColor" 
              d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"
            />
          </svg>
        );
      case 'link':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path 
              fill="currentColor" 
              d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
            />
          </svg>
        );
      case 'note':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path 
              fill="currentColor" 
              d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
            />
          </svg>
        );
      case 'code':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path 
              fill="currentColor" 
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="resource-panel">
      <div className="panel-header">
        <h3>
          {activeTab === 'resources' && 'Task Resources'}
          {activeTab === 'preview' && 'Resource Preview'}
          {activeTab === 'editor' && 'Edit Resource'}
        </h3>
        <div className="panel-tabs">
          <button 
            className={`panel-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          {previewResource && (
            <button 
              className={`panel-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          )}
          {isAddingResource && (
            <button 
              className={`panel-tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
          )}
        </div>
        <button 
          className="close-panel-button"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="panel-content">
        {activeTab === 'resources' && (
          <>
            <div className="task-info-header">
              <h4>{task.title}</h4>
              <div className="task-status">{task.status}</div>
            </div>
            
            <p className="task-description">{task.description}</p>
            
            <div className="resources-header">
              <h5>Resources</h5>
              <button 
                className="add-resource-button"
                onClick={() => {
                  setIsAddingResource(true);
                  setActiveTab('editor');
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Resource
              </button>
            </div>
            
            {(!task.resources || task.resources.length === 0) ? (
              <div className="empty-resources">
                <p>No resources attached to this task</p>
              </div>
            ) : (
              <div className="resources-list">
                {task.resources.map((resource, index) => (
                  <div key={index} className="resource-item">
                    <div className="resource-icon">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="resource-details">
                      <div className="resource-name">{resource.name}</div>
                      <div className="resource-type">{resource.type}</div>
                    </div>
                    <div className="resource-actions">
                      {(resource.type === 'note' || resource.type === 'code' || resource.type === 'link') && (
                        <button 
                          className="preview-button"
                          onClick={() => handlePreview(resource)}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      )}
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(resource)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'preview' && previewResource && (
          <div className="resource-preview">
            <div className="preview-header">
              <h4>{previewResource.name}</h4>
              <div className="preview-type">{previewResource.type}</div>
            </div>
            
            {previewResource.type === 'link' && previewResource.url && (
              <div className="link-preview">
                <div className="link-url">{previewResource.url}</div>
                <a 
                  href={previewResource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="open-link-button"
                >
                  Open Link
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            )}
            
            {(previewResource.type === 'note' || previewResource.type === 'code') && previewResource.content && (
              <div className={`content-preview ${previewResource.type}`}>
                {previewResource.type === 'code' ? (
                  <pre className="code-block">
                    <code>{previewResource.content}</code>
                  </pre>
                ) : (
                  <div className="note-content">{previewResource.content}</div>
                )}
              </div>
            )}
            
            <div className="preview-actions">
              <button 
                className="edit-resource-button"
                onClick={() => handleEdit(previewResource)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                Edit Resource
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'editor' && (
          <div className="resource-editor">
            <div className="form-group">
              <label htmlFor="resource-type">Resource Type</label>
              <select 
                id="resource-type"
                value={newResourceType}
                onChange={(e) => setNewResourceType(e.target.value as any)}
              >
                <option value="note">Note</option>
                <option value="link">Link</option>
                <option value="code">Code Snippet</option>
                <option value="file">File</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="resource-name">Resource Name</label>
              <input 
                type="text"
                id="resource-name"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="Enter a name for this resource"
              />
            </div>
            
            {(newResourceType === 'note' || newResourceType === 'code') && (
              <div className="form-group">
                <label htmlFor="resource-content">Content</label>
                <textarea 
                  id="resource-content"
                  value={resourceContent}
                  onChange={(e) => setResourceContent(e.target.value)}
                  rows={8}
                  placeholder={newResourceType === 'note' ? "Enter your note here..." : "// Enter your code here..."}
                ></textarea>
              </div>
            )}
            
            {newResourceType === 'link' && (
              <div className="form-group">
                <label htmlFor="resource-url">URL</label>
                <input 
                  type="url"
                  id="resource-url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
            )}
            
            {newResourceType === 'file' && (
              <div className="form-group">
                <label htmlFor="resource-file">File</label>
                <div className="file-upload">
                  <input 
                    type="file"
                    id="resource-file"
                    className="file-input"
                  />
                  <button className="file-upload-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Choose File
                  </button>
                  <span className="file-name">No file chosen</span>
                </div>
              </div>
            )}
            
            <div className="editor-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setIsAddingResource(false);
                  setActiveTab('resources');
                }}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleAddResource}
                disabled={!resourceName || (newResourceType === 'link' && !resourceUrl) || ((newResourceType === 'note' || newResourceType === 'code') && !resourceContent)}
              >
                Save Resource
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcePanel;