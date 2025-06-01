/**
 * Accessibility Utilities
 * 
 * Provides comprehensive accessibility utilities, ARIA helpers,
 * screen reader support, and WCAG compliance tools.
 */

import { RefObject } from 'react';

/**
 * Accessibility configuration
 */
export const ACCESSIBILITY_CONFIG = {
  // ARIA live region politeness levels
  liveRegion: {
    polite: 'polite' as const,
    assertive: 'assertive' as const,
    off: 'off' as const,
  },
  
  // Focus management
  focus: {
    skipLinksId: 'skip-links',
    mainContentId: 'main-content',
    trapClass: 'focus-trap',
  },
  
  // Screen reader
  screenReader: {
    hideClass: 'sr-only',
    showClass: 'sr-only-focusable',
    liveRegionId: 'live-region',
  },
  
  // Keyboard navigation
  keyboard: {
    tabbableSelectors: [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', '),
  },
  
  // Color contrast ratios (WCAG AA)
  contrast: {
    normal: 4.5,
    large: 3,
    enhanced: 7, // WCAG AAA
  },
} as const;

/**
 * ARIA attributes helper
 */
export const ariaAttributes = {
  /**
   * Generate ARIA attributes for expanded/collapsed state
   */
  expanded(isExpanded: boolean): { 'aria-expanded': boolean } {
    return { 'aria-expanded': isExpanded };
  },

  /**
   * Generate ARIA attributes for selected state
   */
  selected(isSelected: boolean): { 'aria-selected': boolean } {
    return { 'aria-selected': isSelected };
  },

  /**
   * Generate ARIA attributes for checked state
   */
  checked(isChecked: boolean | 'mixed'): { 'aria-checked': boolean | 'mixed' } {
    return { 'aria-checked': isChecked };
  },

  /**
   * Generate ARIA attributes for pressed state
   */
  pressed(isPressed: boolean): { 'aria-pressed': boolean } {
    return { 'aria-pressed': isPressed };
  },

  /**
   * Generate ARIA attributes for disabled state
   */
  disabled(isDisabled: boolean): { 'aria-disabled': boolean } {
    return { 'aria-disabled': isDisabled };
  },

  /**
   * Generate ARIA attributes for hidden state
   */
  hidden(isHidden: boolean): { 'aria-hidden': boolean } {
    return { 'aria-hidden': isHidden };
  },

  /**
   * Generate ARIA attributes for invalid state
   */
  invalid(isInvalid: boolean): { 'aria-invalid': boolean } {
    return { 'aria-invalid': isInvalid };
  },

  /**
   * Generate ARIA attributes for required state
   */
  required(isRequired: boolean): { 'aria-required': boolean } {
    return { 'aria-required': isRequired };
  },

  /**
   * Generate ARIA label attributes
   */
  label(label: string): { 'aria-label': string } {
    return { 'aria-label': label };
  },

  /**
   * Generate ARIA labelledby attributes
   */
  labelledBy(ids: string | string[]): { 'aria-labelledby': string } {
    const idString = Array.isArray(ids) ? ids.join(' ') : ids;
    return { 'aria-labelledby': idString };
  },

  /**
   * Generate ARIA describedby attributes
   */
  describedBy(ids: string | string[]): { 'aria-describedby': string } {
    const idString = Array.isArray(ids) ? ids.join(' ') : ids;
    return { 'aria-describedby': idString };
  },

  /**
   * Generate ARIA live region attributes
   */
  live(politeness: 'polite' | 'assertive' | 'off' = 'polite'): {
    'aria-live': 'polite' | 'assertive' | 'off';
    'aria-atomic': boolean;
  } {
    return {
      'aria-live': politeness,
      'aria-atomic': true,
    };
  },

  /**
   * Generate ARIA controls attributes
   */
  controls(targetId: string): { 'aria-controls': string } {
    return { 'aria-controls': targetId };
  },

  /**
   * Generate ARIA owns attributes
   */
  owns(ids: string | string[]): { 'aria-owns': string } {
    const idString = Array.isArray(ids) ? ids.join(' ') : ids;
    return { 'aria-owns': idString };
  },

  /**
   * Generate ARIA role attributes
   */
  role(role: string): { role: string } {
    return { role };
  },

  /**
   * Generate ARIA level attributes (for headings)
   */
  level(level: number): { 'aria-level': number } {
    return { 'aria-level': Math.max(1, Math.min(6, level)) };
  },

  /**
   * Generate ARIA position attributes
   */
  positionInSet(position: number, setSize: number): {
    'aria-posinset': number;
    'aria-setsize': number;
  } {
    return {
      'aria-posinset': position,
      'aria-setsize': setSize,
    };
  },
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: Element = document.body): Element[] {
    return Array.from(
      container.querySelectorAll(ACCESSIBILITY_CONFIG.keyboard.tabbableSelectors)
    ).filter((element) => {
      return (
        !element.hasAttribute('disabled') &&
        !element.getAttribute('aria-hidden') &&
        element.getAttribute('tabindex') !== '-1' &&
        this.isVisible(element)
      );
    });
  },

  /**
   * Check if element is visible
   */
  isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  },

  /**
   * Focus the first focusable element in container
   */
  focusFirst(container: Element = document.body): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
      return true;
    }
    return false;
  },

  /**
   * Focus the last focusable element in container
   */
  focusLast(container: Element = document.body): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      (focusable[focusable.length - 1] as HTMLElement).focus();
      return true;
    }
    return false;
  },

  /**
   * Focus next focusable element
   */
  focusNext(currentElement?: Element): boolean {
    const focusable = this.getFocusableElements();
    const current = currentElement || document.activeElement;
    
    if (!current) return this.focusFirst();
    
    const currentIndex = focusable.indexOf(current);
    if (currentIndex >= 0 && currentIndex < focusable.length - 1) {
      (focusable[currentIndex + 1] as HTMLElement).focus();
      return true;
    }
    
    return this.focusFirst(); // Wrap around
  },

  /**
   * Focus previous focusable element
   */
  focusPrevious(currentElement?: Element): boolean {
    const focusable = this.getFocusableElements();
    const current = currentElement || document.activeElement;
    
    if (!current) return this.focusLast();
    
    const currentIndex = focusable.indexOf(current);
    if (currentIndex > 0) {
      (focusable[currentIndex - 1] as HTMLElement).focus();
      return true;
    }
    
    return this.focusLast(); // Wrap around
  },

  /**
   * Trap focus within a container
   */
  trapFocus(container: Element): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusable = this.getFocusableElements(container);
        if (focusable.length === 0) return;

        const firstFocusable = focusable[0] as HTMLElement;
        const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.classList.add(ACCESSIBILITY_CONFIG.focus.trapClass);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.classList.remove(ACCESSIBILITY_CONFIG.focus.trapClass);
    };
  },

  /**
   * Save and restore focus
   */
  createFocusManager(): {
    save: () => void;
    restore: () => void;
    clear: () => void;
  } {
    let savedElement: Element | null = null;

    return {
      save: () => {
        savedElement = document.activeElement;
      },
      restore: () => {
        if (savedElement && this.isVisible(savedElement)) {
          (savedElement as HTMLElement).focus();
        }
      },
      clear: () => {
        savedElement = null;
      },
    };
  },
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Create a live region for announcements
   */
  createLiveRegion(
    politeness: 'polite' | 'assertive' = 'polite'
  ): {
    announce: (message: string) => void;
    clear: () => void;
    remove: () => void;
  } {
    let liveRegion = document.getElementById(ACCESSIBILITY_CONFIG.screenReader.liveRegionId);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = ACCESSIBILITY_CONFIG.screenReader.liveRegionId;
      liveRegion.className = ACCESSIBILITY_CONFIG.screenReader.hideClass;
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }

    return {
      announce: (message: string) => {
        if (liveRegion) {
          liveRegion.textContent = message;
        }
      },
      clear: () => {
        if (liveRegion) {
          liveRegion.textContent = '';
        }
      },
      remove: () => {
        if (liveRegion && liveRegion.parentNode) {
          liveRegion.parentNode.removeChild(liveRegion);
        }
      },
    };
  },

  /**
   * Announce message to screen readers
   */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = this.createLiveRegion(politeness);
    liveRegion.announce(message);
    
    // Clear after a delay to allow re-announcement of same message
    setTimeout(() => liveRegion.clear(), 1000);
  },

  /**
   * Check if screen reader is active
   */
  isScreenReaderActive(): boolean {
    // This is a heuristic check - not 100% reliable
    return (
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis?.getVoices().length > 0 ||
      false
    );
  },

  /**
   * Create skip links
   */
  createSkipLinks(links: { href: string; text: string }[]): void {
    let skipLinksContainer = document.getElementById(ACCESSIBILITY_CONFIG.focus.skipLinksId);
    
    if (!skipLinksContainer) {
      skipLinksContainer = document.createElement('div');
      skipLinksContainer.id = ACCESSIBILITY_CONFIG.focus.skipLinksId;
      skipLinksContainer.className = ACCESSIBILITY_CONFIG.screenReader.hideClass;
      document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    }

    skipLinksContainer.innerHTML = links
      .map(
        (link) =>
          `<a href="${link.href}" class="${ACCESSIBILITY_CONFIG.screenReader.showClass}">${link.text}</a>`
      )
      .join('');
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation
   */
  handleArrowNavigation(
    event: KeyboardEvent,
    elements: Element[],
    currentIndex: number,
    options: {
      loop?: boolean;
      horizontal?: boolean;
      vertical?: boolean;
    } = {}
  ): number {
    const { loop = true, horizontal = true, vertical = true } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= elements.length) {
            newIndex = loop ? 0 : elements.length - 1;
          }
        }
        break;

      case 'ArrowUp':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? elements.length - 1 : 0;
          }
        }
        break;

      case 'ArrowRight':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= elements.length) {
            newIndex = loop ? 0 : elements.length - 1;
          }
        }
        break;

      case 'ArrowLeft':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? elements.length - 1 : 0;
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = elements.length - 1;
        break;
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      (elements[newIndex] as HTMLElement).focus();
    }

    return newIndex;
  },

  /**
   * Handle escape key
   */
  handleEscape(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Handle enter/space activation
   */
  handleActivation(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance of a color
   */
  calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAG(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean {
    const ratio = this.calculateContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  },

  /**
   * Suggest better contrast color
   */
  suggestBetterContrast(
    backgroundColor: string,
    textColor: string,
    targetRatio: number = ACCESSIBILITY_CONFIG.contrast.normal
  ): string {
    const bgRgb = this.hexToRgb(backgroundColor);
    const textRgb = this.hexToRgb(textColor);
    
    if (!bgRgb || !textRgb) return textColor;

    const bgLuminance = this.calculateLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    // Determine if we should go darker or lighter
    const shouldGoDarker = bgLuminance > 0.5;
    
    if (shouldGoDarker) {
      // Make text darker
      return this.adjustBrightness(textColor, -0.1);
    } else {
      // Make text lighter
      return this.adjustBrightness(textColor, 0.1);
    }
  },

  /**
   * Adjust color brightness
   */
  adjustBrightness(color: string, factor: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const adjust = (value: number) => {
      const adjusted = value + (factor * 255);
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };

    const newR = adjust(rgb.r);
    const newG = adjust(rgb.g);
    const newB = adjust(rgb.b);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  },
};

/**
 * Reduced motion utilities
 */
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get appropriate animation duration based on user preference
   */
  getAnimationDuration(normalDuration: number): number {
    return this.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Apply reduced motion styles conditionally
   */
  applyReducedMotionStyles(element: HTMLElement): void {
    if (this.prefersReducedMotion()) {
      element.style.animationDuration = '0s';
      element.style.transitionDuration = '0s';
    }
  },
};

/**
 * WCAG compliance checker
 */
export const wcagChecker = {
  /**
   * Check page for common accessibility issues
   */
  checkPage(): {
    score: number;
    issues: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index + 1} missing alt text`);
        score -= 5;
      }
    });

    // Check for heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.slice(1));
      if (index === 0 && level !== 1) {
        warnings.push('Page should start with h1');
        score -= 3;
      }
      if (level - previousLevel > 1) {
        warnings.push(`Heading level skipped: ${heading.tagName}`);
        score -= 2;
      }
      previousLevel = level;
    });

    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = input.labels?.length > 0 || 
                     input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby');
      if (!hasLabel) {
        issues.push(`Form input ${index + 1} missing label`);
        score -= 5;
      }
    });

    // Check for focus indicators
    const focusableElements = focusUtils.getFocusableElements();
    focusableElements.forEach((element) => {
      const style = window.getComputedStyle(element, ':focus');
      if (style.outline === 'none' && !style.boxShadow) {
        warnings.push('Some elements may lack focus indicators');
        score -= 2;
      }
    });

    // Check for sufficient color contrast
    const textElements = document.querySelectorAll('p, span, div, a, button, label');
    textElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      if (color && backgroundColor && color !== backgroundColor) {
        // This would require more complex color parsing in a real implementation
        // For now, just add a recommendation
        recommendations.push('Verify color contrast meets WCAG standards');
      }
    });

    // Add general recommendations
    if (issues.length === 0 && warnings.length === 0) {
      recommendations.push('Consider adding skip links for keyboard navigation');
      recommendations.push('Test with screen readers');
      recommendations.push('Verify all interactive elements are keyboard accessible');
    }

    return {
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations,
    };
  },
};

/**
 * React accessibility hooks
 */
export const useAccessibility = () => {
  const announcer = screenReaderUtils.createLiveRegion();
  
  return {
    announce: announcer.announce,
    focusUtils,
    ariaAttributes,
    keyboardUtils,
  };
};

/**
 * Export all accessibility utilities
 */
export default {
  // Configuration
  ACCESSIBILITY_CONFIG,
  
  // ARIA helpers
  ariaAttributes,
  
  // Focus management
  focusUtils,
  
  // Screen reader support
  screenReaderUtils,
  
  // Keyboard navigation
  keyboardUtils,
  
  // Color contrast
  contrastUtils,
  
  // Reduced motion
  motionUtils,
  
  // WCAG compliance
  wcagChecker,
  
  // React hook
  useAccessibility,
};
