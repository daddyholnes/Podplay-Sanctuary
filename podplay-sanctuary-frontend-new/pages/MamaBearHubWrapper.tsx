import React from 'react';
import { useAppStore } from '../store/useAppStore';
import MamaBearHubContent from './MamaBearHubContent';

const SECTION_ID = 'mama-bear';

/**
 * Wrapper component to handle Zustand selector stability
 * This prevents infinite re-renders by isolating the filtering logic
 */
const MamaBearHub: React.FC = () => {
  // Use a stable selector pattern
  const chatHistory = useAppStore((state) => 
    state.chatHistory.filter(msg => msg.section === SECTION_ID)
  );
  const addMessage = useAppStore((state) => state.addMessage);

  return (
    <MamaBearHubContent 
      chatHistory={chatHistory}
      addMessage={addMessage}
    />
  );
};

export default MamaBearHub;
