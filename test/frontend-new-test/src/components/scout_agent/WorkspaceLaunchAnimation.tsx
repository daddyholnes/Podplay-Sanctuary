import React, { useState, useEffect } from 'react';
import './WorkspaceAnimations.css';

interface AnimationStep {
  id: string;
  icon: string;
  text: string;
  status: 'pending' | 'active' | 'completed';
  delay: number;
}

interface WorkspaceLaunchAnimationProps {
  isVisible: boolean;
  projectGoal: string;
  onComplete: () => void;
}

const WorkspaceLaunchAnimation: React.FC<WorkspaceLaunchAnimationProps> = ({
  isVisible,
  projectGoal,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showRocket, setShowRocket] = useState(false);
  const [showMamaBear, setShowMamaBear] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: number, delay: number}>>([]);

  const steps: AnimationStep[] = [
    {
      id: 'analyze',
      icon: '🧠',
      text: 'Analyzing your awesome idea...',
      status: 'pending',
      delay: 500
    },
    {
      id: 'workspace',
      icon: '🏗️',
      text: 'Creating development workspace...',
      status: 'pending',
      delay: 1000
    },
    {
      id: 'environment',
      icon: '⚙️',
      text: 'Setting up environment...',
      status: 'pending',
      delay: 1500
    },
    {
      id: 'files',
      icon: '📁',
      text: 'Generating initial files...',
      status: 'pending',
      delay: 2000
    },
    {
      id: 'preview',
      icon: '👁️',
      text: 'Preparing live preview...',
      status: 'pending',
      delay: 2500
    },
    {
      id: 'complete',
      icon: '🚀',
      text: 'Workspace ready to rock!',
      status: 'pending',
      delay: 3000
    }
  ];

  const [animationSteps, setAnimationSteps] = useState(steps);

  useEffect(() => {
    if (!isVisible) return;

    console.log('🚀 WorkspaceLaunchAnimation - Starting animation sequence!');
    console.log('🎯 Project Goal:', projectGoal);

    // Start rocket animation immediately
    setShowRocket(true);
    
    // Show Mama Bear after a short delay
    setTimeout(() => {
      console.log('🐻 Mama Bear appears!');
      setShowMamaBear(true);
    }, 300);
    
    // Start particles
    setTimeout(() => {
      console.log('✨ Magic particles start!');
      setShowParticles(true);
    }, 800);
    
    // Generate random particles
    const particleArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setParticles(particleArray);

    // Step progression
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setAnimationSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i < index ? 'completed' : i === index ? 'active' : 'pending'
        })));
      }, step.delay);
    });

    // Show success burst and complete
    setTimeout(() => {
      setShowBurst(true);
      setAnimationSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
    }, 3200);

    // Hide animation and call onComplete
    setTimeout(() => {
      onComplete();
    }, 4500);

  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="scout-launch-sequence">
      {/* Animated Rocket */}
      {showRocket && (
        <div className="scout-rocket">
          <div className="scout-rocket-nose"></div>
          <div className="scout-rocket-body"></div>
          <div className="scout-rocket-fins">
            <div className="scout-rocket-fin"></div>
            <div className="scout-rocket-fin"></div>
          </div>
          <div className="scout-rocket-flames"></div>
        </div>
      )}

      {/* Mama Bear */}
      {showMamaBear && (
        <div className="scout-mama-bear">
          🐻
        </div>
      )}

      {/* Magic Particles */}
      {showParticles && (
        <div className="scout-magic-particles">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="scout-particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Progress Steps */}
      <div className="scout-launch-steps">
        <h2 style={{ marginBottom: '20px', color: '#64ffda' }}>
          🚀 Building: {projectGoal.slice(0, 40)}...
        </h2>
        {animationSteps.map((step, index) => (
          <div
            key={step.id}
            className={`scout-step ${step.status} ${index <= currentStep ? 'scout-step-visible' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <span className="scout-step-icon">{step.icon}</span>
            <span className="scout-step-text">{step.text}</span>
            <span className="scout-step-status">
              {step.status === 'completed' ? '✅' : 
               step.status === 'active' ? '⏳' : '⏱️'}
            </span>
          </div>
        ))}
      </div>

      {/* Success Burst */}
      {showBurst && (
        <div className="scout-success-burst">
          <div className="scout-burst-ring"></div>
          <div className="scout-burst-ring"></div>
          <div className="scout-burst-ring"></div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceLaunchAnimation;
