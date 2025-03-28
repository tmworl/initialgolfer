// src/components/InsightsSummaryCard.js

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../ui/theme";
import Typography from "../ui/components/Typography";
import Card from "../ui/components/Card";

/**
 * InsightsSummaryCard Component
 * 
 * Displays a card with a golf coach icon and insights summary.
 * Shows appropriate content for both when insights exist and when they don't.
 * Enhanced with design system components for visual consistency.
 * 
 * @param {object} props
 * @param {string|null} props.summary - The insights summary text to display
 * @param {boolean} props.loading - Whether the insights are currently loading
 * @param {function} props.onRefresh - Function to call when refresh button is pressed
 */
const InsightsSummaryCard = ({ summary, loading = false, onRefresh }) => {
  // If we're loading, show a loading state
  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="golf-outline" size={24} color={theme.colors.primary} />
          </View>
          <Typography variant="subtitle">Coach's Corner</Typography>
        </View>
        <Typography variant="secondary" italic>Analyzing your golf game...</Typography>
      </Card>
    );
  }
  
  // Define content based on whether we have a summary or not
  const cardContent = summary ? (
    <Typography variant="body">{summary}</Typography>
  ) : (
    <Typography variant="secondary" italic>
      Complete a round to get personalized insights from your golf coach. 
      Track your shots to see patterns and improve your game.
    </Typography>
  );
  
  return (
    <Card style={styles.card}>
      {/* Card header with golf coach icon and title */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="golf-outline" size={24} color={theme.colors.primary} />
          </View>
          <Typography variant="subtitle">Coach's Corner</Typography>
        </View>
        
        {/* Add refresh button - only shown when not loading */}
        {onRefresh && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="refresh-outline" 
              size={22} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Card content - either insights summary or empty state */}
      <View style={styles.content}>
        {cardContent}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.medium,
    width: '100%',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.medium,
  },
  leftHeader: {
    flexDirection: "row", 
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff", // Light blue background for the icon
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.medium,
  },
  content: {
    marginLeft: theme.spacing.xsmall,
  },
  refreshButton: {
    padding: theme.spacing.small,
    borderRadius: 20,
  },
});

export default InsightsSummaryCard;