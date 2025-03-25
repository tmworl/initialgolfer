// src/ui/navigation/utils/transitions.js
//
// Navigation transition utilities
// Provides consistent animations for navigation transitions

import { Animated, Easing } from 'react-native';
import navigationTheme from '../theme';
const { tokens, platform } = navigationTheme;

/**
 * Standard slide transition config for horizontal navigation
 */
const SlideFromRight = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.standard,
        easing: Easing.bezier(0.2, 0.0, 0.2, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.standard,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1),
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

/**
 * Fade transition for modal screens
 */
const FadeTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.standard,
        easing: Easing.out(Easing.poly(4)),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.fast,
        easing: Easing.in(Easing.poly(4)),
      },
    },
  },
  cardStyleInterpolator: ({ current }) => {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  },
};

/**
 * Vertical slide transition for modal screens
 */
const ModalSlideFromBottom = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.standard,
        easing: Easing.bezier(0.2, 0.0, 0.2, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: tokens.animation.timing.standard,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1),
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

/**
 * Get platform-appropriate transition for regular navigation
 */
const getDefaultTransition = () => {
  return platform.isIOS ? SlideFromRight : FadeTransition;
};

/**
 * Get platform-appropriate transition for modal presentations
 */
const getModalTransition = () => {
  return platform.isIOS ? ModalSlideFromBottom : FadeTransition;
};

export {
  SlideFromRight,
  FadeTransition,
  ModalSlideFromBottom,
  getDefaultTransition,
  getModalTransition,
};