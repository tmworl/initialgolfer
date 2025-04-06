// src/components/InsightCard.js
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
 * 
 * @param {Object} props
 * @param {string} props.title - Required title drives engagement metrics
 * @param {string|ReactNode} props.content - Primary value delivery
 * @param {string} props.variant - Visual treatment strategy (standard, highlight, alert, success)
 * @param {string} props.iconName - Ionicons identifier for contextual recognition
 * @param {string} props.ctaText - Call-to-action text for conversion
 * @param {Function} props.ctaAction - Conversion action handler
 * @param {Function} props.onRefresh - Premium-exclusive refresh capability
 * @param {boolean} props.loading - Loading state indicator
 * @param {Object} props.style - Custom style overrides
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
          <Typography variant="subtitle">{title}</Typography>
        </View>
        <Typography variant="secondary" italic>Analyzing your golf game...</Typography>
      </Card>
    );
  }
  
  return (
    <Card style={[styles.card, variantStyle.card, style]}>
      {/* Card header with configurable icon and title */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconContainer, variantStyle.iconContainer]}>
            <Ionicons 
              name={iconName} 
              size={24} 
              color={variantStyle.iconColor || theme.colors.primary} 
            />
          </View>
          <Typography 
            variant="subtitle" 
            color={variantStyle.titleColor}
          >
            {title}
          </Typography>
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
      
      {/* Card content with flexible rendering */}
      <View style={styles.content}>
        {typeof content === 'string' ? (
          <Typography variant="body">{content}</Typography>
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.medium,
    backgroundColor: "#f0f8ff", // Light blue background for the icon
  },
  content: {
    marginLeft: theme.spacing.xsmall,
  },
  ctaContainer: {
    marginTop: theme.spacing.medium,
    alignItems: "flex-start",
  },
  refreshButton: {
    padding: theme.spacing.small,
    borderRadius: 20,
  },
});

export default InsightCard;