// src/ui/headerConfig.js
//
// This file provides a consistent header configuration for all stack navigators
// It uses `useSafeAreaInsets()` to properly account for the status bar height
// and maintains platform-specific styling.

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from './theme';

/**
 * Standard header configuration for all stack navigators
 * Ensures consistent styling while respecting platform UI guidelines (iOS vs Android)
 */
export const getHeaderOptions = (title, options = {}) => {
  // Get safe area insets to account for notches and status bars
  const insets = useSafeAreaInsets();

  return {
    title,
    // Apply base header configuration
    headerStyle: {
      backgroundColor: '#fff',  // White background for a clean UI
      elevation: 2,             // Android shadow
      shadowOpacity: 0.1,       // iOS shadow
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      borderBottomWidth: 0,     // Removes default border
    },
    // Set the title font style
    headerTitleStyle: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: theme.typography.fontSize.subtitle,
      fontWeight: Platform.OS === 'ios' ? '600' : '500',  // Semibold on iOS, Medium on Android
      color: theme.colors.text,
      textAlign: Platform.OS === 'ios' ? 'center' : 'left', // Follows platform conventions
    },
    // Customize the back button title (iOS only)
    headerBackTitleStyle: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: theme.typography.fontSize.body,
      fontWeight: '400',
      color: theme.colors.primary,
    },
    headerBackTitleVisible: false, // Hides back button title on iOS
    headerTintColor: theme.colors.primary, // Color for back button icon

    // Align title properly according to platform
    headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',

    // Dynamically adjust for the status bar height
    headerStatusBarHeight: insets.top,

    // Allow additional options to be merged
    ...options,
  };
};
