// src/ui/components/Button.js
//
// Button component with various styles and states
// Provides consistent button styling throughout the app

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import Typography from './Typography';

/**
 * Button Component
 * 
 * A flexible button component with various styles and states.
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant (primary, secondary, outline, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.loading - Whether to show loading indicator
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.iconLeft - Name of Ionicons icon to show on left
 * @param {string} props.iconRight - Name of Ionicons icon to show on right
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Object} props.style - Additional styles for the button container
 * @param {Object} props.textStyle - Additional styles for the button text
 * @param {React.ReactNode} props.children - Button content/label
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onPress,
  style,
  textStyle,
  ...otherProps
}) => {
  // Determine if button should be treated as disabled
  const isDisabled = disabled || loading;
  
  // Get style arrays based on props
  const containerStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && variant === 'outline' && styles.disabledOutline,
  ];
  
  // Define text styles
  const textStyles = [
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ];
  
  // Determine icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  // Determine icon color based on variant and disabled state
  const getIconColor = () => {
    if (isDisabled) {
      return '#aaa';
    }
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };
  
  return (
    <TouchableOpacity
      style={[...containerStyles, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...otherProps}
    >
      {/* Left Icon */}
      {iconLeft && !loading && (
        <Ionicons
          name={iconLeft}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.leftIcon}
        />
      )}
      
      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        /* Button Text */
        <Typography
          variant="body"
          weight="semibold"
          style={[...textStyles, textStyle]}
        >
          {children}
        </Typography>
      )}
      
      {/* Right Icon */}
      {iconRight && !loading && (
        <Ionicons
          name={iconRight}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.rightIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    ...theme.elevation.low,
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.elevation.none,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.small,
    ...theme.elevation.none,
  },
  
  // Sizes
  smallContainer: {
    paddingVertical: theme.spacing.small - 4,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: 20,
    minHeight: 32,
  },
  mediumContainer: {
    minHeight: 44,
  },
  largeContainer: {
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: 28,
    minHeight: 56,
  },
  
  // Text Styles
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textText: {
    color: theme.colors.primary,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: '#e0e0e0',
    ...theme.elevation.none,
  },
  disabledOutline: {
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  disabledText: {
    color: '#aaa',
  },
  
  // Icons
  leftIcon: {
    marginRight: theme.spacing.small,
  },
  rightIcon: {
    marginLeft: theme.spacing.small,
  },
});

export default Button;