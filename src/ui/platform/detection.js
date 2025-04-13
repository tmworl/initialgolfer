// src/ui/platform/detection.js
//
// Platform capability detection with function-based architecture
// Implements unified API pattern for consistent interface access

import { Platform, Dimensions, PixelRatio, NativeModules } from 'react-native';

// Cache window dimensions for performance optimization
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const PIXEL_RATIO = PixelRatio.get();

// Platform identification constants
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

// Android API level detection - critical for M3 support determination
const ANDROID_API_LEVEL = IS_ANDROID ? 
  parseInt(Platform.Version, 10) : 0;  // Platform.Version is API level on Android

/**
 * Determines if device natively supports Material Design 3
 * M3 is natively supported on Android 12 (API 31) and above
 */
const supportsM3 = () => {
  return IS_ANDROID && ANDROID_API_LEVEL >= 31;
};

/**
 * Detects if running on iPhone 12 or newer design models with squared edges.
 * This affects shadow rendering and corner radius calculations.
 */
const isIPhone12OrNewer = () => {
  if (!IS_IOS) return false;
  
  // iPhone 12/13/14/15 models have a minimum side length of 375 pts
  if (Math.min(WINDOW_WIDTH, WINDOW_HEIGHT) < 375) return false;
  
  // For face ID models, look at aspect ratio and device size
  return (
    // Match iPhone 12/13/14/15 aspect ratio (19.5:9) within tolerance
    (WINDOW_HEIGHT / WINDOW_WIDTH > 2.1 || WINDOW_WIDTH / WINDOW_HEIGHT > 2.1) &&
    // But exclude iPhone 11 and X models (which also have Face ID but rounded edges)
    WINDOW_HEIGHT >= 812
  );
};

/**
 * Detects if device has a notch or Dynamic Island, requiring special layout handling
 */
const hasNotchOrDynamicIsland = () => {
  if (!IS_IOS) return false;
  
  // All iPhone models from X onward have a notch or Dynamic Island
  // Use status bar height as a proxy for detecting notch
  return WINDOW_HEIGHT >= 812 && !Platform.isPad;
};

/**
 * Detects if device specifically has a Dynamic Island (iPhone 14 Pro and newer)
 */
const hasDynamicIsland = () => {
  if (!IS_IOS) return false;
  
  // Dynamic Island devices have specific dimensions
  // This approach works for iPhone 14 Pro, iPhone 14 Pro Max and newer
  if (Platform.isPad) return false;
  
  // Dynamic Island detection logic:
  // iPhone 14 Pro has 393pt width in portrait
  // iPhone 14 Pro Max has 430pt width in portrait
  // Other devices in this size range don't have Dynamic Island
  const portraitWidth = Math.min(WINDOW_WIDTH, WINDOW_HEIGHT);
  return (portraitWidth === 393 || portraitWidth === 430) && hasNotchOrDynamicIsland();
};

/**
 * Detects if device has Face ID (affects layout considerations)
 */
const hasFaceID = () => {
  if (!IS_IOS) return false;
  
  if (Platform.isPad) {
    // iPad Pro models have Face ID
    return Math.max(WINDOW_WIDTH, WINDOW_HEIGHT) >= 1024;
  }
  
  // iPhones with Face ID have a notch or Dynamic Island
  return hasNotchOrDynamicIsland();
};

/**
 * Detects if device has a home indicator, requiring bottom inset padding
 */
const hasHomeIndicator = () => {
  if (!IS_IOS) return false;
  
  // Devices with Face ID also have home indicators
  return hasFaceID();
};

/**
 * Returns status bar height, accounting for notches and Dynamic Island
 */
const getStatusBarHeight = () => {
  if (IS_IOS) {
    if (Platform.isPad) return 24;
    return hasNotchOrDynamicIsland() ? 47 : 20;
  }
  
  // Android implementation - check for cutout support
  if (IS_ANDROID) {
    // For Android 28+ (P), we can access StatusBar height directly
    if (ANDROID_API_LEVEL >= 28) {
      return Platform.constants?.StatusBarHeight || 24;
    }
    return 24; // Default for older versions
  }
  
  return 24; // Fallback
};

/**
 * Returns bottom safe area inset for home indicator or system UI
 */
const getBottomInset = () => {
  if (IS_IOS) {
    return hasHomeIndicator() ? 34 : 0;
  }
  
  // Android gesture navigation detection - approximation based on API level
  if (IS_ANDROID && ANDROID_API_LEVEL >= 29) { // Android 10+
    // Check window height ratio as indicator of gesture navigation
    // This is an approximation since there's no direct API to check
    const screenRatio = WINDOW_HEIGHT / WINDOW_WIDTH;
    if (screenRatio > 1.95) { // Taller devices likely use gesture navigation
      return 16; // Approximation for gesture bar height
    }
  }
  
  return 0; // Default when no bottom inset needed
};

