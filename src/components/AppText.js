// src/components/AppText.js
//
// This component provides a consistent way to style text throughout the app,
// using system fonts for better performance and native appearance.
// It accepts various props to control the text style and appearance.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import theme from '../ui/theme';

/**
 * AppText Component
 * 
 * A custom Text component that uses system fonts with consistent styling.
 * 
 * @param {object} props - Component props
 * @param {string} props.variant - The text style variant (title, subtitle, body, secondary, button, caption)
 * @param {object} props.style - Additional custom styles to apply
 * @param {boolean} props.bold - Whether to use bold weight (overrides the variant's default weight)
 * @param {boolean} props.medium - Whether to use medium weight (500)
 * @param {boolean} props.semibold - Whether to use semibold weight (600)
 * @param {boolean} props.italic - Whether to use italic style
 * @param {string} props.color - Text color (overrides the variant's default color)
 * @param {number} props.size - Font size (overrides the variant's default size)
 * @param {string|ReactNode} props.children - The text content
 */
const AppText = ({ 
  children, 
  variant = 'body', 
  style, 
  bold = false,
  medium = false,
  semibold = false,
  italic = false,
  color,
  size,
  ...otherProps 
}) => {
  // Get the base style from theme based on variant
  const variantStyle = theme.typography.styles[variant] || theme.typography.styles.body;
  
  // Determine which font weight to use
  let fontWeight = variantStyle.fontWeight;
  if (bold) {
    fontWeight = theme.typography.fontWeight.bold;
  } else if (semibold) {
    fontWeight = theme.typography.fontWeight.semibold;
  } else if (medium) {
    fontWeight = theme.typography.fontWeight.medium;
  }
  
  // Create the style for this text instance
  const textStyle = {
    ...variantStyle,
    fontWeight,
    fontStyle: italic ? 'italic' : 'normal',
    color: color || variantStyle.color,
    fontSize: size || variantStyle.fontSize,
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

/**
 * Usage examples:
 * 
 * <AppText>Default body text</AppText>
 * <AppText variant="title">Title text</AppText>
 * <AppText variant="body" bold>Bold body text</AppText>
 * <AppText variant="secondary" italic>Italic secondary text</AppText>
 * <AppText variant="caption" color={theme.colors.primary}>Custom color</AppText>
 * <AppText size={20}>Custom size text</AppText>
 */

export default AppText;