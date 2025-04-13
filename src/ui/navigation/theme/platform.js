// src/ui/navigation/theme/platform.js
//
// Platform detection module for navigation styling system
// Detects device capabilities and provides consistent platform information
// ENHANCED with Material Design 3 capability detection

import { Platform, Dimensions, StatusBar } from 'react-native';
import platformDetection from '../../platform/detection';

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
 * ENHANCED: Use Material Design 3 specifications for Android
 */
const getTabBarHeight = () => {
  // For Android with Material Design 3, use the M3 specification
  if (IS_ANDROID) {
    const m3Capabilities = platformDetection.getMaterialDesignLevel();
    if (m3Capabilities.supported && m3Capabilities.version >= 3) {
      // Material Design 3 uses 80dp for bottom navigation including padding
      // We'll use 56dp as the base height, plus any bottom spacing
      return 56;
    }
  }
  
  // Standard tab bar heights by platform
  const standardHeight = IS_IOS ? 49 : 56;
  
  // Add bottom spacing for devices with home indicators
  return standardHeight + getBottomSpace();
};

/**
 * Get the header height based on platform and device
 * ENHANCED: Use Material Design 3 specifications for Android
 */
const getHeaderHeight = () => {
  const statusBarHeight = getStatusBarHeight();
  
  // For Android with Material Design 3, use the M3 specification
  if (IS_ANDROID) {
    const m3Capabilities = platformDetection.getMaterialDesignLevel();
    if (m3Capabilities.supported && m3Capabilities.version >= 3) {
      // Material Design 3 uses 64dp for standard top app bar
      return statusBarHeight + 64;
    }
  }
  
  // Standard navbar/action bar height by platform
  const navigationBarHeight = IS_IOS ? 44 : 56;
  
  return statusBarHeight + navigationBarHeight;
};

/**
 * Get a value based on platform
 * Shorthand for Platform.select that includes additional device information
 * ENHANCED: Incorporates Material Design 3 detection
 */
const select = (config) => {
  // Check for Material Design 3 specific configuration
  if (IS_ANDROID && config.material3) {
    const m3Capabilities = platformDetection.getMaterialDesignLevel();
    if (m3Capabilities.supported && m3Capabilities.version >= 3) {
      return config.material3;
    }
  }
  
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
 * Check if the platform supports shared element transitions
 */
const supportsSharedElementTransitions = () => {
  // Currently only Android API level 21+ supports shared element transitions in React Navigation
  return IS_ANDROID && Platform.Version >= 21;
};

/**
 * NEW: Check if platform supports Material You dynamic color system
 * Dynamic color is a key feature of Material Design 3
 */
const supportsDynamicColors = () => {
  if (!IS_ANDROID) {
    return false;
  }
  
  const m3Capabilities = platformDetection.getMaterialDesignLevel();
  // Dynamic color requires Android 12+ (API level 31+) and Material Design 3 support
  return m3Capabilities.supported && m3Capabilities.version >= 3 && m3Capabilities.dynamic;
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
  supportsSharedElementTransitions,
  supportsDynamicColors, // NEW: Dynamic color system detection
};