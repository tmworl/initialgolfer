// src/ui/navigation/configs/appNavigator.js
//
// AppNavigator configuration factory
// Creates configuration objects for the authentication boundary navigator

import navigationTheme from '../theme';
const { tokens, platform } = navigationTheme;

/**
 * Creates screen options for the root authentication navigator
 * 
 * @returns {Object} Screen options configuration
 */
const createAppNavigatorScreenOptions = () => {
  return {
    // No headers at this level - child navigators handle their own headers
    headerShown: false,
    
    // Essential styling consistency
    cardStyle: {
      backgroundColor: tokens.colors.background.card,
    },
    
    // Disable gestures at auth boundary for security
    gestureEnabled: false,
    
    // Maintain platform-appropriate reset behavior
    detachPreviousScreen: !platform.isIOS,
  };
};

export {
  createAppNavigatorScreenOptions,
};