// src/screens/InsightsScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { AuthContext } from "../context/AuthContext";
import { getLatestInsights } from "../services/insightsService";

// Import design system components
import Typography from "../ui/components/Typography";
import Button from "../ui/components/Button";
import Card from "../ui/components/Card";

/**
 * InsightsScreen Component
 * 
 * This screen displays AI-generated insights about the user's golf game.
 * It shows all sections of the insights data in an organized, readable format.
 */
export default function InsightsScreen() {
  // Get current authenticated user
  const { user } = useContext(AuthContext);
  
  // State management
  const [insights, setInsights] = useState(null);        // Stores the complete insights data
  const [loading, setLoading] = useState(true);          // Tracks loading state during initial load
  const [refreshing, setRefreshing] = useState(false);   // Tracks pull-to-refresh state
  const [error, setError] = useState(null);              // Stores any error messages

  /**
   * Fetch insights data from the database
   */
  const fetchInsights = async () => {
    if (!user) {
      setError("You must be logged in to view insights");
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      
      // Get the full insights object from our service
      const insightsData = await getLatestInsights(user.id);
      
      if (insightsData) {
        console.log("Insights data loaded:", Object.keys(insightsData));
        setInsights(insightsData);
      } else {
        // No insights found - will show empty state
        setInsights(null);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load insights. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load insights when component mounts
  useEffect(() => {
    fetchInsights();
  }, [user]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
  };

  // Render an insights section with icon and content
  const renderInsightSection = (title, content, iconName, iconColor) => {
    // Don't render if content is empty or null
    if (!content) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name={iconName} size={22} color={iconColor} />
          <Typography variant="subtitle" style={styles.sectionTitle}>{title}</Typography>
        </View>
        <Typography variant="body" style={styles.sectionContent}>{content}</Typography>
      </View>
    );
  };
  
  // Render the loading view
  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Typography variant="secondary" style={styles.loadingText}>
            Loading your insights...
          </Typography>
        </View>
      </Layout>
    );
  }
  
  // Render the error state
  if (error) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Typography 
            variant="subtitle" 
            color={theme.colors.error}
            style={styles.errorText}
          >
            {error}
          </Typography>
          <Button 
            variant="primary" 
            onPress={fetchInsights}
            iconLeft="refresh-outline"
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </Layout>
    );
  }
  
  // Render the empty state when no insights exist
  if (!insights) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Ionicons name="golf-outline" size={64} color={theme.colors.primary} />
          <Typography 
            variant="title" 
            style={styles.emptyTitleText}
          >
            No Insights Yet
          </Typography>
          <Typography 
            variant="secondary"
            style={styles.emptyText}
          >
            Complete a round to get personalized insights from your golf coach.
            Track your shots to see patterns and get tips to improve your game.
          </Typography>
        </View>
      </Layout>
    );
  }
  
  // Render the insights content
  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Card style={{margin: 16}}>
          {/* Summary Section */}
          {insights.summary && (
            <Card.Header>
              <Typography variant="body" weight="medium">
                {insights.summary}
              </Typography>
            </Card.Header>
          )}
          
          <View style={{padding: insights.summary ? 0 : 8}}>
            {/* Primary Issue Section */}
            {renderInsightSection(
              "Primary Issue",
              insights.primaryIssue,
              "warning-outline", 
              "#f57c00" // Orange
            )}
            
            {/* Reason Section */}
            {renderInsightSection(
              "Reason",
              insights.reason,
              "information-circle-outline", 
              "#0288d1" // Blue
            )}
            
            {/* Practice Focus Section */}
            {renderInsightSection(
              "Practice Focus",
              insights.practiceFocus,
              "basketball-outline", 
              "#4caf50" // Green
            )}
            
            {/* Management Tip Section */}
            {renderInsightSection(
              "Management Tip",
              insights.managementTip,
              "bulb-outline", 
              "#ffc107" // Amber
            )}
            
            {/* Progress Section - Only shown if available and not null */}
            {insights.progress && insights.progress !== "null" && (
              renderInsightSection(
                "Progress",
                insights.progress,
                "trending-up-outline", 
                "#9c27b0" // Purple
              )
            )}
          </View>
          
          {/* Show when the insights were generated */}
          {insights.generatedAt && (
            <Card.Footer>
              <Typography 
                variant="caption" 
                italic={true}
                align="center"
              >
                Generated on {new Date(insights.generatedAt).toLocaleDateString()}
              </Typography>
            </Card.Footer>
          )}
        </Card>
        
        {/* Refresh button at the bottom */}
        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            iconLeft="refresh-outline"
            onPress={onRefresh}
            loading={refreshing}
          >
            Refresh Insights
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
}

// We're keeping the styles here for compatibility, but gradually they could be
// moved to the component level in the future design system
const styles = {
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  sectionContent: {
    lineHeight: 24,
    paddingLeft: 30, // Indent to align with section title
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyTitleText: {
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  }
};