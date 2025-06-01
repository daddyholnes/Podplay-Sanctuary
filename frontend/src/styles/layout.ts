/**
 * Podplay Sanctuary - Layout Utilities
 * 
 * CSS-in-JS layout utilities and responsive design helpers.
 * Provides consistent layout patterns, responsive breakpoints,
 * and common layout components for the application.
 */

import styled, { css } from 'styled-components';
import { Theme } from './theme';
import { StyleProps, Box, Flex } from './components';

// Container component for max-width layouts
export interface ContainerProps extends StyleProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
}

const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

export const Container = styled(Box)<ContainerProps>`
  width: 100%;
  max-width: ${({ maxWidth = 'xl' }) => containerMaxWidths[maxWidth]};
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.md};
  
  ${({ centerContent }) => centerContent && css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  `}
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding-left: ${({ theme }) => theme.spacing.lg};
    padding-right: ${({ theme }) => theme.spacing.lg};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    padding-left: ${({ theme }) => theme.spacing.xl};
    padding-right: ${({ theme }) => theme.spacing.xl};
  }
`;

// Stack component for vertical layouts
export interface StackProps extends StyleProps {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const Stack = styled(Box)<StackProps>`
  display: flex;
  flex-direction: column;
  
  ${({ spacing = 'md', theme }) => css`
    gap: ${theme.spacing[spacing]};
  `}
  
  ${({ align }) => {
    switch (align) {
      case 'start':
        return css`align-items: flex-start;`;
      case 'center':
        return css`align-items: center;`;
      case 'end':
        return css`align-items: flex-end;`;
      case 'stretch':
        return css`align-items: stretch;`;
      default:
        return '';
    }
  }}
  
  ${({ divider, theme }) => divider && css`
    > * + * {
      border-top: 1px solid ${theme.colors.border.primary};
      padding-top: ${theme.spacing[spacing || 'md']};
    }
  `}
`;

// HStack component for horizontal layouts
export interface HStackProps extends StyleProps {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const HStack = styled(Box)<HStackProps>`
  display: flex;
  flex-direction: row;
  
  ${({ spacing = 'md', theme }) => css`
    gap: ${theme.spacing[spacing]};
  `}
  
  ${({ align }) => {
    switch (align) {
      case 'start':
        return css`align-items: flex-start;`;
      case 'center':
        return css`align-items: center;`;
      case 'end':
        return css`align-items: flex-end;`;
      case 'stretch':
        return css`align-items: stretch;`;
      default:
        return '';
    }
  }}
  
  ${({ justify }) => {
    switch (justify) {
      case 'start':
        return css`justify-content: flex-start;`;
      case 'center':
        return css`justify-content: center;`;
      case 'end':
        return css`justify-content: flex-end;`;
      case 'between':
        return css`justify-content: space-between;`;
      case 'around':
        return css`justify-content: space-around;`;
      case 'evenly':
        return css`justify-content: space-evenly;`;
      default:
        return '';
    }
  }}
  
  ${({ wrap }) => wrap && css`
    flex-wrap: wrap;
  `}
  
  ${({ divider, theme, spacing = 'md' }) => divider && css`
    > * + * {
      border-left: 1px solid ${theme.colors.border.primary};
      padding-left: ${theme.spacing[spacing]};
    }
  `}
`;

// Grid component for grid layouts
export interface GridLayoutProps extends StyleProps {
  columns?: number | string;
  rows?: number | string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  columnGap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  rowGap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  templateAreas?: string;
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
}

export const GridLayout = styled(Box)<GridLayoutProps>`
  display: grid;
  
  ${({ columns }) => {
    if (typeof columns === 'number') {
      return css`grid-template-columns: repeat(${columns}, 1fr);`;
    }
    if (typeof columns === 'string') {
      return css`grid-template-columns: ${columns};`;
    }
    return '';
  }}
  
  ${({ rows }) => {
    if (typeof rows === 'number') {
      return css`grid-template-rows: repeat(${rows}, 1fr);`;
    }
    if (typeof rows === 'string') {
      return css`grid-template-rows: ${rows};`;
    }
    return '';
  }}
  
  ${({ gap, theme }) => gap && css`
    gap: ${theme.spacing[gap]};
  `}
  
  ${({ columnGap, theme }) => columnGap && css`
    column-gap: ${theme.spacing[columnGap]};
  `}
  
  ${({ rowGap, theme }) => rowGap && css`
    row-gap: ${theme.spacing[rowGap]};
  `}
  
  ${({ templateAreas }) => templateAreas && css`
    grid-template-areas: ${templateAreas};
  `}
  
  ${({ autoFlow }) => autoFlow && css`
    grid-auto-flow: ${autoFlow};
  `}
`;

// Responsive grid with auto-fit columns
export interface ResponsiveGridProps extends StyleProps {
  minColumnWidth?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const ResponsiveGrid = styled(Box)<ResponsiveGridProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ minColumnWidth = '300px' }) => minColumnWidth}, 1fr));
  
  ${({ gap = 'md', theme }) => css`
    gap: ${theme.spacing[gap]};
  `}
`;

// Center component for centering content
export interface CenterProps extends StyleProps {
  inline?: boolean;
}

export const Center = styled(Box)<CenterProps>`
  display: ${({ inline }) => inline ? 'inline-flex' : 'flex'};
  align-items: center;
  justify-content: center;
`;

// Spacer component for flexible spacing
export const Spacer = styled.div`
  flex: 1;
`;

