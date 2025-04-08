// src/components/ShotTable.js
//
// Optimized architecture with two-line headers and precise vertical constraints
// Maintains proportional width distribution while enforcing deterministic text flow

import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Typography from "../ui/components/Typography";
import theme from "../ui/theme";

// Get screen dimensions for responsive calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========== DOMAIN MODEL CONSTANTS ==========
// Define shot types and outcomes with standardized naming
const SHOT_TYPES = ["Tee Shot", "Long Shot", "Approach", "Chip", "Putts", "Sand", "Penalties"];

// Display transformation mapping - consistent with data model
const OUTCOME_DISPLAY_MAPPING = {
  "On Target": "On\nTarget",        // Force line break with \n
  "Slightly Off": "Slightly\nOff",  // Force line break with \n
  "Recovery Needed": "Bad"          // Single word needs no break
};

// Map display name back to data model - bidirectional mapping
const DISPLAY_TO_DATA_MAPPING = {
  "On\nTarget": "On Target",
  "Slightly\nOff": "Slightly Off",
  "Bad": "Recovery Needed"
};

// Domain-specific utility function for outcome display transformation
const getDisplayOutcome = (outcome) => OUTCOME_DISPLAY_MAPPING[outcome] || outcome;

// Get data model key from UI display name
const getDataModelOutcome = (displayOutcome) => DISPLAY_TO_DATA_MAPPING[displayOutcome] || displayOutcome;

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
  const [tableWidth, setTableWidth] = useState(SCREEN_WIDTH - theme.spacing.medium * 2);
  const [calculatedStyles, setCalculatedStyles] = useState({});
  
  // Ensure activeColumn is always valid by applying defensive programming
  useEffect(() => {
    if (!shotCounts) return;
    
    const validOutcomes = Object.keys(shotCounts[SHOT_TYPES[0]] || {});
    
    // If activeColumn isn't valid, set it to the first outcome
    if (!activeColumn || !validOutcomes.includes(activeColumn)) {
      // Use first outcome as default when activeColumn is invalid
      console.log("Correcting invalid activeColumn");
      if (validOutcomes.length > 0 && setActiveColumn) {
        setActiveColumn(validOutcomes[0]);
      }
    }
  }, [shotCounts, activeColumn, setActiveColumn]);

  // Calculate cell dimensions and button sizes based on available width
  useEffect(() => {
    if (!shotCounts || !tableWidth) return;
    
    // Extract outcomes from the first shot type to ensure we maintain data model integrity
    const outcomes = Object.keys(shotCounts[SHOT_TYPES[0]] || {});
    if (outcomes.length === 0) return;
  
    // Type column takes 30% of table width
    const typeColumnWidth = Math.floor(tableWidth * 0.30);
    
    // Determine remaining width for outcome columns
    const remainingWidth = tableWidth - typeColumnWidth;
    
    // Count the number of outcomes
    const outcomeCount = outcomes.length;
    const activeOutcomeCount = 1;
    const inactiveOutcomeCount = outcomeCount - 1;
    
    // Distribute remaining width proportionally
    // Active column gets 2.5x the width of inactive columns
    const totalProportionalUnits = (inactiveOutcomeCount * 1) + (activeOutcomeCount * 2.5);
    const unitWidth = remainingWidth / totalProportionalUnits;
    
    // Calculate precise widths
    const baseInactiveWidth = unitWidth * 1;
    const baseActiveWidth = unitWidth * 2.5;
    
    // Initialize widths with floored values to prevent overflow
    let inactiveColumnWidth = Math.floor(baseInactiveWidth);
    let activeColumnWidth = Math.floor(baseActiveWidth);
    
    // Distribute remaining pixels to prevent empty space
    // Calculate how many pixels we've "lost" by flooring
    const allocatedWidth = (inactiveColumnWidth * inactiveOutcomeCount) + activeColumnWidth;
    const remainingPixels = remainingWidth - allocatedWidth;
    
    // If we have remaining pixels, add them to the active column first
    if (remainingPixels > 0) {
      activeColumnWidth += remainingPixels;
    }
    
    // Calculate button dimensions to ensure they fit within active column
    // Account for count text width (30px) and adequate padding (10px on each side)
    const minButtonSpacing = 10; // Minimum spacing between elements
    const countTextWidth = 30;   // Minimum width for the count text
    const availableButtonSpace = activeColumnWidth - countTextWidth - (minButtonSpacing * 4);
    
    // Ensure we have a reasonable minimum for very small screens
    const maxButtonWidth = Math.max(24, Math.floor(availableButtonSpace / 2));
    
    // Apply upper bound to prevent buttons becoming too large
    const buttonSize = Math.min(32, maxButtonWidth);

    // Set the calculated styles
    setCalculatedStyles({
      typeColumnWidth,
      inactiveColumnWidth,
      activeColumnWidth,
      buttonSize
    });
  }, [tableWidth, shotCounts]);

  // Handle layout changes to measure available width
  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTableWidth(width);
  };

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
        return theme.colors.success ? `${theme.colors.success}20` : "#e6ffe6"; // Light green with opacity
      case "Slightly Off":
        return theme.colors.accent ? `${theme.colors.accent}15` : "#fff9e6"; // Light yellow with opacity
      case "Recovery Needed":
        return theme.colors.error ? `${theme.colors.error}15` : "#ffe6e6"; // Light red with opacity
      default:
        return "#f5f5f5"; // Default gray
    }
  };

  // Extract outcomes from the first shot type to ensure we maintain data model integrity
  const outcomes = Object.keys(shotCounts[SHOT_TYPES[0]] || {});

  return (
    <View 
      style={styles.container} 
      onLayout={handleLayout}
    >
      {/* Header Row - Precise height based on two text lines plus padding */}
      <View style={styles.headerRow}>
        <View style={[
          styles.shotTypeCell, 
          { width: calculatedStyles.typeColumnWidth }
        ]}>
          <Typography variant="body" weight="bold" style={styles.headerText}>
            Shot Type
          </Typography>
        </View>
        
        {/* Outcome Headers with color coding and two-line text */}
        {outcomes.map((outcome) => {
          const displayName = getDisplayOutcome(outcome);
          const isActive = activeColumn === outcome;
          
          return (
            <TouchableOpacity
              key={outcome}
              onPress={() => setActiveColumn(outcome)}
              style={[
                styles.outcomeCell,
                isActive ? 
                  [styles.activeOutcomeCell, { width: calculatedStyles.activeColumnWidth }] : 
                  [styles.inactiveOutcomeCell, { width: calculatedStyles.inactiveColumnWidth }],
                { backgroundColor: isActive ? getOutcomeColor(outcome) : '#f5f5f5' }
              ]}
            >
              <Typography 
                variant="body" 
                weight={isActive ? "bold" : "normal"}
                style={styles.headerText}
              >
                {displayName}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Data Rows */}
      {SHOT_TYPES.map((type) => (
        <View key={type} style={styles.dataRow}>
          {/* Shot Type */}
          <View style={[
            styles.shotTypeCell, 
            { width: calculatedStyles.typeColumnWidth }
          ]}>
            <Typography variant="body" weight="medium" style={styles.rowText}>
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
                  isActive ? 
                    [styles.activeOutcomeCell, { width: calculatedStyles.activeColumnWidth }] : 
                    [styles.inactiveOutcomeCell, { width: calculatedStyles.inactiveColumnWidth }],
                  isActive && { backgroundColor: getOutcomeColor(outcome) },
                  count > 0 && !isActive && styles.hasValueCell
                ]}
              >
                {isActive ? (
                  <View style={styles.controlsContainer}>
                    {/* Decrement button */}
                    <TouchableOpacity
                      onPress={() => removeShot(type, outcome)}
                      disabled={count === 0}
                      style={[
                        styles.actionButton,
                        count === 0 && styles.disabledButton,
                        { width: calculatedStyles.buttonSize, height: calculatedStyles.buttonSize }
                      ]}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <Typography 
                        variant="button" 
                        color={count === 0 ? theme.colors.secondary : "white"}
                        style={styles.buttonText}
                      >
                        -
                      </Typography>
                    </TouchableOpacity>
                    
                    {/* Count display */}
                    <Typography 
                      variant="body" 
                      weight="bold" 
                      style={styles.countText}
                    >
                      {count}
                    </Typography>
                    
                    {/* Increment button */}
                    <TouchableOpacity
                      onPress={() => addShot(type, outcome)}
                      style={[
                        styles.actionButton,
                        { width: calculatedStyles.buttonSize, height: calculatedStyles.buttonSize }
                      ]}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <Typography 
                        variant="button" 
                        color="white"
                        style={styles.buttonText}
                      >
                        +
                      </Typography>
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
    backgroundColor: theme.colors.background,
    borderRadius: theme.layout.borderRadius.medium,
    borderWidth: 0,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginVertical: theme.spacing.small,
    ...theme.elevation.medium,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: `${theme.colors.border}50`, 
    height: 52, // Precise height: 2 lines (each ~18px) + vertical padding
    backgroundColor: `${theme.colors.background}80`, // Subtle background
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 52, // Match header row height for visual consistency
  },
  shotTypeCell: {
    justifyContent: 'center',
    paddingLeft: theme.spacing.small,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    height: '100%',
  },
  outcomeCell: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    overflow: 'hidden', // Critical: Prevent button overflow
    padding: 4, // Minimal padding to improve text containment
    transition: '0.2s all ease',
  },
  activeOutcomeCell: {
    // Width set dynamically based on available space
  },
  inactiveOutcomeCell: {
    // Width set dynamically based on available space
  },
  hasValueCell: {
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    fontSize: 13, // Slightly reduced for better fit
    textAlign: 'center',
    lineHeight: 18, // Precise line height for predictable rendering
  },
  rowText: {
    fontSize: 14,
  },
  countValueText: {
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.small,
    maxWidth: '100%', // Critical: Ensure buttons stay within container
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 100, // Make circular buttons
  },
  disabledButton: {
    backgroundColor: theme.colors.secondary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  countText: {
    textAlign: "center",
    minWidth: 30,
  }
});