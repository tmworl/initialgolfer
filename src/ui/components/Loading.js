// src/ui/components/Loading.js
//
// Loading component for consistent loading indicators
// Provides standardized loading states for the app

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../theme';
import Typography from './Typography';

/**
 * Loading Component
 * 
 * A standardized loading indicator with optional text.
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the loading indicator (small, medium, large)
 * @param {string} props.color - Color of the loading indicator
 * @param {string} props.text - Optional text to display below the loading indicator
 * @param {boolean} props.fullscreen - Whether to center the loading in the screen
 * @param {Object} props.style - Additional styles for the container
 */
const Loading = ({
  size = 'medium',
  color = theme.colors.primary,
  text,
  fullscreen = false,
  style,
  ...otherProps
}) => {
  // Map component size to ActivityIndicator size
  const indicatorSize = size === 'small' ? 'small' : 'large';
  
  // Determine container styles
  const containerStyles = [
    styles.container,
    fullscreen && styles.fullscreen,
  ];
  
  return (
    <View style={[...containerStyles, style]} {...otherProps}>
      <ActivityIndicator
        size={indicatorSize}
        color={color}
        style={styles.indicator}
      />
      
      {text && (
        <Typography
          variant="body2"
          color="text.secondary"
          style={styles.text}
        >
          {text}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    zIndex: 10, // Ensure it appears above other content
  },
  indicator: {
    marginBottom: theme.spacing.small,
  },
  text: {
    marginTop: theme.spacing.xsmall,
    textAlign: 'center',
  },
});

export default Loading;