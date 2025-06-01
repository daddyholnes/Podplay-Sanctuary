/**
 * Podplay Sanctuary - Responsive Utilities
 * 
 * Comprehensive responsive design utilities for consistent
 * cross-device experiences. Includes breakpoint helpers,
 * responsive typography, spacing, and component utilities.
 */

import { css } from 'styled-components';
import { Theme } from './theme';

// Breakpoint definitions
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultrawide: '1920px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media query helpers
export const media = {
  // Mobile first approach
  mobile: (styles: any) => css`
    @media (min-width: ${breakpoints.mobile}) {
      ${styles}
    }
  `,
  tablet: (styles: any) => css`
    @media (min-width: ${breakpoints.tablet}) {
      ${styles}
    }
  `,
  desktop: (styles: any) => css`
    @media (min-width: ${breakpoints.desktop}) {
      ${styles}
    }
  `,
  wide: (styles: any) => css`
    @media (min-width: ${breakpoints.wide}) {
      ${styles}
    }
  `,
  ultrawide: (styles: any) => css`
    @media (min-width: ${breakpoints.ultrawide}) {
      ${styles}
    }
  `,
  
  // Desktop first approach
  maxMobile: (styles: any) => css`
    @media (max-width: ${breakpoints.mobile}) {
      ${styles}
    }
  `,
  maxTablet: (styles: any) => css`
    @media (max-width: ${breakpoints.tablet}) {
      ${styles}
    }
  `,
  maxDesktop: (styles: any) => css`
    @media (max-width: ${breakpoints.desktop}) {
      ${styles}
    }
  `,
  maxWide: (styles: any) => css`
    @media (max-width: ${breakpoints.wide}) {
      ${styles}
    }
  `,
  
  // Range queries
  mobileOnly: (styles: any) => css`
    @media (max-width: calc(${breakpoints.tablet} - 1px)) {
      ${styles}
    }
  `,
  tabletOnly: (styles: any) => css`
    @media (min-width: ${breakpoints.tablet}) and (max-width: calc(${breakpoints.desktop} - 1px)) {
      ${styles}
    }
  `,
  desktopOnly: (styles: any) => css`
    @media (min-width: ${breakpoints.desktop}) and (max-width: calc(${breakpoints.wide} - 1px)) {
      ${styles}
    }
  `,
  
  // Custom range
  between: (min: string, max: string) => (styles: any) => css`
    @media (min-width: ${min}) and (max-width: ${max}) {
      ${styles}
    }
  `,
  
  // Orientation
  landscape: (styles: any) => css`
    @media (orientation: landscape) {
      ${styles}
    }
  `,
  portrait: (styles: any) => css`
    @media (orientation: portrait) {
      ${styles}
    }
  `,
  
  // High DPI / Retina
  retina: (styles: any) => css`
    @media (-webkit-min-device-pixel-ratio: 2),
           (min-resolution: 192dpi),
           (min-resolution: 2dppx) {
      ${styles}
    }
  `,
  
  // Touch devices
  touch: (styles: any) => css`
    @media (hover: none) and (pointer: coarse) {
      ${styles}
    }
  `,
  
  // Hover capable devices
  hover: (styles: any) => css`
    @media (hover: hover) and (pointer: fine) {
      ${styles}
    }
  `,
  
  // Reduced motion
  reducedMotion: (styles: any) => css`
    @media (prefers-reduced-motion: reduce) {
      ${styles}
    }
  `,
  
  // Color scheme preferences
  darkMode: (styles: any) => css`
    @media (prefers-color-scheme: dark) {
      ${styles}
    }
  `,
  lightMode: (styles: any) => css`
    @media (prefers-color-scheme: light) {
      ${styles}
    }
  `,
  
  // High contrast
  highContrast: (styles: any) => css`
    @media (prefers-contrast: high) {
      ${styles}
    }
  `,
  
  // Print
  print: (styles: any) => css`
    @media print {
      ${styles}
    }
  `,
};

// Responsive value types
export type ResponsiveValue<T> = T | {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  ultrawide?: T;
};

