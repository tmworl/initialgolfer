// src/ui/components/Button.js
//
// Enhanced button component with iOS 18 interaction model
// Implements dynamic shape calculation and haptic feedback integration

import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import platformDetection from '../platform/detection';
import visualProperties from '../platform/visualProperties';
import BackdropMaterial, { MATERIAL_TYPES } from './BackdropMaterial';
import Typography from './Typography';
import theme from '../theme';

// Haptics module with capability detection
let Haptics;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Create null implementation if module is unavailable
  Haptics = {
    impactAsync: () => Promise.resolve(),
    notificationAsync: () => Promise.resolve(),
    selectionAsync: () => Promise.resolve(),
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' }
  };
  console.warn('Haptics module not available, using fallback implementation');
}

/**
 * Resilient haptic feedback trigger with capability detection
 */
const triggerHapticFeedback = (type = 'impact', intensity = 'light') => {
  // Only attempt haptics on supported platforms with module available
  if (!platformDetection.supportsHaptics) return Promise.resolve();
  
  try {
    if (type === 'impact') {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'notification') {
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      return Haptics.selectionAsync();
    }
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
    return Promise.resolve();
  }
};

/**
 * Button Component
 * 
 * Enhanced interaction element with physically responsive behavior.
 * Implements iOS 18's interaction model with proper haptic feedback and animations.
 * 
 * @param {Object} props Component props
 * @param {string} props.variant - Button style variant (primary, secondary, outline, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.loading - Whether to show loading indicator
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.translucent - Whether to use backdrop material effect
 * @param {string} props.iconLeft - Name of Ionicons icon to show on left
 * @param {string} props.iconRight - Name of Ionicons icon to show on right
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Function} props.onPressIn - Function to call when press starts
 * @param {Function} props.onPressOut - Function to call when press ends
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
  translucent = false,
  iconLeft,
  iconRight,
  onPress,
  onPressIn,
  onPressOut,
  style,
  textStyle,
  ...otherProps
}) => {
  // Track button dimensions for dynamic shape calculation
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Track pressed state for visual feedback
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle layout changes to measure dimensions
  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== dimensions.width || height !== dimensions.height) {
      setDimensions({ width, height });
    }
  };
  
  // Determine if button should be treated as disabled
  const isDisabled = disabled || loading;
  
  // Calculate corner radius based on button dimensions and size variant
  let cornerRadiusVariant;
  switch (size) {
    case 'small':
      cornerRadiusVariant = 'small';
      break;
    case 'large':
      cornerRadiusVariant = 'large';
      break;
    default:
      cornerRadiusVariant = 'standard';
  }
  
  // For pill buttons, use special shape
  if (variant === 'pill') {
    cornerRadiusVariant = 'pill';
  }
  
  // Calculate dynamic corner radius - fallback to fixed values if dimensions aren't available
  const cornerRadius = dimensions.width > 0 
    ? visualProperties.getCornerRadius(dimensions, cornerRadiusVariant)
    : (size === 'small' ? 16 : size === 'large' ? 28 : 22);
  
  // Handle press in with haptic feedback
  const handlePressIn = (event) => {
    setIsPressed(true);
    
    // Trigger subtle haptic feedback on press
    // This creates the iOS 18 haptic response for interactions
    if (!isDisabled) {
      triggerHapticFeedback('impact', 'light');
    }
    
    // Call original onPressIn if provided
    if (onPressIn) {
      onPressIn(event);
    }
  };
  
  // Handle press out
  const handlePressOut = (event) => {
    setIsPressed(false);
    
    // Call original onPressOut if provided
    if (onPressOut) {
      onPressOut(event);
    }
  };
  
  // Handle press with haptic success feedback
  const handlePress = (event) => {
    // Trigger success haptic feedback on press
    // This creates the iOS 18 haptic confirmation for completed interactions
    if (!isDisabled) {
      triggerHapticFeedback('notification', 'success');
    }
    
    // Call original onPress if provided
    if (onPress) {
      onPress(event);
    }
  };
  
  // Get style arrays based on props and state
  const containerStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && variant === 'outline' && styles.disabledOutline,
    isPressed && styles.pressed,
    isPressed && styles[`${variant}Pressed`],
    { borderRadius: cornerRadius }
  ];
  
  // Define text styles
  const textStyles = [
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    isPressed && styles.pressedText,
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
  
  // Prepare button content
  const buttonContent = (
    <>
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
    </>
  );
  
  // Use translucent backdrop material on capable devices when requested
  // and when using primary or secondary variant (which are colored)
  if (translucent && !isDisabled && platformDetection.supportsBlurEffects && 
      (variant === 'primary' || variant === 'secondary')) {
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        {...otherProps}
      >
        <BackdropMaterial
          type={MATERIAL_TYPES.REGULAR}
          style={[...containerStyles, style]}
          onLayout={handleLayout}
          backgroundColor={variant === 'primary' ? theme.colors.primary : theme.colors.secondary}
          opacity={isPressed ? 0.85 : 0.7} // Reduce opacity when pressed
        >
          {buttonContent}
        </BackdropMaterial>
      </TouchableOpacity>
    );
  }
  
  // Standard button implementation for most cases
  return (
    <TouchableOpacity
      style={[...containerStyles, style]}
      activeOpacity={0.8}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={handleLayout}
      disabled={isDisabled}
      {...otherProps}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24, // Default is overridden by calculated value
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      }
    }),
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
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.small,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  
  // Pressed states
  pressed: {
    transform: [{ scale: 0.98 }], // Subtle scale effect
  },
  primaryPressed: {
    backgroundColor: Platform.select({
      ios: theme.colors.primary, // Color handled by opacity
      android: '#0062CC', // Darken for Android
    }),
  },
  secondaryPressed: {
    backgroundColor: Platform.select({
      ios: theme.colors.secondary, // Color handled by opacity
      android: '#555555', // Darken for Android
    }),
  },
  outlinePressed: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)', // Very subtle background
  },
  textPressed: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)', // Very subtle background
  },
  
  // Sizes
  smallContainer: {
    paddingVertical: theme.spacing.small - 4,
    paddingHorizontal: theme.spacing.medium,
    minHeight: 32,
  },
  mediumContainer: {
    minHeight: 44,
  },
  largeContainer: {
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
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
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      }
    }),
  },
  disabledOutline: {
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  disabledText: {
    color: '#aaa',
  },
  pressedText: {
    // No specific change needed
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