// src/components/ShotTable.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import theme from "../ui/theme";

// Define shot types and outcomes with color coding
const shotTypes = ["Tee Shot", "Long Shot", "Approach", "Chip", "Putts", "Sand", "Penalties"];
const outcomes = ["On Target", "Slightly Off", "Recovery Needed"];

// Get screen width for layout calculations
const screenWidth = Dimensions.get('window').width;

/**
 * ShotTable Component
 * 
 * Displays a table of shot types and outcomes for tracking golf shots.
 * Features color-coded outcome headers and optimized layout.
 */
export default function ShotTable({ shotCounts, activeColumn, setActiveColumn, addShot, removeShot }) {
  if (!shotCounts) {
    return <View><Text>Unable to display shot data</Text></View>;
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

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.shotTypeCell}>
          <Text style={styles.headerText}>Shot Type</Text>
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
            <Text style={[
              styles.headerText,
              activeColumn === outcome ? styles.activeHeaderText : null,
              // Smaller font for Recovery Needed
              outcome === "Recovery Needed" ? styles.smallerHeaderText : null
            ]}>
              {outcome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Data Rows */}
      {shotTypes.map((type) => (
        <View key={type} style={styles.dataRow}>
          {/* Shot Type */}
          <View style={styles.shotTypeCell}>
            <Text style={styles.shotTypeText}>{type}</Text>
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
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.countText}>{count}</Text>
                    
                    <TouchableOpacity
                      onPress={() => addShot(type, outcome)}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[
                    styles.countValueText,
                    count > 0 && styles.highlightedCountText
                  ]}>
                    {count}
                  </Text>
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
    width: '44%', // Reduced slightly from 45%
  },
  inactiveOutcomeCell: {
    width: '18%', // Increased slightly from 15%
  },
  hasValueCell: {
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14, // Reduced from 15 for better fit
    textAlign: 'center',
  },
  smallerHeaderText: {
    fontSize: 12, // Even smaller for long text
  },
  activeHeaderText: {
    color: theme.colors.primary,
  },
  shotTypeText: {
    fontSize: 14, // Reduced from 16
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4, // Reduced from 8
  },
  button: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
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
    color: "#fff",
    fontSize: 18, // Reduced from 20
    fontWeight: "bold",
  },
  countText: {
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 30, // Reduced from 35
  },
  countValueText: {
    fontSize: 14, // Reduced from 16
    fontWeight: "500",
  },
  highlightedCountText: {
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
    color: theme.colors.primary,
  }
});