/**
 * Determines if device supports blur effects efficiently
 */
const supportsBlurEffects = () => {
  // Feature detection for blur support
  // This is a runtime check for both capability and module availability
  try {
    // Technical architecture decision: Only enable blur effects on iOS
    // Android blur implementation is inconsistent across devices
    if (IS_IOS) {
      return true;
    }
    
    // For Android, only enable on high-performance devices with API 31+ (Android 12)
    if (IS_ANDROID && ANDROID_API_LEVEL >= 31 && PIXEL_RATIO >= 3) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Determines if device supports haptic feedback
 */
const supportsHaptics = () => {
  // Feature detection for haptics
  try {
    // Only iOS supports consistent haptics through our implementation
    if (IS_IOS) {
      return true;
    }
    
    // For Android 10+ (API 29+), check for hardware capability
    if (IS_ANDROID && ANDROID_API_LEVEL >= 29) {
      // This is a rough approximation - in production you might query the Vibrator service
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Returns the appropriate navigation bar height according to platform guidelines
 * This is critical for proper M3 implementation
 */
const getNavigationBarHeight = () => {
  if (IS_ANDROID) {
    // Material Design 3 navigation bar is taller (80dp)
    if (supportsM3()) {
      return 80;
    }
    // MD2 navigation bar is 56dp
    return 56;
  }
  
  // iOS tab bar standard height
  return IS_IOS ? 49 : 56;
};

/**
 * Returns the appropriate tab bar padding values according to platform guidelines
 * Particularly important for M3 implementation
 */
const getNavigationBarPadding = () => {
  if (IS_ANDROID && supportsM3()) {
    return {
      top: 12,      // 12dp top padding in M3
      bottom: 16,   // 16dp bottom padding in M3
      indicator: 4  // 4dp between active indicator and label
    };
  }
  
  // Default values for other platforms
  return {
    top: 8,
    bottom: 8,
    indicator: 0 // No indicator spacing for other platforms
  };
};

/**
 * Calculates maximum blur intensity supported by the device
 * Higher-powered devices can handle more intensive blur effects
 */
const getMaxBlurIntensity = () => {
  if (IS_IOS) {
    // iOS devices handle blur efficiently, can use higher values
    return 100;
  }
  
  if (IS_ANDROID) {
    // Scale based on device pixel ratio as a proxy for GPU capability
    if (PIXEL_RATIO >= 3) return 80;
    if (PIXEL_RATIO >= 2.5) return 60;
    if (PIXEL_RATIO >= 2) return 40;
    return 20; // Low-end device fallback
  }
  
  return 40; // Safe default
};

/**
 * Get safe insets for uniform cross-platform handling
 */
const getSafeAreaInsets = () => {
  return {
    top: getStatusBarHeight(),
    bottom: getBottomInset(),
    left: 0,
    right: 0
  };
};

/**
 * Platform selection utility for cross-platform code
 * @param {Object} options Platform-specific implementations
 * @returns {any} Selected implementation based on current platform
 */
const select = (options) => {
  const { ios, android, androidM3, androidLegacy, ...rest } = options;
  
  // Enhanced selection logic with M3 support
  if (IS_ANDROID) {
    // Check for M3-specific implementation first
    if (supportsM3() && androidM3 !== undefined) return androidM3;
    // Check for legacy Android implementation
    if (!supportsM3() && androidLegacy !== undefined) return androidLegacy;
    // Fall back to general Android implementation
    if (android !== undefined) return android;
  }
  
  if (IS_IOS && ios !== undefined) return ios;
  
  // Handle specific fallbacks for other platforms
  const defaultOption = rest.default;
  return defaultOption !== undefined ? defaultOption : null;
};

// Export a comprehensive platform detection API
export default {
  isIOS: IS_IOS,
  isAndroid: IS_ANDROID,
  androidApiLevel: ANDROID_API_LEVEL,
  supportsM3, // Function references maintain the architectural pattern
  isIPhone12OrNewer,
  hasNotchOrDynamicIsland,
  hasDynamicIsland,
  hasFaceID,
  hasHomeIndicator,
  getStatusBarHeight,
  getBottomInset,
  getNavigationBarHeight, // New M3-specific function
  getNavigationBarPadding, // New M3-specific function
  supportsBlurEffects,
  supportsHaptics,
  getMaxBlurIntensity,
  getSafeAreaInsets,
  select, // Enhanced platform selection with M3 support
  
  // Add common device metrics for rendering optimizations
  metrics: {
    screenWidth: WINDOW_WIDTH,
    screenHeight: WINDOW_HEIGHT,
    pixelRatio: PIXEL_RATIO
  }
};