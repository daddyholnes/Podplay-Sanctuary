/// <reference types="vite/client" />
/// <reference types="node" />

// Ensure JSX namespace is available
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WEBSOCKET_URL?: string;
  readonly NODE_ENV?: string;
  readonly REACT_APP_NIXOS_VM_SSH_USER?: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix process for browser environment
declare const process: {
  env: {
    NODE_ENV?: string;
    REACT_APP_NIXOS_VM_SSH_USER?: string;
    [key: string]: string | undefined;
  };
};
