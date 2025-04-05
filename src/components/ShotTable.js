// src/components/ShotTable.js
//
// Migration from direct Text components to Typography system
// This component is a revenue-critical interface as it directly captures the data
// that drives our AI insights and premium feature upsell opportunities.

import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "../ui/components/Typography";
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
 * This is a core data collection interface that directly feeds our analytics
 * engine and premium insights feature, making visual clarity and intuitive
 * interaction essential to high-quality data collection that drives conversion.
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
              style={[
                styles.headerText,
                // Smaller font for Recovery Needed
                outcome === "Recovery Needed" ? styles.smallerHeaderText : null
              ]}
            >
              {outcome}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Data Rows */}
      {shotTypes.map((type) => (
        <View key={type} style={styles.dataRow}>
          {/* Shot Type */}
          <View style={styles.shotTypeCell}>
            <Typography variant="body" weight="medium" style={styles.shotTypeText}>
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
                    
                    <Typography variant="body" weight="bold" style={styles.countText}>
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
                    variant={count > 0 ? "body" : "body"}
                    weight={count > 0 ? "bold" : "normal"}
                    color={count > 0 ? theme.colors.primary : null}
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
    width: '44%', // Reduced slightly from 45%
  },
  inactiveOutcomeCell: {
    width: '18%', // Increased slightly from 15%
  },
  hasValueCell: {
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    textAlign: 'center',
  },
  smallerHeaderText: {
    fontSize: 12, // Even smaller for long text
  },
  shotTypeText: {
    fontSize: 14, // Reduced from 16
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
    fontSize: 18, // Reduced from 20
  },
  countText: {
    fontSize: 16, // Reduced from 18
    textAlign: "center",
    minWidth: 30, // Reduced from 35
  },
  countValueText: {
    fontSize: 14, // Reduced from 16
  },
  highlightedCountText: {
    fontSize: 16, // Reduced from 18
    color: theme.colors.primary,
  }
});