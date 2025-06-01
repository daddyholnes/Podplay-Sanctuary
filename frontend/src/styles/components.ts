/**
 * Podplay Sanctuary - Component Styles
 * 
 * Reusable styled components and style utilities for consistent
 * UI components throughout the application. Uses styled-components
 * with theme integration and responsive design patterns.
 */

import styled, { css } from 'styled-components';
import { Theme } from './theme';

// Base component interfaces
export interface BaseStyleProps {
  theme: Theme;
}

export interface SpacingProps {
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginX?: string;
  marginY?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingX?: string;
  paddingY?: string;
}

export interface LayoutProps {
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  zIndex?: number;
}

export interface FlexProps {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  gap?: string;
  flex?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export interface GridProps {
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridArea?: string;
  gridColumn?: string;
  gridRow?: string;
  gridGap?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
}

export interface ColorProps {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface TypographyProps {
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: string;
  fontFamily?: string;
}

export interface BorderProps {
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: string;
}

export interface ShadowProps {
  boxShadow?: string;
  textShadow?: string;
}

export interface TransitionProps {
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
}

// Utility type for all style props
export type StyleProps = BaseStyleProps & 
  SpacingProps & 
  LayoutProps & 
  FlexProps & 
  GridProps & 
  ColorProps & 
  TypographyProps & 
  BorderProps & 
  ShadowProps & 
  TransitionProps;

// Spacing utility function
const spacing = css<SpacingProps>`
  ${({ margin }) => margin && css`margin: ${margin};`}
  ${({ marginTop }) => marginTop && css`margin-top: ${marginTop};`}
  ${({ marginRight }) => marginRight && css`margin-right: ${marginRight};`}
  ${({ marginBottom }) => marginBottom && css`margin-bottom: ${marginBottom};`}
  ${({ marginLeft }) => marginLeft && css`margin-left: ${marginLeft};`}
  ${({ marginX }) => marginX && css`
    margin-left: ${marginX};
    margin-right: ${marginX};
  `}
  ${({ marginY }) => marginY && css`
    margin-top: ${marginY};
    margin-bottom: ${marginY};
  `}
  
  ${({ padding }) => padding && css`padding: ${padding};`}
  ${({ paddingTop }) => paddingTop && css`padding-top: ${paddingTop};`}
  ${({ paddingRight }) => paddingRight && css`padding-right: ${paddingRight};`}
  ${({ paddingBottom }) => paddingBottom && css`padding-bottom: ${paddingBottom};`}
  ${({ paddingLeft }) => paddingLeft && css`padding-left: ${paddingLeft};`}
  ${({ paddingX }) => paddingX && css`
    padding-left: ${paddingX};
    padding-right: ${paddingX};
  `}
  ${({ paddingY }) => paddingY && css`
    padding-top: ${paddingY};
    padding-bottom: ${paddingY};
  `}
`;

// Layout utility function
const layout = css<LayoutProps>`
  ${({ display }) => display && css`display: ${display};`}
  ${({ position }) => position && css`position: ${position};`}
  ${({ top }) => top && css`top: ${top};`}
  ${({ right }) => right && css`right: ${right};`}
  ${({ bottom }) => bottom && css`bottom: ${bottom};`}
  ${({ left }) => left && css`left: ${left};`}
  ${({ width }) => width && css`width: ${width};`}
  ${({ height }) => height && css`height: ${height};`}
  ${({ minWidth }) => minWidth && css`min-width: ${minWidth};`}
  ${({ minHeight }) => minHeight && css`min-height: ${minHeight};`}
  ${({ maxWidth }) => maxWidth && css`max-width: ${maxWidth};`}
  ${({ maxHeight }) => maxHeight && css`max-height: ${maxHeight};`}
  ${({ overflow }) => overflow && css`overflow: ${overflow};`}
  ${({ zIndex }) => zIndex !== undefined && css`z-index: ${zIndex};`}
`;

// Flexbox utility function
const flexbox = css<FlexProps>`
  ${({ flexDirection }) => flexDirection && css`flex-direction: ${flexDirection};`}
  ${({ justifyContent }) => justifyContent && css`justify-content: ${justifyContent};`}
  ${({ alignItems }) => alignItems && css`align-items: ${alignItems};`}
  ${({ alignContent }) => alignContent && css`align-content: ${alignContent};`}
  ${({ gap }) => gap && css`gap: ${gap};`}
  ${({ flex }) => flex && css`flex: ${flex};`}
  ${({ flexGrow }) => flexGrow !== undefined && css`flex-grow: ${flexGrow};`}
  ${({ flexShrink }) => flexShrink !== undefined && css`flex-shrink: ${flexShrink};`}
  ${({ flexBasis }) => flexBasis && css`flex-basis: ${flexBasis};`}
  ${({ flexWrap }) => flexWrap && css`flex-wrap: ${flexWrap};`}
`;

// Grid utility function
const grid = css<GridProps>`
  ${({ gridTemplateColumns }) => gridTemplateColumns && css`grid-template-columns: ${gridTemplateColumns};`}
  ${({ gridTemplateRows }) => gridTemplateRows && css`grid-template-rows: ${gridTemplateRows};`}
  ${({ gridTemplateAreas }) => gridTemplateAreas && css`grid-template-areas: ${gridTemplateAreas};`}
  ${({ gridArea }) => gridArea && css`grid-area: ${gridArea};`}
  ${({ gridColumn }) => gridColumn && css`grid-column: ${gridColumn};`}
  ${({ gridRow }) => gridRow && css`grid-row: ${gridRow};`}
  ${({ gridGap }) => gridGap && css`gap: ${gridGap};`}
  ${({ gridColumnGap }) => gridColumnGap && css`column-gap: ${gridColumnGap};`}
  ${({ gridRowGap }) => gridRowGap && css`row-gap: ${gridRowGap};`}
`;

// Typography utility function
const typography = css<TypographyProps>`
  ${({ fontSize }) => fontSize && css`font-size: ${fontSize};`}
  ${({ fontWeight }) => fontWeight && css`font-weight: ${fontWeight};`}
  ${({ lineHeight }) => lineHeight && css`line-height: ${lineHeight};`}
  ${({ textAlign }) => textAlign && css`text-align: ${textAlign};`}
  ${({ textTransform }) => textTransform && css`text-transform: ${textTransform};`}
  ${({ letterSpacing }) => letterSpacing && css`letter-spacing: ${letterSpacing};`}
  ${({ fontFamily }) => fontFamily && css`font-family: ${fontFamily};`}
`;

// Border utility function
const border = css<BorderProps>`
  ${({ border }) => border && css`border: ${border};`}
  ${({ borderTop }) => borderTop && css`border-top: ${borderTop};`}
  ${({ borderRight }) => borderRight && css`border-right: ${borderRight};`}
  ${({ borderBottom }) => borderBottom && css`border-bottom: ${borderBottom};`}
  ${({ borderLeft }) => borderLeft && css`border-left: ${borderLeft};`}
  ${({ borderWidth }) => borderWidth && css`border-width: ${borderWidth};`}
  ${({ borderStyle }) => borderStyle && css`border-style: ${borderStyle};`}
  ${({ borderRadius }) => borderRadius && css`border-radius: ${borderRadius};`}
`;

// All utilities combined
const styledSystem = css<StyleProps>`
  ${spacing}
  ${layout}
  ${flexbox}
  ${grid}
  ${typography}
  ${border}
  
  ${({ color }) => color && css`color: ${color};`}
  ${({ backgroundColor }) => backgroundColor && css`background-color: ${backgroundColor};`}
  ${({ borderColor }) => borderColor && css`border-color: ${borderColor};`}
  ${({ boxShadow }) => boxShadow && css`box-shadow: ${boxShadow};`}
  ${({ textShadow }) => textShadow && css`text-shadow: ${textShadow};`}
  ${({ transition }) => transition && css`transition: ${transition};`}
  ${({ transitionProperty }) => transitionProperty && css`transition-property: ${transitionProperty};`}
  ${({ transitionDuration }) => transitionDuration && css`transition-duration: ${transitionDuration};`}
  ${({ transitionTimingFunction }) => transitionTimingFunction && css`transition-timing-function: ${transitionTimingFunction};`}
  ${({ transitionDelay }) => transitionDelay && css`transition-delay: ${transitionDelay};`}
`;

// Base styled components
export const Box = styled.div<StyleProps>`
  ${styledSystem}
`;

export const Flex = styled(Box)<StyleProps>`
  display: flex;
`;

export const Grid = styled(Box)<StyleProps>`
  display: grid;
`;

export const Text = styled.span<StyleProps>`
  ${styledSystem}
`;

export const Heading = styled.h1<StyleProps & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }>`
  ${styledSystem}
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Button variants
export interface ButtonProps extends StyleProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: (theme: Theme) => css`
    background-color: ${theme.colors.primary[600]};
    color: ${theme.colors.text.inverse};
    border: 1px solid ${theme.colors.primary[600]};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary[700]};
      border-color: ${theme.colors.primary[700]};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.primary[200]};
    }
  `,
  secondary: (theme: Theme) => css`
    background-color: ${theme.colors.secondary[100]};
    color: ${theme.colors.secondary[800]};
    border: 1px solid ${theme.colors.secondary[300]};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.secondary[200]};
      border-color: ${theme.colors.secondary[400]};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.secondary[200]};
    }
  `,
  outline: (theme: Theme) => css`
    background-color: transparent;
    color: ${theme.colors.primary[600]};
    border: 1px solid ${theme.colors.primary[600]};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.primary[50]};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.primary[200]};
    }
  `,
  ghost: (theme: Theme) => css`
    background-color: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.background.secondary};
    }
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.neutral[200]};
    }
  `,
  danger: (theme: Theme) => css`
    background-color: ${theme.colors.semantic.error};
    color: ${theme.colors.text.inverse};
    border: 1px solid ${theme.colors.semantic.error};
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
      border-color: #dc2626;
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
    }
  `,
};

const buttonSizes = {
  sm: (theme: Theme) => css`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.sm};
    border-radius: ${theme.radii.sm};
  `,
  md: (theme: Theme) => css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.base};
    border-radius: ${theme.radii.md};
  `,
  lg: (theme: Theme) => css`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.lg};
    border-radius: ${theme.radii.lg};
  `,
};

