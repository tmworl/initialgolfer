// src/screens/TrackerScreen.js

import React, { useState, useEffect, useContext, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView,
  BackHandler,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { createRound, saveHoleData, completeRound } from "../services/roundservice";
import ShotTable from "../components/ShotTable";
import HoleNavigator from "../components/HoleNavigator";
import { AuthContext } from "../context/AuthContext";
import Typography from "../ui/components/Typography";
import Button from "../ui/components/Button";
import DistanceIndicator from '../components/DistanceIndicator';

/**
 * TrackerScreen Component
 * 
 * This screen allows users to track shots during a round of golf.
 * Uses the new data structure for tracking and saving hole data.
 * Enhanced to include POI data for each hole when available.
 */
export default function TrackerScreen({ navigation }) {
  // Get the authenticated user from context
  const { user } = useContext(AuthContext);
  
  // Local state for tracking current hole and shots
  const [currentHole, setCurrentHole] = useState(1);
  const [totalHoles] = useState(18); // Standard golf round is 18 holes
  
  // Initialize hole data structure for all holes
  const initialHoleState = {};
  for (let i = 1; i <= 18; i++) {
    initialHoleState[i] = {
      // Hole characteristics (will be filled from course data)
      par: null,
      distance: null,
      index: null,
      features: [],
      
      // Shot data
      shots: [], // Array of { type, result, timestamp }
      
      // Shot counts for ShotTable compatibility
      shotCounts: {
        "Tee Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Long Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Approach": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Chip": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Putts": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Sand": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
        "Penalties": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 }
      },
      
      // POI data for this hole
      poi: null
    };
  }
  
  // Main state variables for the component
  const [holeData, setHoleData] = useState(initialHoleState); // Tracks all data for all holes
  const [round, setRound] = useState(null);                    // Current round data
  const [activeColumn, setActiveColumn] = useState("On Target"); // Currently selected outcome column
  const [loading, setLoading] = useState(false);                // Loading state for async operations
  const [course, setCourse] = useState(null);                   // Current course data
  const [courseDetails, setCourseDetails] = useState(null);     // Detailed course data from database

  // Add this effect to handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Show confirmation dialog instead of going back immediately
        Alert.alert(
          "Exit Round?",
          "Are you sure you want to exit this round? Your progress will be saved.",
          [
            { text: "Cancel", style: "cancel", onPress: () => {} },
            { 
              text: "Exit", 
              style: "destructive",
              onPress: () => {
                // Save current progress and navigate back
                saveCurrentHoleToStorage().then(() => {
                  navigation.goBack();
                });
              }
            }
          ]
        );
        return true; // Prevent default back behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  /**
   * Save the current hole data to AsyncStorage
   * Now includes POI data within the hole data structure
   */
  const saveCurrentHoleToStorage = useCallback(async () => {
    if (!round) return;
    
    try {
      // Get existing stored hole data or initialize empty object
      const existingDataStr = await AsyncStorage.getItem(`round_${round.id}_holes`);
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
      
      // Update with current hole data - POI data is now included in holeData
      existingData[currentHole] = holeData[currentHole];
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem(`round_${round.id}_holes`, JSON.stringify(existingData));
      console.log(`Saved hole ${currentHole} data to AsyncStorage`);
    } catch (error) {
      console.error("Error saving hole data to AsyncStorage:", error);
    }
  }, [round, currentHole, holeData]);

  /**
   * Load hole data from AsyncStorage
   * Will now include POI data if it was previously saved
   */
  const loadHoleDataFromStorage = useCallback(async () => {
    if (!round) return;
    
    try {
      const storedDataStr = await AsyncStorage.getItem(`round_${round.id}_holes`);
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        
        // Merge with current state (only update holes that have stored data)
        setHoleData(prevData => {
          const newData = { ...prevData };
          
          // For each hole in stored data, update the state
          Object.keys(storedData).forEach(holeNum => {
            newData[holeNum] = storedData[holeNum];
          });
          
          return newData;
        });
        
        console.log("Loaded hole data from AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading hole data from AsyncStorage:", error);
    }
  }, [round]);

  /**
   * Function to navigate to the next hole
   * Saves current hole data before moving
   */
  const handleNextHole = useCallback(async () => {
    if (currentHole < totalHoles) {
      // Save current hole data to AsyncStorage
      await saveCurrentHoleToStorage();
      
      // Move to the next hole
      setCurrentHole(prev => prev + 1);
    } else {
      // If on the last hole, prompt to finish the round
      Alert.alert(
        "End of Round",
        "You've reached the last hole. Would you like to finish the round?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Finish Round", 
            onPress: () => finishRound(),
            style: "default" 
          }
        ]
      );
    }
  }, [currentHole, totalHoles, saveCurrentHoleToStorage]);

  /**
   * Function to navigate to the previous hole
   * Saves current hole data before moving
   */
  const handlePreviousHole = useCallback(async () => {
    if (currentHole > 1) {
      // Save current hole data to AsyncStorage
      await saveCurrentHoleToStorage();
      
      // Move to the previous hole
      setCurrentHole(prev => prev - 1);
    }
  }, [currentHole, saveCurrentHoleToStorage]);

  /**
   * Update hole information when courseDetails or currentHole changes
   * Now includes mapping POI data for the current hole
   */
  useEffect(() => {
    // Update hole information when courseDetails is available
    if (courseDetails && courseDetails.holes) {
      // Find information for the current hole
      const currentHoleInfo = courseDetails.holes.find(
        hole => hole.number === currentHole
      );
      
      if (currentHoleInfo) {
        // Get selected tee information
        const selectedTeeName = round?.selected_tee_name?.toLowerCase() || course?.teeName?.toLowerCase();
        
        // Get distance for selected tee
        let distance = null;
        if (currentHoleInfo.distances && selectedTeeName && currentHoleInfo.distances[selectedTeeName]) {
          distance = currentHoleInfo.distances[selectedTeeName];
        } else if (currentHoleInfo.distances) {
          // Fallback to first available tee
          const firstTee = Object.keys(currentHoleInfo.distances)[0];
          if (firstTee) {
            distance = currentHoleInfo.distances[firstTee];
          }
        }
        
        // Find POI data for the current hole if available
        let holePoi = null;
        if (course && course.poi && Array.isArray(course.poi)) {
          // Find POI data for this specific hole
          const holePoiData = course.poi.find(poi => poi.hole === currentHole);
          if (holePoiData) {
            holePoi = {
              greens: holePoiData.greens || [],
              bunkers: holePoiData.bunkers || [],
              hazards: holePoiData.hazards || [],
              tees: holePoiData.tees || []
            };
          }
        }
        
        // Update hole data with course information
        setHoleData(prevData => {
          const newData = { ...prevData };
          
          // Only update if not already set
          if (!newData[currentHole].par) {
            newData[currentHole] = {
              ...newData[currentHole],
              par: currentHoleInfo.par_men || null,
              distance: distance || null,
              index: currentHoleInfo.index_men || null,
              features: currentHoleInfo.features || [],
              poi: holePoi // Add POI data to hole
            };
          }
          
          return newData;
        });
      }
    }
  }, [courseDetails, currentHole, round, course]);

  /**
   * Initialize round on component mount
   * Enhanced to handle POI data from selected course
   */
  useEffect(() => {
    const initializeRound = async () => {
      try {
        if (!user) {
          console.warn("No user found. Cannot create a round without a signed-in user.");
          return;
        }
        
        // Get the selected course data from AsyncStorage
        const storedCourseData = await AsyncStorage.getItem("selectedCourse");
        if (!storedCourseData) {
          console.error("No course selected. Cannot start a round.");
          navigation.goBack();
          return;
        }
        
        const courseData = JSON.parse(storedCourseData);
        setCourse(courseData);
        
        console.log("Starting round with course and tee:", courseData);
        
        // Log POI availability for debugging
        if (courseData.poi && Array.isArray(courseData.poi)) {
          console.log(`Course has POI data for ${courseData.poi.length} holes`);
        } else {
          console.log("Course does not have POI data");
        }
        
        // Check if there's an in-progress round in AsyncStorage
        const existingRoundStr = await AsyncStorage.getItem("currentRound");
        let roundData;
        
        if (existingRoundStr) {
          // Use existing round
          roundData = JSON.parse(existingRoundStr);
          console.log("Resuming existing round:", roundData);
          setRound(roundData);
        } else {
          // Create a new round
          roundData = await createRound(
            user.id,
            courseData.id,
            courseData.teeId,
            courseData.teeName
          );
          
          console.log("New round created:", roundData);
          setRound(roundData);
          
          // Store the round in AsyncStorage
          await AsyncStorage.setItem("currentRound", JSON.stringify(roundData));
        }
        
        // Get supabase from the service
        const { supabase } = require("../services/supabase");
        
        // Get full course details from database
        try {
          const { data: fullCourseData, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", courseData.id)
            .single();
            
          if (error) {
            console.error("Error fetching course details:", error);
          } else if (fullCourseData) {
            console.log("Found full course details:", fullCourseData.name);
            setCourseDetails(fullCourseData);
          }
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
        
        // Load any existing hole data from AsyncStorage
        if (roundData) {
          const storedHolesStr = await AsyncStorage.getItem(`round_${roundData.id}_holes`);
          if (storedHolesStr) {
            const storedHoles = JSON.parse(storedHolesStr);
            
            // Merge with initial state
            setHoleData(prevData => {
              const newData = { ...prevData };
              
              // Update each hole that has stored data
              Object.keys(storedHoles).forEach(holeNum => {
                newData[holeNum] = storedHoles[holeNum];
              });
              
              return newData;
            });
            
            console.log("Loaded hole data from storage");
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
        Alert.alert(
          "Error",
          "There was a problem starting your round. Please try again."
        );
      }
    };
    
    initializeRound();
  }, [user, navigation]);

  /**
   * Function to add a shot of a specific type and outcome
   */
  const addShot = useCallback((type, outcome) => {
    console.log(`Adding ${outcome} ${type} shot for hole ${currentHole}`);
    
    setHoleData(prevData => {
      const newData = { ...prevData };
      const currentHoleInfo = { ...newData[currentHole] };
      
      // Add to shots array
      currentHoleInfo.shots.push({
        type,
        result: outcome,
        timestamp: new Date().toISOString()
      });
      
      // Update shot counts for ShotTable compatibility
      currentHoleInfo.shotCounts[type][outcome] += 1;
      
      // Update hole data
      newData[currentHole] = currentHoleInfo;
      
      return newData;
    });
  }, [currentHole]);

  /**
   * Function to remove a shot of a specific type and outcome
   */
  const removeShot = useCallback((type, outcome) => {
    console.log(`Removing ${outcome} ${type} shot for hole ${currentHole}`);
    
    setHoleData(prevData => {
      const newData = { ...prevData };
      const currentHoleInfo = { ...newData[currentHole] };
      
      // Only proceed if there are shots to remove
      if (currentHoleInfo.shotCounts[type][outcome] <= 0) {
        return prevData;
      }
      
      // Find the index of the last shot of this type and outcome
      const shotIndex = [...currentHoleInfo.shots].reverse().findIndex(
        shot => shot.type === type && shot.result === outcome
      );
      
      if (shotIndex !== -1) {
        // Convert the reversed index to the actual index
        const actualIndex = currentHoleInfo.shots.length - 1 - shotIndex;
        
        // Remove the shot from the shots array
        currentHoleInfo.shots.splice(actualIndex, 1);
        
        // Update the shot counts for ShotTable compatibility
        currentHoleInfo.shotCounts[type][outcome] -= 1;
        
        // Update the hole data
        newData[currentHole] = currentHoleInfo;
      }
      
      return newData;
    });
  }, [currentHole]);

  /**
   * Complete a hole and save data to AsyncStorage
   */
  const completeHole = async () => {
    try {
      setLoading(true);
      
      // Save current hole data to AsyncStorage
      await saveCurrentHoleToStorage();
      
      // Move to next hole if not on last hole
      if (currentHole < totalHoles) {
        setCurrentHole(prev => prev + 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error completing hole:", error);
      setLoading(false);
      Alert.alert("Error", "There was a problem saving your data.");
    }
  };

  /**
   * Complete the round - save all hole data to database
   * Enhanced to include POI data in the saved hole_data
   */
  const finishRound = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Save current hole first
      await saveCurrentHoleToStorage();
      
      // Get all stored hole data
      const storedDataStr = await AsyncStorage.getItem(`round_${round.id}_holes`);
      if (!storedDataStr) {
        throw new Error("No hole data found for this round");
      }
      
      const storedHoleData = JSON.parse(storedDataStr);
      
      // Save each hole to the database
      for (let holeNum = 1; holeNum <= totalHoles; holeNum++) {
        // Skip holes with no data
        if (!storedHoleData[holeNum] || storedHoleData[holeNum].shots.length === 0) {
          continue;
        }
        
        const holeInfo = storedHoleData[holeNum];
        const totalScore = holeInfo.shots.length;
        
        // Create hole data object including POI data
        const holeDataForDb = {
          par: holeInfo.par,
          distance: holeInfo.distance,
          index: holeInfo.index,
          features: holeInfo.features,
          shots: holeInfo.shots,
          poi: holeInfo.poi // Include POI data in database record
        };
        
        // Save hole data to database
        await saveHoleData(
          round.id,
          holeNum,
          holeDataForDb,
          totalScore
        );
        
        console.log(`Hole ${holeNum} data saved to database`);
      }
      
      // Complete the round
      await completeRound(round.id);
      console.log("Round completed successfully");
      
      // Clear AsyncStorage data for this round
      await AsyncStorage.removeItem(`round_${round.id}_holes`);
      await AsyncStorage.removeItem("currentRound");
      
      // Navigate to scorecard with replace to prevent back navigation to the tracker
      // This creates a cleaner flow where completing a round leads directly to the scorecard
      navigation.replace("ScorecardScreen", { 
        roundId: round.id,
        fromTracker: true // Add flag to indicate we came from tracker
      });
    } catch (error) {
      console.error("Error finishing round:", error);
      setLoading(false);
      Alert.alert(
        "Error",
        "There was a problem completing your round. Please try again."
      );
    }
  };

  // Calculate total score for current hole
  const currentHoleScore = holeData[currentHole]?.shots?.length || 0;
  const currentHolePar = holeData[currentHole]?.par || 0;
  const scoreRelativeToPar = currentHoleScore - currentHolePar;
  
  // Add color-coding helper function for score display
  const getScoreColor = () => {
    if (scoreRelativeToPar < 0) return theme.colors.success; // Under par (good)
    if (scoreRelativeToPar > 0) return theme.colors.error;   // Over par (bad)
    return theme.colors.text;  // At par (neutral)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 1. Navigator - KEEP EXISTING */}
        <View style={styles.navigatorContainer}>
          <HoleNavigator
            currentHole={currentHole}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleNextHole}
            totalHoles={totalHoles}
          />
        </View>

        {/* 2. Integrated Hole Info + Score - NEW COMPONENT */}
        <View style={styles.holeInfoContainer}>
          <View style={styles.holeDetailsSection}>
            <Typography variant="body" style={styles.holeInfoText}>
              Hole {currentHole} • Par {holeData[currentHole]?.par || "?"} • {holeData[currentHole]?.distance || "?"} yds
            </Typography>
            
            <View style={styles.scoreIndicator}>
              <Typography 
                variant="body" 
                weight="semibold"
                color={getScoreColor()}
                style={styles.scoreText}
              >
                {currentHoleScore}
              </Typography>
            </View>
          </View>
        </View>

        {/* Show loading indicator when saving data */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Typography variant="body" style={styles.loadingText}>
              Saving your data...
            </Typography>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* 3. Distance Indicator - MAINTAINED POSITION */}
            <DistanceIndicator 
              holeData={holeData[currentHole]} 
              active={!loading} 
            />
            
            {/* 4. Shot Table - MAINTAINED POSITION BUT EXPANDED HEIGHT */}
            <View style={styles.tableContainer}>
              <ShotTable
                shotCounts={holeData[currentHole].shotCounts}
                activeColumn={activeColumn}
                setActiveColumn={setActiveColumn}
                addShot={addShot}
                removeShot={removeShot}
              />
            </View>
            
            {/* 5. Action Button - MAINTAINED POSITION */}
            <View style={styles.buttonContainer}>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onPress={currentHole === totalHoles ? finishRound : completeHole}
                loading={loading}
              >
                {currentHole === totalHoles ? "Complete Round" : "Complete Hole"}
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: '100%',
  },
  navigatorContainer: {
    marginBottom: 6,
    alignItems: 'center',
  },
  holeInfoContainer: {
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
  },
  holeDetailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holeInfoText: {
    color: '#444',
    flex: 1,
  },
  scoreIndicator: {
    marginLeft: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  tableContainer: {
    width: '100%',
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  }
});