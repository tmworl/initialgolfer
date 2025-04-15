// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider, navigationRef } from "./src/context/AuthContext";

/**
 * Root application component
 * 
 * Establishes the core architecture layers:
 * 1. Authentication state management (AuthProvider)
 * 2. Navigation infrastructure (NavigationContainer)
 * 3. Route structure definition (AppNavigator)
 * 
 * The navigationRef binding creates a bridge between the authentication
 * domain and navigation capabilities without introducing tight coupling.
 */
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}