export const Button = styled.button<ButtonProps>`
  ${styledSystem}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  
  ${({ variant = 'primary', theme }) => buttonVariants[variant](theme)}
  ${({ size = 'md', theme }) => buttonSizes[size](theme)}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ loading }) => loading && css`
    opacity: 0.8;
    cursor: wait;
    
    &::before {
      content: '';
      display: inline-block;
      width: 1em;
      height: 1em;
      margin-right: 0.5em;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

// Input components
export interface InputProps extends StyleProps {
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  isDisabled?: boolean;
}

const inputVariants = {
  default: (theme: Theme) => css`
    border: 1px solid ${theme.colors.border.primary};
    background-color: ${theme.colors.background.primary};
    
    &:focus {
      border-color: ${theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
    }
  `,
  filled: (theme: Theme) => css`
    border: 1px solid transparent;
    background-color: ${theme.colors.background.secondary};
    
    &:focus {
      background-color: ${theme.colors.background.primary};
      border-color: ${theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
    }
  `,
  flushed: (theme: Theme) => css`
    border: none;
    border-bottom: 1px solid ${theme.colors.border.primary};
    border-radius: 0;
    background-color: transparent;
    
    &:focus {
      border-bottom-color: ${theme.colors.border.focus};
      box-shadow: 0 1px 0 0 ${theme.colors.border.focus};
    }
  `,
};

const inputSizes = {
  sm: (theme: Theme) => css`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.sm};
    border-radius: ${theme.radii.sm};
  `,
  md: (theme: Theme) => css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.base};
    border-radius: ${theme.radii.md};
  `,
  lg: (theme: Theme) => css`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.lg};
    border-radius: ${theme.radii.lg};
  `,
};

export const Input = styled.input<InputProps>`
  ${styledSystem}
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  
  ${({ variant = 'default', theme }) => inputVariants[variant](theme)}
  ${({ size = 'md', theme }) => inputSizes[size](theme)}
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${({ isInvalid, theme }) => isInvalid && css`
    border-color: ${theme.colors.border.error};
    
    &:focus {
      border-color: ${theme.colors.border.error};
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

export const Textarea = styled.textarea<InputProps>`
  ${styledSystem}
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  resize: vertical;
  min-height: 100px;
  
  ${({ variant = 'default', theme }) => inputVariants[variant](theme)}
  ${({ size = 'md', theme }) => inputSizes[size](theme)}
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${({ isInvalid, theme }) => isInvalid && css`
    border-color: ${theme.colors.border.error};
    
    &:focus {
      border-color: ${theme.colors.border.error};
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

// Card component
export interface CardProps extends StyleProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
}

const cardVariants = {
  elevated: (theme: Theme) => css`
    background-color: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border.primary};
    box-shadow: ${theme.shadows.md};
  `,
  outlined: (theme: Theme) => css`
    background-color: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border.primary};
    box-shadow: none;
  `,
  filled: (theme: Theme) => css`
    background-color: ${theme.colors.background.secondary};
    border: 1px solid transparent;
    box-shadow: none;
  `,
};

export const Card = styled.div<CardProps>`
  ${styledSystem}
  
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.easeInOut};
  
  ${({ variant = 'elevated', theme }) => cardVariants[variant](theme)}
  
  ${({ interactive, theme }) => interactive && css`
    cursor: pointer;
    
    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

// Badge component
export interface BadgeProps extends StyleProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants = {
  default: (theme: Theme) => css`
    background-color: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[800]};
  `,
  success: (theme: Theme) => css`
    background-color: rgba(16, 185, 129, 0.1);
    color: ${theme.colors.semantic.success};
  `,
  warning: (theme: Theme) => css`
    background-color: rgba(245, 158, 11, 0.1);
    color: ${theme.colors.semantic.warning};
  `,
  error: (theme: Theme) => css`
    background-color: rgba(239, 68, 68, 0.1);
    color: ${theme.colors.semantic.error};
  `,
  info: (theme: Theme) => css`
    background-color: rgba(59, 130, 246, 0.1);
    color: ${theme.colors.semantic.info};
  `,
};

const badgeSizes = {
  sm: (theme: Theme) => css`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xs};
  `,
  md: (theme: Theme) => css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  `,
  lg: (theme: Theme) => css`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.base};
  `,
};

