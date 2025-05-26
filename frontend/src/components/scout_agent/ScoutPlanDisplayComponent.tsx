import React from 'react';

interface PlanStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'waiting_for_approval' | string; // Allow other statuses
  // Add other fields like description, sub_steps if needed
}

interface ScoutPlanDisplayProps {
  plan: PlanStep[];
  activeStepId: string | null;
}

const ScoutPlanDisplayComponent: React.FC<ScoutPlanDisplayProps> = ({ plan, activeStepId }) => {
  if (!plan || plan.length === 0) {
    return <div className="scoutPlanDisplay"><p>No plan available.</p></div>;
  }

  // Simple styling for plan steps (can be moved to CSS)
  const stepStyle = (step: PlanStep): React.CSSProperties => ({
    padding: '8px 12px',
    margin: '5px 0',
    borderRadius: '4px',
    border: `1px solid #ddd`,
    backgroundColor: activeStepId === step.id ? '#e8f4fd' : '#f9f9f9', // Highlight active step
    borderColor: activeStepId === step.id ? '#007bff' : '#ddd',
    fontWeight: activeStepId === step.id ? 'bold' : 'normal',
    cursor: 'default', // Could be made clickable to show step details
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  });

  const statusStyle = (status: string): React.CSSProperties => {
    let color = '#555'; // Default
    if (status === 'completed') color = '#28a745'; // Green
    else if (status === 'failed') color = '#dc3545'; // Red
    else if (status === 'in_progress') color = '#007bff'; // Blue
    else if (status === 'waiting_for_approval') color = '#ffc107'; // Yellow/Orange
    else if (status === 'pending') color = '#6c757d'; // Gray
    return {
      display: 'inline-block',
      marginLeft: '10px',
      padding: '2px 6px',
      fontSize: '0.75em',
      borderRadius: '3px',
      backgroundColor: color,
      color: 'white',
      textTransform: 'uppercase',
    };
  };

  return (
    <div className="scoutPlanDisplay">
      <h4>Agent Plan</h4>
      {plan.length > 0 ? (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {plan.map((step, index) => (
            <li key={step.id || index} style={stepStyle(step)}>
              <span>{index + 1}. {step.name || 'Unnamed Step'}</span>
              <span style={statusStyle(step.status || 'unknown')}>
                {step.status || 'Unknown'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No steps in the current plan.</p>
      )}
    </div>
  );
};

export default ScoutPlanDisplayComponent;
