import React from 'react';
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

const MamaBearChatWindow: React.FC<AgentProps> = ({ 
  agentType, 
  agentState, 
  updateAgentState 
}) => {
  return (
    <Container>
      <h2>Mama Bear Chat</h2>
      <p>Chat interface coming soon...</p>
    </Container>
  );
};

export default MamaBearChatWindow;
