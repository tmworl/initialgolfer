// src/ui/navigation/configs/stack.js
//
// Enhanced stack navigator configuration with iOS 18 header material integration
// Implements Dynamic Island avoidance and animation refinements

import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHeaderTitle } from '@react-navigation/elements';
import { TransitionPresets } from '@react-navigation/stack';
import platformDetection from '../../platform/detection';
import visualProperties from '../../platform/visualProperties';
import BackdropMaterial, { MATERIAL_TYPES } from '../../components/BackdropMaterial';
import Typography from '../../components/Typography';
import navigationTheme from '../theme';

const { tokens, platform } = navigationTheme;

/**
 * Create stack navigator default screen options with iOS 18 visual refinements
 * 
 * @returns {Object} Default screen options for stack navigators
 */
const createStackNavigatorScreenOptions = () => {
  return {
    // Header material integration
    headerMode: 'float',
    headerTransparent: platformDetection.isIOS && platformDetection.supportsBlurEffects,
    headerBackground: ({ style }) => (
      platformDetection.isIOS && platformDetection.supportsBlurEffects ? (
        <BackdropMaterial
          type={MATERIAL_TYPES.THIN}
          style={[
            StyleSheet.absoluteFill,
            style,
            { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(200, 200, 200, 0.3)' }
          ]}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            style,
            {
              backgroundColor: tokens.colors.background.header,
              borderBottomWidth: StyleSheet.hairlineWidth, 
              borderBottomColor: tokens.colors.border.header
            }
          ]}
        />
      )
    ),
    
    // Dynamic Island and notch avoidance
    headerStatusBarHeight: platformDetection.getStatusBarHeight() +
      // Add extra padding for Dynamic Island
      (platformDetection.hasDynamicIsland() ? 4 : 0),
    
    // Typography refinements
    headerTitleStyle: {
      ...tokens.typography.header.title,
      ...visualProperties.getOpticalTypography(
        platform.isIOS ? 17 : 20, 
        platform.isIOS ? '600' : '500'
      ),
    },
    
    // Platform-specific configurations
    headerBackTitleVisible: platform.isIOS,
    headerShadowVisible: !platform.isIOS,
    
    // Animation refinements
    gestureEnabled: platform.isIOS,
    gestureDirection: 'horizontal',
    
    // Card styling with proper corner radius
    cardStyle: {
      backgroundColor: tokens.colors.background.card,
    },
    
    // Platform-specific animation presets
    ...Platform.select({
      ios: TransitionPresets.SlideFromRightIOS,
      android: TransitionPresets.FadeFromBottomAndroid,
    }),
    
    // Animation timing refinements
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: platform.isIOS ? 350 : 300,
          // Use native driver for optimal performance
          useNativeDriver: true
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: platform.isIOS ? 350 : 300,
          useNativeDriver: true
        },
      },
    },
  };
};

/**
 * Create stack navigator custom back button with platform optimizations
 * 
 * @param {Object} props - Props received from React Navigation
 * @returns {React.Component} Custom back button component
 */
const CustomBackButton = ({ onPress, canGoBack }) => {
  if (!canGoBack) {
    return null;
  }

  // Optimize hitSlop for touch targets
  const hitSlop = { top: 12, right: 12, bottom: 12, left: 12 };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        marginLeft: platform.isAndroid ? 0 : -8,
      }}
      hitSlop={hitSlop}
      // Enable GPU acceleration for back button animations on Android
      style={Platform.OS === 'android' ? { 
        renderToHardwareTextureAndroid: true 
      } : undefined}
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
 * Create a custom header component with iOS 18 visual refinements
 * 
 * @param {Object} props - Props from React Navigation
 * @returns {React.ReactElement} Custom header with material effects
 */
