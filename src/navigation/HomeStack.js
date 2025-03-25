// src/navigation/HomeStack.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import CourseSelectorScreen from "../screens/CourseSelectorScreen";
import TrackerScreen from "../screens/TrackerScreen";
import ScorecardScreen from "../screens/ScorecardScreen";

// Import our navigation styling system
import { createHomeStackConfig } from "../ui/navigation/configs/stack";

const Stack = createStackNavigator();

/**
 * HomeStack Component
 * 
 * Creates the navigation stack for the home tab with consistent native headers:
 * - HomeScreen: Starting point with recent rounds and "Start New Round" button
 * - CourseSelectorScreen: For selecting a course
 * - TrackerScreen: For tracking shots during a round
 * - ScorecardScreen: For viewing detailed scorecard after completing a round
 */
export default function HomeStack() {
  // Get configuration for the home stack
  const config = createHomeStackConfig();
  
  return (
    <Stack.Navigator 
      initialRouteName="HomeScreen"
      screenOptions={config.screenOptions}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={config.screenConfigs.HomeScreen.options} 
      />
      
      <Stack.Screen 
        name="CourseSelector" 
        component={CourseSelectorScreen} 
        options={config.screenConfigs.CourseSelector.options} 
      />
      
      <Stack.Screen 
        name="Tracker" 
        component={TrackerScreen} 
        options={config.screenConfigs.Tracker.options}
      />
      
      <Stack.Screen 
        name="ScorecardScreen" 
        component={ScorecardScreen} 
        options={config.screenConfigs.ScorecardScreen.options}
      />
    </Stack.Navigator>
  );
}