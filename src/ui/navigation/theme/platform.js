// src/ui/navigation/theme/platform.js
//
// Platform detection module for navigation styling system
// Detects device capabilities and provides consistent platform information

import { Platform, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Cache window dimensions for performance
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// Constants for device detection
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const IS_IPHONE_X_OR_NEWER = IS_IOS && 
  !Platform.isPad && 
  (WINDOW_HEIGHT >= 812 || WINDOW_WIDTH >= 812);

/**
 * Detect if device has a notch
 * Simple detection based on device dimensions and platform
 */
const hasNotch = () => {
  return IS_IPHONE_X_OR_NEWER || (IS_ANDROID && StatusBar.currentHeight > 24);
};

/**
 * Detect if device has a home indicator (iPhone X and newer)
 */
const hasHomeIndicator = () => {
  return IS_IPHONE_X_OR_NEWER;
};

/**
 * Get the status bar height based on platform and device
 */
const getStatusBarHeight = (skipAndroid = false) => {
  if (IS_IOS) {
    return hasNotch() ? 44 : 20;
  }
  
  // Return 0 for Android if skipAndroid is true
  if (skipAndroid) return 0;
  
  // Otherwise, use the actual status bar height
  return StatusBar.currentHeight || 0;
};

/**
 * Get the bottom spacing for elements like tab bars
 * Accounts for the home indicator on newer iOS devices
 */
const getBottomSpace = () => {
  return hasHomeIndicator() ? 34 : 0;
};

/**
 * Get the tab bar height based on platform and device
 */
const getTabBarHeight = () => {
  // Standard tab bar heights by platform
  const standardHeight = IS_IOS ? 49 : 56;
  
  // Add bottom spacing for devices with home indicators
  return standardHeight + getBottomSpace();
};

/**
 * Get the header height based on platform and device
 */
const getHeaderHeight = () => {
  const statusBarHeight = getStatusBarHeight();
  
  // Standard navbar/action bar height by platform
  const navigationBarHeight = IS_IOS ? 44 : 56;
  
  return statusBarHeight + navigationBarHeight;
};

/**
 * Get a value based on platform
 * Shorthand for Platform.select that includes additional device information
 */
const select = (config) => {
  // Get the base value from Platform.select
  const baseValue = Platform.select({
    ios: config.ios,
    android: config.android,
    default: config.default || config.android || config.ios,
  });
  
  // If there are special values for notched devices, apply them
  if (IS_IOS && hasNotch() && config.iosNotch) {
    return config.iosNotch;
  }
  
  return baseValue;
};

/**
 * Check if the device is a tablet
 */
const isTablet = () => {
  const pixelDensity = Dimensions.get('window').scale;
  const adjustedWidth = WINDOW_WIDTH * pixelDensity;
  const adjustedHeight = WINDOW_HEIGHT * pixelDensity;
  
  return Math.sqrt(Math.pow(adjustedWidth, 2) + Math.pow(adjustedHeight, 2)) >= 1000;
};

/**
 * Create hook for getting safe area insets along with platform information
 */
const usePlatformInsets = () => {
  const insets = useSafeAreaInsets();
  
  return {
    ...insets,
    // Provide additional platform-specific values
    bottomSpace: getBottomSpace(),
    headerHeight: getHeaderHeight(),
    tabBarHeight: getTabBarHeight(),
  };
};

/**
 * Check if the platform supports shared element transitions
 */
const supportsSharedElementTransitions = () => {
  // Currently only Android API level 21+ supports shared element transitions in React Navigation
  return IS_ANDROID && Platform.Version >= 21;
};

// Export the platform detection utilities
export default {
  isIOS: IS_IOS,
  isAndroid: IS_ANDROID,
  isPad: Platform.isPad || isTablet(),
  hasNotch: hasNotch(),
  hasHomeIndicator: hasHomeIndicator(),
  getStatusBarHeight,
  getBottomSpace,
  getTabBarHeight,
  getHeaderHeight,
  select,
  usePlatformInsets,
  supportsSharedElementTransitions,
};