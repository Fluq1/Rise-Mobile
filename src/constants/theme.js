export const COLORS = {
    // Primary brand colors
    PRIMARY: '#FFCD00',
    PRIMARY_DARK: '#d4a556',
    PRIMARY_LIGHT: '#FFE47A',
    
    // Secondary colors
    SECONDARY: '#000000',
    
    // Neutral colors
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_DARK: '#333333',
    GRAY: '#86868B',
    GRAY_LIGHT: '#F5F5F7',
    
    // Semantic colors
    SUCCESS: '#34C759',
    ERROR: '#FF3B30',
    WARNING: '#FF9500',
    INFO: '#007AFF',
    
    // Background colors
    BACKGROUND: '#FFFFFF',
    BACKGROUND_LIGHT: '#F5F5F7',
    
    // Shadow and overlay
    SHADOW: 'rgba(0, 0, 0, 0.1)',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
  };
  
  export const FONTS = {
    SIZES: {
      xs: 10,
      small: 12,
      medium: 14,
      large: 16,
      xl: 18,
      xxl: 20,
      h1: 32,
      h2: 24,
      h3: 20,
      h4: 18,
    },
    
    WEIGHTS: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  };
  
  export const SHADOWS = {
    small: {
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
  };
  
  export const SPACING = {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 40,
  };