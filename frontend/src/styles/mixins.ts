/**
 * Podplay Sanctuary - CSS Mixins
 * 
 * Reusable CSS mixins for common styling patterns,
 * complex visual effects, and consistent component styling.
 * Provides a library of tested and optimized style utilities.
 */

import { css } from 'styled-components';
import { Theme } from './theme';

// Typography mixins
export const textTruncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const textLineClamp = (lines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const textGradient = (gradient: string) => css`
  background: ${gradient};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

export const textOutline = (color: string, width: string = '1px') => css`
  text-shadow: 
    -${width} -${width} 0 ${color},
    ${width} -${width} 0 ${color},
    -${width} ${width} 0 ${color},
    ${width} ${width} 0 ${color};
`;

export const textShadowGlow = (color: string, blur: string = '10px') => css`
  text-shadow: 0 0 ${blur} ${color};
`;

// Layout mixins
export const absoluteCenter = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const fixedCenter = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const flexColumnCenter = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const gridCenter = css`
  display: grid;
  place-items: center;
`;

export const aspectRatio = (ratio: number) => css`
  position: relative;
  
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: ${(1 / ratio) * 100}%;
  }
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const fullSize = css`
  width: 100%;
  height: 100%;
`;

export const fullScreen = css`
  width: 100vw;
  height: 100vh;
`;

// Visual mixins
export const glassmorphism = (blur: string = '10px', opacity: number = 0.1) => css`
  backdrop-filter: blur(${blur});
  background: rgba(255, 255, 255, ${opacity});
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const neumorphism = (theme: Theme, inset: boolean = false) => css`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.radii.lg};
  box-shadow: 
    ${inset ? 'inset' : ''} 6px 6px 12px ${theme.mode === 'dark' ? '#1a1a1a' : '#d1d9e6'},
    ${inset ? 'inset' : ''} -6px -6px 12px ${theme.mode === 'dark' ? '#2a2a2a' : '#ffffff'};
`;

export const gradientBorder = (gradient: string, width: string = '2px', radius: string = '8px') => css`
  position: relative;
  background: ${gradient};
  border-radius: ${radius};
  padding: ${width};
  
  &::before {
    content: '';
    position: absolute;
    top: ${width};
    left: ${width};
    right: ${width};
    bottom: ${width};
    background: inherit;
    border-radius: calc(${radius} - ${width});
    z-index: -1;
  }
`;

export const cardElevation = (level: number, theme: Theme) => {
  const elevations = {
    1: theme.shadows.sm,
    2: theme.shadows.md,
    3: theme.shadows.lg,
    4: theme.shadows.xl,
    5: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };
  
  return css`
    box-shadow: ${elevations[level as keyof typeof elevations] || elevations[1]};
  `;
};

export const overlayGradient = (direction: string = 'to bottom', colors: string[] = ['transparent', 'rgba(0, 0, 0, 0.7)']) => css`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(${direction}, ${colors.join(', ')});
    pointer-events: none;
  }
`;

// Interaction mixins
export const buttonReset = css`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  font: inherit;
  outline: none;
`;

export const linkReset = css`
  color: inherit;
  text-decoration: none;
  
  &:hover,
  &:focus,
  &:active {
    color: inherit;
    text-decoration: none;
  }
`;

export const listReset = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const inputReset = css`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  outline: none;
  
  &::-webkit-input-placeholder {
    color: inherit;
  }
  
  &::-moz-placeholder {
    color: inherit;
  }
  
  &:-ms-input-placeholder {
    color: inherit;
  }
  
  &::placeholder {
    color: inherit;
  }
`;

export const hoverLift = (distance: string = '2px') => css`
  transition: transform 0.2s ease-out;
  
  &:hover {
    transform: translateY(-${distance});
  }
`;

export const hoverScale = (scale: number = 1.05) => css`
  transition: transform 0.2s ease-out;
  
  &:hover {
    transform: scale(${scale});
  }
`;

export const focusRing = (theme: Theme, color?: string) => css`
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${color || theme.colors.primary[200]};
  }
  
  &:focus:not(:focus-visible) {
    box-shadow: none;
  }
`;

export const activePress = css`
  transition: transform 0.1s ease-in-out;
  
  &:active {
    transform: scale(0.98);
  }
`;

// Scrollbar mixins
export const customScrollbar = (theme: Theme, width: string = '8px') => css`
  &::-webkit-scrollbar {
    width: ${width};
    height: ${width};
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: ${theme.radii.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.neutral[400]};
    border-radius: ${theme.radii.full};
    
    &:hover {
      background: ${theme.colors.neutral[500]};
    }
  }
  
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.neutral[400]} ${theme.colors.background.secondary};
`;

export const hideScrollbar = css`
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

// Animation mixins
export const smoothTransition = (properties: string[] = ['all'], duration: string = '0.2s') => css`
  transition: ${properties.join(', ')} ${duration} ease-in-out;
`;

