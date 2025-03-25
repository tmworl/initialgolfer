// src/ui/components/Card.js
//
// Card component with platform-specific styling
// Provides native look and feel for both iOS and Android

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import theme from '../theme';

/**
 * Card Component
 * 
 * A flexible card container with platform-specific styling.
 * 
 * @param {Object} props
 * @param {string} props.variant - Card style variant (default, elevated, outlined, flat)
 * @param {boolean} props.noPadding - Remove default padding
 * @param {Object} props.style - Additional styles for the card
 * @param {React.ReactNode} props.children - Card content
 */
const Card = ({
  children,
  variant = 'default',
  noPadding = false,
  style,
  ...otherProps
}) => {
  // Get platform-specific styles
  const platformStyles = Platform.select({
    ios: styles.cardIOS,
    android: styles.cardAndroid,
    default: styles.cardDefault,
  });
  
  return (
    <View
      style={[
        styles.base,
        platformStyles,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        noPadding && styles.noPadding,
        style
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
};

// Card header component
Card.Header = ({ children, style, ...otherProps }) => (
  <View style={[styles.header, style]} {...otherProps}>
    {children}
  </View>
);

// Card footer component
Card.Footer = ({ children, style, ...otherProps }) => (
  <View style={[styles.footer, style]} {...otherProps}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    marginBottom: theme.spacing.medium,
  },
  
  // Platform-specific styles
  cardIOS: {
    borderRadius: 10, // iOS prefers more rounded corners
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // iOS shadow styling
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  cardAndroid: {
    borderRadius: 4, // Material Design uses smaller radius
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    // Android elevation
    elevation: 2,
  },
  
  cardDefault: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    // Default shadow for web or other platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  
  // Variants
  elevated: Platform.select({
    ios: {
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowOpacity: 0.25,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  }),
  
  outlined: Platform.select({
    ios: {
      shadowOpacity: 0,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    android: {
      elevation: 0,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    default: {
      shadowOpacity: 0,
      elevation: 0,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
  }),
  
  flat: Platform.select({
    ios: {
      backgroundColor: '#F5F5F5',
      shadowOpacity: 0,
    },
    android: {
      backgroundColor: '#F5F5F5',
      elevation: 0,
    },
    default: {
      backgroundColor: '#F5F5F5',
      shadowOpacity: 0,
      elevation: 0,
    },
  }),
  
  noPadding: {
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  
  header: Platform.select({
    ios: {
      paddingBottom: 12,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    android: {
      paddingBottom: 12,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },
    default: {
      paddingBottom: 12,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
  }),
  
  footer: Platform.select({
    ios: {
      paddingTop: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    android: {
      paddingTop: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },
    default: {
      paddingTop: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
  }),
});

export default Card;