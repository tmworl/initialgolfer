// src/ui/components/Card.js
//
// Enhanced card component with iOS 18 surface treatments
// Implements dynamic corner radius and material system integration

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import platformDetection from '../platform/detection';
import visualProperties from '../platform/visualProperties';
import BackdropMaterial, { MATERIAL_TYPES } from './BackdropMaterial';
import theme from '../theme';

/**
 * Card Component
 * 
 * Enhanced surface container with dynamic corner radius and depth effects.
 * Supports translucent materials on capable devices with proper iOS 18 styling.
 * 
 * @param {Object} props Component props
 * @param {string} props.variant - Card style variant (default, elevated, outlined, flat)
 * @param {number} props.elevation - Z-index elevation (0-24)
 * @param {boolean} props.translucent - Whether to use backdrop material effect
 * @param {string} props.materialType - Type of backdrop material (thin, regular, thick)
 * @param {boolean} props.noPadding - Remove default padding
 * @param {Object} props.style - Additional styles for the card
 * @param {React.ReactNode} props.children - Card content
 */
const Card = ({
  children,
  variant = 'default',
  elevation = 1,
  translucent = false,
  materialType = MATERIAL_TYPES.REGULAR,
  noPadding = false,
  style,
  ...otherProps
}) => {
  // Track card dimensions for dynamic corner radius calculation
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Handle layout changes to measure dimensions
  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }
  };
  
  // Calculate corner radius based on card dimensions
  // This is a key aspect of iOS 18's adaptive radius system
  const cornerRadius = dimensions.width > 0 
    ? visualProperties.getCornerRadius(dimensions)
    : theme.layout.borderRadius.medium; // Fallback
  
  // Get shadow parameters based on elevation
  const shadowProps = visualProperties.getShadowParams(elevation);
  
  // Determine base styles based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'flat':
        return styles.flat;
      default:
        return styles.default;
    }
  };
  
  // Combine all styles
  const cardStyles = [
    styles.base,
    getVariantStyle(),
    {
      borderRadius: cornerRadius,
      ...shadowProps
    },
    noPadding && styles.noPadding,
    style
  ];
  
  // Use translucent backdrop material on capable devices when requested
  // This creates the iOS 18 material effect with proper blur and vibrancy
  if (translucent && platformDetection.supportsBlurEffects) {
    return (
      <BackdropMaterial
        type={materialType}
        style={cardStyles}
        onLayout={handleLayout}
        {...otherProps}
      >
        {children}
      </BackdropMaterial>
    );
  }
  
  // Fallback to standard View on devices that don't support backdrop material
  return (
    <View
      style={cardStyles}
      onLayout={handleLayout}
      {...otherProps}
    >
      {children}
    </View>
  );
};

// Add Header and Footer sub-components for consistent composition patterns
Card.Header = ({ children, style, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

Card.Footer = ({ children, style, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    marginBottom: theme.spacing.medium,
  },
  default: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border || '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  flat: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  noPadding: {
    padding: 0,
  },
  header: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  footer: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
  },
});

export default Card;