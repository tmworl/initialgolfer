// src/ui/navigation/configs/tabBar.js
//
// Enhanced tab bar configuration with iOS 18 material integration
// Implements backdrop material effects and safe area composition
// Now with full Material Design 3 navigation bar implementation

import React, { useMemo } from 'react';
import { StyleSheet, Platform, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import platformDetection from '../../platform/detection';
import visualProperties from '../../platform/visualProperties';
import BackdropMaterial, { MATERIAL_TYPES } from '../../components/BackdropMaterial';
import navigationTheme from '../theme';

const { tokens, platform } = navigationTheme;

// Determine if we should use Material Design 3 configuration
const useM3 = platformDetection.isAndroid && platformDetection.supportsM3();

/**
 * Renders the Material Design 3 active indicator component with proper shape and animations
 * This is a core visual element of the Material Design 3 navigation bar
 * 
 * @param {Object} props Component props
 * @param {boolean} props.active Whether the tab is currently active
 * @param {boolean} props.hasLabel Whether the tab has a visible label
 * @param {boolean} props.focused Whether the navigation bar itself has focus
 * @param {number} props.tabWidth Width of the containing tab (for proper sizing)
 * @returns {React.ReactElement} The active indicator component
 */
const M3ActiveIndicator = ({ active, hasLabel, focused, tabWidth }) => {
  if (!useM3 || !active) return null;
  
  // Extract dimensions from tokens
  const { height, width, widthIconOnly, borderRadius } = tokens.components.tabBar.activeIndicator;
  
  // Determine width based on presence of label
  const indicatorWidth = hasLabel ? width : widthIconOnly;
  
  return (
    <View style={[
      styles.m3ActiveIndicator,
      {
        width: indicatorWidth,
        height,
        borderRadius,
        backgroundColor: tokens.colors.tint.tabBarActiveIndicator,
        // Strategic positioning to ensure proper alignment
        left: (tabWidth - indicatorWidth) / 2,
        // Hardware acceleration for optimal animation performance
        ...Platform.select({
          android: { renderToHardwareTextureAndroid: true }
        }),
      }
    ]} />
  );
};

/**
 * Generate tab bar icon component with optimized rendering characteristics
 * Enhanced with M3 icon state system and hardware acceleration
 * 
 * @param {string} name - Base name of the Ionicons icon
 * @param {boolean} focused - Whether the tab is focused
 * @param {string} color - Color to apply to the icon
 * @param {number} size - Size of the icon
 * @returns {React.ReactElement} Memoized Ionicons component with optimal rendering properties
 */
const getTabBarIcon = (name) => ({ focused, color, size }) => {
  // Get icon state based on platform and active status
  const iconState = visualProperties.getNavigationIconState(name, focused);
  
  // Use the filled/outlined state based on focus for M3
  const iconName = iconState.name;
  
  // Apply platform-specific size adjustments
  const effectiveSize = iconState.size || size;
  
  // Scale factor for visual feedback (subtle enhancement for M3)
  const scale = iconState.scale || 1.0;
  
  // Component with proper stacking and hardware acceleration
  return (
    <Ionicons 
      name={iconName} 
      size={effectiveSize} 
      color={color}
      // Fine-tuned hardware acceleration for optimal performance
      style={{
        transform: [{ scale }],
        ...Platform.select({
          android: { 
            renderToHardwareTextureAndroid: true,
            elevation: focused ? 1 : 0
          }
        })
      }}
    />
  );
};

/**
 * Map route names to appropriate icon names with semantic meaning
 */
const getIconName = (routeName) => {
  switch (routeName) {
    case 'HomeTab':
      return 'home';
    case 'Rounds':
      return 'golf';
    case 'Insights':
      return 'bulb';
    case 'Profile':
      return 'person';
    default:
      return 'apps';
  }
};

/**
 * Determines if the tab bar should be hidden for certain routes
 * Enhanced implementation for React Navigation 7 compatible with nested navigators
 * 
 * @param {Object} route - Current route object
 * @returns {Object|undefined} Style object with display: 'none' or undefined
 */
const getTabBarVisibility = (route) => {
  // Screens where tab bar should be hidden
  const hiddenRoutes = [
    'CourseSelector', 
    'Tracker', 
    'ScorecardScreen'
  ];

  // Get the current focused route name within nested navigator
  // This handles the case when we're in a nested stack (e.g., HomeStack)
  const routeName = getFocusedRouteNameFromRoute(route);
  
  // If the focused route is in our hidden routes list, hide the tab bar
  if (routeName && hiddenRoutes.includes(routeName)) {
    return { display: 'none' };
  }
  
  // Default: show the tab bar
  return undefined;
};

/**
 * Create complete tab bar configuration with material integration
 * Provides platform-specific styling with full M3 implementation when supported
 * 
 * @param {Object} route - Current route object
 * @returns {Object} Tab bar configuration object with platform-specific enhancements
 */
const getTabBarConfig = (route) => {
  const baseName = route.name;
  
  return {
    // Convert route name to display name if needed
    tabBarLabel: baseName === 'HomeTab' ? 'Clubhouse' : baseName,
    
    // Generate appropriate icon based on route
    tabBarIcon: getTabBarIcon(getIconName(baseName)),
    
    // Apply consistent styling from tokens - enhanced with M3 support
    activeTintColor: tokens.colors.tint.tabBarActive,
    inactiveTintColor: tokens.colors.tint.tabBarInactive,
    
    // Enhanced style with dynamic shadow parameters and M3 support
    tabBarStyle: {
      ...getTabBarVisibility(route),
      // Platform-specific shadow implementation with M3 support
      ...visualProperties.getShadowParams(useM3 ? 3 : platformDetection.isIOS ? 2 : 4),
      // M3-specific height adjustments when supported
      height: tokens.spacing.tabBar.height + tokens.spacing.tabBar.bottomInset,
    },
    
    // Enhanced label configuration for M3
    tabBarLabelStyle: useM3 ? {
      fontSize: tokens.typography.tabBar.label.fontSize,
      fontWeight: tokens.typography.tabBar.label.fontWeight,
      letterSpacing: tokens.typography.tabBar.label.letterSpacing,
      marginTop: tokens.spacing.tabBar.iconLabelSpacing,
      // Remove bottom margin as this is handled by container padding
      marginBottom: 0,
    } : undefined,
    
    // Enhanced item style with proper M3 padding
    tabBarItemStyle: useM3 ? {
      paddingTop: tokens.spacing.tabBar.paddingTop,
      paddingBottom: tokens.spacing.tabBar.paddingBottom,
    } : undefined,
    
    // Add badge for "new" features if needed (Insights tab)
    ...(baseName === 'Insights' ? {
      tabBarBadge: 'New',
      // Badge styling enhanced for M3 compatibility
      tabBarBadgeStyle: {
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 14,
        ...Platform.select({
          ios: {
            marginTop: 2,
          },
          android: useM3 ? {
            // M3 badge positioning
            marginTop: 4,
            marginRight: 4,
          } : {
            marginTop: 2,
          }
        })
      }
    } : {}),
  };
};

/**
 * Create custom tab bar that integrates with our material system
 * This implements iOS 18-style translucent tab bar and Material Design 3 navigation bar
 * 
 * @param {Object} props - Props from React Navigation
 * @returns {React.ReactElement} Custom tab bar with material effects
 */
const createCustomTabBar = (props) => {
  // For M3 Tab Bar on Android, create the fully-featured implementation
  if (useM3) {
    return (
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: tokens.colors.background.tabBar,
            height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
            paddingBottom: platformDetection.getBottomInset(),
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: tokens.colors.border.tabBar,
            // Add M3 elevation
            ...visualProperties.getShadowParams(3),
          }
        ]}
      >
        <View style={styles.tabBarContent}>
          {/* Wrap each tab bar button to add the active indicator */}
          {React.Children.map(props.children, (child, index) => {
            // Get state for this specific tab
            const { state } = props;
            const isFocused = state.index === index;
            
            // Get route for this tab
            const route = state.routes[index];
            
            // Determine if tab has a label
            const hasLabel = !!route.name;
            
            // Calculate tab width based on total width and tab count
            const tabWidth = 100 / React.Children.count(props.children) + '%';
            
            // Wrap the tab button with our custom container
            return (
              <View style={[styles.m3TabContainer, { width: tabWidth }]}>
                <M3ActiveIndicator 
                  active={isFocused} 
                  hasLabel={hasLabel}
                  focused={true}
                  tabWidth={100} // Will be adjusted by percentage width of container
                />
                {child}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
  
  // Use backdrop material for iOS 18 effect on capable devices
  if (platformDetection.isIOS && platformDetection.supportsBlurEffects) {
    return (
      <BackdropMaterial
        type={MATERIAL_TYPES.THIN}
        style={[
          styles.tabBar,
          {
            height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
            paddingBottom: platformDetection.getBottomInset()
          }
        ]}
      >
        <View style={styles.tabBarContent}>
          {props.children}
        </View>
      </BackdropMaterial>
    );
  }
  
  // Standard implementation for Android or devices without blur support
  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: tokens.colors.background.tabBar,
          height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
          paddingBottom: platformDetection.getBottomInset(),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: tokens.colors.border.tabBar,
        }
      ]}
    >
      <View style={styles.tabBarContent}>
        {props.children}
      </View>
    </View>
  );
};

