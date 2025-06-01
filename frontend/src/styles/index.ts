/**
 * Styles Architecture - Barrel Exports
 * 
 * Central export hub for all styling utilities, themes, components, and design tokens.
 * Provides a clean API for consuming style-related functionality throughout the application.
 * 
 * @fileoverview Comprehensive styles system with theme, components, utilities, and responsive design
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

// ============================================================================
// THEME SYSTEM
// ============================================================================

export {
  // Theme configuration
  lightTheme,
  darkTheme,
  defaultTheme,
  createTheme,
  
  // Theme utilities
  generateCSSVariables,
  getThemeValue,
  withTheme,
  
  // Theme context and providers
  ThemeProvider,
  useTheme,
  useThemeMode,
  
  // Design tokens
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  breakpoints,
  
  // Theme types
  type Theme,
  type ThemeMode,
  type ColorPalette,
  type TypographyScale,
  type SpacingScale,
  type Breakpoints,
  type ThemeConfig
} from './theme';

// ============================================================================
// GLOBAL STYLES
// ============================================================================

export {
  // Global style utilities
  GlobalStyles,
  createGlobalStyles,
  injectGlobalStyles,
  
  // CSS reset and base styles
  cssReset,
  baseTypography,
  accessibilityStyles,
  printStyles,
  
  // Global style configuration
  globalStyleConfig,
  
  // Global style types
  type GlobalStylesProps,
  type CSSResetConfig,
  type TypographyConfig
} from './globals';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

export {
  // Layout components
  Box,
  Flex,
  Grid,
  Container,
  Stack,
  HStack,
  VStack,
  
  // Interactive components
  Button,
  IconButton,
  LinkButton,
  
  // Form components
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  
  // Display components
  Card,
  Badge,
  Tag,
  Avatar,
  
  // Feedback components
  Spinner,
  Progress,
  Alert,
  Toast,
  
  // Navigation components
  NavLink,
  Breadcrumb,
  Tab,
  
  // Media components
  Image,
  Video,
  
  // Component props types
  type BoxProps,
  type FlexProps,
  type GridProps,
  type ButtonProps,
  type InputProps,
  type CardProps,
  type BadgeProps,
  type SpinnerProps,
  type StyledComponentProps
} from './components';

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export {
  // Layout components
  ResponsiveGrid,
  AspectRatio,
  Center,
  Spacer,
  Divider,
  
  // Layout utilities
  createLayout,
  withLayout,
  getLayoutStyles,
  
  // Responsive utilities
  Show,
  Hide,
  VisuallyHidden,
  
  // Layout helpers
  layoutHelpers,
  gridHelpers,
  flexHelpers,
  
  // Layout types
  type LayoutProps,
  type ResponsiveValue,
  type GridProps as LayoutGridProps,
  type FlexboxProps,
  type SpaceProps,
  type LayoutConfig
} from './layout';

// ============================================================================
// ANIMATIONS
// ============================================================================

export {
  // Animation components
  Motion,
  Transition,
  AnimatePresence,
  
  // Animation utilities
  createAnimation,
  getAnimationStyles,
  withAnimation,
  
  // Keyframe animations
  keyframes,
  fadeIn,
  fadeOut,
  slideIn,
  slideOut,
  scaleIn,
  scaleOut,
  bounce,
  pulse,
  spin,
  shake,
  flip,
  
  // Transition utilities
  transitions,
  easings,
  durations,
  
  // Animation presets
  entranceAnimations,
  exitAnimations,
  attentionAnimations,
  hoverAnimations,
  loadingAnimations,
  
  // Animation types
  type AnimationProps,
  type TransitionProps,
  type KeyframeAnimation,
  type AnimationConfig,
  type EasingFunction
} from './animations';

// ============================================================================
// CSS MIXINS
// ============================================================================

export {
  // Typography mixins
  typography,
  heading,
  body,
  caption,
  code,
  truncate,
  lineClamp,
  
  // Layout mixins
  flexCenter,
  gridCenter,
  absoluteCenter,
  cover,
  contain,
  aspectRatio,
  
  // Visual effect mixins
  glassmorphism,
  neumorphism,
  gradient,
  textGradient,
  shadow,
  glow,
  
  // Interaction mixins
  hover,
  focus,
  active,
  disabled,
  loading,
  
  // Form mixins
  inputBase,
  inputFocus,
  inputError,
  buttonBase,
  buttonVariant,
  
  // Responsive mixins
  mobile,
  tablet,
  desktop,
  largeDesktop,
  mediaQuery,
  
  // Utility mixins
  srOnly,
  clearfix,
  scrollbar,
  selection,
  
  // Mixin types
  type TypographyMixin,
  type LayoutMixin,
  type VisualMixin,
  type InteractionMixin,
  type ResponsiveMixin
} from './mixins';

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export {
  // Responsive configuration
  responsiveConfig,
  defaultBreakpoints,
  
  // Responsive utilities
  createResponsive,
  withResponsive,
  getResponsiveStyles,
  
  // Breakpoint utilities
  up,
  down,
  between,
  only,
  
  // Responsive values
  responsive,
  responsiveArray,
  responsiveObject,
  
  // Media query utilities
  mediaQueries,
  createMediaQuery,
  useMediaQuery,
  
  // Device detection
  deviceQueries,
  isDesktop,
  isTablet,
  isMobile,
  isTouchDevice,
  
  // Responsive helpers
  responsiveHelpers,
  breakpointHelpers,
  
  // Responsive types
  type ResponsiveConfig,
  type BreakpointValue,
  type MediaQueryConfig,
  type DeviceQuery,
  type ResponsiveUtility
} from './responsive';

// ============================================================================
// STYLE UTILITIES
// ============================================================================

/**
 * Combined utilities for common styling operations
 */
