import React from 'react';
import { ScoutLogEntry } from './ScoutProjectView'; // Assuming interfaces are exported
import './ScoutAgentShared.css';

interface ScoutLogViewerProps {
  logs: ScoutLogEntry[];
}

const ScoutLogViewerComponent: React.FC<ScoutLogViewerProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="scout-info-text">No logs to display for this period.</p>;
  }

  const formatTimestamp = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return isoString; // Fallback if timestamp is invalid
    }
  };

  return (
    <div className="scout-log-viewer">
      {logs.map((log) => (
        <div key={log.log_id} className={`scout-log-entry log-level-${log.is_error ? 'error' : 'info'}`}>
          <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
          {log.step_name && <span className="log-step-name">[{log.step_name}]</span>}
          {log.agent_action && <span className="log-agent-action">({log.agent_action})</span>}
          <span className="log-message">{log.message}</span>
          {log.agent_thoughts && (
            <div className="log-thoughts">
              <strong>Thoughts:</strong> {typeof log.agent_thoughts === 'string' ? log.agent_thoughts : JSON.stringify(log.agent_thoughts, null, 2)}
            </div>
          )}
          {log.parameters && Object.keys(log.parameters).length > 0 && (
            <pre className="log-details log-parameters">Parameters: {JSON.stringify(log.parameters, null, 2)}</pre>
          )}
          {log.outputs && Object.keys(log.outputs).length > 0 && (
            <pre className="log-details log-outputs">Outputs: {JSON.stringify(log.outputs, null, 2)}</pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScoutLogViewerComponent;