const CustomHeader = ({ scene, previous, navigation }) => {
  const { options } = scene.descriptor;
  const title = getHeaderTitle(options, scene.route.name);
  
  const headerHeight = tokens.spacing.header.height + platformDetection.getStatusBarHeight();
  
  // Use material on iOS 18, standard header on other platforms
  if (platformDetection.isIOS && platformDetection.supportsBlurEffects) {
    return (
      <BackdropMaterial
        type={MATERIAL_TYPES.THIN}
        style={[
          styles.header,
          { 
            height: headerHeight,
            paddingTop: platformDetection.getStatusBarHeight()
          }
        ]}
      >
        <View style={styles.headerContent}>
          {previous ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={tokens.colors.tint.header}
              />
            </TouchableOpacity>
          ) : null}
          
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.headerTitle}
          >
            {title}
          </Typography>
          
          {/* Right button placeholder to balance title centering */}
          {previous ? <View style={styles.rightPlaceholder} /> : null}
        </View>
      </BackdropMaterial>
    );
  }
  
  // Standard header for Android
  return (
    <View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: platformDetection.getStatusBarHeight(),
          backgroundColor: tokens.colors.background.header,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: tokens.colors.border.header,
        }
      ]}
    >
      <View style={styles.headerContent}>
        {previous ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        ) : null}
        
        <Typography
          variant="subtitle"
          weight="medium"
          color="#fff"
          style={[
            styles.headerTitle,
            { textAlign: 'left', marginLeft: previous ? 32 : 16 }
          ]}
        >
          {title}
        </Typography>
      </View>
    </View>
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
        options: {
          title: "Clubhouse",
          // iOS 18 large title style
          headerLargeTitle: platformDetection.isIOS,
          headerLargeTitleStyle: {
            ...visualProperties.getOpticalTypography(34, '700'),
          }
        }
      },
      CourseSelector: {
        options: {
          title: "Select Course",
          ...Platform.select({
            android: {
              headerStyle: {
                backgroundColor: tokens.colors.primary,
              },
              headerTintColor: '#fff',
            }
          })
        }
      },
      Tracker: {
        options: ({ navigation }) => ({
          title: "Round Tracker",
          // Prevent going back directly from tracker without completing the round
          headerLeft: () => null,
          // Apply different styling to this critical screen
          ...Platform.select({
            android: {
              headerStyle: {
                backgroundColor: tokens.colors.primary,
              },
              headerTintColor: '#fff',
            }
          })
        })
      },
      ScorecardScreen: {
        options: {
          title: "Scorecard",
          ...Platform.select({
            android: {
              headerStyle: {
                backgroundColor: tokens.colors.primary,
              },
              headerTintColor: '#fff',
            }
          })
        }
      }
    }
  };
};

// Add implementations for the other stack configurations
const createRoundsStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      RoundsScreen: {
        options: {
          title: "Your Rounds",
          // iOS 18 large title style
          headerLargeTitle: platformDetection.isIOS,
          headerLargeTitleStyle: {
            ...visualProperties.getOpticalTypography(34, '700'),
          }
        }
      },
      ScorecardScreen: {
        options: {
          title: "Scorecard"
        }
      }
    }
  };
};

const createInsightsStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      InsightsScreen: {
        options: {
          title: "Golf Insights",
          // iOS 18 large title style
          headerLargeTitle: platformDetection.isIOS,
          headerLargeTitleStyle: {
            ...visualProperties.getOpticalTypography(34, '700'),
          }
        }
      }
    }
  };
};

const createProfileStackConfig = () => {
  return {
    screenOptions: createStackNavigatorScreenOptions(),
    screenConfigs: {
      ProfileScreen: {
        options: {
          title: "Profile",
          // iOS 18 large title style
          headerLargeTitle: platformDetection.isIOS,
          headerLargeTitleStyle: {
            ...visualProperties.getOpticalTypography(34, '700'),
          }
        }
      }
    }
  };
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: Platform.OS === 'ios' ? 'center' : 'left',
  },
  rightPlaceholder: {
    width: 28,
  },
});

export {
  createStackNavigatorScreenOptions,
  createHeaderLeft,
  CustomHeader,
  createHomeStackConfig,
  createRoundsStackConfig,
  createInsightsStackConfig,
  createProfileStackConfig
};