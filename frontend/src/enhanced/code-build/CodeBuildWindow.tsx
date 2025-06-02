import React, { useState, useEffect } from 'react';
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(139, 92, 246, 0.3)' : 'transparent'};
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background: rgba(139, 92, 246, 0.2);
  }
`;

const Content = styled.div`
  flex: 1;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
`;

const CodeBuildWindow: React.FC<AgentProps> = ({ 
  agentType, 
  agentState, 
  updateAgentState 
}) => {
  const [activeTab, setActiveTab] = useState(agentState?.activeTab || 'editor');
  const [projectName] = useState(agentState?.projectName || 'Podplay Sanctuary');
  
  // Update state when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateAgentState({ ...agentState, activeTab: tab });
  };
  
  // Initialize state if needed
  useEffect(() => {
    if (!agentState || Object.keys(agentState).length === 0) {
      updateAgentState({
        activeTab: 'editor',
        projectName: 'Podplay Sanctuary',
        editorContent: '',
        previewUrl: ''
      });
    }
  }, [agentState, updateAgentState]);
  
  return (
    <Container>
      <Header>
        <h2>Code Build: {projectName}</h2>
        <div>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{agentType}</span>
        </div>
      </Header>
      
      <Tabs>
        <Tab 
          active={activeTab === 'editor'}
          onClick={() => handleTabChange('editor')}
        >
          Editor
        </Tab>
        <Tab 
          active={activeTab === 'preview'}
          onClick={() => handleTabChange('preview')}
        >
          Preview
        </Tab>
        <Tab 
          active={activeTab === 'terminal'}
          onClick={() => handleTabChange('terminal')}
        >
          Terminal
        </Tab>
        <Tab 
          active={activeTab === 'files'}
          onClick={() => handleTabChange('files')}
        >
          Files
        </Tab>
      </Tabs>
      
      <Content>
        {activeTab === 'editor' && (
          <div>
            <p>Code editor coming soon...</p>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div>
            <p>Preview panel coming soon...</p>
          </div>
        )}
        
        {activeTab === 'terminal' && (
          <div>
            <p>Terminal coming soon...</p>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div>
            <p>File explorer coming soon...</p>
          </div>
        )}
      </Content>
    </Container>
  );
};

export default CodeBuildWindow;