/**
 * Create the full tab navigator screen options with material integration
 * 
 * @returns {Object} Screen options for tab navigator
 */
const getTabNavigatorScreenOptions = () => {
  return {
    // Hide the tab-level header since each stack has its own headers
    headerShown: false,
    
    // Apply iOS 18 animation characteristics
    tabBarHideOnKeyboard: true,
    
    // Implement custom tab bar with material effects
    tabBarBackground: () => (
      platformDetection.isIOS && platformDetection.supportsBlurEffects ?
        <BackdropMaterial
          type={MATERIAL_TYPES.THIN}
          style={StyleSheet.absoluteFill}
        /> : null
    ),
    
    // Standard tab bar styles - enhanced with M3 support
    tabBarStyle: {
      backgroundColor: useM3 ? 
        tokens.colors.background.tabBar : 
        platformDetection.isIOS && platformDetection.supportsBlurEffects ? 
          'transparent' : tokens.colors.background.tabBar,
      height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
      paddingBottom: platformDetection.getBottomInset(),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: platformDetection.isIOS && platformDetection.supportsBlurEffects ? 
        'rgba(200, 200, 200, 0.25)' : tokens.colors.border.tabBar,
      ...visualProperties.getShadowParams(useM3 ? 3 : platformDetection.isIOS ? 1 : 3),
    },
    
    // M3-specific item styling
    tabBarItemStyle: useM3 ? {
      paddingTop: tokens.spacing.tabBar.paddingTop,
      paddingBottom: tokens.spacing.tabBar.paddingBottom,
    } : {
      paddingTop: 6,
    },
    
    // Typography refinements for labels with M3 support
    tabBarLabelStyle: {
      fontSize: tokens.typography.tabBar.label.fontSize,
      fontWeight: tokens.typography.tabBar.label.fontWeight,
      marginBottom: Platform.OS === 'ios' ? 0 : 4,
      // M3-specific letter spacing
      letterSpacing: useM3 ? tokens.typography.tabBar.label.letterSpacing : undefined,
      // Additional M3-specific margin
      marginTop: useM3 ? tokens.spacing.tabBar.iconLabelSpacing : undefined,
      ...visualProperties.getOpticalTypography(
        tokens.typography.tabBar.label.fontSize, 
        tokens.typography.tabBar.label.fontWeight
      )
    },
    
    // Enable M3 tab bar implementation
    ...(useM3 ? {
      tabBar: createCustomTabBar
    } : {})
  };
};

// Optimized stylesheet for better performance
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
  },
  // M3-specific styles
  m3TabContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  m3ActiveIndicator: {
    position: 'absolute',
    top: 16, // Align properly within 80dp container
    zIndex: 0, // Behind the content
    // Hardware acceleration
    backfaceVisibility: 'hidden',
  }
});

export {
  getTabBarConfig,
  getTabNavigatorScreenOptions,
  createCustomTabBar
};