// Responsive value handler
export const responsiveValue = <T>(
  value: ResponsiveValue<T>,
  property: string,
  transform?: (val: T) => string
): any => {
  if (typeof value === 'object' && value !== null) {
    const transforms = transform || ((val: T) => String(val));
    
    return css`
      ${value.mobile && css`
        ${media.mobile(css`${property}: ${transforms(value.mobile)};`)}
      `}
      ${value.tablet && css`
        ${media.tablet(css`${property}: ${transforms(value.tablet)};`)}
      `}
      ${value.desktop && css`
        ${media.desktop(css`${property}: ${transforms(value.desktop)};`)}
      `}
      ${value.wide && css`
        ${media.wide(css`${property}: ${transforms(value.wide)};`)}
      `}
      ${value.ultrawide && css`
        ${media.ultrawide(css`${property}: ${transforms(value.ultrawide)};`)}
      `}
    `;
  }
  
  const transforms = transform || ((val: T) => String(val));
  return css`
    ${property}: ${transforms(value)};
  `;
};

// Responsive typography utilities
export const responsiveFontSize = (sizes: ResponsiveValue<string>) => 
  responsiveValue(sizes, 'font-size');

export const responsiveLineHeight = (heights: ResponsiveValue<string | number>) => 
  responsiveValue(heights, 'line-height');

export const responsiveLetterSpacing = (spacings: ResponsiveValue<string>) => 
  responsiveValue(spacings, 'letter-spacing');

// Responsive spacing utilities
export const responsiveMargin = (margins: ResponsiveValue<string>) => 
  responsiveValue(margins, 'margin');

export const responsivePadding = (paddings: ResponsiveValue<string>) => 
  responsiveValue(paddings, 'padding');

export const responsiveGap = (gaps: ResponsiveValue<string>) => 
  responsiveValue(gaps, 'gap');

// Responsive layout utilities
export const responsiveWidth = (widths: ResponsiveValue<string>) => 
  responsiveValue(widths, 'width');

export const responsiveHeight = (heights: ResponsiveValue<string>) => 
  responsiveValue(heights, 'height');

export const responsiveMaxWidth = (maxWidths: ResponsiveValue<string>) => 
  responsiveValue(maxWidths, 'max-width');

export const responsiveMinHeight = (minHeights: ResponsiveValue<string>) => 
  responsiveValue(minHeights, 'min-height');

// Responsive grid utilities
export const responsiveGridColumns = (columns: ResponsiveValue<string | number>) => 
  responsiveValue(
    columns, 
    'grid-template-columns', 
    (val) => typeof val === 'number' ? `repeat(${val}, 1fr)` : val
  );

export const responsiveGridRows = (rows: ResponsiveValue<string | number>) => 
  responsiveValue(
    rows, 
    'grid-template-rows', 
    (val) => typeof val === 'number' ? `repeat(${val}, 1fr)` : val
  );

// Responsive flexbox utilities
export const responsiveFlexDirection = (directions: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>) => 
  responsiveValue(directions, 'flex-direction');

export const responsiveJustifyContent = (values: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>) => 
  responsiveValue(values, 'justify-content');

export const responsiveAlignItems = (values: ResponsiveValue<'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'>) => 
  responsiveValue(values, 'align-items');

