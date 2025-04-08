// Modified version of src/components/InsightCard.js with text containment improvements

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../ui/theme";
import Typography from "../ui/components/Typography";
import Card from "../ui/components/Card";
import Button from "../ui/components/Button";

/**
 * InsightCard Component
 * 
 * A strategic monetization surface for delivering insights with configurable
 * conversion touchpoints and premium-exclusive features.
 * MODIFIED FOR TEXT CONTAINMENT: Ensures all text content remains inside card boundaries
 * while allowing flexible height expansion.
 */
const InsightCard = ({
  title,
  content,
  variant = "standard",
  iconName = "golf-outline",
  ctaText,
  ctaAction,
  onRefresh,
  loading = false,
  style,
}) => {
  // Determine variant-specific styling for monetization optimization
  const variantStyle = getVariantStyle(variant);
  
  // Loading state with strategic minimal implementation
  if (loading) {
    return (
      <Card style={[styles.card, style]}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, variantStyle.iconContainer]}>
            <Ionicons name={iconName} size={24} color={variantStyle.iconColor || theme.colors.primary} />
          </View>
          <Typography variant="subtitle" style={styles.headerText}>{title}</Typography>
        </View>
        <Typography variant="secondary" italic>Analyzing your golf game...</Typography>
      </Card>
    );
  }
  
  return (
    <Card style={[styles.card, variantStyle.card, style]}>
      {/* Card header with configurable icon and title - IMPROVED FOR TEXT WRAPPING */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconContainer, variantStyle.iconContainer]}>
            <Ionicons 
              name={iconName} 
              size={24} 
              color={variantStyle.iconColor || theme.colors.primary} 
            />
          </View>
          {/* Title now has flex:1 and properly wraps */}
          <View style={styles.titleContainer}>
            <Typography 
              variant="subtitle" 
              color={variantStyle.titleColor}
              style={styles.headerText}
            >
              {title}
            </Typography>
          </View>
        </View>
        
        {/* Premium-exclusive refresh button */}
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
      
      {/* Card content with flexible rendering - IMPROVED FOR CONTENT EXPANSION */}
      <View style={styles.content}>
        {typeof content === 'string' ? (
          <Typography 
            variant="body"
            style={styles.contentText}
          >
            {content}
          </Typography>
        ) : (
          content
        )}
      </View>
      
      {/* Conversion call-to-action */}
      {ctaText && (
        <View style={styles.ctaContainer}>
          <Button 
            variant={variantStyle.buttonVariant || "primary"} 
            onPress={ctaAction}
          >
            {ctaText}
          </Button>
        </View>
      )}
    </Card>
  );
};

/**
 * Maps variants to specific visual treatments optimized for conversion
 */
const getVariantStyle = (variant) => {
  switch(variant) {
    case 'highlight':
      return {
        card: { borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
        iconContainer: { backgroundColor: `${theme.colors.primary}20` },
        iconColor: theme.colors.primary,
        titleColor: theme.colors.primary,
        buttonVariant: "primary"
      };
    case 'alert':
      return {
        card: { borderLeftWidth: 4, borderLeftColor: theme.colors.accent || "#FF8800" },
        iconContainer: { backgroundColor: `${theme.colors.accent || "#FF8800"}20` },
        iconColor: theme.colors.accent || "#FF8800",
        titleColor: theme.colors.accent || "#FF8800",
        buttonVariant: "secondary"
      };
    case 'success':
      return {
        card: { borderLeftWidth: 4, borderLeftColor: theme.colors.success },
        iconContainer: { backgroundColor: `${theme.colors.success}20` },
        iconColor: theme.colors.success,
        titleColor: theme.colors.success,
        buttonVariant: "outline"
      };
    default:
      return {
        card: {},
        iconContainer: { backgroundColor: "#f0f8ff" },
        iconColor: theme.colors.primary,
        titleColor: theme.colors.text,
        buttonVariant: "primary"
      };
  }
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.medium,
    width: '100%',
    // Remove any fixed height to allow expansion
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed from center to allow title to expand vertically
    justifyContent: "space-between",
    marginBottom: theme.spacing.medium,
    flexWrap: "wrap", // Allow wrapping for very long titles
  },
  leftHeader: {
    flexDirection: "row", 
    alignItems: "flex-start", // Changed from center
    flex: 1, // Take available space
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.medium,
    backgroundColor: "#f0f8ff",
    flexShrink: 0, // Prevent icon from shrinking
  },
  titleContainer: {
    flex: 1, // Take remaining space
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerText: {
    flexShrink: 1, // Allow text to shrink rather than overflow
    flexWrap: 'wrap', // Enable text wrapping
  },
  content: {
    marginLeft: theme.spacing.xsmall,
    // Remove any fixed height constraints
  },
  contentText: {
    // Ensure text can wrap and expand vertically
    flexWrap: 'wrap',
  },
  ctaContainer: {
    marginTop: theme.spacing.medium,
    alignItems: "flex-start",
  },
  refreshButton: {
    padding: theme.spacing.small,
    borderRadius: 20,
    marginLeft: theme.spacing.small,
    flexShrink: 0, // Prevent button from shrinking
  },
});

export default InsightCard;