// src/ui/components/BackdropMaterial.js
//
// iOS 18 material system implementation
// Creates translucent surfaces with blur effects and proper vibrancy

import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import platformDetection from '../platform/detection';
import visualProperties from '../platform/visualProperties';

// Resilient BlurView integration with capability detection
let BlurView;
try {
  // Dynamic import with error handling
  const BlurViewModule = require('@react-native-community/blur');
  BlurView = BlurViewModule.BlurView;
} catch (e) {
  // Fallback View implementation when module is unavailable
  BlurView = ({ style, children, ...props }) => {
    return (
      <View 
        style={[style, { backgroundColor: 'rgba(255,255,255,0.85)' }]} 
        {...props}
      >
        {children}
      </View>
    );
  };
  console.warn('BlurView module not available - using fallback implementation');
}

// Material types that affect appearance properties
export const MATERIAL_TYPES = {
  // Ultra-thin blurred material used in iOS 18 headers and toolbars
  THIN: 'thin',
  // Standard material used for cards and surfaces
  REGULAR: 'regular',
  // Thicker material for modal sheets and elevated content
  THICK: 'thick',
  // Solid material with no translucency for performance optimization
  SOLID: 'solid'
};

/**
 * BackdropMaterial Component
 * 
 * Creates iOS 18-style material surfaces with proper translucency and blur effects.
 * Automatically handles platform-specific implementations and performance optimizations.
 * 
 * @param {Object} props Component props
 * @param {string} props.type Material type (thin, regular, thick, solid)
 * @param {number} props.intensity Blur intensity override (10-100)
 * @param {string} props.backgroundColor Base background color
 * @param {number} props.opacity Opacity value (0-1)
 * @param {boolean} props.disableBlur Force disable blur effects
 * @param {Object} props.style Additional styles for the material container
 * @param {React.ReactNode} props.children Content to render within the material
 */
const BackdropMaterial = ({
  type = MATERIAL_TYPES.REGULAR,
  intensity,
  backgroundColor = '#FFFFFF',
  opacity,
  disableBlur = false,
  style,
  children,
  ...otherProps
}) => {
  // Determine if this device supports blur effects
  const blurSupported = platformDetection.supportsBlurEffects && !disableBlur && BlurView;
  
  // Calculate blur parameters based on material type
  const blurProperties = useMemo(() => {
    // Map material types to semantic blur intensities
    const intensityMap = {
      [MATERIAL_TYPES.THIN]: 'light',
      [MATERIAL_TYPES.REGULAR]: 'regular',
      [MATERIAL_TYPES.THICK]: 'heavy',
      [MATERIAL_TYPES.SOLID]: 'none'
    };
    
    // Calculate blur intensity, allowing custom override
    const blurIntensity = intensity || visualProperties.getBlurIntensity(intensityMap[type]);
    
    // Determine material opacity based on type
    const opacityMap = {
      [MATERIAL_TYPES.THIN]: 0.5,
      [MATERIAL_TYPES.REGULAR]: 0.7,
      [MATERIAL_TYPES.THICK]: 0.85,
      [MATERIAL_TYPES.SOLID]: 1.0
    };
    
    // Use provided opacity or fall back to mapped value
    const materialOpacity = opacity !== undefined ? opacity : opacityMap[type];
    
    // Get backdrop color with computed opacity
    const backdropColor = visualProperties.getBackdropColor(backgroundColor, materialOpacity);
    
    // Select appropriate blur type for iOS
    let blurType = 'light';
    if (Platform.OS === 'ios') {
      blurType = type === MATERIAL_TYPES.THIN ? 'thinMaterialLight' :
                 type === MATERIAL_TYPES.REGULAR ? 'materialLight' : 
                 'thickMaterialLight';
    }
    
    return {
      blurType,
      blurIntensity,
      backdropColor
    };
  }, [type, intensity, backgroundColor, opacity]);
  
  // For iOS, use native materials when possible
  if (Platform.OS === 'ios' && blurSupported && type !== MATERIAL_TYPES.SOLID) {
    return (
      <BlurView
        style={[styles.container, style]}
        blurType={blurProperties.blurType}
        blurAmount={blurProperties.blurIntensity}
        reducedTransparencyFallbackColor={blurProperties.backdropColor}
        {...otherProps}
      >
        {children}
      </BlurView>
    );
  }
  
  // For Android or when blur isn't supported, use semi-transparent background
  return (
    <View 
      style={[
        styles.container,
        { backgroundColor: blurProperties.backdropColor },
        style
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  }
});

export default BackdropMaterial;