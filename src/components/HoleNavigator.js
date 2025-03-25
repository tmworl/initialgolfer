// src/components/HoleNavigator.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../ui/theme";

/**
 * HoleNavigator Component - Allows navigation between holes
 */
export default function HoleNavigator({ currentHole, onPreviousHole, onNextHole, totalHoles = 18 }) {
  // Determine if buttons should be disabled
  const isPreviousDisabled = currentHole <= 1;
  const isNextDisabled = currentHole >= totalHoles;

  return (
    <View style={styles.container}>
      {/* Previous hole button */}
      <TouchableOpacity 
        onPress={onPreviousHole} 
        style={[styles.arrowButton, isPreviousDisabled && styles.disabledButton]}
        disabled={isPreviousDisabled}
      >
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color={isPreviousDisabled ? "#ccc" : theme.colors.primary} 
        />
      </TouchableOpacity>
      
      {/* Current hole indicator */}
      <View style={styles.holeLabelContainer}>
        <Text style={styles.holeTitleText}>HOLE</Text>
        <Text style={styles.holeNumberText}>{currentHole}</Text>
        <Text style={styles.holeTotalText}>of {totalHoles}</Text>
      </View>
      
      {/* Next hole button */}
      <TouchableOpacity 
        onPress={onNextHole} 
        style={[styles.arrowButton, isNextDisabled && styles.disabledButton]}
        disabled={isNextDisabled}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={isNextDisabled ? "#ccc" : theme.colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
  },
  arrowButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    elevation: 0,
  },
  holeLabelContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  holeTitleText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  holeNumberText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  holeTotalText: {
    fontSize: 12,
    color: "#666",
  }
});