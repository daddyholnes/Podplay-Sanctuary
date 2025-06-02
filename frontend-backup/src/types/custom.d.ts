// Type declarations for custom modules
declare module '../agents/MamaBearChat' {
  import React from 'react';
  
  interface MamaBearChatProps {
    agentType?: string;
    onMessage?: (message: string) => void;
  }
  
  const MamaBearChat: React.FC<MamaBearChatProps>;
  export default MamaBearChat;
}

// Add declaration for react-resizable
declare module 'react-resizable' {
  import React from 'react';
  
  export interface ResizableProps {
    width: number;
    height: number;
    handle?: React.ReactElement;
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    onResizeStop?: (e: any, data: any) => void;
    children?: React.ReactNode;
  }
  
  export const Resizable: React.ComponentType<ResizableProps>;
}