// Container queries (for future support)
export const container = {
  sm: '320px',
  md: '640px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Responsive show/hide utilities
export const showFrom = (breakpoint: Breakpoint) => css`
  display: none;
  
  ${media[breakpoint](css`
    display: block;
  `)}
`;

export const hideFrom = (breakpoint: Breakpoint) => css`
  display: block;
  
  ${media[breakpoint](css`
    display: none;
  `)}
`;

export const showOnly = (breakpoint: Breakpoint) => {
  const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const nextBreakpoint = breakpointOrder[currentIndex + 1];
  
  if (nextBreakpoint) {
    return css`
      display: none;
      
      ${media[breakpoint](css`
        display: block;
      `)}
      
      ${media[nextBreakpoint](css`
        display: none;
      `)}
    `;
  }
  
  return css`
    display: none;
    
    ${media[breakpoint](css`
      display: block;
    `)}
  `;
};

// Responsive text utilities
export const responsiveTextAlign = (aligns: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>) => 
  responsiveValue(aligns, 'text-align');

export const responsiveTextSize = (theme: Theme) => ({
  xs: css`
    font-size: ${theme.typography.fontSize.xs};
    ${media.tablet(css`font-size: ${theme.typography.fontSize.sm};`)}
  `,
  sm: css`
    font-size: ${theme.typography.fontSize.sm};
    ${media.tablet(css`font-size: ${theme.typography.fontSize.base};`)}
  `,
  base: css`
    font-size: ${theme.typography.fontSize.base};
    ${media.tablet(css`font-size: ${theme.typography.fontSize.lg};`)}
  `,
  lg: css`
    font-size: ${theme.typography.fontSize.lg};
    ${media.tablet(css`font-size: ${theme.typography.fontSize.xl};`)}
  `,
  xl: css`
    font-size: ${theme.typography.fontSize.xl};
    ${media.tablet(css`font-size: ${theme.typography.fontSize['2xl']};`)}
  `,
  '2xl': css`
    font-size: ${theme.typography.fontSize['2xl']};
    ${media.tablet(css`font-size: ${theme.typography.fontSize['3xl']};`)}
  `,
  '3xl': css`
    font-size: ${theme.typography.fontSize['3xl']};
    ${media.tablet(css`font-size: ${theme.typography.fontSize['4xl']};`)}
  `,
  '4xl': css`
    font-size: ${theme.typography.fontSize['4xl']};
    ${media.tablet(css`font-size: ${theme.typography.fontSize['5xl']};`)}
  `,
});

// Responsive spacing scale
export const responsiveSpacing = (theme: Theme) => ({
  xs: {
    mobile: theme.spacing.xs,
    tablet: theme.spacing.sm,
    desktop: theme.spacing.sm,
  },
  sm: {
    mobile: theme.spacing.sm,
    tablet: theme.spacing.md,
    desktop: theme.spacing.md,
  },
  md: {
    mobile: theme.spacing.md,
    tablet: theme.spacing.lg,
    desktop: theme.spacing.lg,
  },
  lg: {
    mobile: theme.spacing.lg,
    tablet: theme.spacing.xl,
    desktop: theme.spacing.xl,
  },
  xl: {
    mobile: theme.spacing.xl,
    tablet: theme.spacing.xxl,
    desktop: theme.spacing.xxl,
  },
  xxl: {
    mobile: theme.spacing.xxl,
    tablet: theme.spacing.xxxl,
    desktop: theme.spacing.xxxl,
  },
});

// Device detection utilities
export const isMobile = css`
  ${media.maxTablet(css`
    /* Mobile styles */
  `)}
`;

export const isTablet = css`
  ${media.tabletOnly(css`
    /* Tablet styles */
  `)}
`;

export const isDesktop = css`
  ${media.desktop(css`
    /* Desktop styles */
  `)}
`;

export const isTouchDevice = css`
  ${media.touch(css`
    /* Touch device styles */
  `)}
`;

export const isHoverDevice = css`
  ${media.hover(css`
    /* Hover capable device styles */
  `)}
`;

// Aspect ratio utilities for responsive images/videos
export const responsiveAspectRatio = (ratios: ResponsiveValue<number>) => {
  if (typeof ratios === 'object' && ratios !== null) {
    return css`
      position: relative;
      
      &::before {
        content: '';
        display: block;
        width: 100%;
        height: 0;
        padding-bottom: ${ratios.mobile ? (1 / ratios.mobile) * 100 : 56.25}%;
        
        ${ratios.tablet && media.tablet(css`
          padding-bottom: ${(1 / ratios.tablet) * 100}%;
        `)}
        
        ${ratios.desktop && media.desktop(css`
          padding-bottom: ${(1 / ratios.desktop) * 100}%;
        `)}
        
        ${ratios.wide && media.wide(css`
          padding-bottom: ${(1 / ratios.wide) * 100}%;
        `)}
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
  }
  
  return css`
    position: relative;
    
    &::before {
      content: '';
      display: block;
      width: 100%;
      height: 0;
      padding-bottom: ${(1 / ratios) * 100}%;
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
};

// Responsive container utilities
export const responsiveContainer = (theme: Theme) => css`
  width: 100%;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  
  ${media.tablet(css`
    padding: 0 ${theme.spacing.lg};
    max-width: 768px;
  `)}
  
  ${media.desktop(css`
    padding: 0 ${theme.spacing.xl};
    max-width: 1024px;
  `)}
  
  ${media.wide(css`
    max-width: 1280px;
  `)}
`;

// Export all utilities
export default {
  breakpoints,
  media,
  responsiveValue,
  responsiveFontSize,
  responsiveLineHeight,
  responsiveLetterSpacing,
  responsiveMargin,
  responsivePadding,
  responsiveGap,
  responsiveWidth,
  responsiveHeight,
  responsiveMaxWidth,
  responsiveMinHeight,
  responsiveGridColumns,
  responsiveGridRows,
  responsiveFlexDirection,
  responsiveJustifyContent,
  responsiveAlignItems,
  showFrom,
  hideFrom,
  showOnly,
  responsiveTextAlign,
  responsiveTextSize,
  responsiveSpacing,
  responsiveAspectRatio,
  responsiveContainer,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  isHoverDevice,
};
