import React from 'react';

interface LogEntry {
  log_id: string;
  timestamp: string;
  message: string;
  step_id?: string;
  step_name?: string;
  agent_action?: string;
  vm_id?: string;
  parameters?: Record<string, any>;
  outputs?: Record<string, any>; // stdout, stderr, tool_result
  agent_thoughts?: string | Record<string, any>;
  status_update?: string;
  is_error?: boolean;
  // Any other custom fields added via extra_data
  [key: string]: any; 
}

interface ScoutLogViewerProps {
  logs: LogEntry[];
}

const ScoutLogViewerComponent: React.FC<ScoutLogViewerProps> = ({ logs }) => {
  
  const logEntryStyle = (log: LogEntry): React.CSSProperties => ({
    padding: '10px',
    margin: '5px 0',
    borderLeft: `4px solid ${log.is_error ? '#e74c3c' : (log.status_update ? '#3498db' : '#bdc3c7')}`,
    backgroundColor: log.is_error ? '#fadbd8' : '#f9f9f9',
    borderRadius: '4px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.85em',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap', // Preserve whitespace and newlines
    overflowX: 'auto',   // Allow horizontal scroll for long lines
  });

  const timestampStyle: React.CSSProperties = {
    color: '#7f8c8d', // Grayish
    marginRight: '10px',
    fontSize: '0.9em',
  };

  const messageStyle = (log: LogEntry): React.CSSProperties => ({
    color: log.is_error ? '#c0392b' : '#333',
    fontWeight: log.status_update || log.is_error ? 'bold' : 'normal',
  });
  
  const detailBlockStyle: React.CSSProperties = {
    marginTop: '5px',
    paddingLeft: '15px',
    borderLeft: '1px dashed #ccc',
    fontSize: '0.95em',
    color: '#555',
  };

  const renderDetail = (title: string, content: any) => {
    if (content === null || content === undefined || (typeof content === 'object' && Object.keys(content).length === 0) || (typeof content === 'string' && content.trim() === '')) {
      return null;
    }
    return (
      <div style={{ marginTop: '3px' }}>
        <strong>{title}:</strong>
        {typeof content === 'string' ? (
          <pre style={{ margin: '0 0 0 5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{content}</pre>
        ) : (
          <pre style={{ margin: '0 0 0 5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  };


  return (
    <div className="scoutLogViewer" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h4>Agent Logs</h4>
      <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', background: '#fff' }}>
        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.log_id} style={logEntryStyle(log)}>
              <div>
                <span style={timestampStyle}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span style={messageStyle(log)}>{log.message}</span>
              </div>
              {(log.step_id || log.agent_action || log.status_update) && (
                <div style={detailBlockStyle}>
                  {renderDetail('Step', `${log.step_name || 'N/A'} (ID: ${log.step_id || 'N/A'})`)}
                  {renderDetail('Action', log.agent_action)}
                  {renderDetail('Status Update', log.status_update)}
                </div>
              )}
              {log.agent_thoughts && (
                <div style={detailBlockStyle}>
                  {renderDetail('Thoughts', log.agent_thoughts)}
                </div>
              )}
              {log.parameters && Object.keys(log.parameters).length > 0 && (
                <div style={detailBlockStyle}>
                  {renderDetail('Parameters', log.parameters)}
                </div>
              )}
              {log.outputs && Object.keys(log.outputs).length > 0 && (
                 <div style={detailBlockStyle}>
                   {renderDetail('Outputs', log.outputs)}
                 </div>
              )}
              {log.vm_id && renderDetail('VM ID', log.vm_id)}
            </div>
          ))
        ) : (
          <p>No logs available for this project yet.</p>
        )}
      </div>
    </div>
  );
};

export default ScoutLogViewerComponent;
