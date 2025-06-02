import React, { useState, useEffect } from 'react';
import { AgentProps } from '../window-management/types';
import styled from '@emotion/styled';

interface MCPService {
  id: string;
  name: string;
  status: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #2d1b69 0%, #1a103e 100%);
  color: white;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ServiceItem = styled.div<{ active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${props => props.active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 4px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(139, 92, 246, 0.2);
  }
`;

const StatusIndicator = styled.span<{ status: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'error': return '#EF4444';
      default: return '#F59E0B';
    }
  }};
  margin-right: 0.5rem;
  display: inline-block;
`;

const ControlPanel = styled.div`
  margin-top: auto;
  border-top: 1px solid rgba(139, 92, 246, 0.3);
  padding-top: 1rem;
`;

const MCPWindow: React.FC<AgentProps> = ({ 
  agentType, 
  agentState, 
  updateAgentState 
}) => {
  // Initialize with default services if agentState is empty
  const defaultServices: MCPService[] = [
    { id: 'brave-search', name: 'Brave Search', status: 'active' },
    { id: 'fetch', name: 'Fetch', status: 'active' },
    { id: 'filesystem', name: 'Filesystem', status: 'active' },
    { id: 'git', name: 'Git', status: 'active' },
    { id: 'github', name: 'GitHub', status: 'inactive' },
    { id: 'perplexity', name: 'Perplexity', status: 'waiting' },
    { id: 'postgresql', name: 'PostgreSQL', status: 'error' },
  ];
  
  const [services, setServices] = useState<MCPService[]>(agentState?.services || defaultServices);
  const [selectedService, setSelectedService] = useState<MCPService | null>(agentState?.selectedService || null);
  
  // Update agent state when services change
  useEffect(() => {
    if (!agentState || Object.keys(agentState).length === 0) {
      updateAgentState({
        services: defaultServices,
        selectedService: null
      });
    }
  }, [agentState, updateAgentState, defaultServices]);
  
  // Handle service selection
  const handleSelectService = (serviceId: string) => {
    const service = services.find((s: MCPService) => s.id === serviceId);
    setSelectedService(service || null);
    updateAgentState({ ...agentState, selectedService: service });
  };
  
  // Toggle service status
  const toggleServiceStatus = (serviceId: string) => {
    const updatedServices = services.map((service: MCPService) => {
      if (service.id === serviceId) {
        const newStatus = service.status === 'active' ? 'inactive' : 'active';
        return { ...service, status: newStatus };
      }
      return service;
    });
    
    setServices(updatedServices);
    updateAgentState({ ...agentState, services: updatedServices });
  };
  
  return (
    <Container>
      <Header>
        <h2>Model Context Protocol</h2>
        <span>{agentType}</span>
      </Header>
      
      <ServicesList>
        {services.map((service: MCPService) => (
          <ServiceItem 
            key={service.id}
            active={selectedService?.id === service.id}
            onClick={() => handleSelectService(service.id)}
          >
            <div>
              <StatusIndicator status={service.status} />
              {service.name}
            </div>
            <button onClick={(e) => {
              e.stopPropagation();
              toggleServiceStatus(service.id);
            }}>
              {service.status === 'active' ? 'Disable' : 'Enable'}
            </button>
          </ServiceItem>
        ))}
      </ServicesList>
      
      {selectedService && (
        <div>
          <h3>{selectedService.name} Details</h3>
          <p>Configuration options for {selectedService.name} will appear here.</p>
        </div>
      )}
      
      <ControlPanel>
        <button onClick={() => console.log('MCP Settings')}>MCP Settings</button>
      </ControlPanel>
    </Container>
  );
};

export default MCPWindow;
