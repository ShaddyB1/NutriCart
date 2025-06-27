// Cooper AI Theme Constants for React Native
export const COLORS = {
  // Primary gradient colors
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#e6eeff',
  secondary: '#f093fb',
  secondaryDark: '#f5576c',
  accent: '#4facfe',
  accentDark: '#00f2fe',
  
  // Status colors
  success: '#43e97b',
  successDark: '#38f9d7',
  warning: '#fa709a',
  warningDark: '#fee140',
  error: '#ff6b6b',
  info: '#4ecdc4',
  
  // Text colors
  textPrimary: '#2d3748',
  textSecondary: '#4a5568',
  textLight: '#718096',
  textWhite: '#ffffff',
  textMuted: '#a0aec0',
  
  // Background colors
  background: '#f8f9fa',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#edf2f7',
  backgroundOverlay: 'rgba(255, 255, 255, 0.95)',
  backgroundDark: '#1a202c',
  surface: '#ffffff',
  
  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#4a5568',
  
  // Transparent colors
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Gradient colors for React Native
  gradientPrimary: ['#667eea', '#764ba2'],
  gradientSecondary: ['#f093fb', '#f5576c'],
  gradientAccent: ['#4facfe', '#00f2fe'],
  gradientSuccess: ['#43e97b', '#38f9d7'],
  gradientWarning: ['#fa709a', '#fee140'],
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  title: 32,
  hero: 40,
};

export const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const LAYOUT = {
  screenPadding: SPACING.lg,
  cardPadding: SPACING.md,
  buttonHeight: 48,
  inputHeight: 44,
  headerHeight: 60,
  tabBarHeight: 80,
};

// Theme object for easy access
export const THEME = {
  colors: COLORS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
};

export default THEME; 