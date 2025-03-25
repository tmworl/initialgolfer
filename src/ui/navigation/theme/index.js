// src/ui/navigation/theme/index.js
//
// Navigation theme integration layer
// Converts tokens into React Navigation configuration objects
// Provides the public API for the navigation styling system

import { Platform, StyleSheet } from 'react-native';
import platform from './platform';
import tokens from './tokens';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

/**
 * Creates a complete set of options for React Navigation screen headers
 * 
 * @param {string} title - The header title text
 * @param {Object} options - Additional options to override defaults
 * @returns {Object} Complete header configuration object
 */
const getHeaderOptions = (title, options = {}) => {
  return {
    title,
    headerStyle: {
      backgroundColor: tokens.colors.background.header,
      height: tokens.spacing.header.height + tokens.spacing.header.statusBarHeight,
      ...tokens.elevation.header,
      borderBottomWidth: platform.isIOS ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: tokens.colors.border.header,
    },
    headerTitleStyle: {
      ...tokens.typography.header.title,
    },
    headerBackTitleStyle: platform.isIOS ? {
      ...tokens.typography.header.backTitle,
    } : undefined,
    headerTintColor: tokens.colors.tint.header,
    headerBackTitleVisible: platform.isIOS,
    headerTitleAlign: platform.select({
      ios: 'center',
      android: 'left',
    }),
    ...options,
  };
};

/**
 * Creates a complete set of options for React Navigation tab bar
 * 
 * @param {Object} route - Current route object
 * @returns {Object} Complete tab bar configuration object
 */
const getTabBarOptions = (route) => {
  return {
    activeTintColor: tokens.colors.tint.tabBarActive,
    inactiveTintColor: tokens.colors.tint.tabBarInactive,
    labelStyle: {
      ...tokens.typography.tabBar.label,
    },
    tabStyle: {
      paddingVertical: tokens.spacing.tabBar.itemPadding,
    },
    style: {
      backgroundColor: tokens.colors.background.tabBar,
      height: tokens.spacing.tabBar.height,
      paddingBottom: tokens.spacing.tabBar.bottomInset,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.colors.border.tabBar,
      ...tokens.elevation.tabBar,
    },
  };
};

/**
 * Determines if the tab bar should be hidden for certain routes
 * 
 * @param {Object} route - Current route object
 * @returns {Object|undefined} Style object with display: 'none' or undefined
 */
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  
  // Hide the tab bar on these screens
  const hiddenRoutes = [
    'CourseSelector', 
    'Tracker', 
    'ScorecardScreen'
  ];
  
  if (hiddenRoutes.includes(routeName)) {
    return { display: 'none' };
  }
  
  return undefined;
};

/**
 * Creates stack navigator screen options with consistent styling
 * 
 * @param {Object} options - Additional options to override defaults 
 * @returns {Object} Screen options for stack navigator
 */
const getStackScreenOptions = (options = {}) => {
  return {
    headerShown: true,
    cardStyle: {
      backgroundColor: tokens.colors.background.card,
    },
    // Animation configurations for transitions
    cardStyleInterpolator: platform.select({
      ios: require('@react-navigation/stack').CardStyleInterpolators.forHorizontalIOS,
      android: require('@react-navigation/stack').CardStyleInterpolators.forFadeFromBottomAndroid,
    }),
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: tokens.animation.timing.standard,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: tokens.animation.timing.standard,
        },
      },
    },
    ...options,
  };
};

/**
 * Creates modal screen options with appropriate animations
 * 
 * @param {Object} options - Additional options to override defaults
 * @returns {Object} Screen options for modal presentations
 */
const getModalScreenOptions = (options = {}) => {
  return {
    cardStyle: {
      backgroundColor: tokens.colors.background.modal,
    },
    cardStyleInterpolator: platform.select({
      ios: require('@react-navigation/stack').CardStyleInterpolators.forModalPresentationIOS,
      android: require('@react-navigation/stack').CardStyleInterpolators.forRevealFromBottomAndroid,
    }),
    ...options,
  };
};

// Export the public API
export default {
  tokens,
  platform,
  getHeaderOptions,
  getTabBarOptions,
  getTabBarVisibility,
  getStackScreenOptions,
  getModalScreenOptions,
};