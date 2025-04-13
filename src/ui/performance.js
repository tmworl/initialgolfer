// src/ui/performance.js
//
// Performance monitoring and optimization utilities
// Provides tools for measuring and optimizing rendering performance

import { InteractionManager } from 'react-native';
import platformDetection from './platform/detection';

/**
 * Deferred execution with intelligent priority scheduling
 * 
 * @param {Function} task - Function to execute 
 * @param {number} priority - Task priority (1-5, 1 highest)
 * @returns {Promise} Promise that resolves when task completes
 */
export const deferredExecution = (task, priority = 3) => {
  return new Promise((resolve) => {
    // Calculate delay based on priority
    // Higher priority = shorter delay
    const baseDelay = 16; // Approx 1 frame
    const priorityFactor = Math.max(1, Math.min(5, priority));
    const delay = baseDelay * priorityFactor;
    
    // For time-sensitive tasks, run with minimal delay
    if (priority === 1) {
      setTimeout(() => {
        resolve(task());
      }, baseDelay);
      return;
    }
    
    // Use interaction manager for lower priority tasks
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        resolve(task());
      }, delay);
    });
  });
};

/**
 * Conditionally apply expensive visual effects based on device capability
 * 
 * @param {Object} options - Visual effect options
 * @param {Object} options.blur - Blur effect options
 * @param {Object} options.shadow - Shadow effect options
 * @param {Object} options.animation - Animation effect options
 * @returns {Object} Optimized visual effect properties
 */
export const optimizeVisualEffects = (options = {}) => {
  const result = {};
  
  // Device capability detection
  const isHighPerformanceDevice = 
    (platformDetection.isIOS && !platformDetection.isOlderDevice) || 
    (platformDetection.isAndroid && platformDetection.metrics.pixelRatio >= 2.5);
  
  // Optimize blur effects
  if (options.blur) {
    // Only apply blur on capable devices
    if (platformDetection.supportsBlurEffects && isHighPerformanceDevice) {
      result.blurEnabled = true;
      result.blurAmount = Math.min(options.blur.amount || 10, 
        platformDetection.getMaxBlurIntensity());
    } else {
      result.blurEnabled = false;
    }
  }
  
  // Optimize shadow effects
  if (options.shadow) {
    if (isHighPerformanceDevice) {
      // Full quality shadows for high-performance devices
      result.shadowProps = {
        shadowColor: options.shadow.color || '#000',
        shadowOffset: options.shadow.offset || { width: 0, height: 2 },
        shadowOpacity: options.shadow.opacity || 0.1,
        shadowRadius: options.shadow.radius || 3,
        elevation: platformDetection.isAndroid ? (options.shadow.elevation || 2) : undefined
      };
    } else {
      // Simplified shadows for lower-performance devices
      result.shadowProps = {
        shadowColor: options.shadow.color || '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: platformDetection.isAndroid ? 1 : undefined
      };
    }
  }
  
  // Optimize animations
  if (options.animation) {
    if (isHighPerformanceDevice) {
      // Full animations for high-performance devices
      result.animationProps = {
        duration: options.animation.duration || 300,
        useNativeDriver: true,
        // Enable spring physics on capable devices
        enableSpring: true
      };
    } else {
      // Simplified animations for lower-performance devices
      result.animationProps = {
        duration: Math.min(options.animation.duration || 300, 200),
        useNativeDriver: true,
        // Disable spring physics on lower-performance devices
        enableSpring: false
      };
    }
  }
  
  return result;
};

/**
 * Measure component render performance
 * 
 * @param {string} componentName - Name of component being measured
 * @param {Function} renderFunction - Function that renders the component
 * @returns {any} Result of render function
 */
export const measureRenderPerformance = (componentName, renderFunction) => {
  // Only measure in development
  if (__DEV__) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    console.log(`[PERF] ${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  }
  
  return renderFunction();
};

/**
 * Provide performance assessment for current device
 * 
 * @returns {Object} Performance assessment data
 */
export const getDevicePerformanceProfile = () => {
  // Calculate device performance metrics
  const { pixelRatio, screenWidth, screenHeight } = platformDetection.metrics;
  const screenPixels = screenWidth * screenHeight * pixelRatio * pixelRatio;
  
  // Determine performance tier
  let performanceTier = 'medium';
  
  if (platformDetection.isIOS) {
    // iOS devices generally have good performance
    if (platformDetection.isIPhone12OrNewer) {
      performanceTier = 'high';
    } else if (platformDetection.hasFaceID()) {
      performanceTier = 'medium-high';
    }
  } else if (platformDetection.isAndroid) {
    // Android performance varies widely
    if (pixelRatio >= 3) {
      performanceTier = 'high';
    } else if (pixelRatio >= 2.5) {
      performanceTier = 'medium-high';
    } else if (pixelRatio >= 2) {
      performanceTier = 'medium';
    } else {
      performanceTier = 'low';
    }
  }
  
  // Calculate recommended effect intensity
  const recommendedBlurIntensity = platformDetection.getMaxBlurIntensity();
  const recommendedShadowLevel = 
    performanceTier === 'high' ? 3 :
    performanceTier === 'medium-high' ? 2 :
    performanceTier === 'medium' ? 1 : 0;
  
  return {
    performanceTier,
    metrics: {
      pixelRatio,
      screenWidth,
      screenHeight,
      screenPixels
    },
    recommendations: {
      useBlurEffects: recommendedBlurIntensity > 20,
      blurIntensity: recommendedBlurIntensity,
      shadowLevel: recommendedShadowLevel,
      useSophisticatedAnimations: performanceTier !== 'low'
    }
  };
};

export default {
  deferredExecution,
  optimizeVisualEffects,
  measureRenderPerformance,
  getDevicePerformanceProfile
};