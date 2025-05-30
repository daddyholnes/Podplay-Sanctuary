import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { Environment, WorkspaceCreationResponse, ActiveWorkspaceResponse } from '../types';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Card, { CardHeader, CardContent, CardFooter } from '../components/Card';
import Input, { Select, Textarea } from '../components/Input';
import Spinner from '../components/common/Spinner';
import Modal from '../components/Modal';
import { ENVIRONMENT_TYPES, COMMON_PACKAGES, MCP_SERVER_TYPES } from '../utils/constants';

const SECTION_ID = 'workspaces';

const DynamicWorkspaceCenter: React.FC = () => {
  const { activeEnvironments, addEnvironment, setActiveEnvironments, updateEnvironment } = useAppStore(state => ({
    activeEnvironments: state.activeEnvironments,
    addEnvironment: state.addEnvironment,
    setActiveEnvironments: state.setActiveEnvironments,
    updateEnvironment: state.updateEnvironment,
  }));

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    type: ENVIRONMENT_TYPES[0]?.id || 'nixos',
    packages: [] as string[],
    mcpServers: [] as string[],
    repositories: [''],
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customPackage, setCustomPackage] = useState('');
  const [customServer, setCustomServer] = useState('');

  const fetchActiveWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const workspaces = await apiService.getActiveWorkspaces();
      setActiveEnvironments(workspaces);
    } catch (error) {
      console.error("Error fetching active workspaces:", error);
      // Show error to user via store or local state
    } finally {
      setIsLoading(false);
    }
  }, [setActiveEnvironments]);

  useEffect(() => {
    if (activeEnvironments.length === 0) { // Fetch only if not already populated
        fetchActiveWorkspaces();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchActiveWorkspaces is memoized

  const handleInputChange = (field: keyof typeof newWorkspace, value: string | string[]) => {
    setNewWorkspace(prev => ({ ...prev, [field]: value }));
  };

  const handleRepoChange = (index: number, value: string) => {
    const updatedRepos = [...newWorkspace.repositories];
    updatedRepos[index] = value;
    handleInputChange('repositories', updatedRepos);
  };

  const addRepoField = () => handleInputChange('repositories', [...newWorkspace.repositories, '']);
  const removeRepoField = (index: number) => handleInputChange('repositories', newWorkspace.repositories.filter((_, i) => i !== index));
  
  const toggleSelection = (field: 'packages' | 'mcpServers', item: string) => {
    const currentSelection = newWorkspace[field];
    const newSelection = currentSelection.includes(item)
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    handleInputChange(field, newSelection);
  };

  const addCustomItem = (field: 'packages' | 'mcpServers', customItem: string, setCustomItem: React.Dispatch<React.SetStateAction<string>>) => {
    if (customItem.trim() && !newWorkspace[field].includes(customItem.trim())) {
      handleInputChange(field, [...newWorkspace[field], customItem.trim()]);
    }
    setCustomItem('');
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiService.requestWorkspace({
        ...newWorkspace,
        repositories: newWorkspace.repositories.filter(r => r.trim() !== '') // Filter out empty repo strings
      });
      addEnvironment({ 
        id: response.workspaceId, 
        name: newWorkspace.description || `Workspace ${response.workspaceId.substring(0,6)}`, 
        type: newWorkspace.type, 
        status: response.status || 'pending',
        packages: newWorkspace.packages,
        mcpServers: newWorkspace.mcpServers,
        repository: newWorkspace.repositories.join(', '),
        lastUsed: new Date().toISOString()
      });
      setIsCreateModalOpen(false);
      setNewWorkspace({ type: ENVIRONMENT_TYPES[0]?.id || 'nixos', packages: [], mcpServers: [], repositories: [''], description: '' }); // Reset form
    } catch (error) {
      console.error("Error creating workspace:", error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'running') return 'bg-success';
    if (status.toLowerCase() === 'pending') return 'bg-warning';
    if (status.toLowerCase() === 'stopped') return 'bg-text-muted';
    if (status.toLowerCase() === 'error') return 'bg-error';
    return 'bg-gray-400';
  };

  const environmentTypeOptions = ENVIRONMENT_TYPES.map(type => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <div className="h-full flex flex-col space-y-4">
      <header className="flex items-center justify-between pb-2 border-b border-border">
        <h1 className="font-display text-2xl text-cyan-500 flex items-center">
          <Icon name="workspaces" className="w-8 h-8 mr-2" /> Dynamic Workspace Center
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon="plusCircle">Create Environment</Button>
      </header>

      {/* Active Environments */}
      <h2 className="font-display text-xl text-text-secondary">Active Environments</h2>
      {isLoading && activeEnvironments.length === 0 && <Spinner text="Loading environments..." />}
      {!isLoading && activeEnvironments.length === 0 && (
        <p className="text-text-muted text-center py-10">No active environments. Create one to get started!</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeEnvironments.map(env => (
          <Card key={env.id} className="hover:shadow-lg transition-shadow">
            <CardHeader actions={<div className={`w-3 h-3 rounded-full ${getStatusColor(env.status)}`} title={`Status: ${env.status}`}></div>}>
              {env.name || `Workspace ${env.id.substring(0,6)}`}
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong className="text-text-secondary">Type:</strong> {ENVIRONMENT_TYPES.find(t => t.id === env.type)?.name || env.type}</p>
              {env.packages && env.packages.length > 0 && <p><strong className="text-text-secondary">Packages:</strong> {env.packages.join(', ')}</p>}
              {env.repository && <p><strong className="text-text-secondary">Repo:</strong> <span className="truncate">{env.repository}</span></p>}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button size="sm" variant="secondary" leftIcon="cog" onClick={() => alert(`Configure ${env.name}`)}>Configure</Button>
              <Button size="sm" variant="primary" leftIcon="arrowRight" onClick={() => alert(`Open ${env.name}`)}>Open</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Workspace Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Environment" size="2xl">
        <form onSubmit={handleCreateWorkspace} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
          <Textarea label="Description / Name" value={newWorkspace.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="e.g., My React Dev Env" rows={2} />
          <Select label="Environment Type" options={environmentTypeOptions} value={newWorkspace.type} onChange={e => handleInputChange('type', e.target.value)} />

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Packages</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_PACKAGES.map(pkg => (
                <Button key={pkg} type="button" size="sm" variant={newWorkspace.packages.includes(pkg) ? 'primary' : 'secondary'} onClick={() => toggleSelection('packages', pkg)}>{pkg}</Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input value={customPackage} onChange={e => setCustomPackage(e.target.value)} placeholder="Add custom package" className="flex-grow"/>
              <Button type="button" onClick={() => addCustomItem('packages', customPackage, setCustomPackage)} leftIcon="plusCircle" size="sm">Add</Button>
            </div>
            {newWorkspace.packages.filter(p => !COMMON_PACKAGES.includes(p)).length > 0 && (
                 <div className="mt-1 text-xs text-text-muted">Custom: {newWorkspace.packages.filter(p => !COMMON_PACKAGES.includes(p)).join(', ')}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">MCP Servers</label>
             <div className="flex flex-wrap gap-2 mb-2">
              {MCP_SERVER_TYPES.map(srv => (
                <Button key={srv} type="button" size="sm" variant={newWorkspace.mcpServers.includes(srv) ? 'primary' : 'secondary'} onClick={() => toggleSelection('mcpServers', srv)}>{srv}</Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input value={customServer} onChange={e => setCustomServer(e.target.value)} placeholder="Add custom server type" className="flex-grow"/>
              <Button type="button" onClick={() => addCustomItem('mcpServers', customServer, setCustomServer)} leftIcon="plusCircle" size="sm">Add</Button>
            </div>
             {newWorkspace.mcpServers.filter(s => !MCP_SERVER_TYPES.includes(s)).length > 0 && (
                 <div className="mt-1 text-xs text-text-muted">Custom: {newWorkspace.mcpServers.filter(s => !MCP_SERVER_TYPES.includes(s)).join(', ')}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Repositories (Optional)</label>
            {newWorkspace.repositories.map((repo, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input value={repo} onChange={e => handleRepoChange(index, e.target.value)} placeholder="https://github.com/user/repo.git" leftIcon="link" className="flex-grow"/>
                {newWorkspace.repositories.length > 1 && <Button type="button" variant="danger" size="sm" onClick={() => removeRepoField(index)}><Icon name="trash" className="w-4 h-4"/></Button>}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={addRepoField} leftIcon="plusCircle">Add another repository</Button>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} leftIcon="rocket">Create Environment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DynamicWorkspaceCenter;