export const Badge = styled.span<BadgeProps>`
  ${styledSystem}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  
  ${({ variant = 'default', theme }) => badgeVariants[variant](theme)}
  ${({ size = 'md', theme }) => badgeSizes[size](theme)}
`;

// Spinner component
export interface SpinnerProps extends StyleProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner = styled.div<SpinnerProps>`
  ${styledSystem}
  
  display: inline-block;
  width: ${({ size = 'md' }) => 
    size === 'sm' ? '1rem' : 
    size === 'lg' ? '2rem' : '1.5rem'
  };
  height: ${({ size = 'md' }) => 
    size === 'sm' ? '1rem' : 
    size === 'lg' ? '2rem' : '1.5rem'
  };
  border: 2px solid transparent;
  border-top: 2px solid ${({ color, theme }) => color || theme.colors.primary[600]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Divider component
export interface DividerProps extends StyleProps {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = styled.div<DividerProps>`
  ${styledSystem}
  
  ${({ orientation = 'horizontal', theme }) => 
    orientation === 'horizontal' 
      ? css`
          height: 1px;
          width: 100%;
          background-color: ${theme.colors.border.primary};
        `
      : css`
          width: 1px;
          height: 100%;
          background-color: ${theme.colors.border.primary};
        `
  }
`;

export {
  spacing,
  layout,
  flexbox,
  grid,
  typography,
  border,
  styledSystem,
};
