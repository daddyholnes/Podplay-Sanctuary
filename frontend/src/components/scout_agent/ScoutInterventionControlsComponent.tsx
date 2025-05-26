import React, { useState } from 'react';

interface ScoutInterventionControlsProps {
  projectId: string;
  currentStatus: 'unknown' | 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting_for_approval' | string;
  activeStepId: string | null; // Could be used to determine context for intervention
  onIntervene: (command: string, parameters?: any) => Promise<void>; // Make it async if needed
}

const ScoutInterventionControlsComponent: React.FC<ScoutInterventionControlsProps> = ({
  projectId,
  currentStatus,
  activeStepId,
  onIntervene,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCommand = async (command: string, params?: any) => {
    setIsLoading(true);
    try {
      await onIntervene(command, params);
    } catch (error) {
      console.error(`Error during intervention command '${command}':`, error);
      // Optionally display error to user within this component
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      handleCommand('provide_feedback', { text: feedbackText.trim(), step_id: activeStepId });
      setFeedbackText(''); // Clear feedback after sending
    }
  };

  const controlStyle: React.CSSProperties = {
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fdfdfd',
    marginTop: '10px', // If part of a column layout
  };

  const buttonStyle: React.CSSProperties = {
    marginRight: '10px',
    marginBottom: '10px',
    // Assuming global .button styles are available, otherwise define here
  };
  
  const textareaStyle: React.CSSProperties = {
    width: 'calc(100% - 20px)', // Adjust for padding
    minHeight: '60px',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '10px',
    display: 'block',
  };


  return (
    <div className="scoutInterventionControls" style={controlStyle}>
      <h4>Agent Controls & Intervention</h4>
      
      <button 
        onClick={() => handleCommand('pause_agent')} 
        disabled={isLoading || currentStatus !== 'running'}
        style={buttonStyle} className="button buttonWarning"
      >
        {isLoading ? 'Pausing...' : 'Pause Agent'}
      </button>
      
      <button 
        onClick={() => handleCommand('resume_agent')} 
        disabled={isLoading || currentStatus !== 'paused'}
        style={buttonStyle} className="button buttonSuccess"
      >
        {isLoading ? 'Resuming...' : 'Resume Agent'}
      </button>

      {currentStatus === 'waiting_for_approval' && activeStepId && (
        <button 
          onClick={() => handleCommand('approve_step', { step_id: activeStepId })}
          disabled={isLoading}
          style={buttonStyle} className="button buttonPrimary"
        >
          {isLoading ? 'Approving...' : `Approve Step (${activeStepId})`}
        </button>
      )}
      
      <button 
        onClick={() => handleCommand('stop_agent_processing')} 
        disabled={isLoading || currentStatus === 'completed' || currentStatus === 'failed'}
        style={buttonStyle} className="button buttonDanger"
      >
        {isLoading ? 'Stopping...' : 'Stop Agent (Halt)'}
      </button>

      <div>
        <label htmlFor={`feedback-${projectId}`} style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Provide Feedback:</label>
        <textarea
          id={`feedback-${projectId}`}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Type feedback for the agent here..."
          style={textareaStyle}
          disabled={isLoading}
        />
        <button onClick={handleSendFeedback} disabled={isLoading || !feedbackText.trim()} style={buttonStyle} className="button">
          {isLoading ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
      {/* More complex interventions could be added here, e.g., skip step, modify parameters */}
    </div>
  );
};

export default ScoutInterventionControlsComponent;
