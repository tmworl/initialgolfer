// src/ui/components/Typography.js
//
// Enhanced Typography component that builds on AppText
// Provides a consistent way to style text throughout the app

import React from 'react';
import { Text } from 'react-native';
import theme from '../theme';

/**
 * Typography Component
 * 
 * An enhanced text component with consistent styling.
 * Works with your existing theme while providing more flexibility.
 * 
 * @param {object} props
 * @param {string} props.variant - Text style variant (title, subtitle, body, secondary, button, caption)
 * @param {string} props.align - Text alignment (left, center, right)
 * @param {string} props.color - Text color (can be theme colors or direct values)
 * @param {string} props.weight - Font weight (normal, medium, semibold, bold)
 * @param {boolean} props.italic - Whether to use italic style
 * @param {object} props.style - Additional custom styles
 * @param {React.ReactNode} props.children - The text content
 */
const Typography = ({
  children,
  variant = 'body',
  align = 'left',
  color,
  weight,
  italic = false,
  style,
  ...otherProps
}) => {
  // Get base style from theme based on variant
  const variantStyle = theme.typography.styles[variant] || theme.typography.styles.body;
  
  // Determine which font weight to use
  let fontWeight = variantStyle.fontWeight;
  if (weight) {
    switch (weight) {
      case 'normal':
        fontWeight = theme.typography.fontWeight.normal;
        break;
      case 'medium':
        fontWeight = theme.typography.fontWeight.medium;
        break;
      case 'semibold':
        fontWeight = theme.typography.fontWeight.semibold;
        break;
      case 'bold':
        fontWeight = theme.typography.fontWeight.bold;
        break;
      default:
        fontWeight = weight; // Allow direct values like '500'
    }
  }
  
  // Determine color value
  let colorValue = variantStyle.color;
  if (color) {
    if (color in theme.colors) {
      colorValue = theme.colors[color];
    } else {
      colorValue = color; // Use direct color value
    }
  }
  
  // Build the combined style
  const textStyle = {
    ...variantStyle,
    fontWeight,
    fontStyle: italic ? 'italic' : 'normal',
    color: colorValue,
    textAlign: align,
  };
  
  return (
    <Text
      style={[textStyle, style]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};

export default Typography;