// Aspect ratio component
export interface AspectRatioProps extends StyleProps {
  ratio?: number;
}

export const AspectRatio = styled(Box)<AspectRatioProps>`
  position: relative;
  
  &::before {
    content: '';
    display: block;
    height: 0;
    padding-bottom: ${({ ratio = 1 }) => (1 / ratio) * 100}%;
  }
  
  > * {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Responsive show/hide utilities
export const Show = styled(Box)<{ above?: string; below?: string }>`
  ${({ above, theme }) => above && css`
    display: none;
    
    @media (min-width: ${theme.breakpoints[above as keyof typeof theme.breakpoints]}) {
      display: block;
    }
  `}
  
  ${({ below, theme }) => below && css`
    display: block;
    
    @media (min-width: ${theme.breakpoints[below as keyof typeof theme.breakpoints]}) {
      display: none;
    }
  `}
`;

export const Hide = styled(Box)<{ above?: string; below?: string }>`
  ${({ above, theme }) => above && css`
    display: block;
    
    @media (min-width: ${theme.breakpoints[above as keyof typeof theme.breakpoints]}) {
      display: none;
    }
  `}
  
  ${({ below, theme }) => below && css`
    display: none;
    
    @media (min-width: ${theme.breakpoints[below as keyof typeof theme.breakpoints]}) {
      display: block;
    }
  `}
`;

// Portal container for modals, tooltips, etc.
export const Portal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zIndices.modal};
  
  > * {
    pointer-events: auto;
  }
`;

// Overlay for modals and backdrops
export interface OverlayProps extends StyleProps {
  blur?: boolean;
  opacity?: number;
}

export const Overlay = styled(Box)<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme, opacity = 0.5 }) => 
    theme.colors.background.overlay.replace('0.5', opacity.toString())
  };
  z-index: ${({ theme }) => theme.zIndices.overlay};
  
  ${({ blur }) => blur && css`
    backdrop-filter: blur(4px);
  `}
`;

// Sticky container
export interface StickyProps extends StyleProps {
  top?: string;
  bottom?: string;
  zIndex?: number;
}

export const Sticky = styled(Box)<StickyProps>`
  position: sticky;
  top: ${({ top = '0' }) => top};
  bottom: ${({ bottom }) => bottom};
  z-index: ${({ zIndex, theme }) => zIndex || theme.zIndices.sticky};
`;

// Fixed container
export interface FixedProps extends StyleProps {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

export const Fixed = styled(Box)<FixedProps>`
  position: fixed;
  top: ${({ top }) => top};
  right: ${({ right }) => right};
  bottom: ${({ bottom }) => bottom};
  left: ${({ left }) => left};
  z-index: ${({ zIndex, theme }) => zIndex || theme.zIndices.base};
`;

// Scrollable container
export interface ScrollableProps extends StyleProps {
  maxHeight?: string;
  direction?: 'horizontal' | 'vertical' | 'both';
}

export const Scrollable = styled(Box)<ScrollableProps>`
  ${({ maxHeight }) => maxHeight && css`
    max-height: ${maxHeight};
  `}
  
  ${({ direction = 'vertical' }) => {
    switch (direction) {
      case 'horizontal':
        return css`
          overflow-x: auto;
          overflow-y: hidden;
        `;
      case 'vertical':
        return css`
          overflow-x: hidden;
          overflow-y: auto;
        `;
      case 'both':
        return css`
          overflow: auto;
        `;
      default:
        return '';
    }
  }}
`;

// Utility functions for responsive values
export const responsive = {
  mobile: (styles: string) => css`
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      ${styles}
    }
  `,
  tablet: (styles: string) => css`
    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      ${styles}
    }
  `,
  desktop: (styles: string) => css`
    @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
      ${styles}
    }
  `,
  wide: (styles: string) => css`
    @media (min-width: ${({ theme }) => theme.breakpoints.wide}) {
      ${styles}
    }
  `,
  between: (min: string, max: string) => (styles: string) => css`
    @media (min-width: ${min}) and (max-width: ${max}) {
      ${styles}
    }
  `,
};

// Layout helpers
export const layoutHelpers = {
  // Flexbox helpers
  flexCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  flexBetween: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,
  
  flexColumnCenter: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  
  // Position helpers
  absoluteCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  
  fixedCenter: css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  
  // Size helpers
  fullSize: css`
    width: 100%;
    height: 100%;
  `,
  
  fullWidth: css`
    width: 100%;
  `,
  
  fullHeight: css`
    height: 100%;
  `,
  
  // Overflow helpers
  scrollable: css`
    overflow: auto;
  `,
  
  scrollableX: css`
    overflow-x: auto;
    overflow-y: hidden;
  `,
  
  scrollableY: css`
    overflow-x: hidden;
    overflow-y: auto;
  `,
  
  hideScrollbar: css`
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  `,
  
  // Text helpers
  truncate: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  
  lineClamp: (lines: number) => css`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  
  // Visual helpers
  visuallyHidden: css`
    position: absolute !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    overflow: hidden !important;
    height: 1px !important;
    width: 1px !important;
    word-wrap: normal !important;
  `,
};

export default {
  Container,
  Stack,
  HStack,
  GridLayout,
  ResponsiveGrid,
  Center,
  Spacer,
  AspectRatio,
  Show,
  Hide,
  Portal,
  Overlay,
  Sticky,
  Fixed,
  Scrollable,
  responsive,
  layoutHelpers,
};
