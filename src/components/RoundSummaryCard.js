// src/components/RoundSummaryCard.js
//
// This component displays a summary card for a golf round
// Used on both the HomeScreen and RoundsScreen for consistent presentation

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import theme from '../ui/theme';
import Typography from '../ui/components/Typography';
import Card from '../ui/components/Card';

/**
 * RoundSummaryCard Component
 * 
 * Displays a summary of a golf round with course name, date, score,
 * and performance metrics. Used across multiple screens for consistent display.
 * 
 * @param {Object} props
 * @param {Object} props.round - Round data object containing id, date, courseName, score, grossShots
 * @param {Function} props.onPress - Function to call when card is pressed (typically for navigation)
 */
const RoundSummaryCard = ({ round, onPress }) => {
  if (!round) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Card style={styles.roundCard}>
        {/* Course name and date row */}
        <View style={styles.cardTopRow}>
          <Typography 
            variant="body" 
            weight="semibold" 
            style={styles.courseName}
          >
            {round.courseName}
          </Typography>
          <Typography variant="caption">
            {new Date(round.date).toLocaleDateString()}
          </Typography>
        </View>
        
        {/* Stats row - only show for completed rounds */}
        <View style={styles.cardStatsRow}>
          {/* Gross shots (more prominent) */}
          <View style={styles.statContainer}>
            <Typography variant="subtitle" weight="bold">
              {round.grossShots !== null ? round.grossShots : "-"}
            </Typography>
            <Typography variant="caption">Total</Typography>
          </View>
          
          {/* Divider */}
          <View style={styles.statDivider} />
          
          {/* Score to par (less prominent) */}
          <View style={styles.statContainer}>
            <Typography
              variant="body"
              weight="semibold"
              color={theme.colors.primary}
            >
              {round.score !== null 
                ? (round.score > 0 ? `+${round.score}` : round.score) 
                : "-"}
            </Typography>
            <Typography variant="caption">To Par</Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roundCard: {
    marginBottom: theme.spacing.medium,
    padding: 0, // Remove default padding to control it ourselves
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
  },
  cardStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: theme.spacing.small,
    paddingTop: theme.spacing.small,
    paddingBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  courseName: {
    flex: 1,
    marginRight: theme.spacing.small,
  },
  statContainer: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  }
});

export default RoundSummaryCard;