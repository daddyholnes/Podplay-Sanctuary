/**
 * Podplay Sanctuary - Theme Configuration
 * 
 * Central theme configuration with comprehensive design tokens,
 * color palettes, typography scales, spacing systems, and component variants.
 * Supports light/dark modes with accessibility-first design principles.
 */

export interface ThemeBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    placeholder: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
  };
}

export interface ThemeShadows {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
  none: string;
}

export interface ThemeRadii {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeTransitions {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
}

export interface ThemeZIndices {
  hide: number;
  auto: string;
  base: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  notification: number;
}

export interface Theme {
  mode: 'light' | 'dark';
  breakpoints: ThemeBreakpoints;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  colors: ThemeColors;
  shadows: ThemeShadows;
  radii: ThemeRadii;
  transitions: ThemeTransitions;
  zIndices: ThemeZIndices;
}

// Base configuration
const baseConfig = {
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  } as ThemeBreakpoints,

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
    xxxl: '4rem',    // 64px
  } as ThemeSpacing,

  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      secondary: 'Georgia, "Times New Roman", Times, serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  } as ThemeTypography,

  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  } as ThemeShadows,

  radii: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  } as ThemeRadii,

  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  } as ThemeTransitions,

  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  } as ThemeZIndices,
};

// Light theme
export const lightTheme: Theme = {
  mode: 'light',
  ...baseConfig,
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
    accent: {
      50: '#fef7ff',
      100: '#fce7ff',
      200: '#f8d4fe',
      300: '#f2b5fc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
      placeholder: '#9ca3af',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#10b981',
    },
  } as ThemeColors,
};

// Dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  ...baseConfig,
  colors: {
    primary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8',
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    secondary: {
      50: '#1c1917',
      100: '#292524',
      200: '#44403c',
      300: '#57534e',
      400: '#78716c',
      500: '#a8a29e',
      600: '#d6d3d1',
      700: '#e7e5e4',
      800: '#f5f5f4',
      900: '#fafaf9',
    },
    accent: {
      50: '#701a75',
      100: '#86198f',
      200: '#a21caf',
      300: '#c026d3',
      400: '#d946ef',
      500: '#e879f9',
      600: '#f2b5fc',
      700: '#f8d4fe',
      800: '#fce7ff',
      900: '#fef7ff',
    },
    neutral: {
      50: '#171717',
      100: '#262626',
      200: '#404040',
      300: '#525252',
      400: '#737373',
      500: '#a3a3a3',
      600: '#d4d4d4',
      700: '#e5e5e5',
      800: '#f5f5f5',
      900: '#fafafa',
    },
    semantic: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#1e293b',
      placeholder: '#6b7280',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      focus: '#60a5fa',
      error: '#f87171',
      success: '#34d399',
    },
  } as ThemeColors,
};

// Theme utilities
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const createCustomTheme = (
  baseTheme: Theme,
  overrides: Partial<Theme>
): Theme => {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...(overrides.colors || {}),
    },
    typography: {
      ...baseTheme.typography,
      ...(overrides.typography || {}),
    },
  };
};

// CSS custom properties generator
export const generateCSSCustomProperties = (theme: Theme): string => {
  const cssVars: string[] = [];
  
  // Colors
  Object.entries(theme.colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        cssVars.push(`  --color-${category}-${key}: ${value};`);
      });
    } else {
      cssVars.push(`  --color-${category}: ${values};`);
    }
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });
  
  // Typography
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars.push(`  --font-size-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });
  
  // Radii
  Object.entries(theme.radii).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`);
  });
  
  // Z-indices
  Object.entries(theme.zIndices).forEach(([key, value]) => {
    cssVars.push(`  --z-${key}: ${value};`);
  });
  
  return `:root {\n${cssVars.join('\n')}\n}`;
};

// Media query helpers
export const mediaQueries = {
  mobile: `@media (max-width: ${baseConfig.breakpoints.mobile})`,
  tablet: `@media (max-width: ${baseConfig.breakpoints.tablet})`,
  desktop: `@media (min-width: ${baseConfig.breakpoints.desktop})`,
  wide: `@media (min-width: ${baseConfig.breakpoints.wide})`,
  mobileOnly: `@media (max-width: ${baseConfig.breakpoints.tablet})`,
  tabletOnly: `@media (min-width: ${baseConfig.breakpoints.mobile}) and (max-width: ${baseConfig.breakpoints.desktop})`,
  desktopUp: `@media (min-width: ${baseConfig.breakpoints.tablet})`,
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
};

export default lightTheme;
