// src/ui/navigation/configs/stack.js
//
// Stack navigator configuration factory
// Creates configuration objects for stack navigators

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import navigationTheme from '../theme';
const { tokens, platform, getHeaderOptions, getStackScreenOptions } = navigationTheme;

/**
 * Create stack navigator default screen options
 * These apply to all screens in the stack
 * 
 * @returns {Object} Default screen options for stack navigators
 */
const createStackNavigatorScreenOptions = () => {
  return {
    ...getStackScreenOptions(),
    headerBackTitleVisible: false,
    headerShadowVisible: !platform.isIOS,
    gestureEnabled: platform.isIOS,
    gestureDirection: 'horizontal',
    cardStyle: {
      backgroundColor: '#fff',
    },
  };
};

/**
 * Create stack navigator custom back button
 * 
 * @param {Object} props - Props received from React Navigation
 * @returns {React.Component} Custom back button component
 */
const CustomBackButton = ({ onPress, canGoBack }) => {
  if (!canGoBack) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        marginLeft: platform.isAndroid ? 0 : -8,
      }}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <Ionicons
        name={platform.isIOS ? "chevron-back" : "arrow-back"}
        size={platform.isIOS ? 28 : 24}
        color={platform.isIOS ? tokens.colors.tint.header : "#fff"}
      />
    </TouchableOpacity>
  );
};

/**
 * Create a custom header left component factory
 * 
 * @param {Function} navigation - Navigation object from React Navigation
 * @returns {Function} Function that returns a header left component
 */
const createHeaderLeft = (navigation) => {
  return ({ canGoBack }) => {
    if (!canGoBack) {
      return null;
    }
    
    return (
      <CustomBackButton
        canGoBack={canGoBack}
        onPress={() => navigation.goBack()}
      />
    );
  };
};

/**
 * Configuration factory for home stack
 * 
 * @returns {Object} Configuration object with screen options
 */
const createHomeStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      HomeScreen: {
        options: getHeaderOptions("Clubhouse")
      },
      CourseSelector: {
        options: getHeaderOptions("Select Course")
      },
      Tracker: {
        options: ({ navigation }) => ({
          ...getHeaderOptions("Round Tracker"),
          // Prevent going back directly from tracker without completing the round
          headerLeft: () => null,
        })
      },
      ScorecardScreen: {
        options: getHeaderOptions("Scorecard")
      }
    }
  };
};

/**
 * Configuration factory for rounds stack
 * 
 * @returns {Object} Configuration object with screen options
 */
const createRoundsStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      RoundsScreen: {
        options: getHeaderOptions("Your Rounds")
      },
      ScorecardScreen: {
        options: getHeaderOptions("Scorecard")
      }
    }
  };
};

/**
 * Configuration factory for insights stack
 * 
 * @returns {Object} Configuration object with screen options
 */
const createInsightsStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      InsightsScreen: {
        options: getHeaderOptions("Golf Insights")
      }
    }
  };
};

/**
 * Configuration factory for profile stack
 * 
 * @returns {Object} Configuration object with screen options
 */
const createProfileStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      ProfileScreen: {
        options: getHeaderOptions("Profile")
      }
    }
  };
};

export {
  createStackNavigatorScreenOptions,
  createHeaderLeft,
  createHomeStackConfig,
  createRoundsStackConfig,
  createInsightsStackConfig,
  createProfileStackConfig
};