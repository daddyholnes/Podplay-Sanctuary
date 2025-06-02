import React from 'react';
import { ScoutStep } from './ScoutProjectView'; // Assuming interfaces are exported or defined here
import './ScoutAgentShared.css'; // A shared CSS file for common styles

interface ScoutPlanDisplayProps {
  planSteps: ScoutStep[];
  activeStepId?: string;
}

const ScoutPlanDisplayComponent: React.FC<ScoutPlanDisplayProps> = ({ planSteps, activeStepId }) => {
  if (!planSteps || planSteps.length === 0) {
    return <p className="scout-info-text">No plan steps available for this project.</p>;
  }

  return (
    <div className="scout-plan-display">
      <ul className="scout-plan-list">
        {planSteps.map((step, index) => (
          <li
            key={step.id || index}
            className={`
              scout-plan-step 
              status-${step.status?.toLowerCase().replace(/_/g, '-')}
              ${step.id === activeStepId ? 'active-step' : ''}
            `}
          >
            <div className="step-number">{index + 1}.</div>
            <div className="step-details">
              <span className="step-name">{step.name || 'Unnamed Step'}</span>
              <span className="step-status-badge">{step.status || 'Unknown'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoutPlanDisplayComponent;
