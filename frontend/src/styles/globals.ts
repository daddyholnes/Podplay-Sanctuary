/**
 * Podplay Sanctuary - Global Styles
 * 
 * Base global styles with CSS reset, typography defaults,
 * accessibility improvements, and foundational styling.
 * Includes modern CSS best practices and performance optimizations.
 */

import { css } from 'styled-components';
import { Theme } from './theme';

export const globalStyles = (theme: Theme) => css`
  /* CSS Reset and Normalization */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.normal};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.text.primary};
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
    
    @media (max-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.typography.fontSize['3xl']};
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      font-size: ${theme.typography.fontSize['2xl']};
    }
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
    
    @media (max-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.typography.fontSize['2xl']};
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      font-size: ${theme.typography.fontSize.xl};
    }
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
    
    @media (max-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.typography.fontSize.xl};
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      font-size: ${theme.typography.fontSize.lg};
    }
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      font-size: ${theme.typography.fontSize.lg};
    }
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.medium};
  }

  p {
    margin-bottom: ${theme.spacing.md};
    line-height: ${theme.typography.lineHeight.relaxed};
    color: ${theme.colors.text.secondary};
  }

  a {
    color: ${theme.colors.primary[600]};
    text-decoration: none;
    transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
    
    &:hover {
      color: ${theme.colors.primary[700]};
      text-decoration: underline;
    }
    
    &:focus {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
      border-radius: ${theme.radii.sm};
    }
    
    &:focus:not(:focus-visible) {
      outline: none;
    }
  }

  /* Lists */
  ul, ol {
    margin-bottom: ${theme.spacing.md};
    padding-left: ${theme.spacing.lg};
  }

  li {
    margin-bottom: ${theme.spacing.xs};
  }

  /* Code */
  code {
    font-family: ${theme.typography.fontFamily.mono};
    font-size: 0.875em;
    background-color: ${theme.colors.background.secondary};
    padding: 0.125rem 0.25rem;
    border-radius: ${theme.radii.sm};
    color: ${theme.colors.text.primary};
  }

  pre {
    font-family: ${theme.typography.fontFamily.mono};
    font-size: ${theme.typography.fontSize.sm};
    background-color: ${theme.colors.background.secondary};
    padding: ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    overflow-x: auto;
    margin-bottom: ${theme.spacing.md};
    
    code {
      background: none;
      padding: 0;
    }
  }

  /* Form Elements */
  input,
  textarea,
  select,
  button {
    font-family: inherit;
    font-size: inherit;
  }

  input,
  textarea,
  select {
    border: 1px solid ${theme.colors.border.primary};
    border-radius: ${theme.radii.md};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};
    transition: border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
    }
    
    &:disabled {
      background-color: ${theme.colors.background.secondary};
      color: ${theme.colors.text.tertiary};
      cursor: not-allowed;
    }
    
    &::placeholder {
      color: ${theme.colors.text.placeholder};
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    &:focus {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
    }
    
    &:focus:not(:focus-visible) {
      outline: none;
    }
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: ${theme.spacing.md};
  }

  th,
  td {
    text-align: left;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.border.primary};
  }

  th {
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.secondary};
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Horizontal Rule */
  hr {
    border: none;
    height: 1px;
    background-color: ${theme.colors.border.primary};
    margin: ${theme.spacing.xl} 0;
  }

  /* Blockquote */
  blockquote {
    border-left: 4px solid ${theme.colors.primary[500]};
    padding-left: ${theme.spacing.md};
    margin: ${theme.spacing.lg} 0;
    font-style: italic;
    color: ${theme.colors.text.secondary};
  }

  /* Selection */
  ::selection {
    background-color: ${theme.colors.primary[200]};
    color: ${theme.colors.text.primary};
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.neutral[400]};
    border-radius: ${theme.radii.full};
    
    &:hover {
      background: ${theme.colors.neutral[500]};
    }
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${theme.colors.neutral[400]} ${theme.colors.background.secondary};
  }

  /* Focus ring for keyboard navigation */
  .js-focus-visible :focus:not(.focus-visible) {
    outline: none;
  }

  .focus-visible {
    outline: 2px solid ${theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Skip to content link */
  .skip-to-content {
    position: absolute;
    top: -40px;
    left: 6px;
    background: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};
    padding: 8px;
    border-radius: ${theme.radii.md};
    text-decoration: none;
    z-index: ${theme.zIndices.notification};
    
    &:focus {
      top: 6px;
    }
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      outline-width: 2px !important;
    }
    
    button,
    input,
    textarea,
    select {
      border-width: 2px !important;
    }
  }

  /* Print styles */
  @media print {
    *,
    *::before,
    *::after {
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
      content: " (" attr(href) ")";
    }
    
    abbr[title]::after {
      content: " (" attr(title) ")";
    }
    
    a[href^="#"]::after,
    a[href^="javascript:"]::after {
      content: "";
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

  /* Loading and error states */
  .loading {
    opacity: 0.7;
    pointer-events: none;
    cursor: wait;
  }

  .error {
    color: ${theme.colors.semantic.error};
  }

  .success {
    color: ${theme.colors.semantic.success};
  }

  .warning {
    color: ${theme.colors.semantic.warning};
  }

  .info {
    color: ${theme.colors.semantic.info};
  }

  /* Utility classes */
  .visually-hidden {
    position: absolute !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    overflow: hidden !important;
    height: 1px !important;
    width: 1px !important;
    word-wrap: normal !important;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .break-words {
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* Animation classes */
  .fade-in {
    animation: fadeIn ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut};
  }

  .fade-out {
    animation: fadeOut ${theme.transitions.duration.normal} ${theme.transitions.easing.easeIn};
  }

  .slide-up {
    animation: slideUp ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut};
  }

  .slide-down {
    animation: slideDown ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut};
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export default globalStyles;
