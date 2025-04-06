// src/screens/InsightsScreen.js
import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { AuthContext } from "../context/AuthContext";
import { getLatestInsights } from "../services/insightsService";
import InsightCard from "../components/InsightCard"; 
import Typography from "../ui/components/Typography";

/**
 * InsightsScreen Component
 * 
 * This screen displays AI-generated insights about the user's golf game.
 * Now supports dynamic tiered insights architecture for adaptive content display.
 */
export default function InsightsScreen({ navigation }) {
  // Get current authenticated user and premium status
  const { user, hasPermission } = useContext(AuthContext);
  const hasPremiumAccess = hasPermission("product_a");
  
  // State management
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
  
  // Navigation to subscription - conversion action
  const navigateToSubscription = () => {
    navigation.navigate("Subscription"); // Adjust to your actual subscription screen name
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
          <InsightCard
            title="Error Loading Insights"
            content={error}
            iconName="alert-circle-outline"
            variant="alert"
            ctaText="Try Again"
            ctaAction={fetchInsights}
          />
        </View>
      </Layout>
    );
  }
  
  // Render the empty state when no insights exist
  if (!insights) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <InsightCard
            title="No Insights Yet"
            content="Complete a round to get personalized insights from your golf coach. Track your shots to see patterns and get tips to improve your game."
            iconName="golf-outline"
            variant="standard"
          />
        </View>
      </Layout>
    );
  }
  
  // Check if insights has the new tieredInsights format
  const hasTieredInsights = insights && 
                           insights.tieredInsights && 
                           Array.isArray(insights.tieredInsights) && 
                           insights.tieredInsights.length > 0;
  
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
        {/* Check if we have tiered insights structure - if not, fall back to previous format */}
        {hasTieredInsights ? (
          // Render dynamic cards from tieredInsights array
          insights.tieredInsights.map((insight, index) => {
            // Check if user has permissions for this insight (adding permission handling but keeping insights themselves)
            const shouldGate = !hasPremiumAccess && insight.id !== "summary";
            
            return (
              <InsightCard
                key={insight.id || index}
                title={insight.title}
                content={insight.content}
                iconName={insight.iconName}
                variant={insight.variant}
                // Allow premium refresh on main summary card
                onRefresh={insight.id === "summary" && hasPremiumAccess ? onRefresh : undefined}
                // Add CTA for premium features if user doesn't have premium access
                ctaText={shouldGate ? "Unlock Premium Insights" : undefined}
                ctaAction={shouldGate ? navigateToSubscription : undefined}
              />
            );
          })
        ) : (
          // Fallback to original implementation with hardcoded cards
          <>
            {/* Performance Summary - Available to all users */}
            <InsightCard
              title="Performance Summary"
              content={insights.summary}
              iconName="analytics-outline"
              variant={hasPremiumAccess ? "highlight" : "standard"}
              // Only premium users get refresh capability
              onRefresh={hasPremiumAccess ? onRefresh : undefined}
              // Conversion opportunity for non-premium users
              ctaText={!hasPremiumAccess ? "Unlock Full Analysis" : undefined}
              ctaAction={navigateToSubscription}
            />
            
            {/* Primary Issue - Premium content */}
            {hasPremiumAccess && insights.primaryIssue && (
              <InsightCard
                title="Primary Issue"
                content={insights.primaryIssue}
                iconName="warning-outline"
                variant="highlight"
              />
            )}
            
            {/* Root Cause Analysis - Premium content */}
            {hasPremiumAccess && insights.reason && (
              <InsightCard
                title="Root Cause Analysis"
                content={insights.reason}
                iconName="information-circle-outline"
                variant="standard"
              />
            )}
            
            {/* Practice Focus - Premium content */}
            {hasPremiumAccess && insights.practiceFocus && (
              <InsightCard
                title="Practice Focus"
                content={insights.practiceFocus}
                iconName="basketball-outline"
                variant="success"
              />
            )}
            
            {/* Management Tip - Premium content */}
            {hasPremiumAccess && insights.managementTip && (
              <InsightCard
                title="Management Tip"
                content={insights.managementTip}
                iconName="bulb-outline"
                variant="standard"
              />
            )}
            
            {/* Progress - Premium content (only if available) */}
            {hasPremiumAccess && insights.progress && insights.progress !== "null" && (
              <InsightCard
                title="Your Progress"
                content={insights.progress}
                iconName="trending-up-outline"
                variant="success"
              />
            )}
            
            {/* Non-premium upsell card */}
            {!hasPremiumAccess && (
              <InsightCard
                title="Unlock Premium Insights"
                content="Upgrade to get detailed analysis of your primary issues, personalized practice recommendations, and course management strategies tailored to your game."
                iconName="lock-closed-outline"
                variant="alert"
                ctaText="Upgrade Now"
                ctaAction={navigateToSubscription}
              />
            )}
          </>
        )}
        
        {/* Analytics metrics for generation date */}
        {insights.generatedAt && (
          <View style={styles.footerContainer}>
            <Typography 
              variant="caption" 
              italic={true}
              align="center"
            >
              Generated on {new Date(insights.generatedAt).toLocaleDateString()}
            </Typography>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

// Styles with strategic layout optimizations for conversion
const styles = {
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
  },
  footerContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  }
};