export const bounceIn = css`
  animation: bounceIn 0.6s ease-out;
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const slideInFromLeft = css`
  animation: slideInFromLeft 0.3s ease-out;
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const fadeInUp = css`
  animation: fadeInUp 0.3s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const pulseGlow = (color: string) => css`
  animation: pulseGlow 2s ease-in-out infinite alternate;
  
  @keyframes pulseGlow {
    from {
      box-shadow: 0 0 5px ${color};
    }
    to {
      box-shadow: 0 0 20px ${color}, 0 0 30px ${color};
    }
  }
`;

// Form mixins
export const formControl = (theme: Theme) => css`
  display: block;
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: ${theme.colors.border.focus};
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.secondary};
    opacity: 0.6;
  }
  
  &::placeholder {
    color: ${theme.colors.text.placeholder};
    opacity: 1;
  }
`;

export const formLabel = (theme: Theme) => css`
  display: inline-block;
  margin-bottom: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

export const formError = (theme: Theme) => css`
  display: block;
  width: 100%;
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.semantic.error};
`;

export const formGroup = (theme: Theme) => css`
  margin-bottom: ${theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Grid mixins
export const gridAutoFit = (minWidth: string = '300px', gap: string = '1rem') => css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${minWidth}, 1fr));
  gap: ${gap};
`;

export const gridAutoFill = (minWidth: string = '300px', gap: string = '1rem') => css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${minWidth}, 1fr));
  gap: ${gap};
`;

export const gridCenter = css`
  display: grid;
  place-items: center;
`;

// Utility mixins
export const visuallyHidden = css`
  position: absolute !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  overflow: hidden !important;
  height: 1px !important;
  width: 1px !important;
  word-wrap: normal !important;
`;

export const clearfix = css`
  &::after {
    content: '';
    display: table;
    clear: both;
  }
`;

export const wordWrap = css`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

export const userSelectNone = css`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const pointerEventsNone = css`
  pointer-events: none;
`;

export const cursorPointer = css`
  cursor: pointer;
`;

export const cursorNotAllowed = css`
  cursor: not-allowed;
`;

// Responsive mixins
export const respondTo = {
  mobile: (styles: any) => css`
    @media (max-width: 767px) {
      ${styles}
    }
  `,
  tablet: (styles: any) => css`
    @media (min-width: 768px) and (max-width: 1023px) {
      ${styles}
    }
  `,
  desktop: (styles: any) => css`
    @media (min-width: 1024px) {
      ${styles}
    }
  `,
  wide: (styles: any) => css`
    @media (min-width: 1440px) {
      ${styles}
    }
  `,
  between: (min: string, max: string) => (styles: any) => css`
    @media (min-width: ${min}) and (max-width: ${max}) {
      ${styles}
    }
  `,
};

// Print mixins
export const printHidden = css`
  @media print {
    display: none !important;
  }
`;

export const printOnly = css`
  display: none;
  
  @media print {
    display: block !important;
  }
`;

export const printStyles = css`
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    
    a,
    a:visited {
      text-decoration: underline;
    }
    
    a[href]::after {
      content: ' (' attr(href) ')';
    }
    
    abbr[title]::after {
      content: ' (' attr(title) ')';
    }
    
    pre,
    blockquote {
      border: 1px solid #999;
      page-break-inside: avoid;
    }
    
    thead {
      display: table-header-group;
    }
    
    tr,
    img {
      page-break-inside: avoid;
    }
    
    img {
      max-width: 100% !important;
    }
    
    p,
    h2,
    h3 {
      orphans: 3;
      widows: 3;
    }
    
    h2,
    h3 {
      page-break-after: avoid;
    }
  }
`;

// Export all mixins
export default {
  // Typography
  textTruncate,
  textLineClamp,
  textGradient,
  textOutline,
  textShadowGlow,
  
  // Layout
  absoluteCenter,
  fixedCenter,
  flexCenter,
  flexBetween,
  flexColumn,
  flexColumnCenter,
  gridCenter,
  aspectRatio,
  fullSize,
  fullScreen,
  
  // Visual
  glassmorphism,
  neumorphism,
  gradientBorder,
  cardElevation,
  overlayGradient,
  
  // Interaction
  buttonReset,
  linkReset,
  listReset,
  inputReset,
  hoverLift,
  hoverScale,
  focusRing,
  activePress,
  
  // Scrollbar
  customScrollbar,
  hideScrollbar,
  
  // Animation
  smoothTransition,
  bounceIn,
  slideInFromLeft,
  fadeInUp,
  pulseGlow,
  
  // Form
  formControl,
  formLabel,
  formError,
  formGroup,
  
  // Grid
  gridAutoFit,
  gridAutoFill,
  
  // Utility
  visuallyHidden,
  clearfix,
  wordWrap,
  userSelectNone,
  pointerEventsNone,
  cursorPointer,
  cursorNotAllowed,
  
  // Responsive
  respondTo,
  
  // Print
  printHidden,
  printOnly,
  printStyles,
};
