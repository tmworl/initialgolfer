// src/navigation/AppNavigator.js

import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen";
import VerificationPendingScreen from "../screens/VerificationPendingScreen";
import MainNavigator from "./MainNavigator";
import { AuthContext } from "../context/AuthContext";

// Import our navigation styling system
import { createAppNavigatorScreenOptions } from "../ui/navigation/configs/appNavigator";

const Stack = createStackNavigator();

export default function AppNavigator() {
  // Retrieve both user and verification status from AuthContext
  const { user, emailVerified } = useContext(AuthContext);

  // Get styling configuration from our system
  const screenOptions = createAppNavigatorScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        // If no user is authenticated, show the auth screen
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !emailVerified ? (
        // If user exists but email isn't verified, show verification screen
        <Stack.Screen 
          name="VerifyEmail" 
          component={VerificationPendingScreen}
          options={{ headerShown: false }} // Hide header for cleaner verification UI
        />
      ) : (
        // If user is authenticated and verified, show the main app
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}