// src/ui/navigation/theme/tokens.js
//
// Navigation token system that defines the styling vocabulary for navigation
// Provides platform-specific values while referencing the core theme

import { Platform } from 'react-native';
import theme from '../../theme';
import platform from './platform';

/**
 * Navigation Token System
 * 
 * This system defines all visual tokens specific to navigation components
 * while leveraging the core theme system. It handles platform-specific
 * values and provides a consistent interface for the integration layer.
 */
const navigationTokens = {
  // Spacing tokens for navigation elements
  spacing: {
    // Header spacing tokens
    header: {
      height: platform.select({
        ios: 44,
        android: 56,
      }),
      paddingHorizontal: platform.select({
        ios: 16,
        android: 16,
      }),
      statusBarHeight: platform.getStatusBarHeight(),
      elevation: platform.select({
        ios: 0,
        android: 4,
      }),
    },
    
    // Tab bar spacing tokens
    tabBar: {
      height: platform.getTabBarHeight(),
      itemPadding: platform.select({
        ios: 4,
        android: 8,
      }),
      iconMargin: platform.select({
        ios: 4,
        android: 0,
      }),
      bottomInset: platform.getBottomSpace(),
    },
    
    // Screen content spacing
    screen: {
      paddingHorizontal: theme.spacing.medium,
    },
  },
  
  // Typography tokens for navigation elements
  typography: {
    // Header typography
    header: {
      title: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: platform.select({
          ios: 17,
          android: 20,
        }),
        fontWeight: platform.select({
          ios: '600', // Semibold on iOS
          android: '500', // Medium on Android
        }),
        color: theme.colors.text,
      },
      backTitle: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: 17,
        fontWeight: '400',
        color: theme.colors.primary,
      },
    },
    
    // Tab bar typography
    tabBar: {
      label: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: platform.select({
          ios: 10,
          android: 12,
        }),
        fontWeight: platform.select({
          ios: '500',
          android: '400',
        }),
        activeColor: theme.colors.primary,
        inactiveColor: '#8E8E93',
      },
    },
  },
  
  // Color tokens for navigation elements
  colors: {
    // Background colors
    background: {
      header: platform.select({
        ios: '#FFFFFF',
        android: theme.colors.primary,
      }),
      tabBar: '#FFFFFF',
      card: '#FFFFFF',
      modal: '#FFFFFF',
    },
    
    // Border colors
    border: {
      header: platform.select({
        ios: '#C8C8CC',
        android: 'transparent',
      }),
      tabBar: '#C8C8CC',
    },
    
    // Text and icon colors
    tint: {
      header: platform.select({
        ios: theme.colors.primary,
        android: '#FFFFFF',
      }),
      tabBarActive: theme.colors.primary,
      tabBarInactive: '#8E8E93',
    },
  },
  
  // Shadow and elevation tokens
  elevation: {
    header: platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
    tabBar: platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  // Animation tokens for transitions
  animation: {
    timing: {
      // Standard animation duration
      standard: platform.select({
        ios: 350,
        android: 300,
      }),
      // Fast animation for small interactions
      fast: platform.select({
        ios: 200,
        android: 150,
      }),
    },
    easing: {
      // Import from react-native-reanimated or Animated
      // for platform-specific easing functions
    },
  },
};

export default navigationTokens;