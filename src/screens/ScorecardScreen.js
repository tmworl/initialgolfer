// src/screens/ScorecardScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

/**
 * ScorecardScreen Component
 * 
 * Displays a detailed scorecard for a completed round.
 * Shows hole-by-hole scores and outcome breakdowns.
 * Updated to work with the new shots data structure.
 * Enhanced navigation to provide cleaner flow back to home screen.
 */
export default function ScorecardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Get roundId from navigation params
  const { roundId, fromTracker } = route.params || {};
  
  // State variables for scorecard data
  const [roundData, setRoundData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [holesData, setHolesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the outcome categories - used throughout the component
  const outcomes = ["On Target", "Slightly Off", "Recovery Needed"];

  // Fetch all data for this round when component mounts
  useEffect(() => {
    async function fetchRoundData() {
      if (!roundId) {
        console.error("No roundId provided to ScorecardScreen");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Fetch the round data
        const { data: round, error: roundError } = await supabase
          .from("rounds")
          .select(`
            id,
            profile_id,
            course_id,
            score,
            gross_shots,
            created_at,
            is_complete,
            selected_tee_name
          `)
          .eq("id", roundId)
          .single();
          
        console.log("Round data:", round);
        
        if (roundError) {
          console.error("Error fetching round:", roundError);
          throw roundError;
        }
        setRoundData(round);
        
        // 2. Fetch the course data
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("id, name, par, holes")
          .eq("id", round.course_id)
          .single();
          
        console.log("Course data:", course);
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          throw courseError;
        }
        setCourseData(course);
        
        // 3. Fetch all hole data for this round using new table structure
        const { data: holes, error: holesError } = await supabase
          .from("shots")
          .select("hole_number, hole_data, total_score")
          .eq("round_id", roundId)
          .order("hole_number");
          
        console.log("Holes data count:", holes?.length);
        
        if (holesError) {
          console.error("Error fetching holes data:", holesError);
          throw holesError;
        }
        
        // Process the holes data to get outcome breakdowns for display
        const processedHoles = processHolesData(holes, round.selected_tee_name?.toLowerCase());
        setHolesData(processedHoles);
        
      } catch (error) {
        console.error("Error fetching scorecard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRoundData();
  }, [roundId]);

  /**
   * Process the holes data to get outcome breakdowns
   * This converts the JSONB hole_data into a format for display
   */
  const processHolesData = (holes, selectedTee) => {
    const processed = [];
    
    // Default empty data for all 18 holes
    for (let i = 1; i <= 18; i++) {
      processed[i] = {
        number: i,
        score: 0,
        outcomes: {
          "On Target": 0,
          "Slightly Off": 0,
          "Recovery Needed": 0
        }
      };
    }
    
    // Process each hole with data
    holes.forEach(hole => {
      const holeNum = hole.hole_number;
      const holeData = hole.hole_data;
      
      // Skip if missing data
      if (!holeData || !holeData.shots || !Array.isArray(holeData.shots)) {
        return;
      }
      
      // Count by outcome
      const outcomes = {
        "On Target": 0,
        "Slightly Off": 0,
        "Recovery Needed": 0
      };
      
      // Count shots by outcome
      holeData.shots.forEach(shot => {
        if (outcomes[shot.result] !== undefined) {
          outcomes[shot.result]++;
        }
      });
      
      // Update processed data
      processed[holeNum] = {
        number: holeNum,
        score: hole.total_score || holeData.shots.length,
        par: holeData.par,
        distance: holeData.distance,
        outcomes: outcomes
      };
    });
    
    // Return only valid holes (1-18)
    return processed.filter((_, index) => index > 0 && index <= 18);
  };

  // Calculate front nine, back nine, and total scores with outcome breakdowns
  const calculateTotals = () => {
    let frontNine = 0;
    let backNine = 0;
    
    // Initialize outcome totals
    let totalOnTarget = 0;
    let totalSlightlyOff = 0; 
    let totalRecoveryNeeded = 0;
    
    holesData.forEach(hole => {
      const holeNum = hole.number;
      const score = hole.score || 0;
      
      // Add to front or back nine
      if (holeNum <= 9) {
        frontNine += score;
      } else {
        backNine += score;
      }
      
      // Count outcomes
      totalOnTarget += hole.outcomes["On Target"] || 0;
      totalSlightlyOff += hole.outcomes["Slightly Off"] || 0;
      totalRecoveryNeeded += hole.outcomes["Recovery Needed"] || 0;
    });
    
    return {
      frontNine,
      backNine,
      total: frontNine + backNine,
      outcomes: {
        "On Target": totalOnTarget,
        "Slightly Off": totalSlightlyOff,
        "Recovery Needed": totalRecoveryNeeded
      }
    };
  };

  // Get color for outcome column headers
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case "On Target":
        return "#e6ffe6"; // Light green for good shots
      case "Slightly Off":
        return "#fff9e6"; // Light yellow for slightly off shots
      case "Recovery Needed":
        return "#ffe6e6"; // Light red for shots needing recovery
      default:
        return "#f5f5f5"; // Default gray
    }
  };

  /**
   * Navigate directly to home screen
   * Enhanced to clear the navigation stack for a clean return
   */
  const handleGoHome = () => {
    // Use popToTop to go back to the root of the current stack (HomeScreen)
    // This creates a clean navigation state
    navigation.dispatch(StackActions.popToTop());
  };

  // If still loading, show loading indicator
  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading scorecard...</Text>
        </View>
      </Layout>
    );
  }

  // Calculate totals for display
  const totals = calculateTotals();

  return (
    <Layout>
      <View style={styles.container}>
        {/* Course info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{courseData?.name || "Unknown Course"}</Text>
          <Text style={styles.roundDate}>
            {roundData?.created_at ? new Date(roundData.created_at).toLocaleDateString() : ""}
          </Text>
        </View>
        
        {/* Scorecard */}
        <ScrollView style={styles.scorecard}>
          {/* Header row - updated with new outcome categories */}
          <View style={styles.headerRow}>
            <Text style={[styles.holeColumn, styles.headerText]}>Hole</Text>
            <Text style={[styles.parColumn, styles.headerText]}>Par</Text>
            <Text style={[styles.scoreColumn, styles.headerText]}>Score</Text>
            {/* Outcome columns with new categories */}
            <Text style={[styles.outcomeColumn, styles.headerText, {backgroundColor: getOutcomeColor("On Target")}]}>
              On Target
            </Text>
            <Text style={[styles.outcomeColumn, styles.headerText, {backgroundColor: getOutcomeColor("Slightly Off")}]}>
              Slightly Off
            </Text>
            <Text style={[styles.outcomeColumn, styles.headerText, {backgroundColor: getOutcomeColor("Recovery Needed")}]}>
              Recovery
            </Text>
          </View>
          
          {/* Hole rows - Front Nine */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(holeNum => {
            // Find this hole's data
            const holeData = holesData.find(h => h.number === holeNum) || {
              number: holeNum,
              score: 0,
              par: getCourseHolePar(courseData, holeNum),
              outcomes: { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 }
            };
            
            return (
              <View key={`hole-${holeNum}`} style={styles.holeRow}>
                <Text style={styles.holeColumn}>{holeNum}</Text>
                <Text style={styles.parColumn}>{holeData.par || "-"}</Text>
                <Text style={styles.scoreColumn}>{holeData.score || 0}</Text>
                {/* Outcome values */}
                <Text style={styles.outcomeColumn}>{holeData.outcomes["On Target"] || 0}</Text>
                <Text style={styles.outcomeColumn}>{holeData.outcomes["Slightly Off"] || 0}</Text>
                <Text style={styles.outcomeColumn}>{holeData.outcomes["Recovery Needed"] || 0}</Text>
              </View>
            );
          })}
          
          {/* Out (Front Nine) totals */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>Out</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{calculateCoursePar(courseData, 1, 9)}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.frontNine}</Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
          </View>
          
          {/* Hole rows - Back Nine */}
          {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(holeNum => {
            // Find this hole's data
            const holeData = holesData.find(h => h.number === holeNum) || {
              number: holeNum,
              score: 0,
              par: getCourseHolePar(courseData, holeNum),
              outcomes: { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 }
            };
            
            return (
              <View key={`hole-${holeNum}`} style={styles.holeRow}>
                <Text style={styles.holeColumn}>{holeNum}</Text>
                <Text style={styles.parColumn}>{holeData.par || "-"}</Text>
                <Text style={styles.scoreColumn}>{holeData.score || 0}</Text>
                {/* Outcome values */}
                <Text style={styles.outcomeColumn}>{holeData.outcomes["On Target"] || 0}</Text>
                <Text style={styles.outcomeColumn}>{holeData.outcomes["Slightly Off"] || 0}</Text>
                <Text style={styles.outcomeColumn}>{holeData.outcomes["Recovery Needed"] || 0}</Text>
              </View>
            );
          })}
          
          {/* In (Back Nine) totals */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>In</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{calculateCoursePar(courseData, 10, 18)}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.backNine}</Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
          </View>
          
          {/* Total row - updated with new outcome totals */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>Total</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{courseData?.par || "-"}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.total}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes["On Target"]}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes["Slightly Off"]}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes["Recovery Needed"]}</Text>
          </View>
        </ScrollView>
        
        {/* Round summary - updated label to match new categories */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Score</Text>
            <Text style={styles.summaryValue}>{totals.total}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Vs Par</Text>
            <Text style={styles.summaryValue}>
              {roundData?.score !== null ? (roundData.score > 0 ? `+${roundData.score}` : roundData.score) : "N/A"}
            </Text>
          </View>
          {/* Updated to show "On Target" instead of "Good Shots" */}
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>On Target Shots</Text>
            <Text style={styles.summaryValue}>{totals.outcomes["On Target"]}</Text>
          </View>
        </View>
        
        {/* Return to Home button - only shown when coming from tracker */}
        {fromTracker && (
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={handleGoHome}
          >
            <Text style={styles.homeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </Layout>
  );
}

/**
 * Helper function to get par for a specific hole from course data
 */
function getCourseHolePar(courseData, holeNumber) {
  if (!courseData || !courseData.holes || !Array.isArray(courseData.holes)) {
    return null;
  }
  
  const holeData = courseData.holes.find(h => h.number === holeNumber);
  return holeData ? holeData.par_men : null;
}

/**
 * Helper function to calculate par for a range of holes
 */
function calculateCoursePar(courseData, startHole, endHole) {
  if (!courseData || !courseData.holes || !Array.isArray(courseData.holes)) {
    return null;
  }
  
  let totalPar = 0;
  for (let i = startHole; i <= endHole; i++) {
    const holePar = getCourseHolePar(courseData, i);
    if (holePar) {
      totalPar += holePar;
    }
  }
  
  return totalPar || null;
}

// Styles with Material Design guidelines
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  courseInfo: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roundDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scorecard: {
    backgroundColor: "#fff",
    flex: 1,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  holeRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  totalRow: {
    backgroundColor: "#f5f5f5",
  },
  holeColumn: {
    width: 50,
    textAlign: "center",
    fontWeight: "500",
  },
  parColumn: {
    width: 50,
    textAlign: "center",
  },
  scoreColumn: {
    width: 50,
    textAlign: "center",
  },
  outcomeColumn: {
    flex: 1,
    textAlign: "center",
    // Now columns can be individually styled with backgroundColor as needed
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 12, // Slightly smaller font for the longer outcome names
  },
  totalText: {
    fontWeight: "bold",
  },
  summary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  // Return to Home button styling
  homeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    minWidth: 200,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});