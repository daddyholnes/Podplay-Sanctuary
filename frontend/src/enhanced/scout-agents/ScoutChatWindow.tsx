import React, { useState } from 'react';
import { AgentProps } from '../window-management/types';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #2d1b69 0%, #1a103e 100%);
  color: white;
  padding: 1rem;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span`
  background-color: rgba(139, 92, 246, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ScoutChatWindow: React.FC<AgentProps> = ({ 
  agentType, 
  agentState, 
  updateAgentState 
}) => {
  const [activeMode, setActiveMode] = useState(agentState?.mode || 'research');
  
  // Use updateAgentState when mode changes
  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    updateAgentState({ ...agentState, mode });
  };
  
  return (
    <Container>
      <Header>
        <h2>Scout Agent</h2>
        <StatusBadge>
          {agentType} - {activeMode}
        </StatusBadge>
      </Header>
      
      <Content>
        <p>Research and resource discovery agent interface coming soon...</p>
        
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleModeChange('research')}
            style={{ opacity: activeMode === 'research' ? 1 : 0.7 }}
          >
            Research Mode
          </button>
          <button 
            onClick={() => handleModeChange('discovery')}
            style={{ opacity: activeMode === 'discovery' ? 1 : 0.7 }}
          >
            Discovery Mode
          </button>
        </div>
      </Content>
    </Container>
  );
};

export default ScoutChatWindow;
