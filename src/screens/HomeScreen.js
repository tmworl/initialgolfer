// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import InsightCard from "../components/InsightCard"; // New component
import RoundSummaryCard from "../components/RoundSummaryCard";
import { getLatestInsights } from "../services/insightsService";
import Typography from "../ui/components/Typography";
import Button from "../ui/components/Button";
import Card from "../ui/components/Card";

/**
 * HomeScreen Component
 * 
 * This screen shows the insights summary card, "Start New Round" button 
 * and displays cards for recent completed rounds.
 * Enhanced with design system components for visual consistency.
 */
export default function HomeScreen({ navigation }) {
  const { user, hasPermission } = useContext(AuthContext);
  const [recentRounds, setRecentRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Insights state for monetization surface
  const [insightsSummary, setInsightsSummary] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  
  // Determine premium status for conversion opportunities
  const hasPremiumAccess = hasPermission("product_a");

  // Fetch recent rounds when component mounts
  useEffect(() => {
    async function fetchRecentRounds() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch rounds including score and gross_shots if they exist
        const { data, error } = await supabase
          .from("rounds")
          .select(`
            id, 
            profile_id,
            course_id,
            created_at,
            score,
            gross_shots,
            is_complete
          `)
          .eq("profile_id", user.id)
          .eq("is_complete", true) // Only get completed rounds
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (error) {
          console.error("Error fetching rounds:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Get course information
          const courseIds = data.map(round => round.course_id);
          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("id, name")
            .in("id", courseIds);
            
          if (coursesError) {
            console.error("Error fetching courses:", coursesError);
          }
          
          // Map courses to rounds
          const coursesById = {};
          if (coursesData) {
            coursesData.forEach(course => {
              coursesById[course.id] = course;
            });
          }
          
          // Format data for display
          const formattedRounds = data.map(round => ({
            id: round.id,
            date: round.created_at,
            courseName: coursesById[round.course_id] ? coursesById[round.course_id].name : "Unknown Course",
            score: round.score,
            grossShots: round.gross_shots,
            isComplete: round.is_complete
          }));
          
          setRecentRounds(formattedRounds);
        } else {
          setRecentRounds([]);
        }
      } catch (error) {
        console.error("Error in fetchRecentRounds:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecentRounds();
  }, [user]);

  // Fetch insights summary - monetization content
  useEffect(() => {
    async function fetchInsightsSummary() {
      if (!user) return;
      
      try {
        setInsightsLoading(true);
        
        // Use our service function to get just the summary
        const summary = await getLatestInsights(user.id, 'summary');
        console.log("Fetched insights summary:", summary);
        
        // Update state with the summary text
        setInsightsSummary(summary);
      } catch (error) {
        console.error("Error fetching insights summary:", error);
        // Set to null on error so we show the empty state
        setInsightsSummary(null);
      } finally {
        setInsightsLoading(false);
      }
    }
    
    fetchInsightsSummary();
  }, [user]);
  
  // Refresh insights data
  const refreshInsights = async () => {
    if (!user) return;
    
    try {
      setInsightsLoading(true);
      const summary = await getLatestInsights(user.id, 'summary');
      setInsightsSummary(summary);
    } catch (error) {
      console.error("Error refreshing insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Handle navigation to scorecard
  const handleRoundPress = (roundId) => {
    console.log("Round pressed:", roundId);
    navigation.navigate("ScorecardScreen", { roundId });
  };

  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.container}>
          {/* Primary Monetization Surface: Insights Card */}
          <InsightCard
            title="Coach's Corner"
            content={insightsSummary || "Complete a round to get personalized insights from your golf coach."}
            loading={insightsLoading}
            // Different treatment based on permission status
            variant={hasPremiumAccess ? "highlight" : "standard"}
            // Only premium users get refresh capability - visible value gap
            onRefresh={hasPremiumAccess ? refreshInsights : undefined}
            // Conversion opportunity for non-premium users
            ctaText={!hasPremiumAccess && insightsSummary ? "Unlock Full Analysis" : undefined}
            ctaAction={() => navigation.navigate("Subscription")}
          />
          
          {/* Start New Round button */}
          <Button
            variant="primary"
            size="large"
            onPress={() => navigation.navigate("CourseSelector")}
            style={styles.primaryButton}
          >
            Start New Round
          </Button>
          
          <View style={styles.recentRoundsSection}>
            {/* Section title for Recent Rounds */}
            <Typography 
              variant="subtitle" 
              style={styles.sectionTitle}
            >
              Recent Rounds
            </Typography>
            
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : recentRounds.length > 0 ? (
              <View style={styles.roundsList}>
                {recentRounds.map(round => (
                  <RoundSummaryCard 
                    key={round.id}
                    round={round} 
                    onPress={() => handleRoundPress(round.id)}
                  />
                ))}
              </View>
            ) : (
              <Card variant="flat" style={styles.emptyStateCard}>
                <Typography 
                  variant="secondary" 
                  italic 
                  align="center"
                >
                  No completed rounds yet. Start tracking your game!
                </Typography>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  primaryButton: {
    marginVertical: theme.spacing.medium,
    minWidth: 200,
  },
  recentRoundsSection: {
    width: "100%",
    marginTop: theme.spacing.large,
  },
  sectionTitle: {
    marginBottom: theme.spacing.medium,
  },
  roundsList: {
    width: "100%",
  },
  emptyStateCard: {
    padding: theme.spacing.medium,
  }
});