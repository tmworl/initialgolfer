// src/screens/RoundScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import RoundSummaryCard from "../components/RoundSummaryCard";
import Typography from "../ui/components/Typography";

/**
 * RoundsScreen Component
 * 
 * Displays a list of all completed rounds with detailed information.
 * Each round card is touchable and navigates to the ScorecardScreen.
 */
export default function RoundsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRounds() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all COMPLETED rounds with scores and shots data
        // IMPORTANT CHANGE: Added filter for is_complete = true
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
          .order("created_at", { ascending: false });
          
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
          
          setRounds(formattedRounds);
        } else {
          setRounds([]);
        }
      } catch (error) {
        console.error("Error in fetchRounds:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRounds();
  }, [user]);

  // Navigate to the scorecard
  const handleRoundPress = (roundId) => {
    console.log("Navigating to scorecard for round:", roundId);
    // Explicitly navigate to the ScorecardScreen with the roundId parameter
    navigation.navigate("ScorecardScreen", { roundId });
  };

  return (
    <Layout>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : rounds.length > 0 ? (
          <FlatList
            data={rounds}
            renderItem={({ item }) => (
              <RoundSummaryCard 
                round={item} 
                onPress={() => handleRoundPress(item.id)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Typography 
              variant="secondary" 
              italic 
              style={styles.emptyText}
            >
              No completed rounds yet. Start a round from the Home tab!
            </Typography>
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
  }
});