export const styleUtils = {
  // Theme utilities
  theme: {
    get: getThemeValue,
    create: createTheme,
    variables: generateCSSVariables
  },
  
  // Layout utilities
  layout: {
    ...layoutHelpers,
    center: flexCenter,
    cover,
    contain
  },
  
  // Typography utilities
  text: {
    heading,
    body,
    caption,
    code,
    truncate,
    clamp: lineClamp
  },
  
  // Visual utilities
  visual: {
    glass: glassmorphism,
    neuro: neumorphism,
    gradient,
    shadow,
    glow
  },
  
  // Animation utilities
  animate: {
    create: createAnimation,
    fade: { in: fadeIn, out: fadeOut },
    slide: { in: slideIn, out: slideOut },
    scale: { in: scaleIn, out: scaleOut },
    bounce,
    pulse,
    spin,
    shake,
    flip
  },
  
  // Responsive utilities
  responsive: {
    up,
    down,
    between,
    only,
    create: createResponsive
  }
};

/**
 * CSS-in-JS styled components factory
 */
export const styled = {
  // Basic elements
  div: Box,
  section: Box.withComponent('section'),
  article: Box.withComponent('article'),
  header: Box.withComponent('header'),
  footer: Box.withComponent('footer'),
  main: Box.withComponent('main'),
  nav: Box.withComponent('nav'),
  aside: Box.withComponent('aside'),
  
  // Text elements
  h1: Box.withComponent('h1'),
  h2: Box.withComponent('h2'),
  h3: Box.withComponent('h3'),
  h4: Box.withComponent('h4'),
  h5: Box.withComponent('h5'),
  h6: Box.withComponent('h6'),
  p: Box.withComponent('p'),
  span: Box.withComponent('span'),
  
  // Interactive elements
  button: Button,
  a: LinkButton,
  
  // Form elements
  input: Input,
  textarea: Textarea,
  select: Select,
  
  // Media elements
  img: Image,
  video: Video
};

/**
 * Pre-configured design system tokens
 */
export const tokens = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  breakpoints
};

/**
 * Animation presets for common use cases
 */
export const animations = {
  entrance: entranceAnimations,
  exit: exitAnimations,
  attention: attentionAnimations,
  hover: hoverAnimations,
  loading: loadingAnimations
};

/**
 * Responsive design helpers
 */
export const responsive = {
  breakpoints: defaultBreakpoints,
  up,
  down,
  between,
  only,
  queries: mediaQueries,
  devices: deviceQueries
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export all types for external consumption
export type {
  // Theme types
  Theme,
  ThemeMode,
  ThemeConfig,
  ColorPalette,
  TypographyScale,
  SpacingScale,
  
  // Component types
  StyledComponentProps,
  BoxProps,
  FlexProps,
  GridProps,
  ButtonProps,
  InputProps,
  CardProps,
  
  // Layout types
  LayoutProps,
  ResponsiveValue,
  FlexboxProps,
  SpaceProps,
  
  // Animation types
  AnimationProps,
  TransitionProps,
  KeyframeAnimation,
  AnimationConfig,
  
  // Responsive types
  ResponsiveConfig,
  BreakpointValue,
  MediaQueryConfig,
  
  // Utility types
  CSSValue,
  StyleFunction,
  ThemeFunction,
  ResponsiveStyleValue
} from './theme';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export containing the most commonly used styling utilities
 * 
 * @example
 * ```typescript
 * import styles, { Box, useTheme } from '@/styles';
 * 
 * const MyComponent = () => {
 *   const theme = useTheme();
 *   
 *   return (
 *     <Box
 *       css={styles.layout.center}
 *       bg={styles.tokens.colors.primary[500]}
 *       p={styles.tokens.spacing.md}
 *     >
 *       Content
 *     </Box>
 *   );
 * };
 * ```
 */
const styles = {
  // Core utilities
  utils: styleUtils,
  tokens,
  animations,
  responsive,
  styled,
  
  // Theme system
  theme: {
    light: lightTheme,
    dark: darkTheme,
    default: defaultTheme,
    create: createTheme,
    Provider: ThemeProvider,
    useTheme,
    useThemeMode
  },
  
  // Component library
  components: {
    Box,
    Flex,
    Grid,
    Button,
    Input,
    Card,
    Badge,
    Spinner
  },
  
  // Layout system
  layout: {
    Container,
    Stack,
    Center,
    Show,
    Hide,
    ResponsiveGrid
  },
  
  // Global styles
  globals: {
    GlobalStyles,
    createGlobalStyles,
    injectGlobalStyles
  }
};

export default styles;

// ============================================================================
// VERSION AND METADATA
// ============================================================================

/**
 * Styles system version and metadata
 */
export const stylesMetadata = {
  version: '1.0.0',
  name: 'Podplay Sanctuary Styles',
  description: 'Comprehensive design system and styling utilities',
  features: [
    'Theme system with light/dark modes',
    'Styled components library',
    'Responsive design utilities',
    'Animation framework',
    'CSS mixins and utilities',
    'TypeScript support',
    'Accessibility compliance',
    'Performance optimized'
  ],
  components: 25,
  utilities: 50,
  animations: 25,
  mixins: 30,
  breakpoints: 5,
  themes: 2
};
