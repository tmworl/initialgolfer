// src/components/ShotTable.js
//
// Architecture refactoring with strategic display layer transformation 
// to maintain data model integrity while enhancing typography consistency

import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "../ui/components/Typography";
import theme from "../ui/theme";

// ========== DOMAIN MODEL CONSTANTS ==========
// Define shot types and outcomes with color coding - extracted to module level
const SHOT_TYPES = ["Tee Shot", "Long Shot", "Approach", "Chip", "Putts", "Sand", "Penalties"];

// Display transformation mapping - decoupled from render logic for enhanced maintainability
const OUTCOME_DISPLAY_MAPPING = {
  "On Target": "On Target",
  "Slightly Off": "Slightly Off", 
  "Recovery Needed": "Bad"
};

// Domain-specific utility function for outcome display transformation
const getDisplayOutcome = (outcome) => OUTCOME_DISPLAY_MAPPING[outcome] || outcome;

// Get screen width for layout calculations
const screenWidth = Dimensions.get('window').width;

/**
 * ShotTable Component
 * 
 * Displays a table of shot types and outcomes for tracking golf shots.
 * This is a core data collection interface that directly feeds our analytics
 * engine and premium insights feature.
 * 
 * @param {Object} props
 * @param {Object} props.shotCounts - Current shot count data
 * @param {string} props.activeColumn - Currently selected outcome column
 * @param {Function} props.setActiveColumn - Function to set active column
 * @param {Function} props.addShot - Function to add a shot
 * @param {Function} props.removeShot - Function to remove a shot
 */
export default function ShotTable({ shotCounts, activeColumn, setActiveColumn, addShot, removeShot }) {
  if (!shotCounts) {
    return (
      <View>
        <Typography variant="body">Unable to display shot data</Typography>
      </View>
    );
  }

  // Function to get color for outcome column headers
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case "On Target":
        return "#e6ffe6"; // Light green
      case "Slightly Off":
        return "#fff9e6"; // Light yellow
      case "Recovery Needed":
        return "#ffe6e6"; // Light red
      default:
        return "#f5f5f5"; // Default gray
    }
  };

  // Extract outcomes from the first shot type to ensure we maintain data model integrity
  const outcomes = Object.keys(shotCounts[SHOT_TYPES[0]] || {});

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.shotTypeCell}>
          <Typography variant="body" weight="bold" style={styles.headerText}>
            Shot Type
          </Typography>
        </View>
        
        {/* Outcome Headers with color coding */}
        {outcomes.map((outcome) => (
          <TouchableOpacity
            key={outcome}
            onPress={() => setActiveColumn(outcome)}
            style={[
              styles.outcomeCell,
              activeColumn === outcome ? styles.activeOutcomeCell : styles.inactiveOutcomeCell,
              // Apply background color to header cells
              { backgroundColor: activeColumn === outcome ? getOutcomeColor(outcome) : '#f5f5f5' }
            ]}
          >
            <Typography 
              variant="body" 
              weight={activeColumn === outcome ? "bold" : "normal"}
              style={styles.headerText}
            >
              {getDisplayOutcome(outcome)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Data Rows */}
      {SHOT_TYPES.map((type) => (
        <View key={type} style={styles.dataRow}>
          {/* Shot Type */}
          <View style={styles.shotTypeCell}>
            <Typography variant="body" weight="medium" style={styles.headerText}>
              {type}
            </Typography>
          </View>
          
          {/* Outcome Cells */}
          {outcomes.map((outcome) => {
            // Get the count for this shot type and outcome
            const count = shotCounts[type] && 
                          typeof shotCounts[type][outcome] === 'number' ? 
                          shotCounts[type][outcome] : 0;
            
            const isActive = activeColumn === outcome;
            
            return (
              <TouchableOpacity
                key={outcome}
                onPress={() => !isActive && setActiveColumn(outcome)}
                style={[
                  styles.outcomeCell,
                  isActive ? styles.activeOutcomeCell : styles.inactiveOutcomeCell,
                  // Apply light background color when this column is active
                  isActive && { backgroundColor: getOutcomeColor(outcome) },
                  // Highlight cells with values
                  count > 0 && !isActive && styles.hasValueCell
                ]}
              >
                {isActive ? (
                  <View style={styles.controlsContainer}>
                    <TouchableOpacity
                      onPress={() => removeShot(type, outcome)}
                      disabled={count === 0}
                      style={[styles.button, count === 0 && styles.disabledButton]}
                    >
                      <Typography variant="button" color="#fff" style={styles.buttonText}>-</Typography>
                    </TouchableOpacity>
                    
                    <Typography 
                      variant="body" 
                      weight="bold" 
                      style={styles.countText}
                    >
                      {count}
                    </Typography>
                    
                    <TouchableOpacity
                      onPress={() => addShot(type, outcome)}
                      style={styles.button}
                    >
                      <Typography variant="button" color="#fff" style={styles.buttonText}>+</Typography>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Typography 
                    variant="body"
                    weight={count > 0 ? "bold" : "normal"}
                    color={count > 0 ? theme.colors.primary : theme.colors.text}
                    style={styles.countValueText}
                  >
                    {count}
                  </Typography>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginVertical: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 60, // Reduced from 80 to save space
  },
  shotTypeCell: {
    width: '28%', // Slightly increased to fit shot type names
    justifyContent: 'center',
    paddingLeft: 8,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  outcomeCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOutcomeCell: {
    width: '44%', // Maintains existing architecture
  },
  inactiveOutcomeCell: {
    width: '18%', // Maintains existing architecture
  },
  hasValueCell: {
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    textAlign: 'center',
    // Typography variant handles font size through the design system
  },
  countValueText: {
    textAlign: 'center',
    // Typography variant handles font size through the design system
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4, // Maintaining existing architecture - will be addressed in layout refactoring
  },
  button: {
    width: 36, // Maintaining existing architecture - will be addressed in layout refactoring
    height: 36, // Maintaining existing architecture - will be addressed in layout refactoring
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 18, 
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18, // Retaining existing button text size
  },
  countText: {
    textAlign: "center",
    minWidth: 30, // Retaining existing count text constraints
  }
});