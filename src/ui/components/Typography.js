// src/ui/components/Typography.js
//
// Enhanced typography system with optical size adjustments
// Implements SF Pro-specific weight mapping and tracking calculations

import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import platformDetection from '../platform/detection';
import visualProperties from '../platform/visualProperties';
import theme from '../theme';

/**
 * Typography Component
 * 
 * Enhanced text component with optical size adjustments and proper vertical rhythm.
 * Automatically applies platform-specific typography optimizations based on context.
 * 
 * @param {Object} props Component props
 * @param {string} props.variant - Text style variant (title, subtitle, body, secondary, button, caption)
 * @param {string} props.align - Text alignment (left, center, right)
 * @param {string} props.color - Text color (can be theme colors or direct values)
 * @param {string} props.weight - Font weight (normal, medium, semibold, bold)
 * @param {boolean} props.italic - Whether to use italic style
 * @param {number} props.size - Custom font size override
 * @param {number} props.opacity - Text opacity for visual hierarchy
 * @param {Object} props.style - Additional custom styles
 * @param {React.ReactNode} props.children - The text content
 */
const Typography = ({
  children,
  variant = 'body',
  align = 'left',
  color,
  weight,
  italic = false,
  size,
  opacity,
  style,
  ...otherProps
}) => {
  // Get base style from theme based on variant
  const baseStyle = theme.typography.styles[variant] || theme.typography.styles.body;
  
  // Determine effective font size (prop override or variant default)
  const fontSize = size || baseStyle.fontSize;
  
  // Determine effective font weight
  let fontWeight = baseStyle.fontWeight;
  if (weight) {
    switch (weight) {
      case 'normal':
      case 'regular':
        fontWeight = '400';
        break;
      case 'medium':
        fontWeight = '500';
        break;
      case 'semibold':
        fontWeight = '600';
        break;
      case 'bold':
        fontWeight = '700';
        break;
      default:
        fontWeight = weight; // Allow direct numeric weights
    }
  }
  
  // Apply optical adjustments based on size and weight
  // This is critical for iOS 18's typography system which uses SF Pro optical sizes
  const opticalProps = visualProperties.getOpticalTypography(fontSize, fontWeight);
  
  // Determine color value (prop > theme color > variant default)
  let textColor = baseStyle.color;
  if (color) {
    textColor = theme.colors[color] || color; // Use theme color or direct value
  }
  
  // Construct the final text style with all adjustments
  const textStyle = {
    // Base variant style
    ...baseStyle,
    
    // Optical size adjustments
    fontSize: opticalProps.fontSize,
    fontWeight: opticalProps.fontWeight,
    lineHeight: opticalProps.lineHeight,
    letterSpacing: opticalProps.letterSpacing,
    
    // Optional fontFamily from optical props
    ...(opticalProps.fontFamily ? { fontFamily: opticalProps.fontFamily } : {}),
    
    // Style customizations
    color: textColor,
    textAlign: align,
    fontStyle: italic ? 'italic' : 'normal',
    opacity: opacity !== undefined ? opacity : 1,
  };
  
  // Apply platform-specific text optimizations
  const platformStyle = {};
  
  if (platformDetection.isIOS) {
    // iOS-specific text rendering optimizations
    platformStyle.fontVariant = baseStyle.fontSize >= 20 ? ['proportional-nums'] : undefined;
    
    // Apply SF Pro Text for smaller sizes, SF Pro Display for larger
    if (!baseStyle.fontFamily) {
      platformStyle.fontFamily = fontSize >= 20 ? undefined : undefined; // iOS uses system font
    }
  } else if (platformDetection.isAndroid) {
    // Android-specific text rendering optimizations
    platformStyle.includeFontPadding = false; // Remove extra padding for more precise control
    
    // Adjust line height slightly to match iOS text placement
    platformStyle.lineHeight = textStyle.lineHeight * 1.05;
    
    // Apply Roboto by default unless fontFamily is explicitly set
    if (!baseStyle.fontFamily) {
      platformStyle.fontFamily = 'Roboto';
    }
  }
  
  return (
    <Text
      style={[textStyle, platformStyle, style]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};

export default Typography;