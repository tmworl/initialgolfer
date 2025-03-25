// src/ui/navigation/configs/tabBar.js
//
// Tab bar configuration factory
// Creates configuration objects for bottom tab navigators

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import navigationTheme from '../theme';
const { tokens, platform, getTabBarOptions, getTabBarVisibility } = navigationTheme;

/**
 * Generate tab bar icon component
 * 
 * @param {string} name - Base name of the Ionicons icon
 * @param {boolean} focused - Whether the tab is focused
 * @param {string} color - Color to apply to the icon
 * @param {number} size - Size of the icon
 * @returns {React.Component} Ionicons component
 */
const getTabBarIcon = (name) => ({ focused, color, size }) => {
  // Use outline version when not focused, solid when focused
  const iconName = focused ? name : `${name}-outline`;
  return <Ionicons name={iconName} size={size} color={color} />;
};

/**
 * Get icon name mapping for the main tabs
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
 * Create complete tab bar configuration for the main navigator
 * 
 * @param {Object} route - Current route object
 * @returns {Object} Tab bar configuration object
 */
const getTabBarConfig = (route) => {
  const baseName = route.name;
  
  return {
    // Convert route name to display name if needed
    tabBarLabel: baseName === 'HomeTab' ? 'Clubhouse' : baseName,
    
    // Generate appropriate icon based on route
    tabBarIcon: getTabBarIcon(getIconName(baseName)),
    
    // Apply consistent styling from tokens
    ...getTabBarOptions(route),
    
    // Control visibility based on child routes
    tabBarStyle: getTabBarVisibility(route),
    
    // Add badge for "new" features if needed (Insights tab)
    ...(baseName === 'Insights' ? {
      tabBarBadge: 'New',
    } : {}),
  };
};

/**
 * Create the full tab navigator screen options
 * 
 * @returns {Object} Screen options for tab navigator
 */
const getTabNavigatorScreenOptions = () => {
  return {
    // Hide the tab-level header since each stack has its own headers
    headerShown: false,
    
    // Note: We've removed the custom tabBarButton implementation that was
    // causing issues with TouchableNativeFeedback.Ripple.
    // This can be revisited in a future UI refinement phase.
  };
};

export {
  getTabBarConfig,
  getTabNavigatorScreenOptions,
};