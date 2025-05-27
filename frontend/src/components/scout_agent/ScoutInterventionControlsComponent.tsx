import React, { useState } from 'react';
import { ScoutProjectStatusSummary } from './ScoutProjectView'; // Assuming interfaces are exported
import './ScoutAgentShared.css';

interface ScoutInterventionControlsProps {
  projectId: string;
  currentProjectStatus: ScoutProjectStatusSummary['project_overall_status'];
  activeStepId?: string;
  onIntervene: (command: string, params?: Record<string, any>) => Promise<void>;
}

const ScoutInterventionControlsComponent: React.FC<ScoutInterventionControlsProps> = ({
  projectId: _projectId,
  currentProjectStatus,
  // activeStepId, // Could be used for context-specific interventions
  onIntervene,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimpleCommand = async (command: 'pause' | 'resume' | 'approve_current_step') => {
    setIsSubmitting(true);
    await onIntervene(command);
    setIsSubmitting(false);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    await onIntervene('provide_feedback', { text: feedback });
    setFeedback('');
    setIsSubmitting(false);
  };
  
  const isAgentActive = currentProjectStatus === 'running'; // Or other active statuses like 'waiting-for-approval'

  return (
    <div className="scout-intervention-controls">
      <div className="control-group">
        <button onClick={() => handleSimpleCommand('pause')} disabled={!isAgentActive || isSubmitting} title="Pause the agent's execution">
          ⏸️ Pause Agent
        </button>
        <button onClick={() => handleSimpleCommand('resume')} disabled={(!isAgentActive || currentProjectStatus !== 'paused') || isSubmitting} title="Resume a paused agent">
          ▶️ Resume Agent
        </button>
      </div>
      <div className="control-group">
        <button onClick={() => handleSimpleCommand('approve_current_step')} disabled={!isAgentActive || isSubmitting} title="Approve the current step if agent is waiting">
          👍 Approve Current Step
        </button>
        {/* Add more specific intervention buttons here as agent capabilities grow 
            Example: <button disabled={!isAgentActive || isSubmitting}>Force Next Step</button> 
        */}
      </div>
      <div className="feedback-group">
        <label htmlFor="agentFeedback" style={{display: 'block', marginBottom: '5px', fontSize: '0.9em'}}>Provide Feedback/Instructions:</label>
        <textarea
          id="agentFeedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Type feedback or specific instructions for the agent here..."
          rows={3}
          disabled={isSubmitting}
        />
        <button onClick={handleFeedbackSubmit} disabled={!feedback.trim() || isSubmitting}>
          Send Feedback
        </button>
      </div>
    </div>
  );
};

export default ScoutInterventionControlsComponent;
