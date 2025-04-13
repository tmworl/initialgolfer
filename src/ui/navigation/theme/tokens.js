// src/ui/navigation/theme/tokens.js
//
// Navigation token system that defines the styling vocabulary for navigation
// Provides platform-specific values while referencing the core theme
// Now enhanced with Material Design 3 specification support

import { Platform } from 'react-native';
import theme from '../../theme';
import platform from './platform';
import platformDetection from '../../platform/detection';

/**
 * Determine if we should apply Material Design 3 enhancements
 * This is a strategic architectural decision that affects the entire navigation system
 */
const useM3 = platformDetection.isAndroid && platformDetection.supportsM3();

/**
 * Navigation Token System
 * 
 * This system defines all visual tokens specific to navigation components
 * while leveraging the core theme system. It handles platform-specific
 * values and provides a consistent interface for the integration layer.
 * 
 * Material Design 3 support is now integrated directly into the token system
 * to ensure architectural consistency and proper platform adaptation.
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
    
    // Tab bar spacing tokens - enhanced with M3 specifications
    tabBar: {
      // Height based on M3 specs (80dp) vs iOS standard (49pt)
      height: platform.select({
        ios: 49,
        android: useM3 ? 80 : 56,
      }),
      
      // Tab item spacing - enhanced with M3 specifications
      itemPadding: platform.select({
        ios: 4,
        // M3 defines distinct top/bottom padding
        android: useM3 ? 0 : 8, // Set to 0 to use paddingTop/Bottom directly
      }),
      
      // M3-specific padding metrics
      paddingTop: useM3 && platformDetection.isAndroid ? 12 : 4,
      paddingBottom: useM3 && platformDetection.isAndroid ? 16 : 4,
      
      // Spacing between icon and label in M3
      iconLabelSpacing: useM3 && platformDetection.isAndroid ? 4 : 2,
      
      // Icon size according to M3 specs (24dp)
      iconSize: platform.select({
        ios: 24,
        android: 24, // Consistent across Android versions
      }),
      
      // Bottom area spacing
      iconMargin: platform.select({
        ios: 4,
        android: useM3 ? 0 : 0,
      }),
      bottomInset: platform.getBottomSpace(),
      
      // M3 active indicator dimensions
      activeIndicator: useM3 ? {
        height: 32, // 32dp height
        width: 64,  // 64dp width
        widthIconOnly: 56, // 56dp when icon only
        borderRadius: 16, // 16dp radius for pill shape
        marginBottom: 4,  // 4dp spacing between indicator and text
      } : null,
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
          android: useM3 ? 'Roboto-Medium' : 'Roboto',
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
    
    // Tab bar typography - enhanced with M3 specifications
    tabBar: {
      label: {
        fontFamily: Platform.select({
          ios: 'System',
          android: useM3 ? 'Roboto-Medium' : 'Roboto',
          default: undefined,
        }),
        fontSize: platform.select({
          ios: 10,
          android: useM3 ? 12 : 12, // M3 uses 12sp
        }),
        fontWeight: platform.select({
          ios: '500',
          android: useM3 ? '500' : '400', // M3 uses Medium weight
        }),
        // M3 uses more prominent letter spacing
        letterSpacing: useM3 && platformDetection.isAndroid ? 0.5 : 0,
        // Colors moved to colors.tint section
      },
    },
  },
  
  // Color tokens for navigation elements
  colors: {
    // Background colors
    background: {
      header: platform.select({
        ios: '#FFFFFF',
        android: useM3 ? theme.colors.background : theme.colors.primary,
      }),
      tabBar: platform.select({
        ios: '#FFFFFF',
        android: useM3 ? theme.colors.background : '#FFFFFF',
      }),
      card: '#FFFFFF',
      modal: '#FFFFFF',
    },
    
    // Border colors
    border: {
      header: platform.select({
        ios: '#C8C8CC',
        android: 'transparent',
      }),
      tabBar: platform.select({
        ios: '#C8C8CC',
        android: useM3 ? 'transparent' : '#E0E0E0',
      }),
    },
    
    // Text and icon colors
    tint: {
      header: platform.select({
        ios: theme.colors.primary,
        android: useM3 ? theme.colors.text : '#FFFFFF',
      }),
      // Tab bar colors - enhanced with M3 state system
      tabBarActive: useM3 ? theme.colors.primary : theme.colors.primary,
      tabBarInactive: useM3 ? '#757575' : '#8E8E93', // M3 uses more distinct inactive color
      
      // M3-specific active indicator background
      tabBarActiveIndicator: useM3 ? `${theme.colors.primary}1A` : 'transparent', // Primary with 10% opacity
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
      android: useM3 ? {
        // M3 uses more subtle elevation for navigation elements
        elevation: 2, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1,
      } : {
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
      android: useM3 ? {
        // M3 uses a distinct elevation for navigation bar
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      } : {
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
        android: useM3 ? 300 : 300, // M3 uses consistent 300ms
      }),
      // Fast animation for small interactions
      fast: platform.select({
        ios: 200,
        android: useM3 ? 150 : 150, // M3 uses optimized timing
      }),
    },
    // Animation curves based on platform standards
    easing: {
      // M3 standard curves
      m3Standard: 'cubic-bezier(0.2, 0, 0, 1.0)',
      m3Emphasized: 'cubic-bezier(0.2, 0, 0, 1.0)',
      m3Decelerated: 'cubic-bezier(0.0, 0, 0.2, 1.0)',
      m3Accelerated: 'cubic-bezier(0.3, 0, 1.0, 1.0)',
    },
  },
  
  // Component-specific tokens for direct use in components
  components: {
    // Tab bar specific tokens
    tabBar: {
      // Tab item layout properties for each platform
      item: platform.select({
        ios: {
          minHeight: 49,
          paddingHorizontal: 10,
        },
        android: useM3 ? {
          // M3 tab item layout
          minHeight: 80,
          paddingTop: 12,
          paddingBottom: 16,
          paddingHorizontal: 0, // Horizontal centering is handled differently in M3
        } : {
          // Legacy Android
          minHeight: 56,
          paddingVertical: 8,
          paddingHorizontal: 12,
        },
      }),
      
      // Active indicator - only present in M3
      activeIndicator: useM3 ? {
        visible: true,
        height: 32,
        width: 64,
        widthIconOnly: 56,
        borderRadius: 16,
        backgroundColor: `${theme.colors.primary}1A`, // Primary with 10% opacity
        marginBottom: 4,
      } : {
        visible: false,
      },
      
      // Icon styling
      icon: platform.select({
        ios: {
          size: 28,
          activeSize: 30,
          activeOpacity: 1,
          inactiveOpacity: 0.7,
        },
        android: useM3 ? {
          // M3 icon styling
          size: 24, // M3 standard 24dp
          activeSize: 24, // No size change in M3
          activeOpacity: 1,
          inactiveOpacity: 0.8,
          marginBottom: 4, // 4dp spacing to label
        } : {
          // Legacy Android
          size: 24,
          activeSize: 24,
          activeOpacity: 1,
          inactiveOpacity: 0.6,
        },
      }),
      
      // Label styling
      label: platform.select({
        ios: {
          fontSize: 10,
          fontWeight: '500',
          activeOpacity: 1,
          inactiveOpacity: 0.7,
        },
        android: useM3 ? {
          // M3 label styling
          fontSize: 12, // M3 uses 12sp
          fontWeight: '500', // Medium weight
          letterSpacing: 0.5,
          activeOpacity: 1,
          inactiveOpacity: 0.8,
        } : {
          // Legacy Android
          fontSize: 12,
          fontWeight: '400',
          activeOpacity: 1,
          inactiveOpacity: 0.6,
        },
      }),
    },
  },
};

export default navigationTokens;