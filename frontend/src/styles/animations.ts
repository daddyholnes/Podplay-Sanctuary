/**
 * Podplay Sanctuary - Animation Utilities
 * 
 * CSS-in-JS animation utilities, keyframes, transitions,
 * and motion components for creating engaging user experiences
 * with performance-optimized animations.
 */

import styled, { css, keyframes } from 'styled-components';
import { Theme } from './theme';
import { StyleProps, Box } from './components';

// Keyframe animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideOutUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

export const slideOutDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

export const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

export const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
`;

export const zoomIn = keyframes`
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const zoomOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
`;

export const rotateIn = keyframes`
  from {
    transform: rotate(-90deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
`;

export const rotateOut = keyframes`
  from {
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(90deg);
    opacity: 0;
  }
`;

export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

export const shake = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
`;

export const flash = keyframes`
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0;
  }
`;

export const rubberBand = keyframes`
  0% {
    transform: scale(1);
  }
  30% {
    transform: scaleX(1.25) scaleY(0.75);
  }
  40% {
    transform: scaleX(0.75) scaleY(1.25);
  }
  60% {
    transform: scaleX(1.15) scaleY(0.85);
  }
  100% {
    transform: scale(1);
  }
`;

export const swing = keyframes`
  15% {
    transform: rotate(15deg);
  }
  30% {
    transform: rotate(-10deg);
  }
  40% {
    transform: rotate(8deg);
  }
  50% {
    transform: rotate(-5deg);
  }
  65% {
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-1deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

export const wobble = keyframes`
  0% {
    transform: none;
  }
  15% {
    transform: translate3d(-25%, 0, 0) rotate(-5deg);
  }
  30% {
    transform: translate3d(20%, 0, 0) rotate(3deg);
  }
  45% {
    transform: translate3d(-15%, 0, 0) rotate(-3deg);
  }
  60% {
    transform: translate3d(10%, 0, 0) rotate(2deg);
  }
  75% {
    transform: translate3d(-5%, 0, 0) rotate(-1deg);
  }
  100% {
    transform: none;
  }
`;

// Animation component interfaces
export interface AnimationProps extends StyleProps {
  animation?: string;
  duration?: 'fast' | 'normal' | 'slow' | string;
  delay?: string;
  iteration?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  playState?: 'running' | 'paused';
  timingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
}

export interface TransitionProps extends StyleProps {
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: 'fast' | 'normal' | 'slow' | string;
  transitionDelay?: string;
  transitionTimingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
}

// Animation utility functions
const getAnimationDuration = (duration: string, theme: Theme): string => {
  switch (duration) {
    case 'fast':
      return theme.transitions.duration.fast;
    case 'normal':
      return theme.transitions.duration.normal;
    case 'slow':
      return theme.transitions.duration.slow;
    default:
      return duration;
  }
};

const getTimingFunction = (timingFunction: string, theme: Theme): string => {
  switch (timingFunction) {
    case 'ease-in':
      return theme.transitions.easing.easeIn;
    case 'ease-out':
      return theme.transitions.easing.easeOut;
    case 'ease-in-out':
      return theme.transitions.easing.easeInOut;
    default:
      return timingFunction;
  }
};

// Animation component
export const Animated = styled(Box)<AnimationProps>`
  ${({ 
    animation,
    duration = 'normal',
    delay = '0s',
    iteration = 1,
    direction = 'normal',
    fillMode = 'none',
    playState = 'running',
    timingFunction = 'ease',
    theme
  }) => animation && css`
    animation-name: ${animation};
    animation-duration: ${getAnimationDuration(duration, theme)};
    animation-delay: ${delay};
    animation-iteration-count: ${iteration};
    animation-direction: ${direction};
    animation-fill-mode: ${fillMode};
    animation-play-state: ${playState};
    animation-timing-function: ${getTimingFunction(timingFunction, theme)};
  `}
  
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
`;

// Transition component
export const Transition = styled(Box)<TransitionProps>`
  ${({ 
    transition,
    transitionProperty = 'all',
    transitionDuration = 'normal',
    transitionDelay = '0s',
    transitionTimingFunction = 'ease',
    theme
  }) => css`
    transition-property: ${transition ? 'all' : transitionProperty};
    transition-duration: ${transition ? theme.transitions.duration.normal : getAnimationDuration(transitionDuration, theme)};
    transition-delay: ${transitionDelay};
    transition-timing-function: ${transition ? theme.transitions.easing.easeInOut : getTimingFunction(transitionTimingFunction, theme)};
    
    ${transition && css`
      transition: ${transition};
    `}
  `}
  
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms !important;
  }
`;

// Pre-built animation components
export const FadeIn = styled(Animated)`
  animation-name: ${fadeIn};
`;

export const FadeOut = styled(Animated)`
  animation-name: ${fadeOut};
`;

export const SlideInUp = styled(Animated)`
  animation-name: ${slideInUp};
`;

export const SlideInDown = styled(Animated)`
  animation-name: ${slideInDown};
`;

export const SlideInLeft = styled(Animated)`
  animation-name: ${slideInLeft};
`;

export const SlideInRight = styled(Animated)`
  animation-name: ${slideInRight};
`;

export const ScaleIn = styled(Animated)`
  animation-name: ${scaleIn};
`;

export const ZoomIn = styled(Animated)`
  animation-name: ${zoomIn};
`;

export const Bounce = styled(Animated)`
  animation-name: ${bounce};
`;

export const Pulse = styled(Animated)`
  animation-name: ${pulse};
  animation-iteration-count: infinite;
`;

export const Spin = styled(Animated)`
  animation-name: ${spin};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;

export const Shake = styled(Animated)`
  animation-name: ${shake};
`;

export const Flash = styled(Animated)`
  animation-name: ${flash};
`;

// Hover animation utilities
export const hoverAnimations = {
  lift: css`
    transition: transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      transform: translateY(-2px);
    }
  `,
  
  scale: css`
    transition: transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      transform: scale(1.05);
    }
  `,
  
  rotate: css`
    transition: transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      transform: rotate(5deg);
    }
  `,
  
  glow: css`
    transition: box-shadow ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      box-shadow: 0 0 20px ${({ theme }) => theme.colors.primary[300]};
    }
  `,
  
  fadeIn: css`
    opacity: 0.8;
    transition: opacity ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      opacity: 1;
    }
  `,
  
  slideUp: css`
    transition: transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:hover {
      transform: translateY(-4px);
    }
  `,
};

// Loading animation utilities
export const loadingAnimations = {
  spinner: css`
    animation: ${spin} 1s linear infinite;
  `,
  
  pulse: css`
    animation: ${pulse} 2s infinite;
  `,
  
  bounce: css`
    animation: ${bounce} 1s infinite;
  `,
  
  dots: css`
    &::after {
      content: '';
      animation: ${flash} 1.5s infinite;
    }
  `,
  
  skeleton: css`
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.background.secondary} 25%,
      ${({ theme }) => theme.colors.background.tertiary} 50%,
      ${({ theme }) => theme.colors.background.secondary} 75%
    );
    background-size: 200% 100%;
    animation: ${keyframes`
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    `} 2s ease-in-out infinite;
  `,
};

// Focus animation utilities
export const focusAnimations = {
  ring: css`
    transition: box-shadow ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[200]};
    }
  `,
  
  scale: css`
    transition: transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:focus {
      outline: none;
      transform: scale(1.02);
    }
  `,
  
  glow: css`
    transition: box-shadow ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeOut};
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[500]};
    }
  `,
};

// Animation utilities
export const animationUtils = {
  // Entrance animations
  entrance: {
    fadeIn: css`animation: ${fadeIn} 0.3s ease-out;`,
    slideInUp: css`animation: ${slideInUp} 0.3s ease-out;`,
    slideInDown: css`animation: ${slideInDown} 0.3s ease-out;`,
    slideInLeft: css`animation: ${slideInLeft} 0.3s ease-out;`,
    slideInRight: css`animation: ${slideInRight} 0.3s ease-out;`,
    scaleIn: css`animation: ${scaleIn} 0.3s ease-out;`,
    zoomIn: css`animation: ${zoomIn} 0.3s ease-out;`,
    rotateIn: css`animation: ${rotateIn} 0.3s ease-out;`,
  },
  
  // Exit animations
  exit: {
    fadeOut: css`animation: ${fadeOut} 0.3s ease-in;`,
    slideOutUp: css`animation: ${slideOutUp} 0.3s ease-in;`,
    slideOutDown: css`animation: ${slideOutDown} 0.3s ease-in;`,
    slideOutLeft: css`animation: ${slideOutLeft} 0.3s ease-in;`,
    slideOutRight: css`animation: ${slideOutRight} 0.3s ease-in;`,
    scaleOut: css`animation: ${scaleOut} 0.3s ease-in;`,
    zoomOut: css`animation: ${zoomOut} 0.3s ease-in;`,
    rotateOut: css`animation: ${rotateOut} 0.3s ease-in;`,
  },
  
  // Attention animations
  attention: {
    bounce: css`animation: ${bounce} 1s;`,
    shake: css`animation: ${shake} 0.82s;`,
    pulse: css`animation: ${pulse} 2s infinite;`,
    heartbeat: css`animation: ${heartbeat} 1.5s infinite;`,
    flash: css`animation: ${flash} 2s infinite;`,
    rubberBand: css`animation: ${rubberBand} 1s;`,
    swing: css`animation: ${swing} 1s;`,
    wobble: css`animation: ${wobble} 1s;`,
  },
  
  // Loading animations
  loading: loadingAnimations,
  
  // Hover animations
  hover: hoverAnimations,
  
  // Focus animations
  focus: focusAnimations,
  
  // Utility functions
  stagger: (delay: number, index: number) => css`
    animation-delay: ${delay * index}ms;
  `,
  
  duration: (duration: string) => css`
    animation-duration: ${duration};
  `,
  
  delay: (delay: string) => css`
    animation-delay: ${delay};
  `,
  
  infinite: css`
    animation-iteration-count: infinite;
  `,
  
  once: css`
    animation-iteration-count: 1;
  `,
  
  paused: css`
    animation-play-state: paused;
  `,
  
  running: css`
    animation-play-state: running;
  `,
};

export default {
  // Keyframes
  fadeIn,
  fadeOut,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  slideOutUp,
  slideOutDown,
  slideOutLeft,
  slideOutRight,
  scaleIn,
  scaleOut,
  zoomIn,
  zoomOut,
  rotateIn,
  rotateOut,
  bounce,
  shake,
  pulse,
  spin,
  heartbeat,
  flash,
  rubberBand,
  swing,
  wobble,
  
  // Components
  Animated,
  Transition,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  ScaleIn,
  ZoomIn,
  Bounce,
  Pulse,
  Spin,
  Shake,
  Flash,
  
  // Utilities
  animationUtils,
  hoverAnimations,
  loadingAnimations,
  focusAnimations,
};
